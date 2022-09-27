import Copied from "components/copied";
import { useWalletKit } from "hooks";
import React, { useState } from "react";
import { RiFileCopyLine } from "react-icons/ri";
import { useAppSelector } from "redux/hooks";
import { SelectFiatPreference, SelectFiatSymbol } from "redux/slices/account/remoxData";
import { GetFiatPrice } from "utils/const";
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
    <div className="h-full w-full shadow-custom rounded-xl bg-white dark:bg-darkSecond ">
      <div className="rounded-xl">
          <img src={nft.imageAddress} alt="" className="w-full h-full rounded-xl" />
      </div>
      <div className="flex justify-between items-center py-3 px-2 border-b dark:border-b-greylish text-base">
          <div className="flex flex-col items-start justify-center">
              <div className="font-semibold">{nft.text}</div>
              <div className="text-sm text-greylish">{nft.name}</div>
          </div>
          <div className="text-base font-medium flex items-center gap-1">{nft.value} <img src={coin?.logoURI} className="rounded-[50%] h-3/5 w-5" alt="" /> </div>
      </div>
      <div className="flex justify-between items-center  py-4 px-2">
          <div className="text-base font-semibold">{fiatSymbol}{(+nft.value * fiatPrice).toFixed(3)}</div>
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
