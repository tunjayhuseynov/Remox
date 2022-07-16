import * as React from 'react';
import { useState } from 'react';
import { useSelector } from "react-redux";
import Loader from "components/Loader";
import { IBalanceItem, SelectBalances, SelectTotalBalance } from "../../../redux/slices/currencies";
import { motion } from 'framer-motion'
import { Fragment, useEffect, useRef } from "react";
import { selectDarkMode } from "redux/slices/notificationSlice";
import { useAppSelector } from '../../../redux/hooks';
import { TokenType } from "types/coins/index";
import AnimatedTabBar from 'components/animatedTabBar';
import { useRouter } from 'next/router';
import { SetComma } from 'utils';
import { SelectSpotBalance, SelectYieldBalance, SelectSpotTotalBalance, SelectYieldTotalBalance } from 'redux/slices/account/remoxData';

export interface INftData {
    totalBalance: number;
    nft: {
        name: string;
        text: string;
        currency: number;
        value: number;
    }[];
}

const Assets = () => {
    const spotTokens = useAppSelector(SelectSpotBalance);
    const yieldTokens = useAppSelector(SelectYieldBalance);
    const spotTotalBalance = useAppSelector(SelectSpotTotalBalance);
    const yieldTotalBalance = useAppSelector(SelectYieldTotalBalance);

    let totalBalance = (spotTotalBalance + yieldTotalBalance).toFixed(2);
    const balanceRedux = useAppSelector(SelectBalances)
    const navigate = useRouter()
    const index = (navigate.query.index as string | undefined) ? + navigate.query.index! : 0



    const TypeCoin = [
        {
            header: "Spot Assets",
            balance: spotTotalBalance.toFixed(2) ,
            tokenTypes: TokenType.YieldToken,
        },
        {
            header: "Yield Bearing Assets",
            balance: yieldTotalBalance.toFixed(2) ,
            tokenTypes: TokenType.YieldToken,
        }

    ]
    const assetType = [
        {
            to: "/dashboard/assets",
            text: "Tokens"
        },
        {
            to: "/dashboard/assets?index=1&secondAnimation=true",
            text: "NFTs"
        }
    ]
    const nftdata:INftData = {
        totalBalance: 3453,
        nft: [
            {
                name: "Bored Rmx #31",
                text: "Bored Ape Yacht Club",
                currency: 71,
                value: 876,
            },
            {
                name: "Bored Rmx #32",
                text: "Bored Ape Yacht Club",
                currency: 42,
                value: 623,
            },
            {
                name: "Bored Rmx #33",
                text: "Bored Ape Yacht Club",
                currency: 37,
                value: 945,
            },
        ]

    }

    return <>
        <div>
            <div className="font-bold text-4xl">Assets</div>
            <div className="w-full h-full  pt-4 ">
                <div className="flex   pt-2  w-[40%] justify-between text-2xl">
                    <AnimatedTabBar data={assetType} index={0} className={'text-2xl'} />
                </div>
                <div className="flex justify-between items-center  py-8 ">
                    <div className="font-bold text-2xl">{index === 0 ? 'Token Balances' : "NFT Balances"}</div>
                    {index === 0 ? <div className="font-bold text-2xl">{(totalBalance && balanceRedux) || (totalBalance !== undefined && parseFloat(totalBalance) === 0 && balanceRedux) ? `$${totalBalance}` : <Loader />}</div> : <div className="font-bold text-2xl">${SetComma(nftdata.totalBalance)}</div>}
                </div>
                {index === 0 ? <div className=" pb-5 ">
                    <div>
                        <div className="flex items-center justify-between py-3">
                            <div className="font-bold text-lg">{TypeCoin[0].header}</div>
                            <div className="font-bold text-lg">${TypeCoin[0].balance}</div>
                        </div>
                        <div id="header" className="grid grid-cols-[35%,25%,20%,20%] md:grid-cols-[25%,20%,20%,30%,5%]  2xl:grid-cols-[25%,20%,20%,31%,4%]  py-4 pl-4">
                            <div className="text-sm font-semibold text-greylish dark:text-white sm:text-xl">Asset</div>
                            <div className="text-sm font-semibold text-greylish dark:text-white sm:text-xl">Balance</div>
                            <div className="hidden font-semibold text-greylish dark:text-white sm:block sm:text-xl">Price</div>
                            <div className="hidden font-semibold text-greylish dark:text-white sm:block sm:text-xl">24h</div>
                            <div className="text-sm font-semibold text-greylish dark:text-white sm:text-xl pl-2">Value</div>
                        </div>
                        {Object.entries(spotTokens!).map((item, index) => {                     
                            if(item[1].amount === 0 ) return <div key={index}></div>
                            return <div key={index}> 
                            <div className="grid grid-cols-[35%,25%,20%,20%] md:grid-cols-[25%,20%,20%,27%,8%]  2xl:grid-cols-[25%,20%,20%,31%,4%] pl-4">
                                <div className="flex space-x-3 items-center">
                                    <div><img src={item[1].coins?.coinUrl} width={20} height={20} alt="" className="rounded-full" /></div>
                                    <div className="font-semibold">{item[1].coins?.name}</div>
                                </div>
                                <div className={`font-semibold `} >
                                    {(item[1].amount || 0).toFixed(2)}
                                </div>
                                <div className="hidden sm:block font-semibold" >
                                    ${(item[1].tokenPrice || 0).toFixed(2)}
                                </div>
                                <div className="hidden sm:block font-semibold" >
                                    {(item[1].per_24 || 0).toFixed(2)}%
                                </div>
                                <div className="font-semibold flex justify-self-end xl:block pr-1 xl:pr-2" >
                                    ${(item[1].amount * item[1].tokenPrice).toFixed(2)}
                                </div>
                            </div>
                                <div className="grid grid-cols-[95%,5%] items-center pt-2 pb-8 pl-4">
                                    <div className="bg-greylish bg-opacity-10 dark:bg-darkSecond rounded-2xl relative my-3 h-[0.5rem] ">
                                    <motion.div className='h-full bg-primary '  animate={{ width: ((item[1].percent || 0) + '%') }} transition={{ ease: "easeOut", duration: 2 }}></motion.div>
                                    </div> 
                                    <div className="ml-2"> {(item[1].percent || 0).toFixed(2)}%</div>
                                </div>
                            </div>
                        })}
                        <div className="flex items-center justify-between py-3">
                            <div className="font-bold text-lg">{TypeCoin[1].header}</div>
                            <div className="font-bold text-lg">${TypeCoin[1].balance}</div>
                        </div>
                        <div id="header" className="grid grid-cols-[35%,25%,20%,20%] md:grid-cols-[25%,20%,20%,30%,5%]  2xl:grid-cols-[25%,20%,20%,31%,4%]  py-4 pl-4">
                            <div className="text-sm font-semibold text-greylish dark:text-white sm:text-xl">Asset</div>
                            <div className="text-sm font-semibold text-greylish dark:text-white sm:text-xl">Balance</div>
                            <div className="hidden font-semibold text-greylish dark:text-white sm:block sm:text-xl">Price</div>
                            <div className="hidden font-semibold text-greylish dark:text-white sm:block sm:text-xl">24h</div>
                            <div className="text-sm font-semibold text-greylish dark:text-white sm:text-xl pl-2">Value</div>
                        </div>
                        {Object.entries(yieldTokens!).map((item, index) => {                     
                            if(item[1].amount === 0 ) return <div key={index}></div>
                            return <div key={index}> 
                            <div className="grid grid-cols-[35%,25%,20%,20%] md:grid-cols-[25%,20%,20%,27%,8%]  2xl:grid-cols-[25%,20%,20%,31%,4%] pl-4">
                                <div className="flex space-x-3 items-center">
                                    <div><img src={item[1].coins?.coinUrl} width={20} height={20} alt="" className="rounded-full" /></div>
                                    <div className="font-semibold">{item[1].coins?.name}</div>
                                </div>
                                <div className={`font-semibold `} >
                                    {(item[1].amount || 0).toFixed(2)}
                                </div>
                                <div className="hidden sm:block font-semibold" >
                                    ${(item[1].tokenPrice || 0).toFixed(2)}
                                </div>
                                <div className="hidden sm:block font-semibold" >
                                    {(item[1].per_24 || 0).toFixed(2)}%
                                </div>
                                <div className="font-semibold flex justify-self-end xl:block pr-1 xl:pr-2" >
                                    ${(item[1].amount * item[1].tokenPrice).toFixed(2)}
                                </div>
                            </div>
                                <div className="grid grid-cols-[95%,5%] items-center pt-2 pb-8 pl-4">
                                    <div className="bg-greylish bg-opacity-10 dark:bg-darkSecond rounded-2xl relative my-3 h-[0.5rem] ">
                                    <motion.div className='h-full bg-primary '  animate={{ width: ((item[1].percent || 0) + '%') }} transition={{ ease: "easeOut", duration: 2 }}></motion.div>
                                    </div> 
                                    <div className="ml-2"> {(item[1].percent || 0).toFixed(2)}%</div>
                                </div>
                            </div>
                        })}
                    </div>
                </div> :

                    <div className="w-full h-full  grid grid-cols-3 gap-20 ">
                        {nftdata.nft.map((i, index) => {
                            return <div key={index} className=" h-full shadow-custom rounded-xl bg-white dark:bg-darkSecond">
                                <div className="w-full   rounded-xl">
                                    <img src="/icons/nftmonkey.png" alt="" className="w-full max-h-[16rem] object-cover rounded-xl" />
                                </div>
                                <div className="flex justify-between items-center py-3 px-2 border-b dark:border-b-greylish">
                                    <div className="flex flex-col items-start justify-center">
                                        <div className="text-xl font-semibold">{i.name}</div>
                                        <div className="text-sm text-greylish">{i.text}</div>
                                    </div>
                                    <div className=" text-xl font-medium flex gap-1">{i.currency} <span><img src="/icons/celoicon.svg" alt="" w-2 h-2 /></span> CELO</div>
                                </div>
                                <div className="flex justify-between items-center  py-4 px-2">
                                    <div className=" text-2xl font-semibold">${i.value}</div>
                                    <div className="flex  items-center gap-3 justify-center">
                                        <div className="text-2xl font-semibold">
                                            <img src="/icons/copyicon.png" alt="" className="w-5 h-5 cursor-pointer" /></div>
                                        <a href=""><img src="/icons/edit.png" className="w-6 h-6 cursor-pointer" alt="" /></a>
                                    </div>
                                </div>
                            </div>
                        })}
                    </div>}
            </div>
        </div>
    </>
}

export default Assets;

