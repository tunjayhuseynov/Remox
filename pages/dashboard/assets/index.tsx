import * as React from 'react';
import { useState } from 'react';
import { useSelector } from "react-redux";
import Loader from "components/Loader";
import { IBalanceItem, SelectBalances, SelectTotalBalance } from "../../../redux/reducers/currencies";
import { motion } from 'framer-motion'
import { Fragment, useEffect, useRef } from "react";
import { selectDarkMode } from "redux/reducers/notificationSlice";
import { useAppSelector } from '../../../redux/hooks';
import { TokenType } from "types/coins/index";
import AnimatedTabBar from 'components/animatedTabBar';

const variants = {
    black: {
        color: "#000000",
        transition: {
            duration: 1,
        }
    },
    white: {
        color: "#FFFFFF",
        transition: {
            duration: 1,
        }
    },
    red: {
        color: ["#000000", "#ed0037", "#000000"],
        transition: {
            duration: 2,
            times: [0, 0.2, 1]
        }
    },
    redDark: {
        color: ["#FFFFFF", "#ed0037", "#FFFFFF"],
        transition: {
            duration: 2,
            times: [0, 0.2, 1]
        }
    },
    green: {
        color: ["#000000", "#00e55f", "#000000"],
        transition: {
            duration: 2,
            times: [0, 0.2, 1]
        }
    },
    greenDark: {
        color: ["#FFFFFF", "#00e55f", "#FFFFFF"],
        transition: {
            duration: 2,
            times: [0, 0.2, 1]
        }
    }
}

