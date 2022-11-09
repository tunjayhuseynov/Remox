import axios from "axios";
import CeloInputReader, {
  ERCMethodIds,
  EvmInputReader,
  IFormattedTransaction,
} from "hooks/useTransactionProcess";
import type { NextApiRequest, NextApiResponse } from "next";
import { AltCoins, Coins, CoinsName } from "types";
import { GetTransactions, Transactions } from "types/sdk";
import * as solanaWeb3 from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import _ from "lodash";
import { SolanaEndpoint } from "components/Wallet";
import { adminApp } from "firebaseConfig/admin";
import { ITag } from "./tags/index.api";
import { Blockchains, BlockchainType } from "types/blockchains";
import axiosRetry from "axios-retry";
// import Piscina from 'piscina';
// import path from "path";

// const CeloInputReaderParallel = new Piscina({
//   filename: path.resolve('./pages/api', "reader.mjs"),
//   maxThreads: 20
// });

// GET /api/transactions  --params blockchain, address

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IFormattedTransaction[] | string>
) {
  try {
    let txList: IFormattedTransaction[] = [];

    const addresses = req.query["addresses[]"];
    const txs = req.query["txs[]"];
    const onlyTransferList = req.query["onlyTransferList"] as string | undefined;

    const start = req.query.start as string | undefined;
    const take = req.query.take as string | undefined;

    const parsedtxs = typeof txs === "string" ? [txs] : txs;
    const authId = req.query.id as string;
    const parsedAddress =
      typeof addresses === "string" ? [addresses] : addresses;
    if (!parsedAddress) return res.json([])
    const blockchaiName = req.query.blockchain as BlockchainType["name"];
    const blockchain = Blockchains.find((b) => b.name === blockchaiName);
    if (!blockchain) throw new Error("Blockchain not found");
    if (!parsedAddress) throw new Error("Address not found");

    const CoinsReq = await adminApp
      .firestore()
      .collection(blockchain.currencyCollectionName)
      .get();
    const Coins = CoinsReq.docs.reduce<Coins>((acc, doc) => {
      acc[(doc.data() as AltCoins).symbol] = doc.data() as AltCoins;
      return acc;
    }, {});

    if (parsedAddress.length === 0 || !blockchain)
      return res.status(400).send("Missing address or blockchain");

    let myTags: { tags: ITag[] } | undefined;
    if (authId) {
      myTags = (
        await adminApp.firestore().collection("tags").doc(authId).get()
      ).data() as { tags: ITag[] };
    }

    const txRes = await Promise.all(parsedAddress.map(address => GetTxs(
      address,
      myTags?.tags ?? [],
      blockchain,
      Coins,
      parsedtxs,
      start ? parseInt(start) : undefined,
      take ? parseInt(take) : undefined,
      onlyTransferList === "true" ? true : false
    )))

    txList = txList.concat(...txRes)

    res.status(200).json(txList);
  } catch (error: any) {
    throw new Error(error);
  }
}

