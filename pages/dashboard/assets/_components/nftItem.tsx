import React from "react";
import { INFT } from "../index.page";

const nftItem = ({nft}: {nft: INFT}) => {

  return (
    <div className="h-full w-full shadow-custom rounded-xl bg-white dark:bg-darkSecond">
      <div className="max-w-[34.5rem] rounded-xl">
          <img src={nft.imageAddress} alt="" className="w-full h-full rounded-xl" />
      </div>
      <div className="flex justify-between items-center py-3 px-2 border-b dark:border-b-greylish">
          <div className="flex flex-col items-start justify-center">
              <div className="text-xl font-semibold">{nft.text}</div>
              <div className="text-sm text-greylish">{nft.name}</div>
          </div>
          <div className=" text-xl font-medium flex gap-1">{} <span><img src="/icons/celoicon.svg" alt="" w-2 h-2 /></span></div>
      </div>
      {/* <div className="flex justify-between items-center  py-4 px-2">
          <div className=" text-2xl font-semibold"></div>
          <div className="flex  items-center gap-3 justify-center">
              <div className="text-2xl font-semibold">
                  <img src="/icons/copyicon.png" alt="" className="w-5 h-5 cursor-pointer" /></div>
              <a href=""><img src="/icons/edit.png" className="w-6 h-6 cursor-pointer" alt="" /></a>
          </div>
      </div> */}
    </div>
  );
};

export default nftItem;
