import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as anchor from "@project-serum/anchor";
import { SolanaProvider } from "@saberhq/solana-contrib";
import { useMemo } from 'react';
import { useAppSelector } from 'redux/hooks';
import { SelectBlockchain } from 'redux/slices/account/selector';

export default function useSolanaProvider() {
  const blockchain = useAppSelector(SelectBlockchain)
  const { connection } = useConnection();
  const { publicKey, signTransaction, signAllTransactions, sendTransaction } = useWallet();

  const Provider = useMemo(() => {
    if (!blockchain) return null;
    if (blockchain.name === 'solana') {
      if (!publicKey || !signAllTransactions || !signTransaction) return undefined;
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
    if (!blockchain) return null;
    if (blockchain.name === 'solana') {
      if (!publicKey || !signAllTransactions || !signTransaction) return undefined;
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
