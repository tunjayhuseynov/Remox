import { useCallback, useMemo, useState } from "react";
import Web3 from "web3";
import Web3Modal from "web3modal";
import useAsyncEffect from "./useAsyncEffect";
import WalletConnectProvider from "@walletconnect/web3-provider";


const useWeb3Connector = () => {
    const [web3, setWeb3] = useState<Web3 | null>(null);

    useAsyncEffect(async () => {
        const w = window as any;
        if (w.ethereum) {
            const web3 = new Web3(w.ethereum);
            setWeb3(web3);
        }
    }, [])

    const address = useMemo(() => {
        if (web3 && web3.eth.accounts.wallet.length > 0) {
            return web3.eth.accounts.wallet[0].address;
        }
    }, [web3])

    const connected = useMemo(() => {
        return web3 !== null;
    }, []);


    const signMessage = async (message: string) => {
        if (!web3 || !address) {
            throw new Error("Web3 not connected");
        }
        return await web3.eth.personal.sign(message, address, "");
    }

    const connect = useCallback(async () => {
        const providerOptions = {
            /* See Provider Options Section */
            walletconnect: {
                display: {
                    name: "Mobile"
                },
                package: WalletConnectProvider,
                options: {
                    infuraId: "INFURA_ID" // required
                }
            }
        };

        const web3Modal = new Web3Modal({
            // network: "mainnet",
            // cacheProvider: true,
            providerOptions
        });

        const provider = await web3Modal.connect();

        const web3 = new Web3(provider);
        setWeb3(web3);
        return web3;
    }, [])

    return { web3, connect, connected, signMessage, address };

}

export default useWeb3Connector;