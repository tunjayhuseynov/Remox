import { useWalletKit } from 'hooks';
import { ISubbudgetORM } from 'pages/api/budget/index.api'
import React, { useMemo } from 'react'
import { ProgressBarWidth } from 'utils'

function SubBudgets({ item }: { item: ISubbudgetORM }) {
  const { GetCoins } = useWalletKit()
  const token = GetCoins[item.budgetCoins.coin]
  const used = item.budgetCoins.totalUsedAmount
  const total = item.budgetCoins.totalAmount
  const progress = useMemo(() => ProgressBarWidth(used * 100 / total), [])

  return <div className=" border-b py-4 w-full flex justify-between items-center">
    <div className="text-greylish w-[15%]">{item.name}</div>
    <div className="text-greylish flex items-start gap-1 text-sm">
      <img src={token.coinUrl} className="w-5 h-5 rounded-full" alt="" /><span className="text-red-600">{used}</span>/  <img src={token.coinUrl} className="w-5 h-5 rounded-full" alt="" /><span className="text-black">{0}</span>  /  <img src="/icons/currencies/celodollar.svg" className="w-5 h-5" alt="" /><span className="text-greylish">{total - used}</span>
    </div>
    <div className=" rounded-xl relative  h-[1rem] flex w-[20%] bg-greylish bg-opacity-40">
      <div className=" h-full bg-primary rounded-l-xl" style={progress}></div>
      <div className="stripe-1 ml-2 object-cover h-full" ></div>
      <div className=" h-full bg-greylish bg-opacity-10 rounded-r-xl"></div>
    </div >
  </div >
}

export default SubBudgets