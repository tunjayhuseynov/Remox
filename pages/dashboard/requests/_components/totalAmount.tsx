import { IRequest } from "rpcHooks/useRequest";
import { useMemo } from "react";
import { IMember } from 'types/dashboard/contributors';
import { SelectCurrencies, SelectFiatPreference, SelectFiatSymbol, SelectTotalBalance } from "redux/slices/account/selector";
import { Coins } from "types";
import { useWalletKit } from "hooks";
import { GetFiatPrice } from "utils/const";
import { useAppSelector } from "redux/hooks";
import { FiatMoneyList } from "firebaseConfig";
import { NG } from "utils/jsxstyle";

export const TotalFiatAmount = (coinList: (IRequest | IMember)[], Coins: Coins, fiat: FiatMoneyList) => {
    return coinList.reduce((acc, curr) => {
        const coin = Object.values(Coins).find((c) => c.symbol === curr.currency)

        if (coin) {
            const fiatPrice = GetFiatPrice(coin, fiat)
            const amount = typeof curr.amount === "string" ? parseFloat(curr.amount) : curr.amount
            if (curr.fiat) {
                const tokenFiatPrice = GetFiatPrice(coin!, curr.fiat)
                const tokenAmount = amount / tokenFiatPrice
                acc += (tokenAmount * fiatPrice)
            } else {
                acc += (amount * fiatPrice)
            }
        }
        if (curr.secondCurrency && curr.secondAmount) {
            const secondCoin = Object.values(Coins).find((c) => c.symbol === curr.secondCurrency)
            const fiatPrice = GetFiatPrice(secondCoin!, fiat)
            const amount = typeof curr.secondAmount === "string" ? parseFloat(curr.secondAmount) : curr.secondAmount
            if (curr.fiatSecond) {
                const tokenFiatPrice = GetFiatPrice(secondCoin!, curr.fiatSecond)
                const tokenAmount = amount / tokenFiatPrice
                acc += (tokenAmount * fiatPrice)
            } else {
                acc += (amount * fiatPrice)
            }
        }
        return acc

    }, 0)
}


export default function TotalAmount({ coinList }: { coinList: IRequest[] | IMember[] }) {

    const totalBalance = useAppSelector(SelectTotalBalance)
    const fiatCurrency = useAppSelector(SelectFiatSymbol)
    const currency = useAppSelector(SelectCurrencies)
    const fiat = useAppSelector(SelectFiatPreference)
    const { GetCoins } = useWalletKit();
    const totalAmount = useMemo<number>(() => TotalFiatAmount(coinList, GetCoins, fiat), [coinList, currency])

    let remain = totalBalance - totalAmount

    return <>
        <div className={`mb-4 w-full  ${coinList.length > 0 && "border-r dark:border-[#D6D6D6]  border-opacity-10"} w-full flex flex-col justify-center  pr-5`}>
            <div className="w-full flex justify-start  items-center">
                <div className={`font-semibold  text-3xl`}>{fiatCurrency}<NG number={totalBalance} fontSize={1.75} /></div>
            </div>
            {totalAmount.toFixed(2) !== "0.00" &&
                <div className="w-full flex justify-start items-center text-lg font-semibold">
                    <div>-{fiatCurrency}<NG number={totalAmount} fontSize={1.25} /></div>
                </div>
            }
        </div>
        {totalAmount.toFixed(2) !== "0.00" &&
            <div className="w-full pt-3  pr-10">
                <div className="w-full flex justify-start items-center">
                    <div className="font-semibold text-3xl">{fiatCurrency}{remain < 0 ? "-" : ""}<NG number={Math.abs(remain)} fontSize={1.75} /></div>
                </div>
            </div>
        }
    </>
}