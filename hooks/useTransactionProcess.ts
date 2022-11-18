import { Transactions } from "../types/sdk";
import { hexToNumberString, hexToUtf8, toChecksumAddress } from "web3-utils";
import { AltCoins, Coins, CoinsName } from "types";
import useWalletKit from "./walletSDK/useWalletKit";
import { ITag } from "pages/api/tags/index.api";
import { Blockchains, BlockchainType, MultisigProviders } from "types/blockchains";
import InputDataDecoder from "ethereum-input-data-decoder";
import { ethers } from "ethers";
import ERC20 from "rpcHooks/ABI/ERC.json";
import Ubeswap from "rpcHooks/ABI/Ubeswap.json";
import Moola from "rpcHooks/ABI/Moola.json";
import MoolaAirdrop from "rpcHooks/ABI/MoolaAirdrop.json";
import BatchRequest from "rpcHooks/ABI/BatchRequest.json";
import Sablier from "rpcHooks/ABI/Sablier.json"; // Also Xeggo
import CeloTerminal from "rpcHooks/ABI/CeloTerminal.json";
import GnosisSafe from "rpcHooks/ABI/Gnosis.json";
import BigNumber from "bignumber.js";
import Web3 from 'web3'
import { IBudgetORM } from "pages/api/budget/index.api";
import CyberBoxABI from 'rpcHooks/ABI/CyberBox.json'
import GToken from 'rpcHooks/ABI/GToken.json';
import OneInch from 'rpcHooks/ABI/OneInch.json';

export const ERCMethodIds = {
  transferFrom: "transferFrom",
  transfer: "transfer",
  transferWithComment: "transferWithComment",
  approve: "approve",
  batchRequest: "batchRequest",
  swap: "swap",

  automatedTransfer: "automatedTransfer",
  automatedCanceled: "automatedCanceled",
  automatedBatchRequest: "automatedBatchRequest",

  nftTokenERC721: "nftTokenERC721",


  reward: "reward",
  borrow: "borrow",
  deposit: "deposit",
  withdraw: "withdraw",
  repay: "repay",

  rejection: "0x1",

  addOwner: "addOwner",
  removeOwner: "removeOwner",
  changeThreshold: "changeThreshold",
  changeInternalThreshold: "changeInternalThreshold",

  noInput: "0x",

  unknown: "unknown",
};

export interface IFormattedTransaction {
  rawData: Transactions;
  timestamp: number;
  method: string;
  hash: string;
  id: string;
  tags: ITag[];
  budget?: IBudgetORM,
  address: string,
  isError: boolean,
  blockchain: string,
  indexPlace?: number,
}

export interface IAddOwner extends IFormattedTransaction {
  to: string;
}

export interface IRemoveOwner extends IFormattedTransaction {
  to: string;
}

export interface IChangeThreshold extends IFormattedTransaction {
  amount: string;
}

export interface ITransfer extends IFormattedTransaction {
  to: string;
  from?: string
  amount: string;
  coin: AltCoins;
}

export interface IAutomationTransfer extends IFormattedTransaction {
  coin: AltCoins;
  startTime: number;
  endTime: number;
  to: string;
  amount: string;
  streamId: string
}

export interface IAutomationCancel extends IFormattedTransaction {
  // coin: AltCoins;
  // to: string;
  // amount: string;
  // endTime: number;
  // startTime: number;
  streamId: string;
}

export interface IAutomationBatchRequest extends IFormattedTransaction {
  payments: IAutomationTransfer[]
}

export interface ITransferComment extends ITransfer {
  comment: string;
}

export interface ITransferFrom extends ITransfer {
  from: string;
}

export interface ISwap extends IFormattedTransaction {
  amountIn: string;
  amountOutMin: string;
  coinIn: AltCoins;
  coinOutMin: AltCoins;
}

export interface IBatchRequest extends IFormattedTransaction {
  payments: {
    method: string;
    coin: AltCoins;
    from: string;
    to: string;
    amount: string;
  }[];
}

