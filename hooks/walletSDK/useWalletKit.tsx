import { useContractKit, useContractKitContext, localStorageKeys, WalletTypes, PROVIDERS } from '@celo-tools/use-contractkit'
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useLazyGetTransactionsQuery } from 'redux/api';
import { BlockChainTypes, selectBlockchain, updateBlockchain } from 'redux/reducers/network';
import { AltCoins, CeloCoins, CoinsName, PoofCoins, SolanaCoins, TokenType } from 'types';
import { Transactions } from 'types/sdk';
import { fromLamport, fromWei, toLamport } from 'utils/ray';
import { ERC20MethodIds } from '../useTransactionProcess';
import useCeloPay, { PaymentInput, Task } from 'rpcHooks/useCeloPay'
import { Tag } from 'rpcHooks/useTags';

import * as spl from 'easy-spl'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { useFirestoreSearchField } from 'rpcHooks/useFirebase';
import { IUser } from 'firebaseConfig/types';
import { changePrivateToken } from 'redux/reducers/selectedAccount';
import { TextDecoder, TextEncoder } from 'util';
import { GetSignedMessage } from 'utils';
import useNextSelector from 'hooks/useNextSelector';



export enum CollectionName {
    Celo = "currencies",
    Solana = "solanaCurrencies"
}

export type BlockchainType = "celo" | "solana"

