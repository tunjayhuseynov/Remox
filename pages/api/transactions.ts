import axios from 'axios';
import { ERC20MethodIds, IFormattedTransaction, InputReader } from 'hooks/useTransactionProcess';
import type { NextApiRequest, NextApiResponse } from 'next'
import { CeloCoins, CoinsName, PoofCoins, SolanaCoins } from 'types';
import { GetTransactions, Transactions } from 'types/sdk'
import * as solanaWeb3 from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Tag } from 'apiHooks/useTags';
import _ from 'lodash';
import { SolanaEndpoint } from 'components/Wallet';
import { BlockchainType, CeloExplorer, fromMinScale, GetCoins } from 'utils/api';
import { FirestoreRead, FirestoreReadMultiple } from 'apiHooks/useFirebase';



// GET /api/transactions  --params blockchain, address

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IFormattedTransaction[] | string>
) {
  try {
    let txList: IFormattedTransaction[] = []

    const addresses = req.query["addresses[]"];
    const authId = req.query.id as string;
    const parsedAddress = typeof addresses === "string" ? [addresses] : addresses;
    const blockchain = req.query.blockchain as BlockchainType;

    if (parsedAddress.length === 0 || !blockchain) return res.status(400).send("Missing address or blockchain")

    let myTags;
    if (authId) {
      myTags = await FirestoreRead<{tags: Tag[]}>("tags", authId)
    }

    for (const key of parsedAddress) {
      const txs = await GetTxs(key, myTags?.tags ?? [], blockchain)
      txList = txList.concat(txs)
    }

    res.status(200).json(txList)
  } catch (error) {
    res.status(405).json(error as any)
  }
}

const GetTxs = async (address: string, tags: Tag[], blockchain: BlockchainType) => {
  let txList: Transactions[] = []

  if (blockchain === "solana") {
    const txsList: Transactions[] = []
    // new PublicKey("So11111111111111111111111111111111111111112")
    const connection = new solanaWeb3.Connection(SolanaEndpoint)
    const sings = await connection.getConfirmedSignaturesForAddress2(new solanaWeb3.PublicKey(address), { limit: 1000 })
    const txs = await connection.getParsedTransactions(sings.map(s => s.signature))
    const tokens = await connection.getTokenAccountsByOwner(new solanaWeb3.PublicKey(address), { programId: TOKEN_PROGRAM_ID })


    for (const tx of txs) {
      const arr = tx?.transaction.message.instructions
      if (arr) {
        const arrLen = arr.length;
        let amount, from, to, token: CoinsName = CoinsName.SOL;
        for (let index = 0; index < arrLen - 1; index++) {
          if ((arr[index] as any)?.["parsed"]?.["type"]) {
            from = (arr[index] as any)["parsed"]["info"]["source"] ?? ""
            to = (arr[index] as any)["parsed"]["info"]["destination"] ?? ""
            if ((arr[index] as any)["parsed"]["info"]?.["mint"]) {
              token = Object.values(SolanaCoins).find(c => c.contractAddress.toLowerCase() === (arr[index] as any)["parsed"]["info"]["mint"]?.toLowerCase())?.name ?? CoinsName.noCoin
              amount = (arr[index] as any)["parsed"]["info"]["tokenAmount"]?.amount
            } else {
              token = CoinsName.SOL
              amount = (arr[index] as any)["parsed"]["info"]["lamports"] ?? "0"
            }
          }
        }
        let parsedTx: Transactions = {
          from,
          to,
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
          value: amount,
          cumulativeGasUsed: "",
          logIndex: "",
          tokenDecimal: "",
          tokenName: token,
          tokenSymbol: token,
          transactionIndex: "",
        }
        txsList.push(parsedTx)
      }
    }

    txList = txsList;
  } else if (blockchain === 'celo') {
    const exReq = await axios.get<GetTransactions>(`${CeloExplorer}?module=account&action=tokentx&address=${address}`)

    const txs = exReq.data;
    txList = txs.result;
  }

  const parsedTxs = await ParseTxs(txList, blockchain, tags)

  return parsedTxs
}

const ParseTxs = async (transactions: Transactions[], blockchain: BlockchainType, tags: Tag[]) => {
  const Coins = GetCoins(blockchain)
  let result: Transactions[] = [...transactions]

  const FormattedTransaction: IFormattedTransaction[] = []

  const groupedHash = _(result).groupBy("hash").value();
  const uniqueHashs = Object.values(groupedHash).reduce((acc: Transactions[], value: Transactions[]) => {
    const best = _(value).maxBy((o) => parseFloat(fromMinScale(blockchain)(o.value)));
    if (best) acc.push(best)

    return acc;
  }, [])

  uniqueHashs.forEach((transaction: Transactions) => {
    const input = transaction.input;
    const formatted = InputReader(input, transaction, tags, Coins);

    if (formatted) {
      FormattedTransaction.push({
        rawData: transaction,
        hash: transaction.hash,
        ...formatted
      })
    }
  })

  return FormattedTransaction;
}


