import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useWalletKit } from 'hooks';
import * as anchor from "@project-serum/anchor";
import { SolanaProvider } from "@saberhq/solana-contrib";
import { useMemo } from 'react';

export default function useSolanaProvider() {
  const { blockchain } = useWalletKit()
  const { connection } = useConnection();
  const { publicKey, signTransaction, signAllTransactions, sendTransaction } = useWallet();

  const Provider = useMemo(() => {
    if (blockchain === 'solana') {
      if (!publicKey || !signAllTransactions || !signTransaction) throw new Error("Wallet not initialized");
      const anchorProvider = new anchor.AnchorProvider(connection, {
        publicKey,
        signAllTransactions,
        signTransaction
      }, {})
      anchor.setProvider(anchorProvider);

      return SolanaProvider.init({
        connection: connection,
        wallet: {
          publicKey,
          signAllTransactions,
          signTransaction
        },
        opts: anchorProvider.opts,
      });
    }
  }, [blockchain])

  const AnchorProvider = useMemo(() => {
    if (blockchain === 'solana') {
      if (!publicKey || !signAllTransactions || !signTransaction) throw new Error("Wallet not initialized");
      const anchorProvider = new anchor.AnchorProvider(connection, {
        publicKey,
        signAllTransactions,
        signTransaction
      }, {})
      anchor.setProvider(anchorProvider);

      return anchorProvider
    }
  }, [blockchain])

  return { Provider }
}
