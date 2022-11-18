import { CeloProvider } from '@celo-tools/celo-ethers-wrapper';
import { ChainId, Fetcher, Fraction, JSBI as UbeJSBI, Percent, Route, Router, TokenAmount, Trade, TradeType } from '@ubeswap/sdk';
import { getAddress } from 'ethers/lib/utils';
import axios from 'axios';
import { useState } from 'react';
import { AltCoins } from 'types';
import { fromWei, toWei } from 'utils/ray';
import { Jupiter } from '@jup-ag/core'
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { DecimalConverter } from 'utils/api';
import { useAppSelector } from 'redux/hooks';
import { SelectSelectedAccountAndBudget } from 'redux/slices/account/selector';
import { Blockchains } from 'types/blockchains';
import { ISwapParam1inch } from 'pages/api/payments/send/index.api';

export default function useSwap() {
    const { connection } = useConnection();

    const [isLoading, setLoading] = useState(false)

    const accountAndBudget = useAppSelector(SelectSelectedAccountAndBudget)
    const account = accountAndBudget.account
    const blockchain = Blockchains.find(b => b.name === account?.blockchain) ?? Blockchains[0];
    const protocol = blockchain.swapProtocols[0];

    const MinmumAmountOut = async (inputCoin: AltCoins, outputCoin: AltCoins, amount: string, slippage: string, deadline: number) => {
        try {
            setLoading(true)

            if (protocol?.name === "1inch") {
                const swapParams: ISwapParam1inch = {
                    fromTokenAddress: inputCoin.address.toString(),
                    toTokenAddress: outputCoin.address.toString(),
                    amount: new BigNumber(amount).multipliedBy(10 ** inputCoin.decimals).toString(),
                    fromAddress: account?.address ?? "",
                    slippage: +slippage,
                    disableEstimate: false,
                    allowPartialFill: true
                }

                const swapParamsOne: ISwapParam1inch = {
                    fromTokenAddress: inputCoin.address.toString(),
                    toTokenAddress: outputCoin.address.toString(),
                    amount: (1 * Math.pow(10, inputCoin.decimals)).toString(),
                    fromAddress: account?.address ?? "",
                    slippage: +slippage,
                    disableEstimate: false,
                    allowPartialFill: true
                }
                const swapTransaction = await buildTxForSwap(swapParams);
                const swapTransactionOne = await buildTxForSwap(swapParamsOne);

                let gas = new BigNumber(swapTransaction.estimatedGas).dividedBy(10 ** 9).toString();
                setLoading(false)
                return {
                    minimumAmountOut: new BigNumber(swapTransaction.toTokenAmount).dividedBy(10 ** outputCoin.decimals).toString(),
                    oneTokenValue: new BigNumber(swapTransactionOne.toTokenAmount).dividedBy(10 ** outputCoin.decimals).toString(),
                    feeAmount: gas
                };

            }



            // if (blockchain.name === 'solana') {
            //     const jupiter = await Jupiter.load({
            //         connection,
            //         cluster: "mainnet-beta",
            //         // user: publicKey!, // or public key
            //         //platformFeeAndAccounts:  NO_PLATFORM_FEE,
            //         routeCacheDuration: -1, // Will not refetch data on computeRoutes for up to 10 seconds
            //     });

            //     let minOut = "0";
            //     let fee;
            //     if (parseFloat(amount) > 0) {
            //         const routes = await jupiter.computeRoutes({
            //             inputMint: new PublicKey(inputCoin.address), // Mint address of the input token
            //             outputMint: new PublicKey(outputCoin.address), // Mint address of the output token
            //             amount: JSBI.BigInt(parseFloat(amount) * (10 ** inputCoin.decimals!)), // raw input amount of tokens
            //             slippage: parseFloat(slippage), // The slippage in % terms
            //             forceFetch: false // false is the default value => will use cache if not older than routeCacheDuration
            //         })
            //         fee = (await routes.routesInfos[0].getDepositAndFee())?.totalFeeAndDeposits?.toString()
            //         minOut = new BigNumber(String(routes.routesInfos[0].outAmount)).dividedBy(10 ** outputCoin.decimals!).toString()
            //     }

            //     const routeOne = await jupiter.computeRoutes({
            //         inputMint: new PublicKey(inputCoin.address), // Mint address of the input token
            //         outputMint: new PublicKey(outputCoin.address), // Mint address of the output token
            //         amount: JSBI.BigInt(1 * (10 ** inputCoin.decimals!)), // raw input amount of tokens
            //         slippage: parseFloat(slippage), // The slippage in % terms
            //         forceFetch: false // false is the default value => will use cache if not older than routeCacheDuration
            //     })

            //     setLoading(false)
            //     return { minimumAmountOut: minOut, oneTokenValue: new BigNumber(routeOne.routesInfos[0].outAmount.toString()).dividedBy(10 ** outputCoin.decimals!).toString(), feeAmount: fee ?? "0" }
            // } else if (blockchain.name === "celo") {

            const provider = new CeloProvider('https://forno.celo.org')
            let priceImpactWithoutFeePercent;
            let feeAmount: any = 0;

            let inputAddress = inputCoin.address;
            const input = await Fetcher.fetchTokenData(ChainId.MAINNET, getAddress(inputAddress), provider);

            let outputAddress = outputCoin.address;
            const output = await Fetcher.fetchTokenData(ChainId.MAINNET, getAddress(outputAddress), provider);

            const pair = await Fetcher.fetchPairData(output, input, provider);
            const route = new Route([pair], input);

            let minimumAmountOut = "0";

            if (parseFloat(amount) > 0) {
                const amountIn = new BigNumber(amount).multipliedBy(10 ** inputCoin.decimals).toString();
                const trade = new Trade(route, new TokenAmount(input, amountIn), TradeType.EXACT_INPUT); //


                const BASE_FEE = new Percent(UbeJSBI.BigInt(30), UbeJSBI.BigInt(10000))
                const ONE_HUNDRED_PERCENT = new Percent(UbeJSBI.BigInt(10000), UbeJSBI.BigInt(10000))
                const INPUT_FRACTION_AFTER_FEE = ONE_HUNDRED_PERCENT.subtract(BASE_FEE)

                const realizedLPFee = !trade
                    ? undefined
                    : ONE_HUNDRED_PERCENT.subtract(
                        trade.route.pairs.reduce<Fraction>(
                            (currentFee: Fraction): Fraction => currentFee.multiply(INPUT_FRACTION_AFTER_FEE),
                            ONE_HUNDRED_PERCENT
                        )
                    )

                const priceImpactWithoutFeeFraction = trade && realizedLPFee ? trade.priceImpact.subtract(realizedLPFee) : undefined

                priceImpactWithoutFeePercent = priceImpactWithoutFeeFraction
                    ? new Percent(priceImpactWithoutFeeFraction.numerator, priceImpactWithoutFeeFraction.denominator)
                    : undefined

                feeAmount =
                    realizedLPFee &&
                    trade &&
                    new TokenAmount(trade.inputAmount.token, realizedLPFee.multiply(trade.inputAmount.raw).quotient)

                feeAmount = feeAmount.toSignificant(4)
                const amountOut = trade.minimumAmountOut(new Percent(slippage.toString(), '1000'));
                minimumAmountOut = amountOut.raw.toString();
                minimumAmountOut = DecimalConverter(minimumAmountOut, outputCoin.decimals).toString();
            }

            const oneCoin = new BigNumber(1).multipliedBy(10 ** inputCoin.decimals!).toString();
            const tradeOne = new Trade(route, new TokenAmount(input, oneCoin), TradeType.EXACT_INPUT); //

            const amountOutOne = tradeOne.minimumAmountOut(new Percent(slippage, '1000'));
            let minimumAmountOutOne = amountOutOne.raw.toString();
            minimumAmountOutOne = DecimalConverter(minimumAmountOutOne, outputCoin.decimals).toString();
            setLoading(false)
            return { minimumAmountOut, oneTokenValue: minimumAmountOutOne, feeAmount: feeAmount };
            // }
        } catch (e: any) {
            setLoading(false)
            throw new Error(e);
        }
    }

    function apiRequestUrl(methodName: string, queryParams: any) {
        const apiBaseUrl = "https://api.1inch.io/v5.0/" + blockchain.chainId;

        return (
            apiBaseUrl +
            methodName +
            "?" +
            new URLSearchParams(queryParams).toString()
        );
    }

    async function buildTxForSwap(swapParams: ISwapParam1inch) {
        const url = apiRequestUrl("/quote", swapParams);

        const res = await axios.get(url);

        const result = await res.data;
        const tx = result;

        return tx;
    }

    return { MinmumAmountOut, isLoading };
}
