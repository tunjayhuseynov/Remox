import { IRequest } from "apiHooks/useRequest";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { ICoinMembers, ICurrencyInternal, SelectCurrencies, SelectTotalBalance } from "redux/reducers/currencies";

export const TotalUSDAmount = (coinList: IRequest[], currency: ICoinMembers) => {
    return coinList.reduce((acc, curr) => {
        const coin = Object.entries(currency).find(c => c[0] === curr.currency) as [string, ICurrencyInternal] | undefined
        if (coin) {
            const amount = parseFloat(curr.amount)
            acc += ((coin[1]?.price ?? 1) * amount)
            if (curr.secondaryCurrency && curr.secondaryAmount) {
                const secondaryCoin = Object.entries(currency).find(c => c[0] === curr.secondaryCurrency) as [string, ICurrencyInternal] | undefined
                if (secondaryCoin) {
                    const secondaryAmount = parseFloat(curr.secondaryAmount)
                    acc += ((secondaryCoin[1]?.price ?? 1) * secondaryAmount)
                }
            }
        }
        return acc
    }, 0)
}


export default function TotalAmount({ coinList }: { coinList: IRequest[] }) {

    const totalBalance = useSelector(SelectTotalBalance)
    const currency = useSelector(SelectCurrencies)

    const totalAmount = useMemo<number>(() => TotalUSDAmount(coinList, currency), [coinList, currency])

    return <div className="shadow-custom p-5 rounded-xl">
        <div className="pb-4 border-b border-greylish space-y-3 pl-4">
            <div className="flex justify-between items-center">
                <div className="text-greylish dark:text-white tracking-wide">Total Balance</div>
                <div className="flex space-x-3 items-center">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    <div>{totalBalance?.toFixed(2)} USD</div>
                </div>
            </div>
            <div className="flex justify-between items-center">
                <div className="text-greylish dark:text-white tracking-wide">Pending payout</div>
                <div className="flex space-x-3 items-center">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    <div>-{totalAmount.toFixed(2)} USD</div>
                </div>
            </div>
        </div>
        <div className="pt-3 pl-4">
            <div className="flex justify-between">
                <div className="text-greylish dark:text-white tracking-wide">Total Remaining Balance</div>
                <div className="flex space-x-3">
                    <div>{((totalBalance ?? 0) - totalAmount).toFixed(2)} USD</div>
                </div>
            </div>
        </div>
    </div>;
}
