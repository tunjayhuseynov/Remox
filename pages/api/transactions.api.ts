import axios from "axios";
import {
  ERC20MethodIds,
  EvmInputReader,
  IFormattedTransaction,
  CeloInputReader,
} from "hooks/useTransactionProcess";
import type { NextApiRequest, NextApiResponse } from "next";
import { AltCoins, Coins, CoinsName } from "types";
import { GetTransactions, Transactions } from "types/sdk";
import * as solanaWeb3 from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import _ from "lodash";
import { SolanaEndpoint } from "components/Wallet";
import { adminApp } from "firebaseConfig/admin";
import { ITag } from "./tags/index.api";
import { Blockchains, BlockchainType } from "types/blockchains";
import { DecimalConverter } from "utils/api";
import Web3 from 'web3'
import InputDataDecoder from "ethereum-input-data-decoder";
import ERC20 from "rpcHooks/ABI/erc20.json";
import { IBudget, IBudgetExercise } from "firebaseConfig";
import { budgetExerciseCollectionName } from "crud/budget_exercise";
import { IBudgetORM } from "./budget/index.api";
import axiosRetry from "axios-retry";


// GET /api/transactions  --params blockchain, address

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IFormattedTransaction[] | string>
) {
  try {
    let txList: IFormattedTransaction[] = [];

    const addresses = req.query["addresses[]"];
    const txs = req.query["txs[]"];

    const parsedtxs = typeof txs === "string" ? [txs] : txs;
    const authId = req.query.id as string;
    const parsedAddress =
      typeof addresses === "string" ? [addresses] : addresses;
    const blockchaiName = req.query.blockchain as BlockchainType["name"];
    const blockchain = Blockchains.find((b) => b.name === blockchaiName);
    if (!blockchain) throw new Error("Blockchain not found");

    const CoinsReq = await adminApp
      .firestore()
      .collection(blockchain.currencyCollectionName)
      .get();
    const Coins = CoinsReq.docs.reduce<Coins>((acc, doc) => {
      acc[(doc.data() as AltCoins).symbol] = doc.data() as AltCoins;
      return acc;
    }, {});

    if (parsedAddress.length === 0 || !blockchain)
      return res.status(400).send("Missing address or blockchain");
  
    let myTags: { tags: ITag[] } | undefined;
    if (authId) {
      myTags = (
        await adminApp.firestore().collection("tags").doc(authId).get()
      ).data() as { tags: ITag[] };
      // myTags = await FirestoreRead<{tags: Tag[]}>("tags", authId)
    }

    const txRes = await Promise.all(parsedAddress.map(address => GetTxs(
      address,
      myTags?.tags ?? [],
      blockchain,
      Coins,
      parsedtxs
    )))

    txList = txList.concat(...txRes)
    // for (const key of parsedAddress) {
    //   const txs = await GetTxs(
    //     key,
    //     myTags?.tags ?? [],
    //     blockchain,
    //     coins,
    //     parsedtxs
    //   );
    //   txList = txList.concat(txs);
    // }

    res.status(200).json(txList);
  } catch (error: any) {
    throw new Error(error);
  }
}

