import { Alfajores, ContractKitProvider, Mainnet } from '@celo-tools/use-contractkit'
import { CeloContract } from '@celo/contractkit'
import { useMemo } from 'react';
import { BaseUrl } from 'utils/const';
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


export default function Wallet({ children }: { children: JSX.Element }) {
    const SolNetwork = WalletAdapterNetwork.Mainnet;

    // const endpoint = useMemo(() => clusterApiUrl(SolNetwork), [SolNetwork]);

    const endpoint = "https://explorer-api.mainnet-beta.solana.com/" //"https://solana-api.projectserum.com"

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
        <ConnectionProvider endpoint={endpoint} >
            <WalletProvider wallets={solWallets} autoConnect>
                <WalletModalProvider>
                    <ContractKitProvider
                        feeCurrency={CeloContract.GoldToken}
                        dapp={{
                            name: 'Remox DAO',
                            icon: `${BaseUrl}/favicon.png`,
                            description: 'Remox - Contributor and Treasury Management Platform',
                            url: `${BaseUrl}`,
                        }}
                        networks={[Mainnet, Alfajores]}
                    >
                        {children}
                    </ContractKitProvider>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>

    )
}
