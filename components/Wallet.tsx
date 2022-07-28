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
import { CeloProvider } from '@celo/react-celo';


export const CeloEndpoint = 'https://forno.celo.org';
export const SolanaEndpoint = "https://explorer-api.mainnet-beta.solana.com/"
export const SolanaSerumEndpoint = "https://solana-api.projectserum.com"


export default function Wallet({ children }: { children: JSX.Element }) {
    // const web3React = useWeb3React()
    const SolNetwork = WalletAdapterNetwork.Mainnet;

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
                    <CeloProvider
                        dapp={{
                            name: 'Remox DAO',
                            icon: `${BASE_URL}/favicon.png`,
                            description: 'Remox - Contributor and Treasury Management Platform',
                            url: `${BASE_URL}`,
                        }}
                    >
                        {children}
                    </CeloProvider>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    )
}
