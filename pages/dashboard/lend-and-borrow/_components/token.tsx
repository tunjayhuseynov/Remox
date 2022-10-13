import { useWalletKit } from 'hooks'
import React, { useState } from 'react'
import { useAppSelector } from 'redux/hooks'
import { SelectFiatPreference, SelectFiatSymbol } from 'redux/slices/account/selector'
import { LendingReserveData } from 'rpcHooks/useLending'
import { GetFiatPrice } from 'utils/const'
import { NG } from 'utils/jsxstyle'

const TokenItem = ({asset}: {asset: LendingReserveData}) => {
    const [detailModal, setDetailModal] = useState<boolean>(false)  
    const {GetCoins} = useWalletKit()
    const fiat = useAppSelector(SelectFiatPreference)
    const fiatSymbol = useAppSelector(SelectFiatSymbol)
    const coin = Object.values(GetCoins).find((coin) => coin.address.toLowerCase() === asset.coinReserveConfig.Address.toLowerCase());

    const totalSupply = Math.round(+asset.totalStableDebt + +asset.totalVariableDebt + +asset.rawAvailableLiquidity)

    const totalBorrow = Math.round(+asset.totalStableDebt + +asset.totalVariableDebt)
    const totalBorrowPrice = GetFiatPrice(coin ?? Object.values(GetCoins)[0] , fiat) * totalBorrow

    const stableBorrowAPY = Math.pow(1+(+asset.stableBorrowRate/12),12) - 1
    const variableBorrowAPY = Math.pow(1+(+asset.variableBorrowRate/12),12) - 1

    console.log("totalSupply: " + totalSupply)
    console.log("stableBorrowAPY: " + stableBorrowAPY)
    console.log("variableBorrowAPY: " + variableBorrowAPY)
    console.log(coin?.symbol)
    console.log(asset)
    

    return (
    <>
        <div onClick={() => { setDetailModal(true) }} className={`grid grid-cols-[16.66%,16.66%,16.66%,16.66%,16.66%,16.66%] items-center py-3 h-[6.1rem] bg-white shadow-15 dark:bg-darkSecond my-4 rounded-md border-opacity-10 hover:bg-greylish dark:hover:!bg-[#191919]   hover:bg-opacity-5 hover:transition-all cursor-pointer `}>
            <div className="flex items-center gap-2 pl-3">
                <img src={coin?.logoURI} className='w-7 h-7 rounded-full' alt="" />
                <div className="text-sm font-medium h-6">{coin?.symbol}</div>
            </div>
            <div className="text-sm font-medium">
                {asset.coinReserveConfig.LoanToValue}
            </div>

            <div className="flex flex-col ">
                <div className="text-lg font-medium text-right">
                    {/* {asset.} {coin?.name} */}
                </div>
                <div className="text-sm text-greylish font-medium text-right">
                    {/* ${item.totalSupply.usdValue} */}
                </div>
            </div>
            <div className="text-lg font-medium text-right">
                {/* {item.supplyApy}% */}
            </div>
            <div className="flex flex-col justify-center items-start">
                <span>
                    <NG number={totalBorrow} fontSize={0.875} decimalSize={80} /> {coin?.symbol}
                </span>
                <span className='text-xs text-greylish font-medium flex justify-end items-end '>
                    {fiatSymbol}<NG number={totalBorrowPrice} fontSize={0.75} decimalSize={80} />
                </span>
            </div>
            <div className="text-lg font-medium text-right">
                {/* {item.borrowApy}% */}
            </div>
        </div>
    </>
  )
}

export default TokenItem