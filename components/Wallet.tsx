import { useMemo } from 'react';
import {
    LedgerWalletAdapter,
    PhantomWalletAdapter,
    SlopeWalletAdapter,
    SolflareWalletAdapter,
    SolletExtensionWalletAdapter,
    SolletWalletAdapter,
    TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
    WalletModalProvider,
} from '@solana/wallet-adapter-react-ui';
import { BASE_URL } from 'utils/api';
import { CeloProvider, NetworkNames, SupportedProviders } from '@celo/react-celo';
import { Blockchains } from 'types/blockchains';

// import { publicProvider } from 'wagmi/providers/public';



export const CeloEndpoint = 'https://forno.celo.org';
export const SolanaEndpoint = "https://explorer-api.mainnet-beta.solana.com/"
export const SolanaSerumEndpoint = "https://solana-api.projectserum.com"


export default function Wallet({ children }: { children: JSX.Element }) {
    // const web3React = useWeb3React()
    const SolNetwork = WalletAdapterNetwork.Mainnet;

    // const { chains, provider } = configureChains(
    //     [chain.mainnet, chain.polygon, chain.optimism, chain.arbitrum, {
    //         id: 42220,
    //         name: 'Celo',
    //         network: 'mainnet',
    //         rpcUrls: {
    //             default: CeloEndpoint
    //         },
    //         nativeCurrency: {
    //             decimals: 18,
    //             name: 'CELO',
    //             symbol: 'CELO',
    //         },
    //         blockExplorers: {
    //             default: {
    //                 name: 'Celo Explorer',
    //                 url: 'https://explorer.celo.org',
    //             },
    //         },
    //         testnet: false,
    //     }],
    //     [
    //         publicProvider()
    //     ]
    // );

    // const { connectors } = getDefaultWallets({
    //     appName: 'Remox App',
    //     chains
    // });

    // const wagmiClient = createClient({
    //     autoConnect: true,
    //     connectors,
    //     provider
    // })

    // const endpoint = useMemo(() => clusterApiUrl(SolNetwork), [SolNetwork]);

    //"https://solana-api.projectserum.com"

    const solWallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SlopeWalletAdapter(),
            new SolflareWalletAdapter({ network: SolNetwork }),
            new TorusWalletAdapter(),
            new LedgerWalletAdapter(),
            new SolletWalletAdapter({ network: SolNetwork }),
            new SolletExtensionWalletAdapter({ network: SolNetwork }),
        ],
        [SolNetwork]
    );

    return (
        <ConnectionProvider endpoint={SolanaEndpoint} >
            <WalletProvider wallets={solWallets} autoConnect>
                <WalletModalProvider>
                    {/* <WagmiConfig client={wagmiClient}>
                        <RainbowKitProvider chains={chains}>
                            <YourApp />
                        </RainbowKitProvider>
                    </WagmiConfig> */}
                    <CeloProvider
                        dapp={{
                            name: 'Remox DAO',
                            icon: `${BASE_URL}/favicon.png`,
                            description: 'Remox - Contributor and Treasury Management Platform',
                            url: `${BASE_URL}`,
                        }}
                        defaultNetwork={"Celo"}
                        // network={{
                        //     name: NetworkNames.Mainnet,
                        //     rpcUrl: Blockchains.find(s => s.name === "celo")!.rpcUrl,
                        //     chainId: 42220,
                        //     explorer: Blockchains.find(s => s.name === "celo")!.explorerUrl,
                        // }}
                        manualNetworkMode={true}
                        connectModal={{
                            providersOptions: {
                                hideFromDefaults: [
                                    SupportedProviders.Valora,
                                    SupportedProviders.CeloDance,
                                    SupportedProviders.Omni,
                                    SupportedProviders.Steakwallet,
                                    SupportedProviders.CeloWallet,
                                    SupportedProviders.CeloTerminal,
                                    SupportedProviders.CeloExtensionWallet,
                                ]
                            }
                        }}
                        networks={[
                            {
                                name: "Celo",
                                rpcUrl: Blockchains.find(s => s.name === "celo")!.rpcUrl,
                                chainId: 42220,
                                explorer: Blockchains.find(s => s.name === "celo")!.explorerAPIUrl,
                            },
                            // {
                            //     chainId: 42220,
                            //     name: "Ethereum",
                            //     rpcUrl: Blockchains.find(s => s.name === "ethereum_evm")!.rpcUrl,
                            //     explorer: Blockchains.find(s => s.name === "ethereum_evm")!.explorerUrl,
                            // }
                        ]}
                    >
                        {children}
                    </CeloProvider>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    )
}
