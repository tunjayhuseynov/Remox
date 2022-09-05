import { useMemo } from "react";
import { SelectParsedTransactions } from "../redux/slices/account/transactions";
import { useSelector } from "react-redux";
import { Transactions } from "../types/sdk";
import { hexToNumberString, hexToUtf8 } from "web3-utils";
import { AltCoins, Coins, CoinsName } from "types";
import { selectTags } from "redux/slices/tags";
import useWalletKit from "./walletSDK/useWalletKit";
import { ITag } from "pages/api/tags/index.api";
import { Blockchains, BlockchainType } from "types/blockchains";
import InputDataDecoder from "ethereum-input-data-decoder";
import { ethers } from "ethers";
import ERC20 from "rpcHooks/ABI/erc20.json";
import Ubeswap from "rpcHooks/ABI/Ubeswap.json";
import Moola from "rpcHooks/ABI/Moola.json";
import BatchRequest from "rpcHooks/ABI/BatchRequest.json";
import Gelato from "rpcHooks/ABI/Gelato.json";
import { IBudget } from "firebaseConfig";
import BigNumber from "bignumber.js";

export const ERC20MethodIds = {
  transferFrom: "transferFrom",
  transfer: "transfer",
  transferWithComment: "transferWithComment",
  approve: "approve",
  batchRequest: "batchRequest",
  swap: "swap",
  automatedTransfer: "automatedTransfer",
  borrow: "borrow",
  deposit: "deposit",
  withdraw: "withdraw",
  repay: "repay",
  createStream: "createStream",
  cancelStream: "cancelStream",
  rejection: "0x1",
  addOwner: "addOwner",
  removeOwner: "removeOwner",
  changeThreshold: "changeThreshold",
  noInput: "0x",
};

export interface IFormattedTransaction {
  rawData: Transactions;
  timestamp: number;
  method: string;
  hash: string;
  id: string;
  tags?: ITag[];
  budget?: IBudget
}

export interface ITransfer extends IFormattedTransaction {
  // aw, Moola Borrow
  to: string;
  amount: string;
  coin: AltCoins;
}

export interface IAutomationTransfer extends IFormattedTransaction {
  startTime: number;
  interval: number;
  address: string;
  amount: string;
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
    coinAddress: AltCoins;
    from: string;
    to: string;
    amount: string;
  }[];
}

const useTransactionProcess = (): [IFormattedTransaction[]] | [] => {
  const transactions = useSelector(SelectParsedTransactions);
  const tags = useSelector(selectTags);
  const { GetCoins } = useWalletKit();
  return useMemo(() => {
    if (transactions && GetCoins) {
      const FormattedTransaction = transactions;
      return [FormattedTransaction];
    }
    return [];
  }, [transactions, tags]);
};

