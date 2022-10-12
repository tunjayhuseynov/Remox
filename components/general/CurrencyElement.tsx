import { FiatMoneyList } from 'firebaseConfig'
import React from 'react'
import { AltCoins } from 'types'
import { NG } from 'utils/jsxstyle'
import { fiatList } from './PriceInputField'

const CurrencyElement = ({fiat, coin, amount, size} : {fiat: FiatMoneyList | null, coin: AltCoins, amount: string | number, size?: number}) => {
    const fiatDetails = fiatList.find((f) => f.name === fiat )

  return (
    <div className="flex items-center">
        <div className="flex items-center mr-3">
          {
            fiat ? (
              <div className="relative">
                <img src={fiatDetails?.logo} alt="" className="rounded-full w-5 h-5 relative object-cover" />
                <img src={coin.logoURI} alt="" className="rounded-full w-3 h-3 absolute right-[-6.3px] bottom-[-4.5px] object-cover" />
              </div>
              ) : <img src={coin.logoURI} className="rounded-full w-5 h-5 object-cover" alt="Currency Logo" />
          }
        </div>
        <div className='font-medium text-sm'>
            <NG number={+amount} decimalSize={70} fontSize={size ?? 0.875} />
        </div>
    </div>
  )
}

export default CurrencyElement

