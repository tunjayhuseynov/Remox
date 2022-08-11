import { IRequest } from "rpcHooks/useRequest";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { ICoinMembers, ICurrencyInternal, SelectCurrencies, SelectTotalBalance } from "redux/slices/currencies";
import { IMember } from 'types/dashboard/contributors';

export const TotalUSDAmount = (coinList: (IRequest | IMember)[], currency: ICoinMembers) => {
    return coinList.reduce((acc, curr) => {
        const coin = Object.entries(currency).find(c => c[0] === curr.currency) as [string, ICurrencyInternal] | undefined
        if (coin) {
            const amount = typeof curr.amount === "string" ? parseFloat(curr.amount) : curr.amount

            if (curr.usdBase) {
                acc + amount
            } else {
                acc += ((coin[1]?.price ?? 1) * amount)
            }

            if (curr.secondaryCurrency && curr.secondaryAmount) {
                const secondaryCoin = Object.entries(currency).find(c => c[0] === curr.secondaryCurrency) as [string, ICurrencyInternal] | undefined
                if (secondaryCoin) {
                    const secondaryAmount = typeof curr.secondaryAmount === "string" ? parseFloat(curr.secondaryAmount) : curr.secondaryAmount
                    if (curr.usdBase) {
                        acc + secondaryAmount
                    } else {
                        acc += ((secondaryCoin[1]?.price ?? 1) * secondaryAmount)
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

    const totalAmount = useMemo<number>(() => TotalUSDAmount(coinList, currency), [coinList, currency])

    return <>
        <div className={`pb-4 ${totalAmount.toFixed(2) !== "0.00" && "border-b"} w-full flex flex-col justify-center items-start space-y-3`}>
            <div className="flex justify-start   items-center">
                <div className="font-bold  text-2xl">${totalBalance?.toFixed(2)} USD</div>
            </div>
            {totalAmount.toFixed(2) !== "0.00" &&
                <div className="flex justify-end items-center">
                    <div>-{totalAmount.toFixed(2)} USD</div>
                </div>}
        </div>
        {totalAmount.toFixed(2) !== "0.00" && <div className="pt-2 ">
            <div className="flex justify-start items-center">
                <div className="font-bold text-2xl">{((totalBalance ?? 0) - totalAmount).toFixed(2)} USD</div>
            </div>
        </div>}

    </>;
}
