import { useWalletKit } from 'hooks'
import React, { useState } from 'react'
import { useAppSelector } from 'redux/hooks'
import { SelectFiatPreference, SelectFiatSymbol } from 'redux/slices/account/selector'
import { LendingReserveData } from 'rpcHooks/useLending'
import { GetFiatPrice } from 'utils/const'
import { NG } from 'utils/jsxstyle'
import BigNumber from 'bignumber.js'

const TokenItem = ({asset, isVariable, isAPY}: {asset: LendingReserveData, isVariable: boolean, isAPY: boolean }) => {
    // const [detailModal, setDetailModal] = useState<boolean>(false)  
    const {GetCoins} = useWalletKit()
    const fiat = useAppSelector(SelectFiatPreference)
    const fiatSymbol = useAppSelector(SelectFiatSymbol)
    const coin = Object.values(GetCoins()).find((coin) => coin.address.toLowerCase() === asset.coinReserveConfig.Address.toLowerCase());

    const fiatPrice = GetFiatPrice(coin ?? Object.values(GetCoins())[0] , fiat)


    // BORROW
    const variableBorrowAPR = new BigNumber(asset.variableBorrowRate).div(new BigNumber(10).pow(25)).toString()
    const stableBorrowAPR = new BigNumber(asset.stableBorrowRate).div(new BigNumber(10).pow(25)).toString()
    const variableBorrowAPY = (new BigNumber((new BigNumber(1).plus(new BigNumber(+variableBorrowAPR/100).div(new BigNumber(12))).pow(new BigNumber(12))).minus(new BigNumber(1)))).multipliedBy(new BigNumber(100)).toString()
    const stableBorrowAPY = (new BigNumber((new BigNumber(1).plus(new BigNumber(+stableBorrowAPR/100).div(new BigNumber(12))).pow(new BigNumber(12))).minus(new BigNumber(1)))).multipliedBy(new BigNumber(100)).toString()
    const totalBorrow = new BigNumber(asset.totalStableDebt).plus(asset.totalVariableDebt).toString()
    const totalBorrowPrice = new BigNumber(fiatPrice).multipliedBy(totalBorrow)

    // SUPPLY
    const totalSupply = (new BigNumber(asset.totalStableDebt).plus(new BigNumber(asset.totalVariableDebt)).plus(new BigNumber(asset.rawAvailableLiquidity).div(new BigNumber(10).pow(new BigNumber(18))))).toString()
    const totalSupplyPrice = new BigNumber(totalSupply).multipliedBy(new BigNumber(fiatPrice))
    
    const utilizationRatio = new BigNumber(totalBorrow).div(new BigNumber(totalSupply)).toString()
    const shareOfStableDebt = new BigNumber(asset.totalStableDebt).div((new BigNumber(asset.totalStableDebt).plus(new BigNumber(asset.totalVariableDebt)))).toString()
    const shareOfVariableDebt = new BigNumber(asset.totalVariableDebt).div((new BigNumber(asset.totalStableDebt).plus(new BigNumber(asset.totalVariableDebt)))).toString()
    
    
    const stableBorrows = (new BigNumber(shareOfStableDebt).multipliedBy(new BigNumber(asset.averageStableBorrowRate).div(new BigNumber(100)))).toString()
    const variableBorrows = (new BigNumber(shareOfVariableDebt).multipliedBy(new BigNumber(asset.variableBorrowRate).div(new BigNumber(10).pow(25)).div(new BigNumber(100)))).toString()
    const reserveFactorRatio = (new BigNumber(1).minus(new BigNumber(asset.coinReserveConfig.ReserveFactor).div(new BigNumber(100)))).toString()

    const variableSupplyAPY = new BigNumber(utilizationRatio).multipliedBy(new BigNumber(stableBorrows).plus(new BigNumber(variableBorrows))).multipliedBy(reserveFactorRatio).multipliedBy(new BigNumber(100)).toString()
    const variableSupplyAPR = ((Math.pow((+variableSupplyAPY+1),1/12))-1)*12*10

    // console.log(`Variable Borrow APR: ${variableBorrowAPR}%`)
    // console.log(`Variable Borrow APY: ${variableBorrowAPY}%`)
    // console.log(`Stable Borrow APR: ${stableBorrowAPR}%`)
    // console.log(`Stable Borrow APY: ${stableBorrowAPY}%`)
    // console.log(`Total Borrow: ${totalBorrow}`)


    console.log(coin?.symbol)


    

    return (
    <>
        <tr  className={`grid grid-cols-[16.66%,16.66%,16.66%,16.66%,18.66%,14.66%] items-center py-3 h-[6.1rem] bg-white shadow-15 dark:bg-darkSecond my-4 rounded-md border-opacity-10 hover:bg-greylish dark:hover:!bg-[#191919]   hover:bg-opacity-5 hover:transition-all cursor-pointer `}>
            <td className="flex items-center gap-2 pl-3">
                <img src={coin?.logoURI} className='w-7 h-7 rounded-full' alt="" />
                <div className="text-sm font-medium h-6">{coin?.symbol}</div>
            </td>
            <td className="text-sm font-medium">
                {asset.coinReserveConfig.LoanToValue}
            </td>

            <td className="flex flex-col justify-center items-start">
                <span>
                    <NG number={+totalSupply} fontSize={0.875} decimalSize={80} />
                </span>
                <span className='text-xs text-greylish font-medium flex justify-end items-end '>
                    {fiatSymbol}<NG number={+totalSupplyPrice} fontSize={0.75} decimalSize={80} />
                </span>
            </td>
            <td className={`text-sm font-medium `}>
                {(isVariable ? isAPY ? `${(+variableSupplyAPY).toFixed(1)}%` : `${(+variableSupplyAPR).toFixed(1)}%` : '=')}
            </td>
            <td className="flex flex-col justify-center items-start">
                <span>
                    <NG number={+totalBorrow} fontSize={0.875} decimalSize={80} />
                </span>
                <span className='text-xs text-greylish font-medium flex justify-end items-end '>
                    {fiatSymbol}<NG number={+totalBorrowPrice} fontSize={0.75} decimalSize={80} />
                </span>
            </td>
            <td className="text-sm font-medium">
                {(isVariable ? isAPY ? +variableBorrowAPY : +variableBorrowAPR : isAPY ? +stableBorrowAPY : +stableBorrowAPR).toFixed(1)}%
            </td>
        </tr>
    </>
  )
}

export default TokenItem