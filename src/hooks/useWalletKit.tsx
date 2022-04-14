import { useContractKit } from '@celo-tools/use-contractkit'
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { useCallback, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useLazyGetTransactionsQuery } from 'redux/api';
import { BlockChainTypes, selectBlockchain, updateBlockchain } from 'redux/reducers/network';
import { AltCoins, CeloCoins, CoinsName, SolanaCoins, TokenType } from 'types';
import { Transactions } from 'types/sdk';
import { fromLamport, fromWei, toLamport } from 'utils/ray';
import { ERC20MethodIds } from './useTransactionProcess';
import useCeloPay, { PaymentInput, Task } from 'API/useCeloPay'
import { Tag } from 'API/useTags';
import { toTransactionObject } from '@celo/connect';
const multiProxy = import("API/ABI/MultisigProxy.json");
const multisigContract = import("API/ABI/Multisig.json")

enum CollectionName {
    Celo = "currencies",
    Solana = "solanaCurrencies"
}

export default function useWalletKit() {
    const blockchain = useSelector(selectBlockchain) as "celo" | "solana"
    const dispatch = useDispatch()

    const { setVisible } = useWalletModal();
    const { Pay, BatchPay } = useCeloPay()

    const [transactionTrigger, { data: transactionData, isFetching: transactionFetching }] = useLazyGetTransactionsQuery()

    //Celo
    const { address, destroy, kit, walletType, connect, initialised } = useContractKit()

    //solana
    const { connection } = useConnection();
    const { publicKey, sendTransaction, disconnect, wallet, connect: solConnect, connected } = useWallet();

    const setBlockchain = (bc: BlockChainTypes) => {
        dispatch(updateBlockchain(bc))
    }

    const GetCoins = useMemo(() => {
        if (blockchain === "celo") {
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

            for (const tx of txs) {
                const len = tx ? tx.transaction.message.instructions.length - 1 : 0
                let parsedTx: Transactions = {
                    from: (tx?.transaction.message.instructions[len] as any)["parsed"]["info"]["source"] ?? "",
                    to: (tx?.transaction.message.instructions[len] as any)["parsed"]["info"]["destination"] ?? "",
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
                    value: (tx?.transaction.message.instructions[len] as any)["parsed"]["info"]["lamports"] ?? "0",
                    cumulativeGasUsed: "",
                    logIndex: "",
                    tokenDecimal: "",
                    tokenName: Object.values(SolanaCoins).find(c => c.contractAddress.toLowerCase() === (tx?.transaction.message.instructions[len] as any)["parsed"]["info"]["mint"]?.toLowerCase())?.name ?? "",
                    tokenSymbol: Object.values(SolanaCoins).find(c => c.contractAddress.toLowerCase() === (tx?.transaction.message.instructions[len] as any)["parsed"]["info"]["mint"]?.toLowerCase())?.name ?? CoinsName.noCoin,
                    transactionIndex: "",
                }
                txsList.push(parsedTx)
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
                        lamports = await connection.getBalance(publicKey)
                    } else {
                        const tok = await connection.getTokenAccountsByOwner(publicKey, { mint: new PublicKey(item.contractAddress) })
                        // lamports = await connection.getTokenAccountsByOwner(publicKey, {programId: new PublicKey(item.contractAddress)})
                        lamports = tok.value.length > 0 ? tok.value[0].account.lamports : 0
                    }
                    return fromLamport(lamports)
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
        if (blockchain === 'solana') {
            console.log(blockchain)
            setVisible(true);
            return undefined;
        }
        return await connect();
        //throw new Error("Blockchain not supported")
    }, [blockchain])

    const Wallet = useMemo(() => {
        if (blockchain === 'solana' && wallet) {
            return wallet.adapter.name
        }
        return walletType
    }, [blockchain])

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
        } else if (blockchain === 'solana' && publicKey) {
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: new PublicKey(recipient),
                    lamports: toLamport(amount),
                })
            )
            const signature = await sendTransaction(transaction, connection);

            return await connection.confirmTransaction(signature, 'processed');
        }
    }, [blockchain, publicKey, address])

    const SendBatchTransaction = useCallback(async (inputArr: PaymentInput[], task?: Task, tags?: Tag[]) => {
        if (blockchain === 'celo') {
            await BatchPay(inputArr, task, tags)
        } else if (blockchain === 'solana' && publicKey) {
            const transaction = new Transaction()
            for (const item of inputArr) {
                transaction.add(
                    SystemProgram.transfer({
                        fromPubkey: publicKey,
                        toPubkey: new PublicKey(item.recipient),
                        lamports: toLamport(item.amount),
                    })
                )
            }
            const signature = await sendTransaction(transaction, connection);

            await connection.confirmTransaction(signature, 'processed');
        }
        return
    }, [blockchain, publicKey, address])


    const CreateMultisigAccount = useCallback(async (owners: string[], name: string, sign: string, internalSign: string) => {
        if (blockchain === 'solana') {
            
            return ""
        }

        const { abi: proxyABI, bytecode: proxyBytecode } = await multiProxy
        const { abi: multiSigABI, bytecode: multiSigBytecode } = await multisigContract
        const tx0 = toTransactionObject(
            kit.connection,
            (new kit.web3.eth.Contract(proxyABI as any)).deploy({ data: proxyBytecode }) as any)

        const tx1 = toTransactionObject(
            kit.connection,
            (new kit.web3.eth.Contract(multiSigABI as any)).deploy({ data: multiSigBytecode }) as any)

        const res0 = await tx0.sendAndWaitForReceipt({ from: address!, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') })
        const res1 = await tx1.sendAndWaitForReceipt({ from: address!, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') })
        if (!res0.contractAddress || !res1.contractAddress) {
            throw new Error("MultiSig deploy failure");
        }
        const proxyAddress = res0.contractAddress
        const multiSigAddress = res1.contractAddress

        new Promise(resolve => setTimeout(resolve, 500))
        const initializerAbi = multiSigABI.find((abi) => abi.type === 'function' && abi.name === 'initialize')
        const callData = kit.web3.eth.abi.encodeFunctionCall(
            initializerAbi as any,
            [[address, ...owners] as any, sign as any, internalSign as any]
        )

        const proxy = new kit.web3.eth.Contract(proxyABI as any, proxyAddress)
        const txInit = toTransactionObject(
            kit.connection,
            proxy.methods._setAndInitializeImplementation(multiSigAddress, callData)
        )
        const txChangeOwner = toTransactionObject(
            kit.connection,
            proxy.methods._transferOwnership(proxyAddress)
        )
        await txInit.sendAndWaitForReceipt({ from: address!, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') })
        await txChangeOwner.sendAndWaitForReceipt({ from: address!, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') })

        return proxyAddress;
    }, [blockchain])


    return {
        Address, Disconnect, GetBalance, blockchain,
        Wallet, setBlockchain, Connect, Connected,
        GetCoins, GetTransactions, SendTransaction,
        SendBatchTransaction, Collection, CreateMultisigAccount
    }
}
