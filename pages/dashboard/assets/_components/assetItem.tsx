import { SetComma } from "utils";
import { motion } from "framer-motion";
import { useAppSelector } from "redux/hooks";
import { SelectTotalBalance, SelectPriceCalculationFn, SelectFiatSymbol, SelectFiatPreference } from "redux/slices/account/selector";
import { IPrice } from "utils/api";
import { useMemo } from "react";
import { GetFiatPrice } from "utils/const";

const AssetItem = ({ asset }: { asset: IPrice[0] }) => {
  const calculatePrice = useAppSelector(SelectPriceCalculationFn)
  const totalBalance = useAppSelector(SelectTotalBalance)
  const fiatSymbol = useAppSelector(SelectFiatSymbol)
  const fiat = useAppSelector(SelectFiatPreference)
  const fiatPrice = GetFiatPrice(asset, fiat)

  const percent = useMemo(() => {
    return totalBalance > 0 ? (calculatePrice(asset) / totalBalance) * 100 : 0
  }, [totalBalance])

  return (
    <div className="py-3 h-[6.1rem] bg-white shadow-15 dark:bg-darkSecond mt-3  rounded-md border-opacity-10 hover:bg-greylish hover:bg-opacity-5 hover:transition-all w-full px-3">
      <div className="grid grid-cols-[25%,35%,15%,25%] ">
        <div className="flex space-x-3 items-center">
          <div>
            <img
              src={asset.logoURI}
              width={20}
              height={20}
              alt=""
              className="rounded-full"
            />
          </div>
          <div className="font-medium text-lg ">{asset.name}</div>
        </div>
        <div className={`font-medium text-lg `}>{asset.amount.toLocaleString()}</div>
        <div className="hidden sm:block font-medium text-lg ">{fiatSymbol}{fiatPrice.toLocaleString()}</div>
        <div className="font-medium text-lg text-right">{fiatSymbol}{SetComma(calculatePrice(asset))}</div>
      </div>
      <div className="grid grid-cols-[94%,6%] gap-2  items-center pt-2 pb-8 pr-2">
        <div className="bg-greylish bg-opacity-10 dark:bg-dark rounded-2xl  h-3 ">
          <motion.div
            className="h-full bg-primary rounded-2xl"
            animate={{ x: 0, width: `${percent}%` }}
            transition={{ ease: "easeOut", duration: 2 }}
          ></motion.div>
        </div>
        <div className="text-right font-semibold"> {percent.toLocaleString()}%</div>
      </div>
    </div>
  );
};

export default AssetItem;
