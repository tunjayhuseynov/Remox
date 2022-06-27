import { Connection, SystemInstruction } from "@solana/web3.js";
import { MethodIds, MethodNames, TransactionMultisig } from "hooks/walletSDK/useMultisig";
import { NextApiRequest, NextApiResponse } from "next";
import { GokiSDK, GOKI_IDLS } from "@gokiprotocol/client";
import { BorshInstructionCoder } from "@project-serum/anchor";
import BigNumber from "bignumber.js";
import { SolanaCoins } from "types";
import { MultisigTxParser } from "utils/multisig";
import { decodeTransferCheckedInstructionUnchecked } from 'node_modules/@solana/spl-token'
import { BlockchainType } from "hooks/walletSDK/useWalletKit";
import { Contract, ethers } from "ethers";
import Multisig from 'rpcHooks/ABI/Multisig.json'

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
    try {
        const { blockchain, address: multisigAddress, Skip, Take } = req.query as { blockchain: BlockchainType, address: string, Skip: string, Take: string };
        const skip = +Skip;
        const take = +Take;

        let transactionArray: TransactionMultisig[] = []
        if (blockchain === 'solana') {

            // const network = "http://127.0.0.1:8899"
            // const connection = new Connection(network);

            // // new GokiSDK().loadSmartWallet()


            // const wallet = await sdk.loadSmartWallet(new PublicKey(multisigAddress));
            // if (wallet.data) {
            //     const owners = wallet.data.owners.map(s => s.toBase58()) as string[];
            //     const program = new BorshInstructionCoder(GOKI_IDLS.SmartWallet)
            //     for (let index = 0; index < wallet.data.numTransactions.toNumber(); index++) {
            //         const tx = await wallet.fetchTransactionByIndex(index);
            //         if (tx) {
            //             for (let index = 0; index < tx.instructions.length; index++) {
            //                 let method = MethodIds[MethodNames.transfer], confirmations: string[] = [], destination = "", executed = false, value = new BigNumber(0), newOwner, owner, requiredCount;
            //                 const buffer = Buffer.from(tx.instructions[index].data);
            //                 const idlData = program.decode(buffer);
            //                 executed = tx.executedAt.toNumber() != -1;
            //                 confirmations = wallet.data.owners.filter((s, i) => tx.signers[i]).map(s => s.toBase58())
            //                 if (idlData) {
            //                     const { data, name } = idlData;
            //                     switch (name) {
            //                         case "setOwners":
            //                             let updatedOwners = (data as any).owners.map((s: any) => s.toBase58()) as string[]
            //                             if (updatedOwners.length > owners.length) {
            //                                 method = MethodIds[MethodNames.addOwner]
            //                                 owner = updatedOwners.find(s => !owners.includes(s))
            //                             }
            //                             else if (updatedOwners.length == owners.length) {
            //                                 method = MethodIds[MethodNames.replaceOwner]
            //                                 newOwner = updatedOwners.find(s => !owners.includes(s))
            //                             } else {
            //                                 method = MethodIds[MethodNames.removeOwner]
            //                                 owner = owners.find(s => !updatedOwners.includes(s))
            //                             }
            //                             break;
            //                         case "changeThreshold":
            //                             method = MethodIds[MethodNames.changeRequirement]
            //                             const threshold = (data as any).threshold.toNumber();
            //                             requiredCount = threshold;
            //                         default:
            //                             break;
            //                     }
            //                 } else {
            //                     try {
            //                         const data = SystemInstruction.decodeTransfer({
            //                             data: buffer,
            //                             programId: tx.instructions[0].programId,
            //                             keys: tx.instructions[0].keys,
            //                         })
            //                         method = MethodIds[MethodNames.transfer]
            //                         destination = SolanaCoins.SOL.contractAddress;
            //                         owner = data.toPubkey.toBase58()
            //                         value = new BigNumber(data.lamports.toString())
            //                     } catch (error) {
            //                         try {
            //                             const data = decodeTransferCheckedInstructionUnchecked({
            //                                 data: buffer,
            //                                 programId: tx.instructions[0].programId,
            //                                 keys: tx.instructions[0].keys,
            //                             })
            //                             method = MethodIds[MethodNames.transfer]
            //                             owner = data.keys.destination?.pubkey.toBase58() ?? ""
            //                             destination = data.keys.mint?.pubkey.toBase58() ?? ""
            //                             value = new BigNumber(data.data.amount.toString()).dividedBy(10 ** data.data.decimals).multipliedBy(lamport)
            //                         } catch (error) {
            //                             console.error("There is no option for this tx: ", tx)
            //                             continue;
            //                         }
            //                     }
            //                 }

            //                 const parsedTx = MultisigTxParser({
            //                     data: "",
            //                     blockchain,
            //                     confirmations,
            //                     destination,
            //                     executed,
            //                     index,
            //                     Value: value,
            //                     parsedData: {
            //                         method,
            //                         newOwner,
            //                         owner,
            //                         requiredCount
            //                     }
            //                 })
            //                 transactionArray.push(parsedTx)

            //             }
            //         }
            //     }
            // }
        } else if (blockchain === 'celo') {
            const provider = new ethers.providers.JsonRpcProvider("https://forno.celo.org", {
                chainId: 42220,
                name: "forno",
            })

            const contract = new Contract(multisigAddress, Multisig.abi, provider)

            const owners = await contract.getOwners() as string[]

            let Total = await contract.transactionCount.call() as BigNumber
            // let Total = (await contract.getTransactionCount(true, true)) as BigNumber
            let total = Total.toNumber();
            // const kitMultiSig = await kit.contracts.getMultiSig(multisigAddress);
            // let total = await kitMultiSig.getTransactionCount(true, true)
            if (total > skip) {
                total -= skip;
            }
            let limit = total - take - 1 > 0 ? total - take - 1 : 0;
            for (let index = total - 1; index > limit; index--) {
                const tx = await contract.transactions(index)
                if (!tx || (tx && !tx['data'])) continue;

                const confirmations: any[] = []

                // contract.confirmations(index, address)
                const list = await Promise.all(owners.map(s => contract.confirmations(index, s)))
                list.forEach(s => {
                    if (s) {
                        confirmations.push(s)
                    }
                })
                console.log(index)


                const obj = MultisigTxParser({
                    index, destination: tx.destination,
                    data: tx.data, executed: tx.executed,
                    confirmations: confirmations as any, Value: tx.value, blockchain
                })

                transactionArray.push(obj)
            }
        }

        res.status(200).json({
            txs: transactionArray
        })
    } catch (e: any) {
        console.error(e)
        throw new Error(e);
    }
}