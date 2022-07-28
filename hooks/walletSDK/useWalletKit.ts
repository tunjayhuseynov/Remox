import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import {
    PublicKey,
    Transaction,
    TransactionInstruction,
} from "@solana/web3.js";
import { useCallback, useMemo } from "react";
import {
    AltCoins,
    CeloCoins,
    Coins,
    SolanaCoins,
    TokenType,
} from "types";
import { fromLamport, fromWei } from "utils/ray";
import * as spl from "easy-spl";
import { TextDecoder, TextEncoder } from "util";
import { GetSignedMessage, GetTime } from "utils";
import {
    SelectBlockchain,
    setBlockchain as SetBlockchain,
} from "redux/slices/account/remoxData";
import { FetchPaymentData } from "redux/slices/account/thunks/payment";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { IPaymentInput, ISwap } from "pages/api/payments/send/index.api";
import Web3 from "web3";
import { Contracts } from "rpcHooks/Contracts/Contracts";
import useAllowance from "rpcHooks/useAllowance";
import useTasking from "rpcHooks/useTasking";
import { DateInterval } from "types/dashboard/contributors";
import { ITag } from "pages/api/tags/index.api";
import { IAccount, IBudget, ISubBudget } from "firebaseConfig";
import useMultisig from "./useMultisig";
import { AddTransactionToTag } from "redux/slices/account/thunks/tags";
import { Add_Tx_To_Budget_Thunk } from "redux/slices/account/thunks/budgetThunks/budget";
import { Add_Tx_To_Subbudget_Thunk } from "redux/slices/account/thunks/budgetThunks/subbudget";
import { IBudgetORM, ISubbudgetORM } from "pages/api/budget/index.api";
import { Refresh_Data_Thunk } from "redux/slices/account/thunks/refresh";
import { ethers } from "ethers";
import useWeb3Connector from "hooks/useWeb3Connector";
import { Blockchains, BlockchainType } from "types/blockchains";
import { useCelo } from "@celo/react-celo";

export enum CollectionName {
    Celo = "currencies",
    Solana = "solanaCurrencies",
}

export interface Task {
    interval: DateInterval | "instant" | number;
    startDate: number;
}