const GetTxs = async (
  address: string,
  tags: ITag[],
  blockchain: BlockchainType,
  coins: Coins,
  inTxs?: string[]
) => {
  axiosRetry(axios, { retries: 10 });
  let txList: Transactions[] = [];

  if (blockchain.name === "solana") {
    const txsList: Transactions[] = [];
    // new PublicKey("So11111111111111111111111111111111111111112")
    const connection = new solanaWeb3.Connection(SolanaEndpoint);
    const sings = !inTxs
      ? await connection.getConfirmedSignaturesForAddress2(
        new solanaWeb3.PublicKey(address),
        { limit: 1000 }
      )
      : null;
    const txs = await connection.getParsedTransactions(
      inTxs ?? sings!.map((s) => s.signature)
    );
    // const tokens = await connection.getTokenAccountsByOwner(
    //   new solanaWeb3.PublicKey(address),
    //   { programId: TOKEN_PROGRAM_ID }
    // );
    const CoinArray = Object.values(coins)
    for (const tx of txs) {
      const arr = tx?.transaction.message.instructions;
      if (arr) {
        const arrLen = arr.length;
        let amount, from, to, token: AltCoins;
        for (let index = 0; index < arrLen - 1; index++) {
          if ((arr[index] as any)?.["parsed"]?.["type"]) {
            from = (arr[index] as any)["parsed"]["info"]["source"] ?? "";
            to = (arr[index] as any)["parsed"]["info"]["destination"] ?? "";
            if ((arr[index] as any)["parsed"]["info"]?.["mint"]) {
              token =
                CoinArray.find(
                  (c) =>
                    c.address.toLowerCase() ===
                    (arr[index] as any)["parsed"]["info"]["mint"]?.toLowerCase()
                ) ?? CoinArray.find((c) => c.symbol === "SOL")!;
              amount = (arr[index] as any)["parsed"]["info"]["tokenAmount"]
                ?.amount;
            } else {
              token = CoinArray.find((c) => c.symbol === "SOL")!;
              amount = (arr[index] as any)["parsed"]["info"]["lamports"] ?? "0";
            }
          }
        }
        let parsedTx: Transactions = {
          from,
          to,
          blockHash: tx?.transaction.message.recentBlockhash ?? "",
          blockNumber: "",
          confirmations: "",
          gas: tx?.meta?.fee.toString() ?? "",
          gasPrice: "1",
          gasUsed: "1",
          hash: tx?.transaction.signatures[0] ?? "",
          input: ERC20MethodIds.noInput ?? "",
          nonce: "",
          timeStamp: (
            tx?.blockTime ?? Math.floor(new Date().getTime() / 1e3)
          ).toString(),
          contractAddress: token!.address ?? "",
          value: amount,
          isError: "0",
          cumulativeGasUsed: "",
          logIndex: "",
          tokenDecimal: "",
          tokenName: token!.name,
          tokenSymbol: token!.symbol,
          transactionIndex: "",
        };
        txsList.push(parsedTx);
      }
    }

    txList = txsList;
  } else if (blockchain.name === "celo" || blockchain.name === "ethereum_evm") {
    if (inTxs) {
      for (const tx of inTxs) {
        const exReq = await axios.get<{ result: Transactions }>(
          `${blockchain.explorerUrl}?module=transaction&action=gettxinfo&txhash=${tx}`
        );

        const txs = exReq.data;
        txList.push(txs.result);
      }
    } else {
      const exReqRaw = axios.get<GetTransactions>(
        `${blockchain.explorerUrl}?module=account&action=txlist&address=${address}`
      );
      const tokenReqRaw = axios.get<GetTransactions>(
        `${blockchain.explorerUrl}?module=account&action=tokentx&address=${address}`
      );

      const [exReq, tokenReq] = await Promise.all([exReqRaw, tokenReqRaw]);

      const tokens = tokenReq.data.result.filter(s => s.from?.toLowerCase() !== address?.toLowerCase());

      const txs = exReq.data;
      txList = txs.result.concat(tokens);
    }
  } else if (blockchain.name === "polygon_evm") {
    if (inTxs) {
      for (const tx of inTxs) {
        const exReq = await axios.get<{ result: Transactions }>(
          `${blockchain.explorerUrl}?module=transaction&action=gettxreceiptstatus&txhash=${tx}&apikey=JEH6JVI32EP99FG14NBEIUVQK1FNJIATBT`
        );

        const txs = exReq.data;
        txList.push(txs.result);
      }
    } else {
      const exReq = await axios.get<GetTransactions>(
        `${blockchain.explorerUrl}?module=account&action=txlist&address=${address}&apikey=JEH6JVI32EP99FG14NBEIUVQK1FNJIATBT`
      );
      const txs = exReq.data;
      txList = txs.result;

      // txList = txList.map((tx: any) => tx)

      // txList = txList.filter((tx) => tx).map((tx: any) => tx["rawData"])
    }
  }
  const parsedTxs = await ParseTxs(txList.filter(s => s.isError !== "1"), blockchain, tags, address, coins);

  return parsedTxs;
};

const ParseTxs = async (
  transactions: Transactions[],
  blockchain: BlockchainType,
  tags: ITag[],
  address: string,
  coins: Coins,
) => {
  try {
    let result: Transactions[] = [...transactions];
    const FormattedTransaction: IFormattedTransaction[] = [];

    const groupedHash = _(result).groupBy("hash").value();
    const uniqueHashs = Object.values(groupedHash).reduce(
      (acc: Transactions[], value: Transactions[]) => {
        const best = _(value).maxBy((o) =>
          +o.value
        );
        if (best) acc.push(best);
        return acc;
      },
      []
    );
    for (const transaction of uniqueHashs) {
      const input = transaction.input;

      if (blockchain.name.includes("evm")) {
        const formatted = await EvmInputReader(input, blockchain.name, {
          transaction,
          tags,
          Coins: coins,
          blockchain,
          address
        });
        if (formatted && formatted.method) {
          FormattedTransaction.push({
            timestamp: +transaction.timeStamp,
            rawData: transaction,
            hash: transaction.hash,
            tags: formatted.tags ?? [],
            address,
            ...formatted,
          });
        }

      } else if (blockchain.name === "celo") {
        const formatted = await CeloInputReader(input, { transaction, tags, Coins: coins, blockchain, address });

        if (formatted && formatted.method && (formatted.coin || (formatted.payments?.length ?? 0) > 0 || (formatted.method === ERC20MethodIds.swap && formatted?.coinIn))) {

          FormattedTransaction.push({
            timestamp: +transaction.timeStamp,
            rawData: transaction,
            hash: transaction.hash,
            address,
            ...formatted,
          });
        }
      }
    }


    return FormattedTransaction;
  } catch (error) {
    console.log("Transactin Api", error);

    throw new Error(error as any);
  }
};
