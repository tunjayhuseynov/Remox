import React from "react";
import { SetComma } from "utils";
import { motion } from "framer-motion";
import { AltCoins } from "types";
import { IPrice } from "utils/api";
import { IPriceCoin } from "pages/api/calculation/price.api";
import { IToken } from "../index.page";

const AssetItem = ({ asset }: { asset: IToken }) => {
  return (
    <div className="py-3 h-[6.1rem] bg-white shadow-15 dark:bg-darkSecond mt-5  rounded-md border-opacity-10 hover:bg-greylish hover:bg-opacity-5 hover:transition-all w-full px-3">
      <div className="grid grid-cols-[35%,25%,20%,20%] md:grid-cols-[25%,20%,20%,27%,8%]  xl:grid-cols-[25%,20%,20%,29%,6%] ">
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
        <div className="hidden sm:block font-medium text-lg ">${asset.priceUSD.toLocaleString()}</div>
        <div className="hidden sm:block font-medium text-lg ">{}%</div>
        <div className="font-medium text-lg text-right">${SetComma(asset.priceUSD * asset.amount)}</div>
      </div>
      <div className="grid grid-cols-[95.5%,4.5%] items-center pt-2 pb-8">
        <div className="bg-greylish bg-opacity-10 dark:bg-dark rounded-2xl relative my-3 h-3 ">
          <motion.div
            className="h-full bg-primary rounded-2xl"
            animate={{ x: 0, width: "100%" }}
            transition={{ ease: "easeOut", duration: 2 }}
          ></motion.div>
        </div>
        <div className="text-right font-semibold"> {asset.percent.toLocaleString()}%</div>
      </div>
    </div>
  );
};

export default AssetItem;
