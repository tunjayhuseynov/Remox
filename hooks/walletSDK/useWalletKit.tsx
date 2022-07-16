import { useContractKit, useContractKitContext, localStorageKeys, WalletTypes, PROVIDERS } from '@celo-tools/use-contractkit'
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux';
import { AltCoins, CeloCoins, Coins, PoofCoins, SolanaCoins, TokenType } from 'types';
import { fromLamport, fromWei } from 'utils/ray';
import * as spl from 'easy-spl'
import { TextDecoder, TextEncoder } from 'util';
import { GetSignedMessage } from 'utils';
import { SelectBlockchain, setBlockchain as SetBlockchain } from 'redux/slices/account/remoxData';
import { FetchPaymentData } from 'redux/slices/account/thunks/payment';
import { useAppDispatch } from 'redux/hooks';
import { IPaymentInput } from 'pages/api/payments/send';
import Web3 from 'web3'
import { Contracts } from 'rpcHooks/Contracts/Contracts';
import useAllowance from 'rpcHooks/useAllowance';
import useTasking from 'rpcHooks/useTasking';
import { DateInterval } from 'types/dashboard/contributors';
import { ITag } from 'pages/api/tags';
import { IAccount } from 'firebaseConfig';
import useMultisig from './useMultisig';


export enum CollectionName {
    Celo = "currencies",
    Solana = "solanaCurrencies"
}

export interface Task {
    interval: DateInterval | "instant",
    startDate: number,
}

export type BlockchainType = "celo" | "solana"

export const MULTISIG_PROVIDERS = [
    {
        name: "Celo Terminal",
        type: "celoTerminal",
        blockchain: "celo"
    },
    {
        name: "Goki",
        type: "goki",
        blockchain: "solana"
    },
]

