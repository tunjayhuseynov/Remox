import { Connection, PublicKey, SystemInstruction } from "@solana/web3.js";
import { MethodIds, MethodNames, ITransactionMultisig } from "hooks/walletSDK/useMultisig";
import { NextApiRequest, NextApiResponse } from "next";
import { GokiSDK, GOKI_ADDRESSES, GOKI_IDLS, Programs, SmartWalletTransactionData } from "@gokiprotocol/client";
import { BorshInstructionCoder, utils } from "@project-serum/anchor";
import BigNumber from "bignumber.js";
import { SolanaCoins } from "types";
import { MultisigTxParser } from "utils/multisig";
import { decodeTransferCheckedInstructionUnchecked } from 'node_modules/@solana/spl-token'
import { BlockchainType } from "hooks/walletSDK/useWalletKit";
import { Contract, ethers } from "ethers";
import Multisig from 'rpcHooks/ABI/Multisig.json'
import { newProgramMap } from "@saberhq/anchor-contrib";
import { SolanaReadonlyProvider } from "@saberhq/solana-contrib";
import { lamport } from "utils/ray";
import { u64 } from "@saberhq/token-utils";
import { GetTime } from "utils";


export default async function handler(req: NextApiRequest, res: NextApiResponse<ITransactionMultisig[]>) {
    try {
        const { blockchain, address: multisigAddress, Skip, Take, name } = req.query as { blockchain: BlockchainType, address: string, Skip: string, Take: string, name: string };
        const skip = +Skip;
        const take = +Take;

        let transactionArray: ITransactionMultisig[] = []
        if (blockchain === 'solana') {

            const pb = new PublicKey(multisigAddress)

            const connection = new Connection("https://solana-api.projectserum.com", "finalized");
            const provider = new SolanaReadonlyProvider(connection)

            const allAddresses = { ...GOKI_ADDRESSES, SmartWallet: pb };
            const programs = newProgramMap<Programs>(provider, GOKI_IDLS, allAddresses);

            const data = await programs.SmartWallet.account.smartWallet.fetch(pb)

            if (data) {
                const owners = data.owners.map(s => s.toBase58()) as string[];
                const program = new BorshInstructionCoder(GOKI_IDLS.SmartWallet)
                for (let index = 0; index < data.numTransactions.toNumber(); index++) {

                    const [txKey] = await findTransactionAddress(pb, index);
                    const tx = await programs.SmartWallet.account.transaction.fetchNullable(txKey);

                    if (tx) {
                        for (let index = 0; index < tx.instructions.length; index++) {
                            let method = MethodIds[MethodNames.transfer], confirmations: string[] = [], destination = "", executed = false, timestamp = 0, value = new BigNumber(0), newOwner, owner, requiredCount;
                            const buffer = Buffer.from(tx.instructions[index].data);
                            const idlData = program.decode(buffer);
                            timestamp = tx.executedAt.toNumber()
                            executed = tx.executedAt.toNumber() != -1;
                            confirmations = data.owners.filter((s, i) => tx.signers[i]).map(s => s.toBase58())
                            if (idlData) {
                                const { data, name } = idlData;
                                switch (name) {
                                    case "setOwners":
                                        let updatedOwners = (data as any).owners.map((s: any) => s.toBase58()) as string[]
                                        if (updatedOwners.length > owners.length) {
                                            method = MethodIds[MethodNames.addOwner]
                                            owner = updatedOwners.find(s => !owners.includes(s))
                                        }
                                        else if (updatedOwners.length == owners.length) {
                                            method = MethodIds[MethodNames.replaceOwner]
                                            newOwner = updatedOwners.find(s => !owners.includes(s))
                                        } else {
                                            method = MethodIds[MethodNames.removeOwner]
                                            owner = owners.find(s => !updatedOwners.includes(s))
                                        }
                                        break;
                                    case "changeThreshold":
                                        method = MethodIds[MethodNames.changeRequirement]
                                        const threshold = (data as any).threshold.toNumber();
                                        requiredCount = threshold;
                                    default:
                                        break;
                                }
                            } else {
                                try {
                                    const data = SystemInstruction.decodeTransfer({
                                        data: buffer,
                                        programId: tx.instructions[0].programId,
                                        keys: tx.instructions[0].keys,
                                    })
                                    method = MethodIds[MethodNames.transfer]
                                    destination = SolanaCoins.SOL.contractAddress;
                                    owner = data.toPubkey.toBase58()
                                    value = new BigNumber(data.lamports.toString())
                                } catch (error) {
                                    try {
                                        const data = decodeTransferCheckedInstructionUnchecked({
                                            data: buffer,
                                            programId: tx.instructions[0].programId,
                                            keys: tx.instructions[0].keys,
                                        })
                                        method = MethodIds[MethodNames.transfer]
                                        owner = data.keys.destination?.pubkey.toBase58() ?? ""
                                        destination = data.keys.mint?.pubkey.toBase58() ?? ""
                                        value = new BigNumber(data.data.amount.toString()).dividedBy(10 ** data.data.decimals).multipliedBy(lamport)
                                    } catch (error) {
                                        console.error("There is no option for this tx: ", tx)
                                        continue;
                                    }
                                }
                            }

                            const parsedTx = MultisigTxParser({
                                contractAddress: pb.toBase58(),
                                contractInternalThreshold: data.threshold.toNumber(),
                                contractThreshold: data.threshold.toNumber(),
                                contractOwnerAmount: owners.length,
                                data: "",
                                blockchain,
                                confirmations,
                                destination,
                                executed,
                                index,
                                Value: value,
                                parsedData: {
                                    method,
                                    newOwner,
                                    owner,
                                    requiredCount
                                },
                                timestamp,
                                name
                            })
                            transactionArray.push(parsedTx)

                        }
                    }
                }
            }
        } else if (blockchain === 'celo') {
            const provider = new ethers.providers.JsonRpcProvider("https://forno.celo.org", {
                chainId: 42220,
                name: "forno",
            })

            const contract = new Contract(multisigAddress, Multisig.abi, provider)

            // const owners = await contract.getOwners() as string[]

            let Total = await contract.transactionCount.call() as BigNumber
            // let Total = (await contract.getTransactionCount(true, true)) as BigNumber
            let total = Total.toNumber();
            // const kitMultiSig = await kit.contracts.getMultiSig(multisigAddress);
            // let total = await kitMultiSig.getTransactionCount(true, true)
            if (total > skip) {
                total -= skip;
            }
            let limit = total - take - 1 > 0 ? total - take - 1 : 0;
            // for (let index = total - 1; index > limit; index--) {

            // }
            const GetTx = async (index: number) => {
                const tx = await contract.transactions(index)
                // if (!tx || (tx && !tx['data'])) continue;

                let confirmations: string[] = []

                confirmations = await contract.getConfirmations(index);

                const obj = MultisigTxParser({
                    parsedData: null,
                    index, destination: tx.destination,
                    data: tx.data, executed: tx.executed,
                    confirmations: confirmations as any,
                    Value: tx.value,
                    blockchain, timestamp: GetTime(),
                    contractAddress: multisigAddress,
                    contractInternalThreshold: contract.internalRequired.toNumber(),
                    contractThreshold: contract.required.toNumber(),
                    contractOwnerAmount: contract.getOwners().length,
                    name
                })

                return obj;
            }
            const list = await Promise.all(Array.from(Array(total).keys()).map(s => GetTx(total - 1 - s)))
            transactionArray.push(...list);
        }

        res.status(200).json(transactionArray)
    } catch (e: any) {
        console.error(e)
        throw new Error(e);
    }
}

const findTransactionAddress = async (
    smartWallet: PublicKey,
    index: number
): Promise<[PublicKey, number]> => {
    return await PublicKey.findProgramAddress(
        [
            utils.bytes.utf8.encode("GokiTransaction"),
            smartWallet.toBuffer(),
            new u64(index).toBuffer(),
        ],
        GOKI_ADDRESSES.SmartWallet
    );
};