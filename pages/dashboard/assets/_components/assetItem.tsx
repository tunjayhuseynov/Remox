import { motion } from "framer-motion";
import { useAppSelector } from "redux/hooks";
import { SelectTotalBalance, SelectPriceCalculationFn, SelectFiatSymbol, SelectFiatPreference } from "redux/slices/account/selector";
import { IPrice } from "utils/api";
import { useMemo } from "react";
import { GetFiatPrice } from "utils/const";
import { NG } from "utils/jsxstyle";

const AssetItem = ({ asset }: { asset: IPrice[0] }) => {
  const calculatePrice = useAppSelector(SelectPriceCalculationFn)
  const totalBalance = useAppSelector(SelectTotalBalance)
  const fiatSymbol = useAppSelector(SelectFiatSymbol)
  const fiat = useAppSelector(SelectFiatPreference)
  const fiatPrice = GetFiatPrice(asset, fiat)
  console.log(asset, fiatPrice)
  const percent = useMemo(() => {
    return totalBalance > 0 ? (calculatePrice(asset) / totalBalance) * 100 : 0
  }, [totalBalance])

  return (
    <div className="py-3 h-[6.1rem] bg-white shadow-15 dark:bg-darkSecond mt-3  rounded-md border-opacity-10 hover:bg-greylish hover:bg-opacity-5 hover:transition-all w-full px-3">
      <div className="grid grid-cols-[25%,35%,15%,25%] pb-2 pt-2">
        <div className="flex space-x-2 items-center">
          <div>
            <img
              src={asset.logoURI}
              width={20}
              height={20}
              alt=""
              className="rounded-full"
            />
          </div>
          <div className="font-medium text-sm ">{asset.symbol}</div>
        </div>
        <div className="font-medium text-sm"><NG number={asset.amount} fontSize={0.875} decimalSize={80}/></div>
        <div className="font-medium text-sm">{fiatSymbol}<NG number={fiatPrice} fontSize={0.875} decimalSize={80}/></div>
        <div className="font-medium text-sm text-right">{fiatSymbol}<NG number={calculatePrice(asset)} fontSize={0.875} decimalSize={80} /></div>
      </div>
      <div className="grid grid-cols-[95%,5%] gap-2  items-center pt-2 pr-2">
        <div className="bg-greylish bg-opacity-10 dark:bg-dark rounded-2xl  h-3 ">
          <motion.div
            className="h-full bg-primary rounded-2xl"
            animate={{ x: 0, width: `${percent}%` }}
            transition={{ ease: "easeOut", duration: 2 }}
          ></motion.div>
        </div>
        <div className="text-right font-medium text-xs"> {percent.toFixed(1)}%</div>
      </div>
    </div>
  );
};

export default AssetItem;
