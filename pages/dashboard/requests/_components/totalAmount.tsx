import { IRequest } from "rpcHooks/useRequest";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { IMember } from 'types/dashboard/contributors';
import { SelectCurrencies, SelectTotalBalance } from "redux/slices/account/selector";
import { AltCoins, Coins } from "types";
import { SetComma } from 'utils'
import { useWalletKit } from "hooks";
import { GetFiatPrice } from "utils/const";

export const TotalUSDAmount = (coinList: (IRequest | IMember)[], Coins: Coins) => {
    return coinList.reduce((acc, curr) => {
        const coin = Object.values(Coins).find((c) => c.symbol === curr.currency)
        if (coin) {
            const amount = typeof curr.amount === "string" ? parseFloat(curr.amount) : curr.amount

            if (curr.fiat) {
                acc + amount
            } else {
                const fiatPrice = GetFiatPrice(coin!, curr.fiat)
                acc += ((fiatPrice ?? 1) * amount)
            }

            if (curr.secondCurrency && curr.secondAmount) {
                const secondCoin = Object.values(Coins).find((c) => c.symbol === curr.secondCurrency)
                if (secondCoin) {
                    const secondaryAmount = typeof curr.secondAmount === "string" ? parseFloat(curr.secondAmount) : curr.secondAmount
                    if (curr.fiatSecond) {
                        acc + secondaryAmount
                    } else {


                        //  acc += ((seconCoin?.priceUSD ?? 1) * secondaryAmount)
                    }
                }
            }
        }
        return acc
    }, 0)
}


export default function TotalAmount({ coinList }: { coinList: IRequest[] | IMember[] }) {

    const totalBalance = useSelector(SelectTotalBalance)
    const currency = useSelector(SelectCurrencies)
    const { GetCoins } = useWalletKit();
    const totalAmount = useMemo<number>(() => TotalUSDAmount(coinList, GetCoins ), [coinList, currency])

    return <>
        <div className={`mb-4 w-full  ${coinList.length > 0 && "border-r dark:border-[#D6D6D6]  border-opacity-10"} w-full flex flex-col justify-center  pr-5`}>
            <div className="w-full flex justify-start   items-center">
                <div className={`font-semibold   text-xl`}>${SetComma(totalBalance)}</div>
            </div>
            {totalAmount.toFixed(2) !== "0.00" &&
                <div className="w-full flex justify-start items-center text-lg font-semibold">
                    <div>-${SetComma(totalAmount)}</div>
                </div>
            }
        </div>
        {totalAmount.toFixed(2) !== "0.00" &&  
            <div className="w-full pt-2  pr-10">
                <div className="w-full flex justify-start items-center">
                    <div className="font-semibold text-xl">${SetComma((totalBalance - totalAmount))}</div>
                </div>
            </div>
        }
    </>
}