export const GenerateTransaction = (
  transaction: Partial<Transactions>
): Transactions => ({
  blockHash: transaction.blockHash ?? "",
  blockNumber: transaction.blockNumber ?? "0",
  confirmations: transaction.confirmations ?? "0",
  contractAddress: transaction.contractAddress ?? "",
  cumulativeGasUsed: transaction.cumulativeGasUsed ?? "0",
  from: transaction.from ?? "",
  safeHash: transaction.safeHash ?? undefined,
  gas: transaction.gas ?? "0",
  gasPrice: transaction.gasPrice ?? "0",
  gasUsed: transaction.gasUsed ?? "0",
  hash: transaction.hash ?? "",
  input: transaction.input ?? "",
  logIndex: transaction.logIndex ?? "0",
  nonce: transaction.nonce ?? "0",
  to: transaction.to ?? "",
  timeStamp: transaction.timeStamp ?? "0",
  isError: transaction.isError ?? "0",
  tokenDecimal: transaction.tokenDecimal ?? "0",
  tokenName: transaction.tokenName ?? "",
  tokenSymbol: transaction.tokenSymbol ?? CoinsName.CELO,
  transactionIndex: transaction.transactionIndex ?? "0",
  value: transaction.value ?? "0",
});

interface IReader {
  input: string,
  transaction: Transactions;
  tags: ITag[];
  Coins: Coins;
  blockchain: BlockchainType;
  address: string,
  provider: MultisigProviders,
  showMultiOut: boolean,
  isExecuted?: boolean
}

