import { IRequest } from "rpcHooks/useRequest";
import { Fragment } from "react";
import { useSelector } from "react-redux";
import { IMember } from 'types/dashboard/contributors';
import _ from 'lodash'
import { useWalletKit } from "hooks";
import { SelectBalance } from "redux/slices/account/selector";
import { GetFiatPrice } from "utils/const";
import { NG } from "utils/jsxstyle";
 
export default function TokenBalance({ coinList }: { coinList: IRequest[] | IMember[] }) {
    const balance = useSelector(SelectBalance)
    const { GetCoins } = useWalletKit()

    const cleanList: (IRequest | IMember)[] = []
    coinList.forEach(item => {
        const coin = Object.values(GetCoins).find((coin) => coin.symbol === item.currency)
        if (item.secondAmount && item.secondCurrency) {
            if(item.fiatSecond) {
                const coin = Object.values(GetCoins).find((coin) => coin.symbol === item.secondCurrency)
                const fiatPrice = GetFiatPrice((coin ?? Object.values(GetCoins)[0]), item.fiatSecond)
                cleanList.push({
                    ...item,
                    amount: (+item.secondAmount / fiatPrice).toString(),
                    currency: item.secondCurrency,
                })
            } else {
                cleanList.push({
                    ...item,
                    amount: item.secondAmount ,
                    currency: item.secondCurrency,
                })
            }
        }

        if(coin) {
            if(item.fiat){
                const fiatPrice = GetFiatPrice((coin ?? Object.values(GetCoins)[0]), item.fiat)
                cleanList.push({
                    ...item,
                    amount: (+item.amount / fiatPrice).toString(),
                    currency: item.currency,
                })
            } else {
                cleanList.push({
                    ...item,
                    amount: item.amount,
                    currency: item.currency
                })
            }

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
                            <div>
                                <NG number={coinBalance?.amount ?? 1}  />
                            </div>
                        </div>

                    </div>
                    <div className="flex  w-full items-center space-x-1 justify-start">
                        <div className="flex justify-between items-center ">
                            <img src={coin?.logoURI} alt="" width={20} height={20} className="rounded-full" />
                        </div>
                        <div className="flex items-start justify-start pr-2 text-lg font-medium">
                            <div>-{coin &&   (+(item.amount))}</div>
                        </div>

                    </div>
                    <div className="w-full flex items-center justify-start space-x-1 pt-5">
                        <div className="flex justify-between items-center  ">
                            <img src={coin?.logoURI} alt="" width={20} height={20} className="rounded-full" />
                        </div>
                        <div className="flex items-start justify-start pr-2 text-lg font-medium" >
                            <div>
                                <NG number={coinBalance!.amount - (+item!.amount)}/>
                            </div>
                        </div>
                    </div>
                </div>
            </Fragment>
        })}
    </>;


}