export default function useWalletKit() {
    const blockchain = useAppSelector(SelectBlockchain) as BlockchainType;
    const dispatch = useAppDispatch();

    const { allow } = useAllowance();
    const { createTask } = useTasking();
    const { submitTransaction } = useMultisig();

    const { setVisible } = useWalletModal();

    //Celo
    const { address, destroy, kit, walletType, connect, initialised } =
        useCelo();

    //solana
    const { connection } = useConnection();
    const {
        publicKey,
        sendTransaction,
        signMessage,
        disconnect,
        wallet,
        connect: solConnect,
        connected,
        signTransaction,
        signAllTransactions,
    } = useWallet();

    // EVM_WALLET
    const { connect: web3Connect, signMessage: web3SignMessage, address: web3Address, connected: web3Connected } = useWeb3Connector()


    const setBlockchain = (bc: BlockchainType) => {
        dispatch(SetBlockchain(bc));
    };

    const setBlockchainAuto = () => {
        if (address) {
            localStorage.setItem("blockchain", "celo");
            dispatch(SetBlockchain(Blockchains.find((bc) => bc.name === "celo")!));
        } else if (publicKey) {
            localStorage.setItem("blockchain", "solana");
            dispatch(SetBlockchain(Blockchains.find((bc) => bc.name === "solana")!));
        } else if (web3Connected) {
            localStorage.setItem("blockchain", "polygon_evm");
            dispatch(SetBlockchain(Blockchains.find((bc) => bc.name === "polygon_evm")!));
        }
    };

    const fromMinScale = useMemo(() => {
        if (blockchain.name === "celo") {
            return fromWei;
        }

        return fromLamport;
    }, [blockchain]);

    const signMessageInWallet = useCallback(
        async (nonce: number) => {
            if (blockchain.name === "celo") {
                const wallet = kit.getWallet()
                if(!wallet) throw new Error("No wallet")
                const signature = await wallet.signPersonalMessage(
                    (await Address)!,
                    GetSignedMessage(nonce),
                );
                return {
                    publicKey: Address!,
                    signature,
                };
            }

            if (blockchain.name === "polygon_evm") {
                return {
                    publicKey: web3Address,
                    signature: await web3SignMessage(GetSignedMessage(nonce))
                }
            }

            const encodedMessage = new TextEncoder().encode(GetSignedMessage(nonce));
            if (!signMessage) throw new Error("signMessage not found");
            const signature = await signMessage(encodedMessage);
            return {
                publicKey: Address!,
                signature: new TextDecoder().decode(signature),
            };
        },
        [blockchain, kit]
    );

    const GetCoins = useMemo(() => {
        if (blockchain.name === "celo") {
            return CeloCoins;
        }

        return SolanaCoins;
    }, [blockchain]);

    const Address = useMemo(async (): Promise<string | null> => {
        if (blockchain.name === "celo") {
            return address ?? null;
        } else if (blockchain.name === "solana") {
            return publicKey?.toBase58() ?? null;
        } else if (blockchain.name === "polygon_evm") {
            return web3Address ?? null;
        }
        return address ?? null; // Has to be change to null
    }, [blockchain, publicKey, address]);

    const Connected = useMemo(() => {
        if (blockchain.name === "celo") {
            return initialised;
        } else if (blockchain.name === "solana") {
            return connected;
        }
        return initialised; // Has to be change to null
    }, [blockchain, publicKey, address, initialised, connected]);

    const Disconnect = useCallback(async () => {
        if (blockchain.name === "celo") {
            await destroy();
        } else if (blockchain.name === "solana") {
            await disconnect();
        }
    }, [blockchain]);

    const Connect = useCallback(async () => {
        try {
            if (blockchain.name === "solana") {
                setVisible(true);
                return undefined;
            }

            if (blockchain.name === "polygon_evm") {
                const connector = await web3Connect()
                return connector
            }

            let connection = await connect();
            return connection;
        } catch (error) {
            console.error(error);
        }
    }, [blockchain]);

    const Wallet = useMemo(() => {
        if (blockchain.name === "solana" && wallet) {
            return wallet.adapter.name;
        }
        return walletType;
    }, [blockchain, walletType, wallet]);

    const Collection = useMemo(() => {
        if (blockchain.name === "celo") {
            return CollectionName.Celo;
        } else if (blockchain.name === "solana" && wallet) {
            return CollectionName.Solana;
        }
        return CollectionName.Celo;
    }, [blockchain]);

    const SendTransaction = useCallback(
        async (
            account: IAccount,
            inputArr: IPaymentInput[],
            {
                task,
                tags,
                isStreaming = false,
                startTime,
                endTime,
                budget,
                subbudget,
                swap,
            }: {
                budget?: IBudgetORM;
                subbudget?: ISubbudgetORM;
                isStreaming?: boolean;
                task?: Task;
                tags?: ITag[];
                startTime?: number;
                endTime?: number;
                swap?: ISwap;
            } = {}
        ) => {
            let txhash;
            const Address = account.address;
            if (!blockchain) throw new Error("blockchain not found");
            if (!Address) throw new Error("Address not set");
            if (inputArr.length === 0) throw new Error("No inputs");
            const txData = await dispatch(
                FetchPaymentData({
                    blockchain: blockchain.name,
                    executer: Address,
                    requests: inputArr,
                    endTime: endTime ?? null,
                    startTime: startTime ?? null,
                    isStreaming,
                    swap: swap ?? null,
                })
            ).unwrap();

            if (blockchain.name === "celo") {
                const destination = txData.destination as string;
                const data = txData.data as string;
                const web3 = new Web3((window as any).celo);

                let option = {
                    data,
                    gas: "500000",
                    from: Address,
                    to: destination,
                    gasPrice: "500000000",
                    value: "0",
                };

                if (swap) {
                    await allow(
                        Address,
                        swap.inputCoin.contractAddress,
                        "0xE3D8bd6Aed4F159bc8000a9cD47CffDb95F96121",
                        swap.amount
                    );
                }

                const approveArr = await GroupCoinsForApprove(inputArr, GetCoins);
                if (inputArr.length > 1) {
                    for (let index = 0; index < approveArr.length; index++) {
                        await allow(
                            Address,
                            approveArr[index].coin.contractAddress,
                            Contracts.BatchRequest.address,
                            approveArr[index].amount.toString()
                        );
                    }
                }

                if (task) {
                    const command = data;
                    for (let index = 0; index < approveArr.length; index++) {
                        await allow(
                            Address,
                            approveArr[index].coin.contractAddress,
                            Contracts.Gelato.address,
                            approveArr[index].amount.toString()
                        );
                    }
                    const txHash = await createTask(
                        account,
                        task.startDate,
                        task.interval,
                        Contracts.BatchRequest.address,
                        command
                    );
                    dispatch(Refresh_Data_Thunk());
                    return;
                }

                if (account.signerType === "single") {
                    const recipet = await web3.eth.sendTransaction(option);
                    const hash = recipet.transactionHash;
                    txhash = hash;
                    if (tags && tags.length > 0) {
                        for (const tag of tags) {
                            await dispatch(
                                AddTransactionToTag({
                                    id: account.id,
                                    tagId: tag.id,
                                    transactionId: hash,
                                })
                            );
                        }
                    }
                } else {
                    const txHash = await submitTransaction(
                        account.address,
                        data,
                        destination
                    );
                    txhash = txHash;
                }
            } else if (
                blockchain.name === "solana" &&
                publicKey &&
                signTransaction &&
                signAllTransactions
            ) {
                const data = txData.data as TransactionInstruction[];
                const destination = txData.destination;

                if (account.signerType === "multi") {
                    const txHash = await submitTransaction(
                        account.address,
                        data,
                        destination
                    );
                    dispatch(Refresh_Data_Thunk());
                    return;
                }
                const transaction = new Transaction();
                transaction.add(...data);

                const signature = await sendTransaction(transaction, connection);
                const latestBlockHash = await connection.getLatestBlockhash();
                await connection.confirmTransaction({
                    blockhash: latestBlockHash.blockhash,
                    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
                    signature: signature,
                });

                if (tags && tags.length > 0) {
                    for (const tag of tags) {
                        await dispatch(
                            AddTransactionToTag({
                                id: account.id,
                                tagId: tag.id,
                                transactionId: signature,
                            })
                        );
                    }
                }
                txhash = signature;
            }
            if (budget && txhash) {
                const coins = await GroupCoinsForApprove(inputArr, GetCoins);
                for (const coin of coins) {
                    await dispatch(
                        Add_Tx_To_Budget_Thunk({
                            budget: budget,
                            tx: {
                                isSendingOut: true,
                                hash: txhash,
                                amount: coin.amount,
                                token: coin.coin.name,
                                timestamp: GetTime(),
                            },
                        })
                    );

                    if (subbudget) {
                        await dispatch(
                            Add_Tx_To_Subbudget_Thunk({
                                subbudget: subbudget,
                                tx: {
                                    isSendingOut: true,
                                    hash: txhash,
                                    amount: coin.amount,
                                    token: coin.coin.name,
                                    timestamp: GetTime(),
                                },
                            })
                        );
                    }
                }
            }
            dispatch(Refresh_Data_Thunk());
            return;
        },
        [blockchain, publicKey, address]
    );

    return {
        Address,
        Disconnect,
        blockchain,
        Wallet,
        setBlockchain,
        Connect,
        Connected,
        GetCoins,
        SendTransaction,
        Collection,
        setBlockchainAuto,
        fromMinScale,
        signMessageInWallet,
    };
}

export const GroupCoinsForApprove = async (
    inputArr: IPaymentInput[],
    GetCoin: Coins
) => {
    const approveArr: { coin: AltCoins; amount: number }[] = [];

    for (let index = 0; index < inputArr.length; index++) {
        const element = inputArr[index];
        const coin = GetCoin[element.coin];
        if (!approveArr.some((e) => e.coin.name === coin.name)) {
            approveArr.push({ coin: coin, amount: element.amount });
        } else {
            approveArr.find((e) => e.coin.name === coin.name)!.amount +=
                element.amount;
        }
    }

    return approveArr;
};
