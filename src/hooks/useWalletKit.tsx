import { useContractKit } from '@celo-tools/use-contractkit'
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { PublicKey } from '@solana/web3.js';
import React, { useCallback, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useLazyGetTransactionsQuery } from 'redux/api';
import { BlockChainTypes, selectBlockchain, updateBlockchain } from 'redux/reducers/network';
import { AltCoins, CeloCoins, CoinsName, SolanaCoins, TokenType } from 'types';
import { Transactions } from 'types/sdk';
import { fromLamport, fromWei } from 'utils/ray';
import { ERC20MethodIds } from './useTransactionProcess';

export default function useWalletKit() {
    const blockchain = useSelector(selectBlockchain)
    const dispatch = useDispatch()

    const { setVisible } = useWalletModal();

    const [transactionTrigger, { data: transactionData, isFetching: transactionFetching }] = useLazyGetTransactionsQuery()
    const [txs, setTxs] = useState<Transactions[]>([])

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
        } else if (blockchain === "solana") {
            return SolanaCoins;
        }
    }, [blockchain])

    const GetTransactions = useCallback(async () => {
        if (blockchain === "solana" && publicKey) {
            const txsList: Transactions[] = []
            // new PublicKey("So11111111111111111111111111111111111111112")
            const sings = await connection.getConfirmedSignaturesForAddress2(publicKey, {limit: 1000})
            const txs = await connection.getParsedTransactions(sings.map(s => s.signature))
            for (const tx of txs) {
                let parsedTx: Transactions = {
                    from: (tx?.transaction.message.instructions[0] as any)["parsed"]["info"]["source"] ?? "",
                    to: (tx?.transaction.message.instructions[0] as any)["parsed"]["info"]["destination"] ?? "",
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
                    value: (tx?.transaction.message.instructions[0] as any)["parsed"]["info"]["lamports"] ?? "0",
                    cumulativeGasUsed: "",
                    logIndex: "",
                    tokenDecimal: "",
                    tokenName: CoinsName.SOL,
                    tokenSymbol: CoinsName.SOL,
                    transactionIndex: "",
                }
                txsList.push(parsedTx)
            }
            console.log(txs)
            setTxs(txsList)
        } else if (blockchain === 'celo' && address) {
            transactionTrigger(address)
                .unwrap()
                .then(txs => {
                    setTxs(txs.result)
                })
                .catch(() => {
                    transactionTrigger(address).unwrap().catch((error: any) => { console.error(error) })
                })
        }
    }, [blockchain, publicKey, address])

    const GetBalance = useCallback(async (item?: AltCoins, addressParams?: string) => {
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
                    lamports = (await connection.getTokenAccountBalance(new PublicKey(item.contractAddress))).value.decimals
                }
                return fromLamport(lamports)
            }
            return 0;
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
    }, [blockchain, publicKey, address])

    const Disconnect = useCallback(async () => {
        if (blockchain === 'celo') {
            await destroy();
        } else if (blockchain === 'solana') {
            await disconnect();
        }
    }, [blockchain])

    const Connect = useCallback(async () => {
        if (blockchain === 'celo') {
            return await connect();
        } else if (blockchain === 'solana') {
            console.log(blockchain)
            setVisible(true);
            return undefined;
        }
        return await connect();
        //throw new Error("Blockchain not supported")
    }, [blockchain])

    const Wallet = useMemo(() => {
        if (blockchain === 'celo') {
            return walletType;
        } else if (blockchain === 'solana' && wallet) {
            return wallet.adapter.name
        }
        return walletType
    }, [blockchain])


    return { Address, Disconnect, GetBalance, blockchain, Wallet, setBlockchain, Connect, Connected, GetCoins, txs, GetTransactions }
}
