import { toTransactionBatch } from "@celo/contractkit/lib/wrappers/MetaTransactionWallet"
import { ethers } from "ethers"
import { fromWei, toWei } from "utils/ray"
import nomAbi from "rpcHooks/ABI/nom.json"
import { CeloEndpoint } from "components/Wallet"
import ERC20 from 'rpcHooks/ABI/erc20.json'
import BatchRequestABI from 'rpcHooks/ABI/BatchRequest.json'
import Web3 from 'web3'
import { AbiItem } from "web3-utils"
import { Contracts } from "rpcHooks/Contracts/Contracts"
import { IPaymentInput, ISwap } from "./index.api"
import { ChainId, Fetcher, Fraction, JSBI as UbeJSBI, Percent, Route, Router, TokenAmount, Trade, TradeType } from '@ubeswap/sdk';
import { getAddress } from "ethers/lib/utils"
import { CeloProvider } from "@celo-tools/celo-ethers-wrapper"
import { Coins } from "types"


const web3 = new Web3(CeloEndpoint)

export const BatchPay = async (inputArr: IPaymentInput[], from: string, coins: Coins) => {

    const data = await GenerateBatchPay(inputArr, from, coins)

    return data;
}

export const GenerateBatchPay = async (inputArr: IPaymentInput[], from: string, coins: Coins) => {
    const arr: {
        data: string,
        destination: string,
        value: string,
    }[] = []

    for (let i = 0; i < inputArr.length; i++) {
        const tx = inputArr[i];
        const coin = coins[tx.coin]
        const data = await GenerateTx({ ...inputArr[i] }, from, coins)
        arr.push({
            destination: coin.address,
            value: "0",
            data: data,
        })
    }

    const input = toTransactionBatch(arr)

    const router = new web3.eth.Contract(
        BatchRequestABI.abi as AbiItem[], Contracts.BatchRequest.address)

    return router.methods.executeTransactions(input.destinations, input.values, input.callData, input.callDataLengths).encodeABI()
}

export const GenerateTx = async ({ coin, amount, recipient, comment, from }: IPaymentInput, fromAddress: string, coins: Coins) => {
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

    const Coin = coins[coin]
    let token = new web3.eth.Contract(ERC20 as AbiItem[], Coin.address);
    let currentBalance = await token.methods.balanceOf(fromAddress).call();
    let celoBalance = fromWei(currentBalance)


    if (amount.toString() >= celoBalance)
        throw new Error('Amount exceeds balance');

    return comment
        ? token.methods
            .transferWithComment(recipient, amountWei, comment).encodeABI()
        : from ? token.methods.transferFrom(from, recipient, amountWei).encodeABI() : token.methods.transfer(recipient, amountWei).encodeABI();
}

export const GenerateSwapData = async (swap: ISwap) => {

    const provider = new CeloProvider('https://forno.celo.org')


    let inputAddress = swap.inputCoin.address;
    const input = await Fetcher.fetchTokenData(ChainId.MAINNET, getAddress(inputAddress), provider);

    let outputAddress = swap.outputCoin.address;
    const output = await Fetcher.fetchTokenData(ChainId.MAINNET, getAddress(outputAddress), provider);


    const addressesMain = {
        ubeswapFactory: '0x62d5b84bE28a183aBB507E125B384122D2C25fAE',
        ubeswapRouter: '0xE3D8bd6Aed4F159bc8000a9cD47CffDb95F96121',
        ubeswapMoolaRouter: '0x7D28570135A2B1930F331c507F65039D4937f66c'
    };

    const router = new web3.eth.Contract(
        [
            {
                inputs: [
                    {
                        internalType: 'uint256',
                        name: 'amountIn',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256',
                        name: 'amountOutMin',
                        type: 'uint256'
                    },
                    {
                        internalType: 'address[]',
                        name: 'path',
                        type: 'address[]'
                    },
                    {
                        internalType: 'address',
                        name: 'to',
                        type: 'address'
                    },
                    {
                        internalType: 'uint256',
                        name: 'deadline',
                        type: 'uint256'
                    }
                ],
                name: 'swapExactTokensForTokens',
                outputs: [
                    {
                        internalType: 'uint256[]',
                        name: 'amounts',
                        type: 'uint256[]'
                    }
                ],
                stateMutability: 'nonpayable',
                type: 'function'
            }
        ],
        addressesMain.ubeswapRouter
    );

    const pair = await Fetcher.fetchPairData(output, input, provider);
    const route = new Route([pair], input);
    const amountIn = toWei(swap.amount)
    // Trade.bestTradeExactIn(pair,new TokenAmount(input, amountIn.toString()),output)
    const trade = new Trade(route, new TokenAmount(input, amountIn), TradeType.EXACT_INPUT); //

    const ubeRouter = Router.swapCallParameters(trade, {
        feeOnTransfer: false,
        allowedSlippage: new Percent(swap.slippage, '1000'),
        recipient: swap.account,
        ttl: swap.deadline
    });

    const sender = await router.methods.swapExactTokensForTokens(...ubeRouter.args).encodeABI()

    return sender;
}