export default function useWalletKit() {
    const blockchain = useNextSelector(selectBlockchain) as BlockchainType;
    const dispatch = useDispatch()

    const { setVisible } = useWalletModal();
    const { Pay, BatchPay } = useCeloPay()

    const [transactionTrigger] = useLazyGetTransactionsQuery()

    const { search, isLoading } = useFirestoreSearchField()

    //Celo
    const { address, destroy, kit, walletType, connect, initialised } = useContractKit()
    const [ctx, setState] = useContractKitContext()


    //solana
    const { connection } = useConnection();
    const { publicKey, sendTransaction, signMessage, disconnect, wallet, connect: solConnect, connected, signTransaction, signAllTransactions } = useWallet();


    const setBlockchain = (bc: BlockChainTypes) => {
        dispatch(updateBlockchain(bc))
    }

    const setBlockchainAuto = () => {
        if (address) {
            localStorage.setItem('blockchain', "celo")
            dispatch(updateBlockchain("celo"))
        } else if (publicKey) {
            localStorage.setItem('blockchain', "solana")
            dispatch(updateBlockchain("solana"))
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

    const GetTransactions = useCallback(async (customAddress?: string) => {
        if (blockchain === "solana" && publicKey) {
            const txsList: Transactions[] = []
            // new PublicKey("So11111111111111111111111111111111111111112")
            const sings = await connection.getConfirmedSignaturesForAddress2(customAddress ? new PublicKey(customAddress) : publicKey, { limit: 1000 })
            const txs = await connection.getParsedTransactions(sings.map(s => s.signature))
            const tokens = await connection.getTokenAccountsByOwner(publicKey, { programId: TOKEN_PROGRAM_ID })

            for (const tx of txs) {
                const arr = tx?.transaction.message.instructions
                if (arr) {
                    const arrLen = arr.length;
                    let amount, from, to, token: CoinsName = CoinsName.SOL;
                    for (let index = 0; index < arrLen - 1; index++) {
                        if ((arr[index] as any)?.["parsed"]?.["type"]) {
                            from = (arr[index] as any)["parsed"]["info"]["source"] ?? ""
                            to = (arr[index] as any)["parsed"]["info"]["destination"] ?? ""
                            if ((arr[index] as any)["parsed"]["info"]?.["mint"]) {
                                token = Object.values(SolanaCoins).find(c => c.contractAddress.toLowerCase() === (arr[index] as any)["parsed"]["info"]["mint"]?.toLowerCase())?.name ?? CoinsName.noCoin
                                amount = (arr[index] as any)["parsed"]["info"]["tokenAmount"]?.amount
                            } else {
                                token = CoinsName.SOL
                                amount = (arr[index] as any)["parsed"]["info"]["lamports"] ?? "0"
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
                        timeStamp: (tx?.blockTime ?? Math.floor(new Date().getTime() / 1e3)).toString(),
                        contractAddress: SolanaCoins.SOL.contractAddress ?? "",
                        value: amount,
                        cumulativeGasUsed: "",
                        logIndex: "",
                        tokenDecimal: "",
                        tokenName: token,
                        tokenSymbol: token,
                        transactionIndex: "",
                    }
                    txsList.push(parsedTx)
                }
            }

            return txsList
        }

        const txs = await transactionTrigger(customAddress ?? (address ?? ""))
            .unwrap()
        return txs.result

    }, [blockchain, publicKey, address])

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
            if (localStorage.getItem(localStorageKeys.lastUsedWalletType) === "PrivateKey") {
                const str = localStorage.getItem(localStorageKeys.lastUsedWalletArguments)
                if (str) {
                    const key = JSON.parse(str)

                    if (key[0] !== "GoldToken") {
                        kit.addAccount(key[0])
                        const accounts = kit.getWallet()?.getAccounts()
                        if (accounts) {
                            kit.defaultAccount = accounts[0]
                            const connector = ctx.connector;
                            connector.type = WalletTypes.PrivateKey;
                            await search("users", [
                                {
                                    field: 'address',
                                    searching: accounts[0],
                                    indicator: "array-contains"
                                }
                            ])

                            dispatch(changePrivateToken(key[0]))
                            setState("setConnector", connector)
                            setState("setAddress", accounts[0])
                        }
                    }
                }
            }
            return connection;
        } catch (error) {
            console.error(error)
        }
        //throw new Error("Blockchain not supported")
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

    const SendTransaction = useCallback(async ({ coin, amount, recipient, comment }: PaymentInput, task?: Task, tags?: Tag[]) => {
        if (blockchain === 'celo') {
            return await Pay({ coin, amount, recipient, comment })
        } else if (blockchain === 'solana' && publicKey && signAllTransactions && signTransaction) {
            let params: any = {
                fromPubkey: publicKey,
                toPubkey: new PublicKey(recipient),
                lamports: toLamport(amount),
            };

            if (coin.contractAddress) {
                const user = spl.Wallet.fromWallet(connection, {
                    publicKey,
                    signAllTransactions,
                    signTransaction
                })
                return await user.transferToken(new PublicKey(coin.contractAddress), new PublicKey(recipient), Number(amount))
            }

            const transaction = new Transaction().add(SystemProgram.transfer(params))

            const signature = await sendTransaction(transaction, connection);

            return await connection.confirmTransaction(signature, 'processed');
        }
    }, [blockchain, publicKey, address])

    const SendBatchTransaction = useCallback(async (inputArr: PaymentInput[], task?: Task, tags?: Tag[]) => {
        if (blockchain === 'celo') {
            await BatchPay(inputArr, task, tags)
        } else if (blockchain === 'solana' && publicKey && signTransaction && signAllTransactions) {
            const transaction = new Transaction()
            for (const item of inputArr) {
                let params: any = {
                    fromPubkey: publicKey,
                    toPubkey: new PublicKey(item.recipient),
                    lamports: toLamport(item.amount),
                }
                if (item.coin.contractAddress) {
                    transaction.add(
                        ...(await spl.token.transferTokenInstructions(
                            connection, new PublicKey(item.coin.contractAddress),
                            publicKey, new PublicKey(item.recipient),
                            Number(item.amount)
                        ))
                    )
                } else {
                    transaction.add(
                        SystemProgram.transfer(params)
                    )
                }
            }
            const signature = await sendTransaction(transaction, connection);

            await connection.confirmTransaction(signature, 'processed');
        }
        return
    }, [blockchain, publicKey, address])


    return {
        Address, Disconnect, GetBalance, blockchain,
        Wallet, setBlockchain, Connect, Connected,
        GetCoins, GetTransactions, SendTransaction,
        SendBatchTransaction, Collection, setBlockchainAuto,
        fromMinScale, signMessageInWallet
    }
}