export default function useWalletKit() {
    const blockchain = useSelector(SelectBlockchain) as BlockchainType;
    const dispatch = useAppDispatch()

    const { allow } = useAllowance()
    const { createTask } = useTasking()
    const { submitTransaction } = useMultisig()

    const { setVisible } = useWalletModal();

    //Celo
    const { address, destroy, kit, walletType, connect, initialised } = useContractKit()
    const [ctx, setState] = useContractKitContext()


    //solana
    const { connection } = useConnection();
    const { publicKey, sendTransaction, signMessage, disconnect, wallet, connect: solConnect, connected, signTransaction, signAllTransactions } = useWallet();


    const setBlockchain = (bc: BlockchainType) => {
        dispatch(SetBlockchain(bc))
    }

    const getMultisigProviders = useMemo(() => {
        if (blockchain === "celo") {
            return MULTISIG_PROVIDERS.filter(p => p.blockchain === "celo")
        }

        return MULTISIG_PROVIDERS.filter(p => p.blockchain === "solana")
    }, [blockchain])

    const setBlockchainAuto = () => {
        if (address) {
            localStorage.setItem('blockchain', "celo")
            dispatch(SetBlockchain("celo"))
        } else if (publicKey) {
            localStorage.setItem('blockchain', "solana")
            dispatch(SetBlockchain("solana"))
        }
    }

    const fromMinScale = useMemo(() => {
        if (blockchain === "celo") {
            return fromWei
        }

        return fromLamport;
    }, [blockchain])

    const signMessageInWallet = useCallback(async (nonce: number) => {
        if (blockchain === "celo") {
            const signature = await kit.web3.eth.personal.sign(GetSignedMessage(nonce), Address!, "");
            return {
                publicKey: Address!,
                signature
            }
        }
        const encodedMessage = new TextEncoder().encode(GetSignedMessage(nonce))
        if (!signMessage) throw new Error("signMessage not found")
        const signature = await signMessage(encodedMessage);
        return {
            publicKey: Address!,
            signature: new TextDecoder().decode(signature)
        }
    }, [blockchain, kit])

    const GetCoins = useMemo(() => {
        if (blockchain === "celo") {
            if (typeof localStorage !== "undefined" && localStorage.getItem(localStorageKeys.lastUsedWalletType) === "PrivateKey") {
                return PoofCoins
            }
            return CeloCoins;
        }

        return SolanaCoins;
    }, [blockchain])

    const GetBalance = useCallback(async (item?: AltCoins, addressParams?: string) => {
        try {
            if (blockchain === 'celo' && item) {
                const ethers = await kit.contracts.getErc20(item.contractAddress);
                let balance = await ethers.balanceOf(addressParams ?? (address ?? ""));
                return fromWei(balance)
            } else if (blockchain === 'solana' && item) {
                if (publicKey) {
                    let lamports;
                    if (item.type === TokenType.GoldToken) {
                        lamports = fromLamport(await connection.getBalance(publicKey))
                    } else {
                        const tok = await spl.mint.getBalance(connection, new PublicKey(item.contractAddress), publicKey)
                        // lamports = await connection.getTokenAccountsByOwner(publicKey, {programId: new PublicKey(item.contractAddress)})
                        lamports = tok ?? 0
                    }
                    return lamports
                }
                return 0;
            }
        } catch (error: any) {
            console.error(item?.name, error.message)
        }
    }, [blockchain, publicKey, address])

    const Address = useMemo((): string | null => {
        if (blockchain === 'celo') {
            return address;
        } else if (blockchain === 'solana') {
            return publicKey?.toBase58() ?? null;
        }
        return address // Has to be change to null
    }, [blockchain, publicKey, address])

    const Connected = useMemo(() => {
        if (blockchain === 'celo') {
            return initialised;
        } else if (blockchain === 'solana') {
            return connected;
        }
        return initialised // Has to be change to null
    }, [blockchain, publicKey, address, initialised, connected])

    const Disconnect = useCallback(async () => {
        if (blockchain === 'celo') {
            await destroy();
        } else if (blockchain === 'solana') {
            await disconnect();
        }
    }, [blockchain])

    const Connect = useCallback(async () => {
        try {
            if (blockchain === 'solana') {
                setVisible(true);
                return undefined;
            }

            let connection = await connect();
            return connection;
        } catch (error) {
            console.error(error)
        }
    }, [blockchain])

    const Wallet = useMemo(() => {
        if (blockchain === 'solana' && wallet) {
            return wallet.adapter.name
        }
        return walletType
    }, [blockchain, walletType, wallet])

    const Collection = useMemo(() => {
        if (blockchain === 'celo') {
            return CollectionName.Celo
        } else if (blockchain === 'solana' && wallet) {
            return CollectionName.Solana
        }
        return CollectionName.Celo
    }, [blockchain])

    const SendTransaction = useCallback(async (account: IAccount, inputArr: IPaymentInput[], { task, tags, isStreaming = false, startTime, endTime }: { isStreaming?: boolean, task?: Task, tags?: ITag[], startTime?: number, endTime?: number, } = {}) => {
        const Address = account.address;
        if (!Address) throw new Error("Address not set")
        if (inputArr.length === 0) throw new Error("No inputs")
        const txData = await dispatch(FetchPaymentData({
            blockchain,
            executer: Address,
            requests: inputArr,
            endTime: endTime ?? null,
            startTime: startTime ?? null,
            isStreaming,
        })).unwrap()

        if (blockchain === 'celo') {
            const destination = txData.destination as string;
            const data = txData.data as string;
            const web3 = new Web3((window as any).celo);
            // let contract: Contract = new web3.eth.Contract((inputArr.length > 1 ? BatchRequestABI.abi : ERC20ABI) as AbiItem[], destination);
            let option = {
                data,
                gas: "500000",
                from: Address,
                to: destination,
                gasPrice: "500000000",
                value: "0",
            }

            const approveArr = await GroupCoinsForApprove(inputArr, GetCoins)
            if (inputArr.length > 1) {
                for (let index = 0; index < approveArr.length; index++) {
                    await allow(Address, approveArr[index].coin.contractAddress, Contracts.BatchRequest.address, approveArr[index].amount.toString())
                }
            }

            if (task) { // Need Multisig
                const abi = data;
                for (let index = 0; index < approveArr.length; index++) {
                    await allow(Address, approveArr[index].coin.contractAddress, Contracts.Gelato.address, approveArr[index].amount.toString())
                }
                await createTask(account, task.startDate, task.interval, Contracts.BatchRequest.address, abi);
                return
            }

            if (account.signerType === "single") {
                const recipet = await web3.eth.sendTransaction(option)
                const hash = recipet.transactionHash
            } else {
                await submitTransaction(account.address, data, destination)
            }

        } else if (blockchain === 'solana' && publicKey && signTransaction && signAllTransactions) {
            const data = txData.data as TransactionInstruction[]
            const destination = txData.destination

            if (account.signerType === "multi") {
                await submitTransaction(account.address, data, destination)
                return
            }
            const transaction = new Transaction()
            transaction.add(...data)

            const signature = await sendTransaction(transaction, connection);
            const latestBlockHash = await connection.getLatestBlockhash();
            await connection.confirmTransaction({
                blockhash: latestBlockHash.blockhash,
                lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
                signature: signature
            });
        }
        return
    }, [blockchain, publicKey, address])


    return {
        Address, Disconnect, GetBalance, blockchain,
        Wallet, setBlockchain, Connect, Connected,
        GetCoins, getMultisigProviders,
        SendTransaction, Collection, setBlockchainAuto,
        fromMinScale, signMessageInWallet
    }
}

export const GroupCoinsForApprove = async (inputArr: IPaymentInput[], GetCoin: Coins) => {
    const approveArr: { coin: AltCoins, amount: number }[] = []

    for (let index = 0; index < inputArr.length; index++) {
        const element = inputArr[index];
        const coin = GetCoin[element.coin]
        if (!approveArr.some(e => e.coin.name === coin.name)) {
            approveArr.push({ coin: coin, amount: element.amount })
        } else {
            approveArr.find(e => e.coin.name === coin.name)!.amount += element.amount
        }
    }

    return approveArr;
}