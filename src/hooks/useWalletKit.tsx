import { useContractKit } from '@celo-tools/use-contractkit'
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import React, { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { BlockChainTypes, selectBlockchain, updateBlockchain } from 'redux/reducers/network';
import { AltCoins } from 'types';
import { fromWei } from 'utils/ray';

export default function useWalletKit() {
    const blockchain = useSelector(selectBlockchain)
    const dispatch = useDispatch()

    //Celo
    const { address, destroy, kit, walletType } = useContractKit()

    //solana
    const { connection } = useConnection();
    const { publicKey, sendTransaction, disconnect, wallet } = useWallet();

    const setBlockchain = (bc: BlockChainTypes) => {
        dispatch(updateBlockchain(bc))
    }

    const GetBalance = useCallback(async (item?: AltCoins, addressParams?: string) => {
        if (blockchain === 'celo' && item) {
            const ethers = await kit.contracts.getErc20(item.contractAddress);
            let balance = await ethers.balanceOf(addressParams ?? (address ?? ""));
            return fromWei(balance)
        } else if (blockchain === 'solana') {
            if (publicKey) {
                const lamports = await connection.getBalance(publicKey);
                return lamports
            }
            return 0;
        }
    }, [])

    const Address = useMemo((): string | null => {
        if (blockchain === 'celo') {
            return address;
        } else if (blockchain === 'solana') {
            return publicKey?.toBase58() ?? null;
        }
        return null
    }, [])

    const Disconnect = useCallback(async () => {
        if (blockchain === 'celo') {
            await destroy();
        } else if (blockchain === 'solana') {
            await disconnect();
        }
    }, [])

    const Wallet = useMemo(() => {
        if (blockchain === 'celo') {
            return walletType;
        } else if (blockchain === 'solana') {
            return wallet?.adapter.name
        }
    }, [])


    return { Address, Disconnect, GetBalance, blockchain, Wallet, setBlockchain }
}
