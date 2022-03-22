import { useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";
import { generate } from "shortid";
import { IBalanceItem, SelectBalances } from "../../../redux/reducers/currencies";
import { motion, useAnimation } from 'framer-motion'
import { Fragment, useEffect, useRef } from "react";
import { selectDarkMode } from "redux/reducers/notificationSlice";


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

    useEffect(() => {
        prevBalance.current = selectBalance
    }, [selectBalance])

    return <>
        <div>
            {/* <div className="font-semibold text-xl">Assets</div> */}
            <div className="w-full sm:px-5 /pt-4 pb-6 ">
                <div id="header" className="grid grid-cols-[35%,25%,20%,20%] sm:grid-cols-[25%,15%,15%,20%,12.5%,12.5%] sm:px-8 pb-5 /py-5" >
                    <div className="text-sm sm:text-base">Assets</div>
                    <div className="text-sm sm:text-base">Balance</div>
                    <div className="text-sm sm:text-base">Amount</div>
                    <div className="hidden sm:block">USD Price</div>
                    <div className="hidden sm:block">24h</div>
                    <div className="text-sm sm:text-base">% Assets</div>
                </div>
                <div className="pb-5 px-2 sm:px-8 shadow-custom rounded-xl bg-white dark:bg-darkSecond">
                    {Object.entries(selectBalance).map(([key, item]: [string, IBalanceItem | undefined], index) => {
                        if (!item && index == 0) return <div key={index} className="flex justify-center py-1"> <ClipLoader /></div>
                        if (!item) return <Fragment key={index}></Fragment>

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

                        return <div key={generate()} className="grid grid-cols-[35%,25%,20%,20%] sm:grid-cols-[25%,15%,15%,20%,12.5%,12.5%] border-b border-black py-5" >
                            <div className="flex space-x-3 items-center">
                                <div><img src={item?.coins?.coinUrl} width={30} height={30} alt="" /></div>
                                <div>{item?.coins?.name} </div>
                            </div>
                            <motion.div animate={price === 0 && amount === 0 ? `${darkMode ? "white" : "black"}` : price === 0 ? amount > 0 ? `${darkMode ? "greenDark" : "green"}` : `${darkMode ? "redDark" : "red"}` : price > 0 ? `${darkMode ? "greenDark" : "green"}` : `${darkMode ? "redDark" : "red"}`}>
                                $ {(item.amount * item.tokenPrice).toFixed(2)}
                            </motion.div>
                            <motion.div animate={amount === 0 ? `${darkMode ? "white" : "black"}` : amount > 0 ? `${darkMode ? "greenDark" : "green"}` : `${darkMode ? "redDark" : "red"}`}>
                                {(item.amount || 0).toFixed(2)}
                            </motion.div>
                            <motion.div variants={variants} className="hidden sm:block" animate={price === 0 ? `${darkMode ? "white" : "black"}` : price > 0 ? `${darkMode ? "greenDark" : "green"}` : `${darkMode ? "redDark" : "red"}`}>
                                $ {(item.tokenPrice || 0).toFixed(2)}
                            </motion.div>
                            <motion.div variants={variants} className="hidden sm:block" animate={per24 === 0 ? `${darkMode ? "white" : "black"}` : per24 > 0 ? `${darkMode ? "greenDark" : "green"}` : `${darkMode ? "redDark" : "red"}`}>
                                % {(item.per_24 || 0).toFixed(2)}
                            </motion.div>
                            <motion.div animate={percent === 0 ? `${darkMode ? "white" : "black"}` : percent > 0 ? `${darkMode ? "greenDark" : "green"}` : `${darkMode ? "redDark" : "red"}`}>
                                % {(item.percent || 0).toFixed(2)}
                            </motion.div>
                        </div>
                    })}
                </div>
            </div>
        </div>
    </>
}

export default Assets;