import Copied from "components/copied";
import { useWalletKit } from "hooks";
import React, { useState } from "react";
import { RiFileCopyLine } from "react-icons/ri";
import { useAppSelector } from "redux/hooks";
import { SelectFiatPreference, SelectFiatSymbol } from "redux/slices/account/remoxData";
import { GetFiatPrice } from "utils/const";
import { NG } from "utils/jsxstyle";
import { INFT } from "../index.page";

const nftItem = ({nft}: {nft: INFT}) => {
  const {GetCoins} = useWalletKit();
  const [tooltip, setTooltip] = useState(false)
  const [divRef, setDivRef] = useState<HTMLDivElement | null>(null)
  const fiat = useAppSelector(SelectFiatPreference)
  const fiatSymbol = useAppSelector(SelectFiatSymbol)

  const coin = Object.values(GetCoins).find((coin) => coin.symbol === "CELO") 
  const fiatPrice = GetFiatPrice(coin ?? Object.values(GetCoins)[0], fiat)


  return (
    <div className="h-full w-full shadow-custom rounded-md bg-white dark:bg-darkSecond ">
      <div className="rounded-t-md">
          <img src={nft.imageAddress} alt="" className="w-full h-full rounded-t-md" />
      </div>
      <div className="flex justify-between items-center py-3 px-3 border-b dark:border-b-greylish text-base">
          <div className="flex flex-col items-start justify-center">
              <div className="font-semibold text-base">{nft.text}</div>
              <div className="text-xs font-semibold text-greylish">{nft.name}</div>
          </div>
          <div className="text-base font-medium flex items-center"><div><NG number={+nft.value} decimalSize={80} /></div><img src={coin?.logoURI} className="rounded-[50%] h-3/5 w-5 ml-2" alt="" /> </div>
      </div>
      <div className="flex justify-between items-center  py-4 px-3">
          <div className="text-base font-semibold">{fiatSymbol}<NG number={+nft.value * fiatPrice} decimalSize={80} /></div>
          <div className="flex  items-center gap-3 justify-center">
              <div className="text-2xl font-semibold" ref={setDivRef}>
                <RiFileCopyLine className="cursor-pointer" onClick={() => {
                  navigator.clipboard.writeText(nft.contractAddress)
                  setTooltip(true)
                  setTimeout(() => {
                      setTooltip(false)
                  }, 300)
                  }}/>
              </div>
          </div>
      </div>
      <Copied tooltip={tooltip} triggerRef={divRef} />
    </div>
  );
};

export default nftItem;
