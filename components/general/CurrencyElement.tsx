import { FiatMoneyList } from 'firebaseConfig'
import React from 'react'
import { AltCoins } from 'types'
import { NG } from 'utils/jsxstyle'
import { fiatList } from './PriceInputField'

const CurrencyElement = ({fiat, coin, amount} : {fiat: FiatMoneyList | null, coin: AltCoins, amount: string | number}) => {
    const fiatDetails = fiatList.find((f) => f.name === fiat )

  return (
    <div className="flex items-center">
        <div className="flex items-center mr-2">
          {
            fiat ? (
              <div className="relative">
                <img src={fiatDetails?.logo} alt="" className="rounded-xl w-6 h-6 relative" />
                <img src={coin.logoURI} alt="" className="rounded-xl w-4 h-4 absolute right-[-6.3px] bottom-[-4.5px]" />
              </div>
              ) : <img src={coin.logoURI} className="rounded-xl w-6 h-6" alt="Currency Logo" />
          }
        </div>
        <div className="flex items-center">
            <NG number={+amount} />
        </div>
    </div>
  )
}

export default CurrencyElement

