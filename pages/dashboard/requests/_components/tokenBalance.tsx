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
import { SetComma } from "utils";

export default function TokenBalance({ coinList }: { coinList: IRequest[] | IMember[] }) {
    const balance = useSelector(SelectBalance)
    const { GetCoins } = useWalletKit()

    const cleanList: (IRequest | IMember)[] = []
    coinList.forEach(item => {
        if (item.secondaryAmount && item.secondaryCurrency) {
            cleanList.push({
                ...item,
                amount: item.secondaryAmount,
                currency: item.secondaryCurrency,
            })
        } else {
            cleanList.push(item)
        }
    })


    const list = _(cleanList).groupBy("currency").map((value, key) => {
        const res: IRequest | IMember = {
            ...value[0],
            amount: value.reduce((acc, curr) => {
                return acc + parseFloat(curr.amount)
            }, 0).toString()
        }
        return res;
    }).value()



    return <>
        {list.map((item, index) => {
            const coin = Object.values(GetCoins).find((c) => c.symbol === item.currency)
            const coinBalance = Object.values(balance).find((b) => b.symbol === item.currency)
            return <Fragment key={item.id}>
                <div className="flex flex-col items-start justify-center text-center gap-2 mb-2 w-[12.5rem]">
                    <div className="w-full flex items-center justify-start space-x-1">
                        <div className="flex justify-between items-center ">
                            <img src={coin?.logoURI} alt="" width={20} height={20} className=" rounded-full" />
                        </div>
                        <div className="flex items-start justify-start pr-2 text-lg font-medium">
                            <div>{SetComma(coinBalance?.amount)}</div>
                        </div>

                    </div>
                    <div className="flex  w-full items-center space-x-1 justify-start">
                        <div className="flex justify-between items-center ">
                            <img src={coin?.logoURI} alt="" width={20} height={20} className="rounded-full" />
                        </div>
                        <div className="flex items-start justify-start pr-2 text-lg font-medium">
                            <div>-{coin && SetComma(+(item.amount))}</div>
                        </div>

                    </div>
                    <div className="w-full flex items-center justify-start space-x-1 pt-5">
                        <div className="flex justify-between items-center  ">
                            <img src={coin?.logoURI} alt="" width={20} height={20} className="rounded-full" />
                        </div>
                        <div className="flex items-start justify-start pr-2 text-lg font-medium" >
                            <div>{SetComma(coinBalance!.amount - (+item!.amount))}</div>
                        </div>

                    </div>
                </div>
            </Fragment>
        })}
    </>;


}