const GetTxs = async (
  address: string,
  tags: ITag[],
  blockchain: BlockchainType,
  coins: Coins,
  inTxs?: string[],
  start?: number,
  take?: number,
  onlyTransferList?: boolean
) => {
  axiosRetry(axios, { retries: 10 });
  let txList: Transactions[] = [];

  if (blockchain.name === "celo" || blockchain.name === "ethereum_evm") {
    if (inTxs) {
      for (const tx of inTxs) {
        const exReq = await axios.get<{ result: Transactions }>(
          `${blockchain.explorerAPIUrl}?module=transaction&action=gettxinfo&txhash=${tx}`
        );

        const txs = exReq.data;
        txList.push(txs.result);
      }
    } else {
      const exReqRaw = axios.get<GetTransactions>(
        `${blockchain.explorerAPIUrl}?module=account&action=txlist&address=${address}`
      );
      const tokenReqRaw = axios.get<GetTransactions>(
        `${blockchain.explorerAPIUrl}?module=account&action=tokentx&address=${address}`
      );

      const [exReq, tokenReq] = await Promise.all([exReqRaw, tokenReqRaw]);

      const tokens = onlyTransferList ? tokenReq.data.result : tokenReq.data.result.filter(s => s.from?.toLowerCase() !== address?.toLowerCase());
      const nfts = tokenReq.data.result.filter(s => s.tokenID)


      const txs = exReq.data;
      txList = onlyTransferList ? tokens : txs.result.concat(tokens).concat(nfts).sort((a, b) => +a.timeStamp > +b.timeStamp ? -1 : 1);
    }
  } else if (blockchain.name === "polygon_evm") {
    if (inTxs) {
      for (const tx of inTxs) {
        const exReq = await axios.get<{ result: Transactions }>(
          `${blockchain.explorerAPIUrl}?module=transaction&action=gettxreceiptstatus&txhash=${tx}&apikey=JEH6JVI32EP99FG14NBEIUVQK1FNJIATBT`
        );

        const txs = exReq.data;
        txList.push(txs.result);
      }
    } else {
      const exReq = await axios.get<GetTransactions>(
        `${blockchain.explorerAPIUrl}?module=account&action=txlist&address=${address}&apikey=JEH6JVI32EP99FG14NBEIUVQK1FNJIATBT`
      );
      const txs = exReq.data;
      txList = txs.result;

      // txList = txList.map((tx: any) => tx)

      // txList = txList.filter((tx) => tx).map((tx: any) => tx["rawData"])
    }
  }
  const parsedTxs = await ParseTxs(start != undefined || take ? txList.splice(start ?? 0, take) : txList, blockchain, tags, address, coins, onlyTransferList);

  return parsedTxs;
};

const ParseTxs = async (
  transactions: Transactions[],
  blockchain: BlockchainType,
  tags: ITag[],
  address: string,
  coins: Coins,
  onlyTransferList?: boolean
) => {
  try {
    let result: Transactions[] = [...transactions];
    const FormattedTransaction: IFormattedTransaction[] = [];

    const groupedHash = _(result).groupBy("hash").value();
    const uniqueHashs = Object.values(groupedHash).reduce(
      (acc: Transactions[], value: Transactions[]) => {
        const best = _(value).maxBy((o) => {
          if (value.some(s => s.tokenID)) {
            return +(o.tokenID ?? 0)
          }
          return +o.value
        }
        );

        if (best) acc.push(best);
        return acc;
      },
      []
    );

    const txs = await Promise.all(uniqueHashs.map(transaction => getParsedTransaction(transaction, blockchain, tags, coins, address, !!onlyTransferList)))

    FormattedTransaction.push(...txs.filter(s => s) as IFormattedTransaction[]);

    return FormattedTransaction;
  } catch (error) {
    console.log("Transactin Api", error);

    throw new Error(error as any);
  }
};

const getParsedTransaction = async (transaction: Transactions, blockchain: BlockchainType, tags: ITag[], coins: Coins, address: string, allowMultiOut: boolean) => {
  const input = transaction.input;

  if (blockchain.name.includes("evm")) {
    const formatted = await EvmInputReader(input ?? "", blockchain.name, {
      input: input ?? "",
      transaction,
      tags,
      Coins: coins,
      blockchain,
      address,
      provider: "GnosisSafe",
      showMultiOut: allowMultiOut,
    });
    if (formatted && formatted.method) {
      return {
        timestamp: +transaction.timeStamp,
        rawData: transaction,
        hash: transaction.hash,
        tags: formatted.tags ?? [],
        address,
        ...formatted,
      }
    }

  } else if (blockchain.name === "celo") {
    // const formatted = await CeloInputReaderParallel.run({ input, transaction, tags, Coins: coins, blockchain, address, provider: "GnosisSafe" });
    const formatted = await CeloInputReader({ input: input ?? "", transaction, tags, Coins: coins, blockchain, address, provider: "", showMultiOut: allowMultiOut });

    if (formatted && formatted.method && ((formatted.method === ERCMethodIds.automatedCanceled && (formatted as any)?.streamId) || ((formatted as any)?.payments?.length ?? 0) > 0
      || (formatted.method === ERCMethodIds.swap && (formatted as any)?.coinIn)
      || (formatted.method === ERCMethodIds.nftTokenERC721)
      || (formatted as any)?.coin
    )) {
      return {
        timestamp: +transaction.timeStamp,
        rawData: transaction,
        hash: transaction.hash,
        isError: (transaction?.isError ?? "0") !== "0" ?? false,
        address,
        ...formatted,
      }
    }
  }
}