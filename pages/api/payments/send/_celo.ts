import { toTransactionBatch } from "@celo/contractkit/lib/wrappers/MetaTransactionWallet"
import { ethers } from "ethers"
import { PaymentInput } from "rpcHooks/useCeloPay"
import { fromWei, toWei } from "utils/ray"
import nomAbi from "rpcHooks/ABI/nom.json"
import { CeloEndpoint } from "components/Wallet"
import ERC20 from 'rpcHooks/ABI/erc20.json'
import BatchRequestABI from 'rpcHooks/ABI/BatchRequest.json'
import Web3 from 'web3'
import { AbiItem } from "web3-utils"
import { Contracts } from "rpcHooks/Contracts/Contracts"
import { IPaymentInput } from "."
import { CeloCoins } from "types"

const web3 = new Web3(CeloEndpoint)

export const BatchPay = async (inputArr: IPaymentInput[], from: string) => {

    const data = await GenerateBatchPay(inputArr, from)

    return data;
}

export const GenerateBatchPay = async (inputArr: IPaymentInput[], from: string) => {
    const arr : {
        data: string,
        destination: string,
        value: string,
    }[]= []

    for (let i = 0; i < inputArr.length; i++) {
        const tx = inputArr[i];
        const coin = CeloCoins[tx.coin]
        const data = await GenerateTx({ ...inputArr[i] }, from)
        arr.push({
            destination: coin.contractAddress,
            value: "0",
            data: data,
        })
    }

    const input = toTransactionBatch(arr)

    const router = new web3.eth.Contract(
        BatchRequestABI.abi as AbiItem[], Contracts.BatchRequest.address)

    return router.methods.executeTransactions(input.destinations, input.values, input.callData, input.callDataLengths).encodeABI()
}

export const GenerateTx = async ({ coin, amount, recipient, comment, from }: IPaymentInput, fromAddress: string) => {
    const amountWei = toWei(amount.toString());
    const provider = new ethers.providers.JsonRpcProvider(CeloEndpoint)
    let nomContract = new ethers.Contract("0xABf8faBbC071F320F222A526A2e1fBE26429344d", nomAbi.abi, provider)

    const isAddressExist = ethers.utils.isAddress(recipient)
    if (!isAddressExist) {
        if (recipient.slice(0, 2) != "0x") {
            recipient = recipient.slice(recipient.length - 4) == ".nom" ? recipient.slice(0, recipient.length - 4) : recipient
            const bytes = ethers.utils.formatBytes32String(recipient);
            recipient = await nomContract.methods.resolve(bytes).call();

            if (recipient.slice(0, 7) == "0x00000") throw new Error('There is not any wallet belong this address');
        }
        else throw new Error('There is not any wallet belong this address');
    }

    const Coin = CeloCoins[coin]
    let token = new web3.eth.Contract(ERC20 as AbiItem[], Coin.contractAddress);
    let currentBalance = await token.methods.balanceOf(fromAddress).call();
    let celoBalance = fromWei(currentBalance)


    if (amount.toString() >= celoBalance)
        throw new Error('Amount exceeds balance');

    return comment
        ? token.methods
            .transferWithComment(recipient, amountWei, comment).encodeABI()
        : from ? token.methods.transferFrom(from, recipient, amountWei).encodeABI() : token.methods.transfer(recipient, amountWei).encodeABI();
}
