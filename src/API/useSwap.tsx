import { CeloProvider } from '@celo-tools/celo-ethers-wrapper';
import { useContractKit } from '@celo-tools/use-contractkit';
import { StableToken } from '@celo/contractkit';
import { ChainId, Fetcher, Fraction, JSBI, Percent, Route, Router, TokenAmount, Trade, TradeType } from '@ubeswap/sdk';
import { getAddress } from 'ethers/lib/utils';
import { DashboardContext } from 'pages/dashboard/layout';
import { useContext, useState } from 'react';
import { AltCoins, CeloCoins } from 'types';
import { fromWei, toWei } from 'utils/ray';

export default function useSwap() {
    const { kit, address } = useContractKit()
    const { refetch } = useContext(DashboardContext) as { refetch: () => Promise<void> }
    
    const [isLoading, setLoading] = useState(false)

    const Exchange = async (inputCoin: AltCoins, outputCoin: AltCoins, amount: string, slippage: string, deadline: number) => {
        const provider = new CeloProvider('https://forno.celo.org')

        setLoading(true)
        let token;
        try {

            let inputAddress = inputCoin.contractAddress;
            const input = await Fetcher.fetchTokenData(ChainId.MAINNET, getAddress(inputAddress), provider);

            let outputAddress = outputCoin.contractAddress;
            const output = await Fetcher.fetchTokenData(ChainId.MAINNET, getAddress(outputAddress), provider);

            if (inputCoin == CeloCoins.CELO) token = await kit.contracts.getGoldToken();
            else if (inputCoin === CeloCoins.cUSD || inputCoin === CeloCoins.cEUR || inputCoin === CeloCoins.cREAL)
                token = await kit.contracts.getStableToken((inputCoin.name as unknown) as StableToken);
            else {
                let altToken = inputCoin.contractAddress;
                token = await kit.contracts.getErc20(altToken);
            }
            const addressesMain = {
                ubeswapFactory: '0x62d5b84bE28a183aBB507E125B384122D2C25fAE',
                ubeswapRouter: '0xE3D8bd6Aed4F159bc8000a9cD47CffDb95F96121',
                ubeswapMoolaRouter: '0x7D28570135A2B1930F331c507F65039D4937f66c'
            };

            let approve = token.approve(
                addressesMain.ubeswapRouter,
                kit.web3.utils.toWei(amount, 'ether')
            );

            let sendFunc = await approve.sendAndWaitForReceipt({ from: address!, gas: 300000, gasPrice: kit.web3.utils.toWei("1", 'Gwei') });

            const router = new kit.connection.web3.eth.Contract(
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
            const amountIn = toWei(amount)
            // Trade.bestTradeExactIn(pair,new TokenAmount(input, amountIn.toString()),output)
            const trade = new Trade(route, new TokenAmount(input, amountIn), TradeType.EXACT_INPUT); //

            const ubeRouter = Router.swapCallParameters(trade, {
                feeOnTransfer: false,
                allowedSlippage: new Percent(slippage, '1000'),
                recipient: address!,
                ttl: deadline
            });

            const txx = await router.methods.swapExactTokensForTokens(...ubeRouter.args);

            const sender = await txx.send({ from: address!, gas: 300000, gasPrice: kit.web3.utils.toWei("0.5", 'Gwei') });
            await refetch()
            setLoading(false)
            return { hash: sender.transactionHash }
        } catch (e: any) {
            setLoading(false)
            throw new Error(e);
        }
    }

    const MinmumAmountOut = async (inputCoin: AltCoins, outputCoin: AltCoins, amount: string, slippage: string, deadline: number) => {
        const provider = new CeloProvider('https://forno.celo.org')
        setLoading(true)
        let priceImpactWithoutFeePercent;
        let feeAmount: any = 0;
        try {

            let inputAddress = inputCoin.contractAddress;
            const input = await Fetcher.fetchTokenData(ChainId.MAINNET, getAddress(inputAddress), provider);

            let outputAddress = outputCoin.contractAddress;
            const output = await Fetcher.fetchTokenData(ChainId.MAINNET, getAddress(outputAddress), provider);

            const pair = await Fetcher.fetchPairData(output, input, provider);
            const route = new Route([pair], input);

            let minimumAmountOut = "0";

            if (parseFloat(amount) > 0) {
                const amountIn = toWei(amount)
                const trade = new Trade(route, new TokenAmount(input, amountIn), TradeType.EXACT_INPUT); //


                const BASE_FEE = new Percent(JSBI.BigInt(30), JSBI.BigInt(10000))
                const ONE_HUNDRED_PERCENT = new Percent(JSBI.BigInt(10000), JSBI.BigInt(10000))
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
                minimumAmountOut = fromWei(minimumAmountOut);
            }

            const oneCoin = toWei(1);
            const tradeOne = new Trade(route, new TokenAmount(input, oneCoin), TradeType.EXACT_INPUT); //

            const amountOutOne = tradeOne.minimumAmountOut(new Percent(slippage, '1000'));
            let minimumAmountOutOne = amountOutOne.raw.toString();
            minimumAmountOutOne = fromWei(minimumAmountOutOne);

            setLoading(false)
            return { minimumAmountOut, oneTokenValue: minimumAmountOutOne, feeAmount: feeAmount };
        } catch (e: any) {
            setLoading(false)
            throw new Error(e);
        }
    }

    return { Exchange, MinmumAmountOut, isLoading };
}
