import { IRequest } from "rpcHooks/useRequest";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { IMember } from 'types/dashboard/contributors';
import { SelectCurrencies, SelectTotalBalance } from "redux/slices/account/selector";
import { AltCoins, Coins } from "types";
import { SetComma } from 'utils'

export const TotalUSDAmount = (coinList: (IRequest | IMember)[], currency: Coins) => {
    return coinList.reduce((acc, curr) => {
        const coin = Object.entries(currency).find(c => c[0] === curr.currency) as [string, AltCoins] | undefined
        if (coin) {
            const amount = typeof curr.amount === "string" ? parseFloat(curr.amount) : curr.amount

            if (curr.usdBase) {
                acc + amount
            } else {
                acc += ((coin[1]?.priceUSD ?? 1) * amount)
            }

            if (curr.secondaryCurrency && curr.secondaryAmount) {
                const secondaryCoin = Object.entries(currency).find(c => c[0] === curr.secondaryCurrency) as [string, AltCoins] | undefined
                if (secondaryCoin) {
                    const secondaryAmount = typeof curr.secondaryAmount === "string" ? parseFloat(curr.secondaryAmount) : curr.secondaryAmount
                    if (curr.usdBase) {
                        acc + secondaryAmount
                    } else {
                        acc += ((secondaryCoin[1]?.priceUSD ?? 1) * secondaryAmount)
                    }
                }
            }
        }
        return acc
    }, 0)
}


// export default function TotalAmount({ coinList }: { coinList: IRequest[] | IMember[] }) {

//     const totalBalance = useSelector(SelectTotalBalance)
//     const currency = useSelector(SelectCurrencies)

//     const totalAmount = useMemo<number>(() => TotalUSDAmount(coinList, currency), [coinList, currency])

//     return <>
//         <div className={`pb-4 ${totalAmount.toFixed(2) !== "0.00" && "border-b"} w-full flex flex-col justify-center items-start space-y-3`}>
//             <div className="flex justify-start   items-center">
//                 <div className="font-bold  text-2xl">${totalBalance?.toFixed(2)} USD</div>
//             </div>
//             {totalAmount.toFixed(2) !== "0.00" &&
//                 <div className="flex justify-end items-center">
//                     <div>-{totalAmount.toFixed(2)} USD</div>
//                 </div>}
//         </div>
//         {totalAmount.toFixed(2) !== "0.00" && <div className="pt-2 ">
//             <div className="flex justify-start items-center">
//                 <div className="font-bold text-2xl">{((totalBalance ?? 0) - totalAmount).toFixed(2)} USD</div>
//             </div>
//         </div>}

//     </>;
// }

export default function TotalAmount({ coinList }: { coinList: IRequest[] | IMember[] }) {

    const totalBalance = useSelector(SelectTotalBalance)
    const currency = useSelector(SelectCurrencies)

    console.log("coinList")
    console.log(coinList);

    const totalAmount = useMemo<number>(() => TotalUSDAmount(coinList, currency), [coinList, currency])

    console.log("totalAmount")
    console.log(totalAmount);

    

    // const totalAmount = useMemo<number>(() => TotalUSDAmount(coinList, currency), [coinList, currency])
    return <>
        <div className={`mb-4 w-full  ${coinList.length > 0 && "border-r border-greylish dark:border-[#454545]  border-opacity-10"} w-full flex flex-col justify-center  pr-5`}>
            <div className="w-full flex justify-start   items-center">
                <div className={`font-semibold   text-xl`}>${SetComma(totalBalance)}</div>
            </div>
            {/* {totalAmount.toFixed(2) !== "0.00" &&
                <div className="w-full flex justify-start items-center text-lg font-semibold">
                    <div>${SetComma(totalAmount)}-</div>
                </div>
            } */}
        </div>
        {/* {totalAmount.toFixed(2) !== "0.00" &&  
            <div className="w-full pt-2  pr-10">
                <div className="w-full flex justify-start items-center">
                    <div className="font-semibold text-xl">${SetComma(((1531070 ?? 0) - totalAmount))}</div>
                </div>
            </div>
        } */}
    </>
}