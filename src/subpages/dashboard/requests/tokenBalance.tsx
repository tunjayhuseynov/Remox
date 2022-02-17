import { IRequest } from "API/useRequest";
import { Fragment } from "react";
import { useSelector } from "react-redux";
import { IBalanceItem, ICurrencyInternal, SelectBalances, SelectCurrencies } from "redux/reducers/currencies";
import { AltCoins, Coins } from "types";
import _ from 'lodash'
import { generate } from "shortid";

export default function TokenBalance({ coinList }: { coinList: IRequest[] }) {

    const currency = useSelector(SelectCurrencies)
    const balance = useSelector(SelectBalances)

    const cleanList: IRequest[] = []

    coinList.forEach(item => {
        cleanList.push(item)
        if (item.secondaryAmount && item.secondaryCurrency) {
            cleanList.push({
                ...item,
                amount: item.secondaryAmount,
                currency: item.secondaryCurrency
            })
        }
    })

    const list = _(cleanList).groupBy("currency").map((value, key) => {
        const res: IRequest = {
            ...value[0],
            amount: value.reduce((acc, curr) => {
                return acc + parseFloat(curr.amount)
            }, 0).toString()
        }
        return res;
    }).value()

    return <div className={`h-full grid ${coinList.length === 0 ? "grid-cols-1" : "grid-cols-2"} gap-5`}>
        {coinList.length === 0 && <div className="self-center text-center w-full">No Selected Request Yet</div>}
        {list.map((coin, index) => {
            const selectedCurrency = Object.entries(currency).find(c => c[0] === coin.currency) as [string, ICurrencyInternal] | undefined
            const selectedBalance = Object.entries(balance).find(c => c[0] === coin.currency) as [string, IBalanceItem] | undefined
            const selectedCoin = Object.values(Coins).find(c => c.name === coin.currency) as AltCoins | undefined

            if (!selectedCurrency || !selectedCoin || !selectedBalance || !selectedBalance[1]) return <Fragment key={index}></Fragment>
            return <Fragment key={generate()}>
                <div className="h-full shadow-custom p-5 rounded-xl w-full flex flex-col space-y-3">
                    <div className="flex justify-between">
                        <div className="flex space-x-3 items-center">
                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                            <div>{selectedBalance[1].amount.toFixed(2)}</div>
                        </div>
                        <div className="flex justify-between space-x-3">
                            <img src={selectedCoin.coinUrl} alt="" className="w-[20px] h-[20px] rounded-full" />
                            <div className="text-greyish dark:text-white tracking-wide">{selectedCoin?.name}</div>
                        </div>
                    </div>
                    <div className="flex justify-between pb-4 border-b border-greylish">
                        <div className="flex space-x-3 items-center">
                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                            <div>-{parseFloat(coin.amount).toFixed(2)}</div>
                        </div>
                        <div className="flex justify-between space-x-3">
                            <img src={selectedCoin.coinUrl} alt="" className="w-[20px] h-[20px] rounded-full" />
                            <div className="text-greyish dark:text-white tracking-wide">{selectedCoin?.name}</div>
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <div className="flex space-x-3 items-center">
                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                            <div>{(selectedBalance[1].amount - parseFloat(coin.amount)).toFixed(2)}</div>
                        </div>
                        <div className="flex justify-between space-x-3">
                            <img src={selectedCoin.coinUrl} alt="" className="w-[20px] h-[20px] rounded-full" />
                            <div className="text-greyish dark:text-white tracking-wide">{selectedCoin?.name}</div>
                        </div>
                    </div>
                </div>
            </Fragment>
        })}
    </div>;
}
