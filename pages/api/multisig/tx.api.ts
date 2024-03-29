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
import { Blockchains, BlockchainType, MultisigProviders } from "types/blockchains";
import { adminApp } from "firebaseConfig/admin";
import { ITag } from "../tags/index.api";
import axios from "axios";
import { AltCoins, Coins, CoinsName } from "types";
import { IBudget, IBudgetExercise } from "firebaseConfig";
import { budgetExerciseCollectionName } from "crud/budget_exercise";
import { BASE_URL } from "utils/api";
import { IMultisigThreshold } from "./sign.api";
import { IBudgetORM } from "../budget/index.api";
import Web3 from 'web3'
import { AbiItem } from "rpcHooks/ABI/AbiItem";
import { IMultisigOwners } from "./owners.api";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ITransactionMultisig | IMultisigSafeTransaction>
) {
    try {
        const {
            id,
            blockchain,
            index,
            address: multisigAddress,
            name,
            providerName
        } = req.query as {
            blockchain: BlockchainType["name"];
            id: string;
            index: string;
            address: string;
            name: string;
            providerName: MultisigProviders;
        };

        let tags = (
            await adminApp.firestore().collection("tags").doc(id).get()
        ).data() as { tags: ITag[] };

        const Blockchain = Blockchains.find(
            (blch: BlockchainType) => blch.name === blockchain
        );
        if (!Blockchain) throw new Error("Blockchain not found");

        const CoinsReq = await adminApp
            .firestore()
            .collection(Blockchain!.currencyCollectionName)
            .get();

        const Coins = CoinsReq.docs.reduce<Coins>((acc, doc) => {
            acc[(doc.data() as AltCoins).symbol] = doc.data() as AltCoins;
            return acc;
        }, {});

        // if (blockchain === 'solana') {

        //     const pb = new PublicKey(multisigAddress)

        //     const connection = new Connection(SolanaSerumEndpoint, "finalized");
        //     const provider = new SolanaReadonlyProvider(connection)

        //     const allAddresses = { ...GOKI_ADDRESSES, SmartWallet: pb };
        //     const programs = newProgramMap<Programs>(provider, GOKI_IDLS, allAddresses);

        //     const data = await programs.SmartWallet.account.smartWallet.fetch(pb)

        //     if (data) {
        //         const owners = data.owners.map(s => s.toBase58()) as string[];
        //         const program = new BorshInstructionCoder(GOKI_IDLS.SmartWallet)
        //         for (let index = 0; index < data.numTransactions.toNumber(); index++) {

        //             const [txKey] = await findTransactionAddress(pb, index);
        //             const tx = await programs.SmartWallet.account.transaction.fetchNullable(txKey);

        //             if (tx) {
        //                 for (let index = 0; index < tx.instructions.length; index++) {
        //                     let method = MethodIds[MethodNames.transfer], confirmations: string[] = [], destination = "", executed = false, created_at = 0, timestamp = 0, value = new BigNumber(0), newOwner, owner, requiredCount;
        //                     const buffer = Buffer.from(tx.instructions[index].data);
        //                     const idlData = program.decode(buffer);
        //                     timestamp = tx.executedAt.toNumber()
        //                     created_at = tx.eta.toNumber()
        //                     executed = tx.executedAt.toNumber() != -1;
        //                     confirmations = data.owners.filter((s, i) => tx.signers[i]).map(s => s.toBase58())
        //                     if (idlData) {
        //                         const { data, name } = idlData;
        //                         switch (name) {
        //                             case "setOwners":
        //                                 let updatedOwners = (data as any).owners.map((s: any) => s.toBase58()) as string[]
        //                                 if (updatedOwners.length > owners.length) {
        //                                     method = MethodIds[MethodNames.addOwner]
        //                                     owner = updatedOwners.find(s => !owners.includes(s))
        //                                 }
        //                                 else if (updatedOwners.length == owners.length) {
        //                                     method = MethodIds[MethodNames.replaceOwner]
        //                                     newOwner = updatedOwners.find(s => !owners.includes(s))
        //                                 } else {
        //                                     method = MethodIds[MethodNames.removeOwner]
        //                                     owner = owners.find(s => !updatedOwners.includes(s))
        //                                 }
        //                                 break;
        //                             case "changeThreshold":
        //                                 method = MethodIds[MethodNames.changeRequirement]
        //                                 const threshold = (data as any).threshold.toNumber();
        //                                 requiredCount = threshold;
        //                             default:
        //                                 break;
        //                         }
        //                     } else {
        //                         try {
        //                             const data = SystemInstruction.decodeTransfer({
        //                                 data: buffer,
        //                                 programId: tx.instructions[0].programId,
        //                                 keys: tx.instructions[0].keys,
        //                             })
        //                             method = MethodIds[MethodNames.transfer]
        //                             destination = SolanaCoins.SOL.contractAddress;
        //                             owner = data.toPubkey.toBase58()
        //                             value = new BigNumber(data.lamports.toString())
        //                         } catch (error) {
        //                             try {
        //                                 const data = decodeTransferCheckedInstructionUnchecked({
        //                                     data: buffer,
        //                                     programId: tx.instructions[0].programId,
        //                                     keys: tx.instructions[0].keys,
        //                                 })
        //                                 method = MethodIds[MethodNames.transfer]
        //                                 owner = data.keys.destination?.pubkey.toBase58() ?? ""
        //                                 destination = data.keys.mint?.pubkey.toBase58() ?? ""
        //                                 value = new BigNumber(data.data.amount.toString()).dividedBy(10 ** data.data.decimals).multipliedBy(lamport)
        //                             } catch (error) {
        //                                 console.error("There is no option for this tx: ", tx)
        //                                 continue;
        //                             }
        //                         }
        //                     }

        //                     const parsedTx = MultisigTxParser({
        //                         contractAddress: pb.toBase58(),
        //                         txHashOrIndex: txKey.toBase58(),
        //                         contractInternalThreshold: data.threshold.toNumber(),
        //                         contractThreshold: data.threshold.toNumber(),
        //                         contractOwnerAmount: owners.length,
        //                         data: "",
        //                         blockchain,
        //                         confirmations,
        //                         destination,
        //                         executed,
        //                         created_at,
        //                         index,
        //                         Value: value,
        //                         parsedData: {
        //                             method,
        //                             newOwner,
        //                             owner,
        //                             requiredCount
        //                         },
        //                         timestamp,
        //                         name,
        //                         tags: tags?.tags ?? []
        //                     })
        //                     transactionArray.push(parsedTx)

        //                 }
        //             }
        //         }
        //     }
        // }
        if (providerName === "Celo Terminal") {
            const web3 = new Web3(Blockchain.rpcUrl);

            const contract = new web3.eth.Contract(Multisig.abi as AbiItem[], multisigAddress);
            const owners = await contract.methods.getOwners().call()

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
                    contractOwnerAmount: owners.length,
                    contractOwners: owners,
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

            return res.json(await GetTx(+index, budgets, Coins))
        }
        else if (providerName === "GnosisSafe") {
            const api = `${Blockchain?.multisigProviders.find(s => s.name === "GnosisSafe")?.txServiceUrl}/api/v1/multisig-transactions/${index}`;
            const response = await axios.get(api);
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

            if(ownerData.nonce === undefined) throw new Error("Nonce is not found");

            const safeTxs = await parseSafeTransaction(transactionsData, [transactionsData], Coins, blockchain, multisigAddress, data.sign, ownerData.owners, tags?.tags ?? [], ownerData.nonce!)
            return res.json(safeTxs)
        }
    } catch (e: any) {
        console.error(e);
        throw new Error(e);
    }
}
