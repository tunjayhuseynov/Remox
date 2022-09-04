import { AltCoins, Coins } from "types";
import { BlockchainType } from "types/blockchains";
import { IPaymentInput, ISwap, ISwapParam1inch } from "./index.api";
import { DecimalConverter } from "utils/api";
import { ethers } from "ethers";
import nomAbi from "rpcHooks/ABI/nom.json";
import ERC20 from "rpcHooks/ABI/erc20.json";
import Web3 from "web3";
import { AbiItem } from "rpcHooks/ABI/AbiItem";
import axios from "axios";




export const GenerateTxEvm = async (
  { coin, amount, recipient, comment, from }: IPaymentInput,
  Blockchain: BlockchainType,
  coins: Coins
) => {
  const web3 = new Web3(Blockchain.rpcUrl);
  const Coin = coins[coin];
  const amountInWei = DecimalConverter(amount, Coin.decimals);

  const contract = new web3.eth.Contract(ERC20 as AbiItem[], Coin.address);

  const currentBalance = await contract.methods.balanceOf(from).call();
  const balance = DecimalConverter(currentBalance, Coin.decimals);

  if (amount >= balance) {
    throw new Error("Amount exceeds balance");
  }

  return comment
    ? contract.methods
        .transferWithComment(recipient, amountInWei, comment)
        .encodeABI()
    : from
    ? contract.methods.transferFrom(from, recipient, amountInWei).encodeABI()
    : contract.methods.transfer(recipient, amountInWei).encodeABI();
};

export const GenerateSwapDataEvm = async (swap: ISwap, chainId: number) => {
  const swapParams: ISwapParam1inch = {
    fromTokenAddress: swap.inputCoin.toString(),
    toTokenAddress: swap.outputCoin.toString(),
    amount: (+swap.amount * Math.pow(10, 6)).toString(),
    fromAddress: swap.account,
    slippage: +swap.slippage,
    disableEstimate: false,
    allowPartialFill: true
  }

  const apiBaseUrl = "https://api.1inch.io/v4.0/" + chainId;

  function apiRequestUrl(methodName: string, queryParams: any) {
    return (
      apiBaseUrl +
      methodName +
      "?" +
      new URLSearchParams(queryParams).toString()
    );
  }

  async function buildTxForSwap(swapParams: ISwapParam1inch) {
    const url = apiRequestUrl("/swap", swapParams);
    console.log("url", url);
  
    const res = await axios.get(url);
    console.log("res", res);
    const result = await res.data;
    const tx = result.tx;

    return {
      tx: {
        ...tx,
        value: 0,
        gas: 21000
      },
    };
  }

  const swapTransaction = await buildTxForSwap(swapParams);

  return swapTransaction.tx.data;
}
