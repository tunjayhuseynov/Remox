import { Connection, PublicKey, SystemInstruction } from "@solana/web3.js";
import {
  MethodIds,
  MethodNames,
  ITransactionMultisig,
  IMultisigSafeTransaction,
} from "hooks/walletSDK/useMultisig";
import { NextApiRequest, NextApiResponse } from "next";
import {
  GokiSDK,
  GOKI_ADDRESSES,
  GOKI_IDLS,
  Programs,
  SmartWalletTransactionData,
} from "@gokiprotocol/client";
import { BorshInstructionCoder, utils } from "@project-serum/anchor";
import BigNumber from "bignumber.js";
import { MultisigTxParser, parseSafeTransaction } from "utils/multisig";
// import { decodeTransferCheckedInstructionUnchecked } from 'node_modules/@solana/spl-token'
import { Contract, ethers } from "ethers";
import Multisig from "rpcHooks/ABI/CeloTerminal.json";
import { newProgramMap } from "@saberhq/anchor-contrib";
import { SolanaReadonlyProvider } from "@saberhq/solana-contrib";
import { lamport } from "utils/ray";
import { u64 } from "@saberhq/token-utils";
import { GetTime } from "utils";
import { SolanaSerumEndpoint } from "components/Wallet";
import { Blockchains, BlockchainType } from "types/blockchains";
import { adminApp } from "firebaseConfig/admin";
import { ITag } from "../tags/index.api";
import axios from "axios";
import { AltCoins, Coins, CoinsName, GnosisTransaction } from "types";
import { IBudget, IBudgetExercise } from "firebaseConfig";
import { budgetExerciseCollectionName } from "crud/budget_exercise";
import { IMultisigThreshold } from "./sign.api";
import { BASE_URL } from "utils/api";
import { IBudgetORM } from "../budget/index.api";
import Web3 from 'web3'
import { AbiItem } from "rpcHooks/ABI/AbiItem";
import axiosRetry from "axios-retry";
import { IMultisigOwners } from "./owners.api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ITransactionMultisig[] | IMultisigSafeTransaction[]>
) {
  try {
    const {
      id,
      blockchain,
      address: multisigAddress,
      Skip,
      name,
      providerName
    } = req.query as {
      blockchain: BlockchainType["name"];
      id: string;
      address: string;
      Skip: string;
      name: string;
      providerName?: string;
    };
    const skip = +Skip;
    axiosRetry(axios, { retries: 10 });
    let tags = (
      await adminApp.firestore().collection("tags").doc(id).get()
    ).data() as { tags: ITag[] };

    const Blockchain = Blockchains.find(
      (blch: BlockchainType) => blch.name === blockchain
    );
    if (!Blockchain) throw new Error("Blockchain not found");


    let transactionArray: ITransactionMultisig[] = [];

    const CoinsReq = await adminApp
      .firestore()
      .collection(Blockchain!.currencyCollectionName)
      .get();

    const Coins = CoinsReq.docs.reduce<Coins>((acc, doc) => {
      acc[(doc.data() as AltCoins).symbol] = doc.data() as AltCoins;
      return acc;
    }, {});


    if (blockchain === "celo" && providerName === "Celo Terminal") {
      const web3 = new Web3(Blockchain.rpcUrl);

      const contract = new web3.eth.Contract(Multisig.abi as AbiItem[], multisigAddress);
      const owners = await contract.methods.getOwners().call()
      let Total = await contract.methods.transactionCount().call();
      let total = Total;
      if (total > skip) {
        total -= skip;
      }

      const GetTx = async (index: number, budgets: IBudgetORM[], coins: Coins) => {

        const tx = await contract.methods.transactions(index).call();

        let confirmations: string[] = [];

        confirmations = await contract.methods.getConfirmations(index).call();

        const obj = await MultisigTxParser({
          parsedData: null,
          txHashOrIndex: index.toString(),
          index,
          destination: tx.destination,
          created_at: GetTime(),
          data: tx.data,
          executed: tx.executed,
          confirmations: confirmations as any,
          Value: tx.value,
          blockchain: Blockchain,
          timestamp: GetTime(),
          contractAddress: multisigAddress,
          contractInternalThreshold: (await contract.methods.internalRequired().call()),
          contractThreshold: (await contract.methods.required().call()),
          contractOwnerAmount: owners.length ?? 0,
          contractOwners: owners ?? [],
          name,
          tags: tags?.tags ?? [],
          budgets: budgets,
          coins: coins,
          provider: providerName
        });

        return obj;
      };

      const snapshots = await adminApp.firestore().collection(budgetExerciseCollectionName).where("parentId", "==", id).get();
      let budgets: IBudgetORM[] = snapshots.docs.map(snapshot => snapshot.data() as IBudgetExercise).reduce<IBudgetORM[]>((acc, curr) => {
        acc.push(...(curr.budgets as IBudgetORM[]));
        return acc;
      }, []);

      const list = await Promise.all(
        Array.from(Array(total).keys()).map((s) => GetTx(total - 1 - s, budgets, Coins))
      );
      transactionArray.push(...(list.filter(s => s.tx && s.tx.method)));
    }
    else if (providerName === "GnosisSafe") {
      const provider = Blockchain?.multisigProviders.find(s => s.name === providerName);
      if (!provider) return;
      const api = `${provider.txServiceUrl}/api/v1/safes/${multisigAddress}/multisig-transactions/`;
      const response = await axios.get<{ results: GnosisTransaction[] }>(api);
      const transactionsData = response.data;

      const { data } = await axios.get<IMultisigThreshold>(BASE_URL + "/api/multisig/sign", {
        params: {
          blockchain,
          address: multisigAddress,
          providerName: providerName
        }
      })

      const { data: ownerData } = await axios.get<IMultisigOwners>(BASE_URL + "/api/multisig/owners", {
        params: {
          blockchain,
          address: multisigAddress,
          providerName: providerName
        }
      })
      const txs = transactionsData.results;
      if (ownerData.nonce === undefined) throw new Error("Nonce is not found");

      const safeTxs = await Promise.all(txs.filter(s => !(s.to === s.safe && !s.data)).map((tx: any) => parseSafeTransaction(tx, txs, Coins, blockchain, multisigAddress, data.sign, ownerData.owners, tags?.tags ?? [], ownerData.nonce!)))
      transactionArray.push(...safeTxs.filter(s => s.tx.method));
    }

    res.status(200).json(transactionArray);
  } catch (e: any) {
    console.error(e);
    throw new Error(e);
  }
}