export const GenerateTransaction = (
  transaction: Partial<Transactions>
): Transactions => ({
  blockHash: transaction.blockHash ?? "",
  blockNumber: transaction.blockNumber ?? "0",
  confirmations: transaction.confirmations ?? "0",
  contractAddress: transaction.contractAddress ?? "",
  cumulativeGasUsed: transaction.cumulativeGasUsed ?? "0",
  from: transaction.from ?? "",
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
  transaction: Transactions;
  tags: ITag[];
  Coins: Coins;
}

export const InputReader = (
  input: string,
  { transaction, tags, Coins }: IReader
) => {
  const theTags = tags.filter((s) =>
    s.transactions.some((t) => t.hash === transaction.hash)
  );

  let decoder = new InputDataDecoder(ERC20);
  let result = decoder.decodeData(input);
  if (!result.method) {
    decoder = new InputDataDecoder(Moola.abi);
    result = decoder.decodeData(input);
    if (!result.method) {
      decoder = new InputDataDecoder(Ubeswap.output.abi);
      result = decoder.decodeData(input);
      if (!result.method) {
        decoder = new InputDataDecoder(BatchRequest.abi);
        result = decoder.decodeData(input);
        if (!result.method) {
          decoder = new InputDataDecoder(Gelato);
          result = decoder.decodeData(input);
        }
      }
    }
  }
  if (!result.method) {
    const coin = Object.values(Coins).find(s => s.address.toLowerCase() === transaction.contractAddress.toLowerCase())
    if (!coin) return { method: null }
    return {
      method: ERC20MethodIds.noInput,
      id: ERC20MethodIds.noInput,
      from: transaction.from,
      to: transaction.to,
      amount: transaction.value.toString(),
      coin: coin,
      tags: theTags,
    };
  } else if (result.method === ERC20MethodIds.transferFrom) {
    return {
      method: ERC20MethodIds.transferFrom,
      id: ERC20MethodIds.transferFrom,
      coin: Object.values(Coins).find(s => s.address.toLowerCase() === transaction.contractAddress.toLowerCase()),
      from: result.inputs[0],
      to: result.inputs[1],
      amount: (result.inputs[2] as BigNumber).toString(),
      tags: theTags,
    };
  } else if (result.method === ERC20MethodIds.transfer) {
    return {
      method: ERC20MethodIds.transfer,
      id: ERC20MethodIds.transfer,
      coin: Object.values(Coins).find(s => s.address.toLowerCase() === transaction.contractAddress.toLowerCase()),
      to: "0x" + result.inputs[0],
      amount: (result.inputs[1] as BigNumber).toString(),
      tags: theTags,
    };
  } else if (result.method === "SwapExactTokensForTokens" || result.method === "swapTokensForExactTokens") {
    const coins: AltCoins[] = Object.values(Coins);
    return {
      method: ERC20MethodIds.swap,
      id: ERC20MethodIds.swap,
      amountIn: result.method === "SwapExactTokensForTokens" ? result.inputs[0].toString() : result.inputs[1].toString(),
      amountOutMin: result.method === "SwapExactTokensForTokens" ? result.inputs[1].toString() : result.inputs[0].toString(),
      coinIn: coins.find(
        (s) =>
          s.address.toLowerCase() === result.inputs[2][0].toLowerCase()
      )!,
      coinOutMin: coins.find(
        (s) =>
          s.address.toLowerCase() === result.inputs[2][1].toLowerCase()
      )!,
      tags: theTags,
    };
  } else if (result.method === "executeTransactions") {
    const txList = [];
    const splitData = (result.inputs[2] as string).substring(2).split("23b872dd");

    for (let i = 0; i < result.inputs[0].length; i++) {
      const coin = Object.values(Coins).find(
        (s) =>
          s.address.toLowerCase() === "0x" + result.inputs[0][i].toLowerCase()
      );

      let decoder = new InputDataDecoder(ERC20);
      let erc = decoder.decodeData(`0x23b872dd${splitData[i]}`);
      console.log(erc)
      if (coin && erc.method === ERC20MethodIds.transferFrom) {
        txList.push({
          coinAddress: coin,
          from: erc.inputs[0],
          to: erc.inputs[1],
          amount: erc.inputs[2].toString(),
        });
      }
    }
    return {
      method: ERC20MethodIds.batchRequest,
      id: ERC20MethodIds.batchRequest,
      payments: txList,
      tags: theTags,
    };

  }
  // else if (result.method === ERC20MethodIds.transferWithComment) {
  //   const len = ERC20MethodIds.transferWithComment.length;
  //   return {
  //     method: "transferWithComment",
  //     id: ERC20MethodIds.transferWithComment,
  //     to: "0x" + input.slice(len, len + 64).substring(24),
  //     coin: Coins[transaction.tokenSymbol as keyof Coins],
  //     amount: hexToNumberString(
  //       "0x" + input.slice(len + 64, len + 64 + 64)
  //     ).toString(),
  //     comment: hexToUtf8(
  //       "0x" +
  //       input.slice(len + 64 + 64 + 64 + 64, len + 64 + 64 + 64 + 64 + 64)
  //     ),
  //     tags: theTags,
  //   };
  // } 
  else if (result.method === "createTimedTask") {
    let decoder = new InputDataDecoder(ERC20);
    let ercRes = decoder.decodeData(result.inputs[4]);
    if (ercRes.method != ERC20MethodIds.transfer) return {}
    return {
      method: ERC20MethodIds.automatedTransfer,
      id: ERC20MethodIds.automatedTransfer,
      tags: theTags,
      startTime: result.inputs[0].toString(),
      interval: result.inputs[1].toString(),
      address: result.inputs[2].toString(),
      coin: Object.values(Coins).find(s => s.address.toLowerCase() === result.inputs[2].toString().toLowerCase()),
      amount: ercRes.method === "transfer" ? ercRes.inputs[1].toString() : 0
    };
  } else if (result.method === ERC20MethodIds.borrow) {
    const coins: AltCoins[] = Object.values(Coins);
    return {
      method: ERC20MethodIds.borrow,
      id: ERC20MethodIds.borrow,
      coin: coins.find(
        (s) =>
          s.address.toLowerCase() === '0x' + result.inputs[0].toLowerCase()
      )!,
      amount: result.inputs[1].toString(),
      to: result.inputs[0],
      tags: theTags,
    };
  } else if (result.method === ERC20MethodIds.deposit) {
    const coins: AltCoins[] = Object.values(Coins);
    return {
      method: ERC20MethodIds.deposit,
      id: ERC20MethodIds.deposit,
      coin: coins.find(
        (s) =>
          s.address.toLowerCase() === '0x' + result.inputs[0].toLowerCase()
      )!,
      amount: result.inputs[1].toString(),
      to: result.inputs[0],
      tags: theTags,
    };
  } else if (result.method === ERC20MethodIds.withdraw) {
    const coins: AltCoins[] = Object.values(Coins);
    return {
      method: ERC20MethodIds.withdraw,
      id: ERC20MethodIds.withdraw,
      coin: coins.find(
        (s) =>
          s.address.toLowerCase() === '0x' + result.inputs[0].toLowerCase()
      )!,
      amount: result.inputs[1].toString(),
      to: result.inputs[0],
      tags: theTags,
    };
  } else if (result.method === ERC20MethodIds.repay) {
    const coins: AltCoins[] = Object.values(Coins);
    return {
      method: ERC20MethodIds.repay,
      id: ERC20MethodIds.repay,
      coin: coins.find(
        (s) =>
          s.address.toLowerCase() === '0x' + result.inputs[0].toLowerCase()
      )!,
      amount: result.inputs[1].toString(),
      to: result.inputs[0],
      tags: theTags,
    };
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
            swap.contractAddress.toLowerCase() === transaction.to.toLowerCase()
        )
      ) {
        const abi = blockchain.swapProtocols.find(
          (swap) =>
            swap.contractAddress.toLowerCase() === transaction.to.toLowerCase()
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
              coin.address.toLowerCase() === result.inputs[1][0].toLowerCase()
          )! ??
          coins.find(
            (coin) =>
              coin.address.toLowerCase() ===
              blockchain.nativeToken.toLowerCase()
          );
        const coinOut =
          coins.find(
            (coin) =>
              coin.address.toLowerCase() === result.inputs[1][1].toLowerCase()
          )! ??
          coins.find(
            (coin) =>
              coin.address.toLowerCase() ===
              blockchain.nativeToken.toLowerCase()
          );

        return {
          method: ERC20MethodIds.swap,
          id: ERC20MethodIds.swap,
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
            lend.contractAddress.toLowerCase() === transaction.to.toLowerCase()
        )
      ) {
        const abi = blockchain.lendingProtocols.find(
          (lend) =>
            lend.contractAddress.toLowerCase() === transaction.to.toLowerCase()
        )?.abi;
        const decoder = new InputDataDecoder(abi);
        const result = decoder.decodeData(input);
        const amount = hexToNumberString(result.inputs[1]._hex).toString();

        const coin =
          coins.find(
            (coin) =>
              coin.address.toLowerCase() ===
              "0x" + result.inputs[0].toLowerCase()
          )! ??
          coins.find(
            (coin) =>
              coin.address.toLowerCase() ===
              blockchain.nativeToken.toLowerCase()
          );

        if (result.method === "supply") {
          return {
            method: ERC20MethodIds.deposit,
            id: ERC20MethodIds.deposit,
            coin: coin,
            amount: +amount / 10 ** coin.decimals,
            to: "0x" + result.inputs[2],
            tags: theTags,
          };
        } else if (result.method === "borrow") {
          return {
            method: ERC20MethodIds.borrow,
            id: ERC20MethodIds.borrow,
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
            method: ERC20MethodIds.withdraw,
            id: ERC20MethodIds.withdraw,
            coin: coin,
            amount: +amount / 10 ** coin.decimals,
            to: "0x" + result.inputs[1],
          };
        } else if (result.method === "repay") {
          return {
            method: ERC20MethodIds.repay,
            id: ERC20MethodIds.repay,
            coin: coin,
            amount: +amount / 10 ** coin.decimals,
            to: "0x" + result.inputs[1],
            tags: theTags,
          };
        }
      } else if (
        blockchain.recurringPaymentProtocols.find(
          (stream) =>
            stream.contractAddress.toLowerCase() ===
            transaction.to.toLowerCase()
        )
      ) {
        const abi = blockchain.recurringPaymentProtocols.find(
          (stream) =>
            stream.contractAddress.toLowerCase() ===
            transaction.to.toLowerCase()
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
            (log) => log.address.toLowerCase() === transaction.to.toLowerCase()
          );
          const hexId = log!.topics[1];
          const streamId = hexToNumberString(hexId);

          const coin =
            coins.find(
              (coin) =>
                coin.address.toLowerCase() ===
                "0x" + result.inputs[2].toLowerCase()
            )! ??
            coins.find(
              (coin) =>
                coin.address.toLowerCase() ===
                blockchain.nativeToken.toLowerCase()
            );
          const amount = hexToNumberString(result.inputs[1]._hex).toString();

          return {
            method: ERC20MethodIds.createStream,
            id: ERC20MethodIds.createStream,
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
            method: ERC20MethodIds.cancelStream,
            id: ERC20MethodIds.cancelStream,
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
            method: ERC20MethodIds.deposit,
            id: ERC20MethodIds.deposit,
            coin: coin,
            contract: transaction.to,
            amount: +amount / 10 ** coin!.decimals,
            to: "0x" + result.inputs[3],
            tags: theTags,
          };
        } else if (result.method === "withdrawETH") {
          return {
            method: ERC20MethodIds.withdraw,
            id: ERC20MethodIds.withdraw,
            coin: coin,
            amount: +amount / 10 ** coin!.decimals,
            to: "0x" + result.inputs[3],
            theTags: theTags,
          };
        } else if (result.method === "borrowETH") {
          return {
            method: ERC20MethodIds.borrow,
            id: ERC20MethodIds.borrow,
            coin: coin,
            amount: +amount / 10 ** coin!.decimals,
            to: "0x" + result.inputs[3],
            theTags: theTags,
          };
        } else if (result.method === "repayETH") {
          return {
            method: ERC20MethodIds.repay,
            id: ERC20MethodIds.repay,
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
            return;
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
              method: ERC20MethodIds.transfer,
              id: ERC20MethodIds.transfer,
              transfer: ERC20MethodIds.transfer,
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

export default useTransactionProcess;
