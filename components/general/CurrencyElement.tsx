import { FiatMoneyList } from 'firebaseConfig'
import React from 'react'
import { AltCoins } from 'types'
import { GetFiatSymbol } from 'utils/const'
import { NG } from 'utils/jsxstyle'
import { fiatList } from './PriceInputField'

interface IProps {
  fiat?: FiatMoneyList | null,
  coin: AltCoins,
  amount: string | number,
  size?: number,
  disableFiat?: boolean,
  imgSize?: number,
  ether?: boolean,
  afterPrice?: boolean
}

const CurrencyElement = ({ fiat, coin, amount, size, afterPrice, disableFiat, ether, imgSize = 1.25 }: IProps) => {
  const fiatDetails = fiatList.find((f) => f.name === fiat)
  let fiatImg = fiatDetails?.logo;
  let symbol = null;
  if (fiat) {
    symbol = GetFiatSymbol(fiat)
  }
  return (
    <div className="flex flex-col">
      <div className="grid gap-x-[4px]" style={{
        gridTemplateColumns: `${imgSize}rem 1fr`
      }}>
        <div style={{
          width: `${imgSize}rem`,
          height: `${imgSize}rem`,
        }}>
          {coin?.logoURI || fiatImg ? <img
            src={fiatImg ?? coin.logoURI}
            width="100%"
            height="100%"
            className="rounded-full object-cover aspect-square"
          /> : <div className="w-full h-full rounded-full bg-gray-500" />}
        </div>
        <span className="text-left leading-none self-center gap-x-[7px] flex">
          <div className="text-sm font-medium"><NG number={+amount} fontSize={0.875} /> </div>
          {/* <span className="text-greylish font-medium text-sm">{afterPrice ? `(${symbol}${price.toFixed(2)})` : ""}</span> */}
        </span>
      </div>
      {!disableFiat && <div className="grid grid-cols-[1.25rem,1fr] gap-x-[4px]">
        <div></div>
        <div className="text-xxs font-medium text-gray-500 leading-none dark:text-gray-200 flex items-center space-x-[2px]">
          <div>
            {fiatImg ? <img
              src={coin.logoURI}
              className="rounded-full w-[0.75rem] h-[0.75rem]"
            /> : `${symbol}`}
          </div>
          <div>
            <NG fontSize={0.625} decimalSize={80} number={fiatImg ? ((+amount).toFixed(0).length > 18 ? 0 : +amount) : ((+amount).toFixed(0).length > 18 ? 0 : +(+amount).toFixed(2))} />
          </div>
        </div>
      </div>}
    </div>
  )
}

export default CurrencyElement

