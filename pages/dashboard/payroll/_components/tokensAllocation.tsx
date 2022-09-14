
import useWalletKit from "hooks/walletSDK/useWalletKit";
import React from "react";
import _ from 'lodash'
import { useAppSelector } from "redux/hooks";
import { SelectBalance } from "redux/slices/account/remoxData";
import { IMember } from "types/dashboard/contributors";



const TokensAllocation = ({ itemsList }: { itemsList: IMember[]  }) => {
    const balance = useAppSelector(SelectBalance)
    const { GetCoins } = useWalletKit()

    const cleanList: (IMember)[] = []
    itemsList.forEach(item => {
        if (item.secondaryAmount && item.secondaryCurrency) {
            cleanList.push({
                ...item,
                amount: item.secondaryAmount ?? "0",
                currency: item.secondaryCurrency,
            })
        } else {
            cleanList.push(item)
        }
    })


    const list = _(cleanList).groupBy("currency").map((value, key) => {
        const res:  IMember = {
            ...value[0],
            amount: value.reduce((acc, curr) => {
                return acc + parseFloat(curr.amount)
            }, 0).toString()
        }
        return res;
    }).value()



  return (
    <>
    {list.map((item, index) => {
        
        <div className="flex flex-col items-start  h-fit">
          <div className="font-semibold text-2xl flex gap-2 items-center">
            <img
              src={`/icons/currencies/celo.png`}
              width="24"
              height="24"
              className=" rounded-full"
              alt=""
            />
            <div className="font-semibold text-xl">{item.amount}</div>
          </div>
          <div></div>
          <div className="font-medium text-sm  text-greylish  text-left pl-10">
            $26,000
          </div>
        </div>
    })}
    </>
  );
};

export default TokensAllocation;