export default async (
  { input, transaction, tags, Coins, blockchain, address, provider, showMultiOut, isExecuted = true }: IReader
) => {
  try {
    const theTags = tags.filter((s) =>
      s.transactions.find((t) => t.hash?.toLowerCase() === transaction.hash?.toLowerCase() && t.address?.toLowerCase() === address?.toLowerCase())
    );

    if (transaction.tokenID) {

      let decoder = new InputDataDecoder(CyberBoxABI)
      let res = decoder.decodeData(input)
      const coin = Object.values(Coins).find(s =>
        s.address?.toLowerCase() === blockchain.nativeToken?.toLowerCase())
      if (!res.method) {
        let decoder = new InputDataDecoder(ERC20)
        let res = decoder.decodeData(input)
        if (!res.method) return {}
        return {
          rawData: {
            ...transaction,
            from: toChecksumAddress(transaction.contractAddress),
            to: "0xabb380bd683971bdb426f0aa2bf2f111aa7824c2",
            value: "0",
          },
          coin: coin,
          from: toChecksumAddress(transaction.contractAddress),
          to: "0xabb380bd683971bdb426f0aa2bf2f111aa7824c2",
          amount: "0",
          method: ERCMethodIds.nftTokenERC721,
          hash: transaction.hash,
          id: ERCMethodIds.nftTokenERC721,
          tags: theTags,
        };
      }
      return {
        rawData: {
          ...transaction,
          from: "0x" + res.inputs[0],
          to: "0xabb380bd683971bdb426f0aa2bf2f111aa7824c2",
          value: (new BigNumber(res.inputs[2].toString())).div(new BigNumber(10).pow(coin?.decimals ?? 18)).toString(),
        },
        coin: coin,
        from: "0x" + res.inputs[0],
        to: "0xabb380bd683971bdb426f0aa2bf2f111aa7824c2",
        amount: (res.inputs[2] as BigNumber).toString(),
        method: ERCMethodIds.nftTokenERC721,
        hash: transaction.hash,
        id: ERCMethodIds.nftTokenERC721,
        tags: theTags,
      };
    }

    let decoder = new InputDataDecoder(ERC20);
    let result = decoder.decodeData(input);
    if (!result.method) {
      decoder = new InputDataDecoder(Ubeswap.output.abi);
      result = decoder.decodeData(input);
      if (!result.method) {
        decoder = new InputDataDecoder(OneInch);
        result = decoder.decodeData(input);
        if (!result.method) {
          decoder = new InputDataDecoder(GToken.abi);
          result = decoder.decodeData(input);
          if (!result.method) {
            decoder = new InputDataDecoder(Moola.abi);
            result = decoder.decodeData(input);
            if (!result.method) {
              decoder = new InputDataDecoder(BatchRequest.abi);
              result = decoder.decodeData(input);
              if (!result.method) {
                decoder = new InputDataDecoder(Sablier.abi);
                result = decoder.decodeData(input);
                if (!result.method) {
                  decoder = new InputDataDecoder(MoolaAirdrop);
                  result = decoder.decodeData(input);
                  if (!result.method && provider === "Celo Terminal") {
                    decoder = new InputDataDecoder(CeloTerminal.abi);
                    result = decoder.decodeData(input);
                  } else if (!result.method && provider === "GnosisSafe") {
                    decoder = new InputDataDecoder(GnosisSafe);
                    result = decoder.decodeData(input);
                  }
                }
              }
            }
          }
        }
      }
    }

    let coin = Object.values(Coins).find(s =>
      s.address?.toLowerCase() === transaction?.to?.toLowerCase() || s.address?.toLowerCase() === transaction?.contractAddress?.toLowerCase()
    )
    if (!coin) {
      coin = Object.values(Coins).find(s =>
        s?.symbol?.toLowerCase() === transaction?.tokenSymbol?.toLowerCase()
      )
    }

    if (!input || input === "0x") {
      return {
        method: ERCMethodIds.transfer,
        id: ERCMethodIds.transfer,
        from: transaction.from,
        to: transaction.to,
        amount: transaction.value.toString(),
        coin: coin ?? Object.values(Coins).find(s => s.address?.toLowerCase() === blockchain?.nativeToken?.toLowerCase()),
        tags: theTags,
      };
    } else if (result.method === ERCMethodIds.transferFrom) {
      if (!coin) return { method: null }
      return {
        method: ERCMethodIds.transferFrom,
        id: ERCMethodIds.transferFrom,
        coin: coin,
        from: "0x" + result.inputs[0],
        to: "0x" + result.inputs[1],
        amount: (result.inputs[2] as BigNumber).toString(),
        tags: theTags,
      };
    } else if (result.method === ERCMethodIds.transferWithComment) {
      if (!coin) return { method: null }
      return {
        method: ERCMethodIds.transfer,
        id: ERCMethodIds.transfer,
        coin: coin,
        to: "0x" + result.inputs[0],
        amount: (result.inputs[1] as BigNumber).toString(),
        tags: theTags,
      };
    }
    else if (result.method === ERCMethodIds.transfer) {
      if (!coin) return { method: null }
      return {
        method: ERCMethodIds.transfer,
        id: ERCMethodIds.transfer,
        coin: coin,
        to: "0x" + result.inputs[0],
        amount: (result.inputs[1] as BigNumber).toString(),
        tags: theTags,
      };
    }
    else if ((result.method === "changeInternalRequirement" || result.method === "changeRequirement") && provider === "Celo Terminal") { // Celo Terminal
      return {
        method: result.method === "changeInternalRequirement" ? ERCMethodIds.changeInternalThreshold : ERCMethodIds.changeThreshold,
        id: result.method === "changeInternalRequirement" ? ERCMethodIds.changeInternalThreshold : ERCMethodIds.changeThreshold,
        amount: (result.inputs[0] as BigNumber).toString(),
        tags: theTags,
      }
    }
    else if (result.method === "changeThreshold" && provider === "GnosisSafe") {
      return {
        method: ERCMethodIds.changeThreshold,
        id: ERCMethodIds.changeThreshold,
        amount: (result.inputs[0] as BigNumber).toString(),
        tags: theTags,
      }
    }
    else if (result.method === "removeOwner" && provider === "Celo Terminal") { // Celo Terminal
      return {
        method: ERCMethodIds.removeOwner,
        id: ERCMethodIds.removeOwner,
        to: "0x" + result.inputs[0],
        tags: theTags,
      }
    } else if (result.method === "removeOwner" && provider === "GnosisSafe") { // Gnosis Safe
      return {
        method: ERCMethodIds.removeOwner,
        id: ERCMethodIds.removeOwner,
        to: "0x" + result.inputs[1],
        tags: theTags,
      }
    }
    else if (result.method === "addOwner" && provider === "Celo Terminal") { // Celo Terminal
      return {
        method: ERCMethodIds.addOwner,
        id: ERCMethodIds.addOwner,
        to: "0x" + result.inputs[0],
        tags: theTags,
      }
    }
    else if (result.method === "addOwnerWithThreshold" && provider === "GnosisSafe") // Gnosis Safe
    {
      return {
        method: ERCMethodIds.addOwner,
        id: ERCMethodIds.addOwner,
        to: "0x" + result.inputs[0],
        tags: theTags,
      }
    }
    else if (result.method === "swap" || result.method === "unoswap" || result.method === "uniswapV3Swap") {
      const coins: AltCoins[] = Object.values(Coins);

      const web3 = new Web3(blockchain.rpcUrl);
      const tx = await web3.eth.getTransactionReceipt(transaction.hash)
      const logs = tx.logs.filter(l => l.topics?.[0]?.toLowerCase() === "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef");
      const to = logs.at(-1)?.address;
      const from = logs.at(0)?.address;

      let amountIn = result.method === "uniswapV3Swap" ?
        result.inputs[0].toString() :
        result.method === "unoswap" ? result.inputs[1].toString() : result.inputs[1][4].toString();

      let amountOut = result.method === "uniswapV3Swap" ?
        result.inputs[1].toString() : result.method === "unoswap" ? result.inputs[2].toString() : result.inputs[1][5].toString();

      return {
        method: ERCMethodIds.swap,
        id: ERCMethodIds.swap,
        amountIn: amountIn,
        amountOutMin: amountOut,
        coinIn: coins.find(
          (s) =>
            s.address?.toLowerCase() === from?.toLowerCase()
        )!,
        coinOutMin: coins.find(
          (s) =>
            s.address?.toLowerCase() === to?.toLowerCase()
        )!,
        tags: theTags,
      };
    }
    else if (result.method === "swapExactTokensForTokens" || result.method === "swapTokensForExactTokens" || result.method === "swapExactTokensForTokensSupportingFeeOnTransferTokens") {
      const coins: AltCoins[] = Object.values(Coins);
      return {
        method: ERCMethodIds.swap,
        id: ERCMethodIds.swap,
        amountIn: result.method === "swapExactTokensForTokens" || result.method === "swapExactTokensForTokensSupportingFeeOnTransferTokens" ? result.inputs[0].toString() : result.inputs[1].toString(),
        amountOutMin: result.method === "swapExactTokensForTokens" || result.method === "swapExactTokensForTokensSupportingFeeOnTransferTokens" ? result.inputs[1].toString() : result.inputs[0].toString(),
        coinIn: coins.find(
          (s) =>
            s.address?.toLowerCase() === "0x" + result.inputs[2][0]?.toLowerCase()
        )!,
        coinOutMin: coins.find(
          (s) =>
            s.address?.toLowerCase() === "0x" + result.inputs[2][1]?.toLowerCase()
        )!,
        tags: theTags,
      };
    }
    else if (result.method === "executeTransactions") {
      const txList = [];
      const splitData = (result.inputs[2] as string).substring(2).split("23b872dd");
      for (let i = 0; i < result.inputs[0].length; i++) {
        const coin = Object.values(Coins).find(
          (s) =>
            s.address?.toLowerCase() === "0x" + result.inputs[0][i]?.toLowerCase()
        );

        let decoder = new InputDataDecoder(ERC20);
        let erc = decoder.decodeData(splitData.length > 1 ? `0x23b872dd${splitData[i + 1]}` : result.inputs[2]);
        if (coin && (erc.method === ERCMethodIds.transferFrom || erc.method === ERCMethodIds.transfer)) {
          txList.push({
            method: ERCMethodIds.transferFrom,
            coin: coin,
            from: erc.method === ERCMethodIds.transferFrom ? "0x" + erc.inputs[0] : undefined,
            to: erc.method === ERCMethodIds.transferFrom ? "0x" + erc.inputs[1] : "0x" + erc.inputs[0],
            amount: erc.method === ERCMethodIds.transferFrom ? erc.inputs[2].toString() : erc.inputs[1].toString(),
          });
        }
      }
      return {
        method: ERCMethodIds.batchRequest,
        id: ERCMethodIds.batchRequest,
        payments: txList,
        tags: theTags,
      };

    }
    else if (result.method === "execTransaction" && showMultiOut) {
      const data = result.inputs[2] as string;
      let decoder = new InputDataDecoder(ERC20);
      let erc = decoder.decodeData(data);
      const coin = Object.values(Coins).find(
        (s) =>
          s.address?.toLowerCase() === "0x" + result.inputs[0]?.toLowerCase()
      );
      if (coin && (erc.method === ERCMethodIds.transferFrom || erc.method === ERCMethodIds.transfer || erc.method === ERCMethodIds.transferWithComment)) {
        return {
          method: erc.method === ERCMethodIds.transfer ? ERCMethodIds.transfer : ERCMethodIds.transferFrom,
          id: erc.method === ERCMethodIds.transfer ? ERCMethodIds.transfer : ERCMethodIds.transferFrom,
          coin: coin,
          from: erc.method === ERCMethodIds.transferFrom ? "0x" + erc.inputs[0] : undefined,
          to: erc.method === ERCMethodIds.transferFrom ? "0x" + erc.inputs[1] : "0x" + erc.inputs[0],
          amount: erc.method === ERCMethodIds.transferFrom ? erc.inputs[2].toString() : erc.inputs[1].toString(),
          tags: theTags,
        };
      }
    }
    else if (result.method === "cancelStream") {
      // console.log(result)
      // const web3 = new Web3(blockchain.rpcUrl);
      // const contract = await web3.eth.getTransactionReceipt(transaction.hash);
      // contract.logs[2].
      // let details: any;
      // try {
      //   details = await contract.methods.getStream((result.inputs[0]).toString()).call()
      // } catch (error) {

      // }
      // const coin = Object.values(Coins).find(s => s.address.toLowerCase() === details["tokenAddress"].toLowerCase());
      // if (!coin) return {};

      const res = {
        // coin: coin,
        // to: details["recipient"],
        // amount: details["deposit"],
        // endTime: details["stopTime"],
        // startTime: details["startTime"],
        method: ERCMethodIds.automatedCanceled,
        id: ERCMethodIds.automatedCanceled,
        streamId: (result.inputs[0]).toString(),
        tags: theTags,
      }
      return res;
    }
    else if (result.method === "createStream") {
      const web3 = new Web3(blockchain.rpcUrl);
      const topic = (await web3.eth.getTransactionReceipt(transaction.hash))?.logs?.at(provider === "GnosisSafe" ? -2 : 1)?.topics[1]
      if (!topic && isExecuted) return {}
      const streamId = isExecuted && topic ? hexToNumberString(topic) : "0";

      const coin = Object.values(Coins).find(s => s.address?.toLowerCase() === "0x" + result.inputs[2].toString()?.toLowerCase())

      if (!coin) return {};
      const res = {
        method: ERCMethodIds.automatedTransfer,
        id: ERCMethodIds.automatedTransfer,
        tags: theTags,
        startTime: +result.inputs[3].toString(),
        endTime: +result.inputs[4].toString(),
        to: "0x" + result.inputs[0].toString(),
        coin: coin,
        amount: result.inputs[1].toString(),
        streamId
      };
      return res;
    }
    else if (result.method === ERCMethodIds.borrow) {
      const coins: AltCoins[] = Object.values(Coins);
      return {
        method: ERCMethodIds.borrow,
        id: ERCMethodIds.borrow,
        coin: coins.find(
          (s) =>
            s.address?.toLowerCase() === '0x' + result.inputs[0]?.toLowerCase()
        )!,
        amount: result.inputs[1].toString(),
        to: "0x" + result.inputs[4],
        tags: theTags,
      };
    }
    else if (result.method === ERCMethodIds.deposit) {
      const coins: AltCoins[] = Object.values(Coins);
      return {
        method: ERCMethodIds.deposit,
        id: ERCMethodIds.deposit,
        coin: coins.find(
          (s) =>
            s.address?.toLowerCase() === (result.types.length === 2 ? transaction.contractAddress.toLowerCase() : '0x' + result.inputs[0]?.toLowerCase())
        )!,
        amount: result.types[0] === "uint256" ? result.inputs[0].toString() : result.inputs[1].toString(),
        to: result.types[1] === "address" ? "0x" + result.inputs[1] : "0x" + result.inputs[2],
        tags: theTags,
      };
    }
    else if (result.method === "depositETH") {
      const coins: AltCoins[] = Object.values(Coins);
      let coin;
      if ((transaction?.contractAddress?.toLowerCase() || transaction?.to?.toLowerCase()) === "0x8A1639098644A229d08F441ea45A63AE050Ee018"?.toLowerCase()) {
        coin = coins.find(
          (s) =>
            s.symbol === "CELO"
        )!
      }
      return {
        method: ERCMethodIds.deposit,
        id: ERCMethodIds.deposit,
        coin: coin,
        amount: transaction.value,
        to: "0x" + result.inputs[0],
        tags: theTags,
      };
    }
    else if (result.method === ERCMethodIds.withdraw) {
      const coins: AltCoins[] = Object.values(Coins);
      let amount, coin, to;

      if ((transaction?.contractAddress?.toLowerCase() || transaction?.to?.toLowerCase()) === "0x8A1639098644A229d08F441ea45A63AE050Ee018".toLowerCase()) {
        coin = coins.find(
          (s) =>
            s.symbol === "CELO"
        )!
        amount = result.inputs[0].toString()
        to = "0x" + result.inputs[1]
      } else if (result.types[0] === "address") {
        coin = coins.find(
          (s) =>
            s.address?.toLowerCase() === '0x' + result.inputs[0]?.toLowerCase()
        )!
        amount = result.inputs[1].toString()
        to = "0x" + result.inputs[0]
      }
      return {
        method: ERCMethodIds.withdraw,
        id: ERCMethodIds.withdraw,
        coin: coin,
        amount: amount,
        to: to,
        tags: theTags,
      };
    }
    else if (result.method === ERCMethodIds.repay || result.method === "repayDelegation") {
      const coins: AltCoins[] = Object.values(Coins);
      const assetAddress = result.method === "repayDelegation" ? result.inputs[1] : result.inputs[0];
      const to = result.method === "repayDelegation" ? result.inputs[1] : result.inputs[0]
      let amount = result.method === "repayDelegation" ? result.inputs[2].toString() : result.inputs[1].toString()
      if (amount.length > 18) {
        amount = "10000000000000000"
      }
      const from = result.method === "repayDelegation" ? result.inputs[0] : result.inputs[3]
      return {
        method: ERCMethodIds.repay,
        id: ERCMethodIds.repay,
        coin: coins.find(
          (s) =>
            s.address?.toLowerCase() === '0x' + assetAddress?.toLowerCase()
        )!,
        amount,
        to,
        from,
        tags: theTags,
      };
    }
    else if (result.method === ERCMethodIds.reward) {
      const coins: AltCoins[] = Object.values(Coins);
      return {
        method: ERCMethodIds.reward,
        id: ERCMethodIds.reward,
        tags: theTags,
        coin: coins.find(
          (s) =>
            s.address?.toLowerCase() === "0x17700282592D6917F6A73D0bF8AcCf4D578c131e"?.toLowerCase()
        )!,
        amount: result.inputs[2].toString(),
        to: "0x" + result.inputs[1],
      }
    }
  } catch (error: any) {
    console.log(error);
    throw new Error(error);
  }
};

