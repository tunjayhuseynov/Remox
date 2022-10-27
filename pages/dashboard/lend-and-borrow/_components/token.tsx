import { useWalletKit } from 'hooks'
import React, { useState } from 'react'
import { useAppSelector } from 'redux/hooks'
import { SelectFiatPreference, SelectFiatSymbol } from 'redux/slices/account/selector'
import { LendingReserveData } from 'rpcHooks/useLending'
import { GetFiatPrice } from 'utils/const'
import { NG } from 'utils/jsxstyle'

const TokenItem = ({asset, isVariable, isAPY}: {asset: LendingReserveData, isVariable: boolean, isAPY: boolean }) => {
    const [detailModal, setDetailModal] = useState<boolean>(false)  
    const {GetCoins} = useWalletKit()
    const fiat = useAppSelector(SelectFiatPreference)
    const fiatSymbol = useAppSelector(SelectFiatSymbol)
    const coin = Object.values(GetCoins).find((coin) => coin.address.toLowerCase() === asset.coinReserveConfig.Address.toLowerCase());

    const fiatPrice = GetFiatPrice(coin ?? Object.values(GetCoins)[0] , fiat)

    // BORROW
    const variableBorrowAPR = Math.round(+asset.variableBorrowRate / 10**25)
    const stableBorrowAPR = Math.round(+asset.stableBorrowRate / 10**25)
    const variableBorrowAPY = Math.round(((1+variableBorrowAPR/12)**12) - 1)
    const stableBorrowAPY = Math.round(((1+stableBorrowAPR/12)**12) - 1)
    const totalBorrow = Math.round(+asset.totalStableDebt + +asset.totalVariableDebt)
    const totalBorrowPrice = fiatPrice * totalBorrow

    // SUPPLY
    const totalSupply = Math.round(+asset.totalStableDebt + +asset.totalVariableDebt + (+asset.rawAvailableLiquidity/10**18))
    const totalSupplyPrice = fiatPrice * totalSupply

    


    console.log(`Variable Borrow APR: ${variableBorrowAPR}%`)
    console.log(`Variable Borrow APY: ${variableBorrowAPY}%`)
    console.log(`Stable Borrow APR: ${stableBorrowAPR}%`)
    console.log(`Stable Borrow APY: ${stableBorrowAPY}%`)
    console.log(`Total Borrow: ${totalBorrow}`)
    console.log(coin?.symbol)



    

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

            <div className="flex flex-col justify-center items-start">
                <span>
                    <NG number={totalSupply} fontSize={0.875} decimalSize={80} /> {coin?.symbol}
                </span>
                <span className='text-xs text-greylish font-medium flex justify-end items-end '>
                    {fiatSymbol}<NG number={totalSupplyPrice} fontSize={0.75} decimalSize={80} />
                </span>
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