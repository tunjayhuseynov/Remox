import { useContractKit } from '@celo-tools/use-contractkit'
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import React, { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { BlockChainTypes, selectBlockchain, updateBlockchain } from 'redux/reducers/network';
import { AltCoins } from 'types';
import { fromWei } from 'utils/ray';

export default function useWalletKit() {
    const blockchain = useSelector(selectBlockchain)
    const dispatch = useDispatch()
    const { setVisible } = useWalletModal();

    //Celo
    const { address, destroy, kit, walletType, connect, initialised } = useContractKit()

    //solana
    const { connection } = useConnection();
    const { publicKey, sendTransaction, disconnect, wallet, connect: solConnect, connected } = useWallet();

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
    }, [blockchain])

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


    return { Address, Disconnect, GetBalance, blockchain, Wallet, setBlockchain, Connect, Connected }
}
