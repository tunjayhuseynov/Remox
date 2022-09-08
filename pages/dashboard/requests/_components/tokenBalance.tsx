import { IRequest } from "rpcHooks/useRequest";
import { Fragment } from "react";
import { useSelector } from "react-redux";
import {  ICurrencyInternal } from "redux/slices/account/reducers/currencies";
import { IMember } from 'types/dashboard/contributors';
import { AltCoins, Coins } from "types";
import _ from 'lodash'
import { generate } from "shortid";
import { useWalletKit } from "hooks";
import { SelectBalance, SelectCurrencies } from "redux/slices/account/selector";
import { IPriceCoin } from "pages/api/calculation/price.api";

export default function TokenBalance({ coinList }: { coinList: IRequest[] | IMember[] }) {

    const currency = useSelector(SelectCurrencies)
    const balance = useSelector(SelectBalance)
    const { GetCoins } = useWalletKit()

    const cleanList: (IRequest | IMember)[] = []
    coinList.forEach(item => {
        cleanList.push(item)
    })

    const list = _(cleanList).groupBy("currency").map((value, key) => {
        const res: IRequest | IMember = {
            ...value[0],
            amount: value.reduce((acc, curr) => {
                if (curr.usdBase) {
                    return acc + (+curr.amount / currency[curr.currency].priceUSD)
                }
                return acc + Number(curr.amount)
            }, 0).toString()
        }
        return res;
    }).value()

    return <>

        {list.map((coin, index) => {
            const selectedCurrency = Object.entries(currency).find(c => c[0] === coin.currency) as [string, ICurrencyInternal] | undefined
            const selectedBalance = Object.entries(balance).find(c => c[0] === coin.currency) as [string, IPriceCoin] | undefined
            const selectedCoin = Object.values(GetCoins).find(c => c.name === coin.currency) as AltCoins | undefined

            if (!selectedCurrency || !selectedCoin || !selectedBalance || !selectedBalance[1]) return <Fragment key={index}></Fragment>
            return <Fragment key={generate()}>
                <div className="flex flex-col items-start justify-center text-center gap-3 mb-2">
                    <div className="flex justify-between items-start">
                        <div className="flex space-x-3 items-center pr-2">
                            <div>{selectedBalance[1].amount.toFixed(2)}</div>
                        </div>
                        <div className="flex justify-between space-x-3">
                            <img src={selectedCoin.coinUrl} alt="" className="w-[1.25rem] h-[1.25rem] rounded-full" />
                            <div className="text-greyish dark:text-white tracking-wide">{selectedCoin?.name}</div>
                        </div>
                    </div>
                    <div className="flex  pb-4 border-b w-full items-start">
                        <div className="flex space-x-3 items-start pr-2">
                            <div>-{(+coin.amount).toFixed(2)}</div>
                        </div>
                        <div className="flex justify-between space-x-3">
                            <img src={selectedCoin.coinUrl} alt="" className="w-[1.25rem] h-[1.25rem] rounded-full" />
                            <div className="text-greyish dark:text-white tracking-wide">{selectedCoin?.name}</div>
                        </div>
                    </div>
                    <div className="flex justify-between items-start">
                        <div className="flex space-x-3 items-center pr-2" >
                            <div>{(selectedBalance[1].amount - (+coin.amount)).toFixed(2)}</div>
                        </div>
                        <div className="flex justify-between space-x-3">
                            <img src={selectedCoin.coinUrl} alt="" className="w-[1.25rem] h-[1.25rem] rounded-full" />
                            <div className="text-greyish dark:text-white tracking-wide">{selectedCoin?.name}</div>
                        </div>
                    </div>
                </div>
            </Fragment>
        })}
    </>;
}
