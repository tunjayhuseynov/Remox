import axios from 'axios';
import { ERC20MethodIds, EvmInputReader, IFormattedTransaction, InputReader } from 'hooks/useTransactionProcess';
import type { NextApiRequest, NextApiResponse } from 'next'
import { CoinsName, SolanaCoins } from 'types';
import { GetTransactions, Transactions } from 'types/sdk'
import * as solanaWeb3 from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import _ from 'lodash';
import { SolanaEndpoint } from 'components/Wallet';
import { CeloExplorer, fromMinScale, GetCoins } from 'utils/api';
import { adminApp } from 'firebaseConfig/admin';
import { ITag } from './tags/index.api';
import { Blockchains, BlockchainType } from 'types/blockchains';

// GET /api/transactions  --params blockchain, address

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IFormattedTransaction[] | string>
) {
  try {
    let txList: IFormattedTransaction[] = [];

    const addresses = req.query["addresses[]"];
    const txs = req.query["txs[]"];

    const parsedtxs = typeof txs === "string" ? [txs] : txs;
    const authId = req.query.id as string;
    const parsedAddress =
      typeof addresses === "string" ? [addresses] : addresses;
    const blockchaiName = req.query.blockchain as BlockchainType["name"];
    const blockchain = Blockchains.find((b) => b.name === blockchaiName);
    if (!blockchain) throw new Error("Blockchain not found");

    const coinsReq = await adminApp
      .firestore()
      .collection(blockchain?.currencyCollectionName)
      .get();
    const coins = coinsReq.docs.map((doc) => doc.data() as AltCoins);

    if (parsedAddress.length === 0 || !blockchain)
      return res.status(400).send("Missing address or blockchain");

    let myTags;
    if (authId) {
      myTags = (
        await adminApp.firestore().collection("tags").doc(authId).get()
      ).data() as { tags: ITag[] };
      // myTags = await FirestoreRead<{tags: Tag[]}>("tags", authId)
    }

    for (const key of parsedAddress) {
      const txs = await GetTxs(
        key,
        myTags?.tags ?? [],
        blockchain,
        coins,
        parsedtxs
      );
      txList = txList.concat(txs);
    }

    res.status(200).json(txList);
  } catch (error) {
    res.status(405).json(error as any);
  }
}

const GetTxs = async (
  address: string,
  tags: ITag[],
  blockchain: BlockchainType,
  coins: AltCoins[],
  inTxs?: string[]
) => {
  let txList: Transactions[] = [];

  if (blockchain.name === "solana") {
    const txsList: Transactions[] = [];
    // new PublicKey("So11111111111111111111111111111111111111112")
    const connection = new solanaWeb3.Connection(SolanaEndpoint);
    const sings = !inTxs
      ? await connection.getConfirmedSignaturesForAddress2(
          new solanaWeb3.PublicKey(address),
          { limit: 1000 }
        )
      : null;
    const txs = await connection.getParsedTransactions(
      inTxs ?? sings!.map((s) => s.signature)
    );
    // const tokens = await connection.getTokenAccountsByOwner(
    //   new solanaWeb3.PublicKey(address),
    //   { programId: TOKEN_PROGRAM_ID }
    // );

    for (const tx of txs) {
      const arr = tx?.transaction.message.instructions;
      if (arr) {
        const arrLen = arr.length;
        let amount, from, to, token: AltCoins;
        for (let index = 0; index < arrLen - 1; index++) {
          if ((arr[index] as any)?.["parsed"]?.["type"]) {
            from = (arr[index] as any)["parsed"]["info"]["source"] ?? "";
            to = (arr[index] as any)["parsed"]["info"]["destination"] ?? "";
            if ((arr[index] as any)["parsed"]["info"]?.["mint"]) {
              token =
                coins.find(
                  (c) =>
                    c.contractAddress.toLowerCase() ===
                    (arr[index] as any)["parsed"]["info"]["mint"]?.toLowerCase()
                ) ?? coins.find((c) => c.symbol === "SOL")!;
              amount = (arr[index] as any)["parsed"]["info"]["tokenAmount"]
                ?.amount;
            } else {
              token = coins.find((c) => c.symbol === "SOL")!;
              amount = (arr[index] as any)["parsed"]["info"]["lamports"] ?? "0";
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
          timeStamp: (
            tx?.blockTime ?? Math.floor(new Date().getTime() / 1e3)
          ).toString(),
          contractAddress: token!.contractAddress ?? "",
          value: amount,
          isError: "0",
          cumulativeGasUsed: "",
          logIndex: "",
          tokenDecimal: "",
          tokenName: token!.name,
          tokenSymbol: token!.symbol,
          transactionIndex: "",
        };
        txsList.push(parsedTx);
      }
    }

    txList = txsList;
  } else if (blockchain.name === "celo" || blockchain.name === "ethereum_evm") {
    if (inTxs) {
      for (const tx of inTxs) {
        const exReq = await axios.get<{ result: Transactions }>(
          `${blockchain.explorerUrl}?module=transaction&action=gettxinfo&txhash=${tx}`
        );

        const txs = exReq.data;
        txList.push(txs.result);
      }
    } else {
      const exReq = await axios.get<GetTransactions>(
        `${blockchain.explorerUrl}?module=account&action=tokentx&address=${address}`
      );

      const txs = exReq.data;
      txList = txs.result;
    }
  } else if (blockchain.name === "polygon_evm") {
    if (inTxs) {
      for (const tx of inTxs) {
        const exReq = await axios.get<{ result: Transactions }>(
          `${blockchain.explorerUrl}?module=transaction&action=gettxreceiptstatus&txhash=${tx}&apikey=JEH6JVI32EP99FG14NBEIUVQK1FNJIATBT`
        );

        const txs = exReq.data;
        txList.push(txs.result);
      }
    } else {
      const exReq = await axios.get<GetTransactions>(
        `${blockchain.explorerUrl}?module=account&action=txlist&address=${address}&apikey=JEH6JVI32EP99FG14NBEIUVQK1FNJIATBT`
      );
      const txs = exReq.data;
      txList = txs.result;

      // txList = txList.map((tx: any) => tx)

      // txList = txList.filter((tx) => tx).map((tx: any) => tx["rawData"])
    }
  }

  const parsedTxs = await ParseTxs(txList, blockchain, tags);

const ParseTxs = async (transactions: Transactions[], blockchain: BlockchainType, tags: ITag[]) => {
  const Coins = GetCoins(blockchain.name)
  let result: Transactions[] = [...transactions]

  const FormattedTransaction: IFormattedTransaction[] = []

  const testAny : any[] = []

  const groupedHash = _(result).groupBy("hash").value();
  const uniqueHashs = Object.values(groupedHash).reduce(
    (acc: Transactions[], value: Transactions[]) => {
      const best = _(value).maxBy((o) =>
        parseFloat(fromMinScale(blockchain.name)(o.value))
      );
      if (best) acc.push(best);

      return acc;
    },
    []
  );

  for (const transaction of uniqueHashs) {
    const input = transaction.input;

    if(blockchain.name.includes("evm")){
      const formatted = await EvmInputReader(input, blockchain.name, { transaction, tags, Coins });
      if (formatted) {
        testAny.push(formatted)
      }
    } else {
      const formatted = InputReader(input, { transaction, tags, Coins });
      if (formatted) {
        FormattedTransaction.push({
          timestamp: +transaction.timeStamp,
          rawData: transaction,
          hash: transaction.hash,
          ...formatted,
        });
      }
    }

    
  })

  return testAny;
}


