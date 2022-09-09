import { IRequest } from "rpcHooks/useRequest";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { IMember } from 'types/dashboard/contributors';
import { SelectCurrencies, SelectTotalBalance } from "redux/slices/account/selector";
import { AltCoins, Coins } from "types";
import { SetComma } from 'utils'
import { useWalletKit } from "hooks";

export const TotalUSDAmount = (coinList: (IRequest | IMember)[], Coins: Coins) => {
    return coinList.reduce((acc, curr) => {
        const coin = Object.values(Coins).find((c) => c.name === curr.currency)
        if (coin) {
            const amount = typeof curr.amount === "string" ? parseFloat(curr.amount) : curr.amount

            if (curr.usdBase) {
                acc + amount
            } else {
                acc += ((coin?.priceUSD ?? 1) * amount)
            }

            if (curr.secondaryCurrency && curr.secondaryAmount) {
                const secondaryCoin = Object.values(Coins).find((c) => c.name === curr.secondaryCurrency)
                if (secondaryCoin) {
                    const secondaryAmount = typeof curr.secondaryAmount === "string" ? parseFloat(curr.secondaryAmount) : curr.secondaryAmount
                    if (curr.usdBase) {
                        acc + secondaryAmount
                    } else {
                        acc += ((secondaryCoin?.priceUSD ?? 1) * secondaryAmount)
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
        <div className={`mb-4 w-full  ${coinList.length > 0 && "border-r border-greylish dark:border-[#454545]  border-opacity-10"} w-full flex flex-col justify-center  pr-5`}>
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