export const EvmInputReader = async (
  input: string,
  blockchainName: string,
  { transaction, tags, Coins }: IReader
) => {
  const blockchain = Blockchains.find((s) => s.name === blockchainName)!;
  const theTags = tags.filter((s) =>
    s.transactions.some((t) => t.hash === transaction.hash)
  );

  const coins: AltCoins[] = Object.values(Coins);

  try {
    if (transaction.isError !== "1") {
      if (
        blockchain.swapProtocols.find(
          (swap) =>
            swap.contractAddress?.toLowerCase() === transaction.to?.toLowerCase()
        )
      ) {
        const abi = blockchain.swapProtocols.find(
          (swap) =>
            swap.contractAddress?.toLowerCase() === transaction.to?.toLowerCase()
        )?.abi;

        const decoder = new InputDataDecoder(abi);
        const result = decoder.decodeData(input);
        const amountIn = hexToNumberString(result.inputs[1][4]._hex).toString();
        const amountOutMin = hexToNumberString(
          result.inputs[1][5]._hex
        ).toString();

        const coinIn =
          coins.find(
            (coin) =>
              coin.address?.toLowerCase() === result.inputs[1][0]?.toLowerCase()
          )! ??
          coins.find(
            (coin) =>
              coin.address?.toLowerCase() ===
              blockchain.nativeToken?.toLowerCase()
          );
        const coinOut =
          coins.find(
            (coin) =>
              coin.address?.toLowerCase() === result.inputs[1][1]?.toLowerCase()
          )! ??
          coins.find(
            (coin) =>
              coin.address?.toLowerCase() ===
              blockchain.nativeToken?.toLowerCase()
          );

        return {
          method: ERCMethodIds.swap,
          id: ERCMethodIds.swap,
          amountIn: +amountIn / 10 ** coinIn!.decimals,
          amountOutMin: +amountOutMin / 10 ** coinOut!.decimals,
          from: transaction.from,
          coinIn: coinIn,
          coinOut: coinOut,
          tags: theTags,
          hash: transaction.hash,
        };
      } else if (
        blockchain.lendingProtocols.find(
          (lend) =>
            lend.contractAddress?.toLowerCase() === transaction.to?.toLowerCase()
        )
      ) {
        const abi = blockchain.lendingProtocols.find(
          (lend) =>
            lend.contractAddress?.toLowerCase() === transaction.to?.toLowerCase()
        )?.abi;
        const decoder = new InputDataDecoder(abi);
        const result = decoder.decodeData(input);
        const amount = hexToNumberString(result.inputs[1]._hex).toString();

        const coin =
          coins.find(
            (coin) =>
              coin.address?.toLowerCase() ===
              "0x" + result.inputs[0]?.toLowerCase()
          )! ??
          coins.find(
            (coin) =>
              coin.address?.toLowerCase() ===
              blockchain.nativeToken?.toLowerCase()
          );

        if (result.method === "supply") {
          return {
            method: ERCMethodIds.deposit,
            id: ERCMethodIds.deposit,
            coin: coin,
            amount: +amount / 10 ** coin.decimals,
            to: "0x" + result.inputs[2],
            tags: theTags,
          };
        } else if (result.method === "borrow") {
          return {
            method: ERCMethodIds.borrow,
            id: ERCMethodIds.borrow,
            coin: coin,
            amount: +amount / 10 ** coin.decimals,
            interestRateMode: hexToNumberString(
              result.inputs[2]._hex
            ).toString(),
            referalCode: result.inputs[3],
            to: "0x" + result.inputs[4],
            tags: theTags,
          };
        } else if (result.method === "withdraw") {
          return {
            method: ERCMethodIds.withdraw,
            id: ERCMethodIds.withdraw,
            coin: coin,
            amount: +amount / 10 ** coin.decimals,
            to: "0x" + result.inputs[1],
            tags: theTags,
          };
        } else if (result.method === "repay") {
          return {
            method: ERCMethodIds.repay,
            id: ERCMethodIds.repay,
            coin: coin,
            amount: +amount / 10 ** coin.decimals,
            to: "0x" + result.inputs[1],
            tags: theTags,
          };
        }
      } else if (
        blockchain.recurringPaymentProtocols.find(
          (stream) =>
            stream.contractAddress?.toLowerCase() ===
            transaction.to?.toLowerCase()
        )
      ) {
        const abi = blockchain.recurringPaymentProtocols.find(
          (stream) =>
            stream.contractAddress?.toLowerCase() ===
            transaction.to?.toLowerCase()
        )!.abi;
        const decoder = new InputDataDecoder(abi);
        const result = decoder.decodeData(input);

        if (result.method === "createStream") {
          const provider = new ethers.providers.JsonRpcProvider(
            blockchain.rpcUrl
          );
          const tx = provider.getTransactionReceipt(transaction.hash);
          const logs = (await tx).logs;
          const log = logs.find(
            (log) => log.address?.toLowerCase() === transaction.to?.toLowerCase()
          );
          const hexId = log!.topics[1];
          const streamId = hexToNumberString(hexId);

          const coin =
            coins.find(
              (coin) =>
                coin.address?.toLowerCase() ===
                "0x" + result.inputs[2]?.toLowerCase()
            )! ??
            coins.find(
              (coin) =>
                coin.address?.toLowerCase() ===
                blockchain.nativeToken?.toLowerCase()
            );
          const amount = hexToNumberString(result.inputs[1]._hex).toString();

          return {
            method: ERCMethodIds.automatedTransfer,
            id: ERCMethodIds.automatedTransfer,
            recipient: "0x" + result.inputs[0],
            deposit: +amount / 10 ** coin.decimals,
            coin: coin,
            startTime: hexToNumberString(result.inputs[3]._hex).toString(),
            stopTime: hexToNumberString(result.inputs[4]._hex).toString(),
            streamId: streamId,
            tags: theTags,
          };
        } else if (result.method === "cancelStream") {
          return {
            method: ERCMethodIds.automatedCanceled,
            id: ERCMethodIds.automatedCanceled,
            streamId: hexToNumberString(result.inputs[0]._hex).toString(),
            tags: theTags,
          };
        }
      } else if (
        blockchain.lendingProtocols.find(
          (lend) =>
            lend.ethGatewayAddress?.toLowerCase() ===
            transaction.to.toLowerCase()
        )
      ) {
        const abi = blockchain.lendingProtocols.find(
          (lend) =>
            lend.ethGatewayAddress?.toLowerCase() ===
            transaction.to.toLowerCase()
        )!.ethGatewayABI;
        const decoder = new InputDataDecoder(abi);
        const result = decoder.decodeData(input);
        const coin = coins.find(
          (coin) =>
            coin.address.toLowerCase() === blockchain.nativeToken.toLowerCase()
        );
        const amount = transaction.value.toString();
        if (result.method === "depositETH") {
          return {
            method: ERCMethodIds.deposit,
            id: ERCMethodIds.deposit,
            coin: coin,
            contract: transaction.to,
            amount: +amount / 10 ** coin!.decimals,
            to: "0x" + result.inputs[3],
            tags: theTags,
          };
        } else if (result.method === "withdrawETH") {
          return {
            method: ERCMethodIds.withdraw,
            id: ERCMethodIds.withdraw,
            coin: coin,
            amount: +amount / 10 ** coin!.decimals,
            to: "0x" + result.inputs[3],
            theTags: theTags,
          };
        } else if (result.method === "borrowETH") {
          return {
            method: ERCMethodIds.borrow,
            id: ERCMethodIds.borrow,
            coin: coin,
            amount: +amount / 10 ** coin!.decimals,
            to: "0x" + result.inputs[3],
            theTags: theTags,
          };
        } else if (result.method === "repayETH") {
          return {
            method: ERCMethodIds.repay,
            id: ERCMethodIds.repay,
            coin: coin,
            amount: +amount / 10 ** coin!.decimals,
            to: "0x" + result.inputs[3],
            theTags: theTags,
          };
        }
      } else {
        const decoder = new InputDataDecoder(ERC20);
        const result = decoder.decodeData(input);
        if (result.method) {
          if (result.method === "approve") {
            return {};
          } else if (result.method === "transfer") {
            const coin =
              coins.find(
                (coin) =>
                  coin.address.toLowerCase() === transaction.to.toLowerCase()
              )! ??
              coins.find(
                (coin) =>
                  coin.address.toLowerCase() ===
                  blockchain.nativeToken.toLowerCase()
              );
            const amount = hexToNumberString(result.inputs[1]._hex);
            return {
              method: ERCMethodIds.transfer,
              id: ERCMethodIds.transfer,
              transfer: ERCMethodIds.transfer,
              to: "0x" + result.inputs[0],
              coin: coin,
              amount: +amount / 10 ** coin.decimals,
              tags: theTags,
            };
          }
        }
      }
    }
  } catch (e: any) {
    throw new Error("Error reading input");
  }
};