const Assets = () => {
    const selectBalance = useSelector(SelectBalances)
    const prevBalance = useRef(selectBalance)
    const darkMode = useSelector(selectDarkMode)
    const [style, setStyle] = useState({});
    const [text, setText] = useState('Tokens')

    let totalBalance = useAppSelector(SelectTotalBalance)
    let balance;
    if (totalBalance !== undefined) balance = parseFloat(`${totalBalance}`).toFixed(2)
    const balanceRedux = useAppSelector(SelectBalances)


    const CoinType = () => {

    }

    const TypeCoin = [
        {
            header: "Spot Assets",
            tokenTypes: TokenType.YieldToken,
        },
        {
            header: "Yield Bearing Assets",
            tokenTypes: TokenType.YieldToken,
        }

    ]
    const paymentdata = [
        {
            to: "",
            text: "Tokens"
        },
        {
            to: "",
            text: "NFTs"
        }
    ]
    const nftdata = [
        {
            name: "Bored Rmx #31",
            currency: 71,
            value:876,
        },
        {
            name: "Bored Rmx #32",
            currency: 42,
            value:623,
        },
        {
            name: "Bored Rmx #33",
            currency: 37,
            value:945,
        },
        
    ]

    return <>
        <div className="">
            <div className="font-bold text-3xl">Assets</div>
            <div className="w-full h-full  pt-4 ">
                <div className="flex   pt-2  w-[40%] justify-between text-2xl">
                    <AnimatedTabBar data={paymentdata} setText={setText} />
                </div>
                <div className="flex justify-end gap-20  py-8">
                    <div className="font-bold text-2xl">{text === "Tokens" ? 'Token Balances' : "NFT Balances"}</div>
                    {text === "Tokens" ? <div className="font-bold text-2xl">{(balance && balanceRedux) || (balance !== undefined && parseFloat(balance) === 0 && balanceRedux) ? `$${balance}` : <Loader />}</div> : <div className="font-bold text-2xl">$143.2</div>}
                </div>
                {text === "Tokens" ? <div className=" pb-5 px-2 sm:px-8 shadow-custom rounded-xl bg-white dark:bg-darkSecond">
                    {TypeCoin.map((i, index) => {
                        return <div key={index}> <div className="font-bold text-2xl py-5 !ml-[-0.5rem]">{i.header}</div>
                            <div id="header" className="grid grid-cols-[35%,25%,20%,20%] md:grid-cols-[25%,20%,20%,30%,5%]  2xl:grid-cols-[25%,20%,20%,31%,4%]  py-4">
                                <div className="text-sm font-semibold text-greylish dark:text-white sm:text-xl">Asset</div>
                                <div className="text-sm font-semibold text-greylish dark:text-white sm:text-xl">Balance</div>
                                <div className="hidden font-semibold text-greylish dark:text-white sm:block sm:text-xl">Price</div>
                                <div className="hidden font-semibold text-greylish dark:text-white sm:block sm:text-xl">24h</div>
                                <div className="text-sm font-semibold text-greylish dark:text-white sm:text-xl pl-2">Value</div>
                            </div>
                            {Object.entries(selectBalance).map(([key, item]: [string, IBalanceItem | undefined], index) => {
                                if (!item && index == 0) return <div key={index} className="flex justify-center py-1"> <Loader /></div>
                                if (!item || (i.header === "Spot Assets" ? item.coins.type === i.tokenTypes : item.coins.type !== i.tokenTypes)) return <Fragment key={index}></Fragment>


                                let price = 0;
                                let per24 = 0;
                                let amount = 0;
                                let percent = 0;

                                const prevCoin = prevBalance.current[key as keyof typeof selectBalance]
                                if (prevCoin) {
                                    per24 = prevCoin.per_24 !== item.per_24 ? prevCoin.per_24 < item.per_24 ? 1 : -1 : 0;
                                    price = prevCoin.tokenPrice !== item.tokenPrice ? prevCoin.tokenPrice < item.tokenPrice ? 1 : -1 : 0;
                                    amount = prevCoin.amount !== item.amount ? prevCoin.amount < item.amount ? 1 : -1 : 0;
                                    percent = prevCoin.percent !== item.percent ? prevCoin.percent < item.percent ? 1 : -1 : 0;
                                }

                                setTimeout(() => {
                                    const newStyle = {
                                        width: `${(item.percent || 0).toFixed(2)}%`
                                    }

                                    setStyle(newStyle);
                                }, 200);

                                return <> <div key={index} className="grid grid-cols-[35%,25%,20%,20%] md:grid-cols-[25%,20%,20%,27%,8%]  2xl:grid-cols-[25%,20%,20%,31%,4%]">
                                    <div className="flex space-x-3 items-center">
                                        <div><img src={item?.coins?.coinUrl} width={20} height={20} alt="" /></div>
                                        <div>{item?.coins?.name}</div>
                                    </div>
                                    <motion.div variants={variants} animate={amount === 0 ? `${darkMode ? "white" : "black"}` : amount > 0 ? `${darkMode ? "greenDark" : "green"}` : `${darkMode ? "redDark" : "red"}`}>
                                        {(item.amount || 0).toFixed(2)}
                                    </motion.div>
                                    <motion.div variants={variants} className="hidden sm:block" animate={price === 0 ? `${darkMode ? "white" : "black"}` : price > 0 ? `${darkMode ? "greenDark" : "green"}` : `${darkMode ? "redDark" : "red"}`}>
                                        $ {(item.tokenPrice || 0).toFixed(2)}
                                    </motion.div>
                                    <motion.div variants={variants} className="hidden sm:block" animate={per24 === 0 ? `${darkMode ? "white" : "black"}` : per24 > 0 ? `${darkMode ? "greenDark" : "green"}` : `${darkMode ? "redDark" : "red"}`}>
                                        % {(item.per_24 || 0).toFixed(2)}
                                    </motion.div>
                                    <motion.div animate={price === 0 && amount === 0 ? `${darkMode ? "white" : "black"}` : price === 0 ? amount > 0 ? `${darkMode ? "greenDark" : "green"}` : `${darkMode ? "redDark" : "red"}` : price > 0 ? `${darkMode ? "greenDark" : "green"}` : `${darkMode ? "redDark" : "red"}`} className=" flex justify-self-end xl:block pr-1 xl:pr-2" >
                                        $ {(item.amount * item.tokenPrice).toFixed(2)}
                                    </motion.div>
                                    {/* <motion.div animate={percent === 0 ? `${darkMode ? "white" : "black"}` : percent > 0 ? `${darkMode ? "greenDark" : "green"}` : `${darkMode ? "redDark" : "red"}`}>
                                    % {(item.percent || 0).toFixed(2)}
                                </motion.div> */}
                                </div>
                                    <div className="grid grid-cols-[95%,5%] items-center pt-2 pb-8">
                                        <div className="bg-light dark:bg-dark rounded-2xl relative my-3 h-[0.5rem] ">
                                            <div className={`bg-primary rounded-2xl h-full `} style={{ width: (item.percent || 0).toFixed(2) + "%" }}></div>
                                        </div>
                                        <div className="ml-2"> {(item.percent || 0).toFixed(2)}%</div>
                                    </div>
                                </>
                            })}
                        </div>
                    })}
                </div> : 
                
                <div className="w-full h-full  grid grid-cols-3 gap-20 ">
                    {nftdata.map((i, index) => {
                        return <div key={index} className=" h-full shadow-custom rounded-xl bg-white dark:bg-darkSecond">
                        <div className="w-full   rounded-xl">
                            <img src="/icons/nftmonkey.png" alt="" className="w-full max-h-[16rem] object-cover rounded-xl" />
                        </div>
                        <div className="flex justify-between items-center py-3 px-2 border-b dark:border-b-greylish">
                            <div className="flex flex-col items-start justify-center">
                                <div className="text-xl font-semibold">{i.name}</div>
                                <div className="text-sm text-greylish">Bored Ape Yacht Club</div>
                            </div>
                            <div className=" text-xl font-medium flex gap-1">{i.currency} <span><img src="/icons/celoicon.svg" alt="" w-2 h-2 /></span> CELO</div>
                        </div>
                        <div className="flex justify-between items-center  py-4 px-2">
                        <div className=" text-2xl font-semibold">${i.value}</div>
                            <div className="flex  items-center gap-3 justify-center">
                                <div className="text-2xl font-semibold">
                                    <img src="/icons/copyicon.png" alt="" className="w-5 h-5 cursor-pointer"/></div>
                                <a href=""><img src="/icons/edit.png" className="w-6 h-6 cursor-pointer"  alt="" /></a>
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