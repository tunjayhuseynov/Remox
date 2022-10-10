import { useWalletKit } from 'hooks'
import React, { useState } from 'react'
import { LendingReserveData } from 'rpcHooks/useLending'

const TokenItem = ({asset}: {asset: LendingReserveData}) => {
    const [detailModal, setDetailModal] = useState<boolean>(false)  
    const {GetCoins} = useWalletKit()

    console.log(asset.coinReserveConfig.Address)

    const coin = Object.values(GetCoins).find((coin) => coin.address.toLowerCase() === asset.coinReserveConfig.Address.toLowerCase());

    console.log(coin)

    return (
    <>
        <div onClick={() => { setDetailModal(true) }} className={`grid grid-cols-[20%,15%,15%,15%,15%,20%]  items-center py-3 h-[6.1rem] bg-white shadow-15 dark:bg-darkSecond my-4 rounded-md border-opacity-10 hover:bg-greylish dark:hover:!bg-[#191919]   hover:bg-opacity-5 hover:transition-all cursor-pointer `}>
            <div className="flex items-center gap-2 pl-3">
                <img src={coin?.logoURI} className='w-9 h-9 rounded-full' alt="" />
                <div className="text-lg font-medium h-6">{coin?.symbol}</div>
            </div>
            <div className="text-lg font-medium w-16 text-right">
                {asset.coinReserveConfig.LoanToValue}
            </div>

            <div className="flex flex-col ">
                <div className="text-lg font-medium w-28 text-right">
                    {/* {asset.} {coin?.name} */}
                </div>
                <div className="text-sm text-greylish font-medium  w-28 text-right">
                    {/* ${item.totalSupply.usdValue} */}
                </div>
            </div>
            <div className="text-lg font-medium w-28 text-right">
                {/* {item.supplyApy}% */}
            </div>
            <div className="flex flex-col ">
                <div className="text-lg font-medium w-28 text-right">
                    {/* {item.totalBorrow.value} {item.totalBorrow.name} */}
                </div>
                <div className="text-sm text-greylish font-medium w-28 text-right">
                    {/* ${item.totalBorrow.usdValue} */}
                </div>
            </div>
            <div className="text-lg font-medium w-28 text-right">
                {/* {item.borrowApy}% */}
            </div>
        </div>
    </>
  )
}

export default TokenItem