import Dropdown from "components/general/dropdown";
import { AltCoins, Coins } from 'types'
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useModalSideExit, useWalletKit } from 'hooks';
import Button from "components/button";
import useSwap from "hooks/walletSDK/useSwap";
import { motion, AnimatePresence } from "framer-motion"
import Loader from "components/Loader";
import { useAppSelector } from "redux/hooks";
import { SelectBalance, SelectDarkMode, SelectSelectedAccountAndBudget } from "redux/slices/account/selector";
import { ToastRun } from "utils/toast";
import useLoading from "hooks/useLoading";

const Swap = () => {
    const { SendTransaction, GetCoins, blockchain } = useWalletKit()
    const { MinmumAmountOut, isLoading } = useSwap()
    const isDark = useAppSelector(SelectDarkMode)
    const selectedBudgetAndAccount = useAppSelector(SelectSelectedAccountAndBudget)
    const balances = useAppSelector(SelectBalance)
    const [token1, setToken1] = useState<AltCoins>(Object.values(GetCoins)[0])
    const [token1Amount, setToken1Amount] = useState<number>()
    const [token2, setToken2] = useState<AltCoins>(Object.values(GetCoins)[1])


    const token1Input = useRef<HTMLInputElement>(null)

    const [appAmount, setAppAmount] = useState<string>("0")
    const [fee, setFee] = useState<string>("")
    const [oneCoinPrice, setOneCoinPrice] = useState<string>("")
    const [isSetting, setSetting] = useState<boolean>(false)


    const [slippageArr, setSlippageArr] = useState([
        { value: 1, label: '0,1%', selected: false },
        { value: 5, label: '0,5%', selected: true },
        { value: 10, label: '1%', selected: false },
        { value: 0, label: '0%', selected: false, invisible: true }
    ])

    const [deadline, setDeadline] = useState<number>(1.5)

    const account = selectedBudgetAndAccount.account

    const [settingRef, exceptRef] = useModalSideExit<boolean>(isSetting, setSetting, false)

    const change = useCallback(async (value?: number) => {
        if (token1!.symbol && token2!.symbol) {
            try {
                const data = await MinmumAmountOut(
                    GetCoins[token1!.symbol],
                    GetCoins[token2!.symbol],
                    (value || (token1Amount ?? 0)).toString(),
                    slippageArr.find(item => item.selected)!.value.toString(),
                    Math.floor(deadline * 60)
                )
                setAppAmount(data!.minimumAmountOut)
                setFee(data!.feeAmount)
                setOneCoinPrice(data!.oneTokenValue)
            } catch (error) {
                console.error(error)
            }

        }
    }, [token1, token2, token1Amount, slippageArr, deadline])

    // const startSwap = async () => {
    //     if (token1!.name && token2!.name && token1Amount && token1Amount > 0 && account) {
    //         try {
    //             const data = await SendTransaction(account, [], {
    //                 swap: {
    //                     account: account.address,
    //                     inputCoin: GetCoins[token1!.name as keyof Coins],
    //                     outputCoin: GetCoins[token2!.name as keyof Coins],
    //                     amount: token1Amount.toString(),
    //                     slippage: slippageArr.find(item => item.selected)!.value.toString(),
    //                     deadline: Math.floor(deadline * 60)
    //                 }
    //             })

    //             ToastRun(
    //                 <div className="flex flex-col items-center space-y-1">
    //                     <div className="font-semobold text-xl">Successfully Swapped</div>
    //                     {/* <div className="text-primary text-sm font-semibold cursor-pointer" onClick={() => window.open(`https://explorer.celo.org/tx/${data.hash}/token-transfers`, '_blank')} > View on Celo Explorer</div> */}
    //                 </div>
    //             )

    //             setOpen(false)
    //         } catch (error) {
    //             const message = (error as any).message || "Something went wrong"
    //             console.error(message)
    //             // dispatch(changeError({ activate: true }))
    //             ToastRun(<div>{message}</div>)
    //         }
    //     }
    // }

    // const [isSwappingLoading, swapping] = useLoading(startSwap)

    useEffect(() => {
        if (token1 && token2) {
            change()
        }
    }, [token1, token2, token1Amount, slippageArr])



    const changeSwap = () => {
        const token1_copy = { ...token1! }
        const token2_copy = { ...token2! }
        const token2_amount = parseFloat(parseFloat(appAmount).toFixed(2))
        setToken1(token2_copy)
        setToken2(token1_copy)

        setToken1Amount(token2_amount)
        if (token1Input.current) {
            token1Input.current.value = token2_amount.toString();
        }
    }

    if (!token1 || !token2) return <></>
    return <>
        <div className="flex justify-start">
            <div className="text-2xl font-semibold ">Swap</div>
        </div>
        <div className="flex flex-col items-center justify-center pt-12">
            <div className="flex flex-col w-[50%]">
                <div className="shadow-custom rounded-xl bg-white dark:bg-darkSecond pt-3 pb-10 px-3 flex flex-col space-y-1">
                    <div className="flex justify-end    ">
                        <div className="relative py-3">
                            <div ref={exceptRef}>
                                <img src="/icons/settings.svg" className="cursor-pointer dark:invert dark:brightness-0" onClick={() => setSetting(!isSetting)} />
                            </div>
                            <AnimatePresence>
                                {isSetting && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} ref={settingRef} className="absolute z-[300] shadow-custom bg-white dark:bg-darkSecond rounded-xl min-w-[15.625rem] left-0 translate-x-[-90%] bottom-0 translate-y-full p-3 text-sm">
                                    <div className="flex flex-col space-y-4">
                                        <div className="font-bold text-xl">Transaction Settings</div>
                                        <div className="flex flex-col space-y-3">
                                            <div className="text-xl">Slippage tolerance</div>
                                            <div className="flex space-x-1 px-2">
                                                {slippageArr.filter(s => !s.invisible).map((item, index) => <div key={index} onClick={() => {
                                                    const arr = [...slippageArr]
                                                    arr.forEach(i => i.selected = false)
                                                    arr[index].selected = true
                                                    setSlippageArr(arr)
                                                }} className={`${item.selected ? "bg-primary bg-opacity-100 text-white" : ""} px-4 py-2 bg-greylish bg-opacity-10 cursor-pointer rounded-xl`}>{item.label}</div>)}
                                                <div className="bg-greylish bg-opacity-10 rounded-xl flex items-center pl-3 pr-5 space-x-1">
                                                    <input placeholder="0.5" type="number" value={((slippageArr[slippageArr.length - 1]!.value / 10) || undefined)} className="outline-none text-right bg-transparent max-w-[3.125rem] unvisibleArrow" min={0} step={"any"} max={100} onChange={(event) => {
                                                        const value = (event.target as HTMLInputElement).value
                                                        if (parseFloat(value) >= 0) {
                                                            setSlippageArr(slippageArr.map((item, index) => {
                                                                if (index === slippageArr.length - 1) {
                                                                    item.selected = true
                                                                    item.value = Math.max(0, Math.min(100, parseFloat(value)))
                                                                } else item.selected = false
                                                                return item
                                                            }))
                                                        } else if (!value || value === "0") {
                                                            setSlippageArr(slippageArr.map((item, index) => {
                                                                if (index === slippageArr.length - 1) {
                                                                    item.selected = false
                                                                    item.value = 0
                                                                } else if (index == 1) { item.selected = true } else item.selected = false
                                                                return item
                                                            }))
                                                        }
                                                    }} />
                                                    <span>%</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col space-y-3">
                                            <div className="text-xl">Transaction deadline</div>
                                            <div className="flex space-x-1 px-2 items-center">
                                                <input type="number" value={deadline === 1.5 ? undefined : deadline} onChange={(event) => {
                                                    const value = (event.target as HTMLInputElement).value
                                                    if (value) {
                                                        setDeadline(parseFloat(value))
                                                    } else setDeadline(1.5)
                                                }} className="bg-greylish bg-opacity-10 rounded-xl py-1 w-[6.25rem] outline-none px-2 text-right unvisibleArrow" placeholder="1.5" />
                                                <div>minutes</div>
                                            </div>
                                        </div>

                                    </div>
                                </motion.div>}
                            </AnimatePresence>
                        </div>
                    </div>
                    <div className={`${isDark ? "bg-[rgb(36,36,36)]" : "bg-[#F5F5F5]"}  min-h-[6.25rem] items-center flex justify-between rounded-xl py-3 px-4`}>
                        <div className="flex flex-col space-y-2 w-[9rem]">
                            <div>
                                <Dropdown
                                    runFn={val => () => {
                                        if (val.name === token2.name) {
                                            setToken2(token1)
                                        }
                                    }}
                                    sx={{ '.MuiSelect-select': { paddingTop: '5px', paddingBottom: '5px', maxHeight: '32px' }, '.MuiOutlinedInput-notchedOutline': { border: 0 } }}
                                    className={`${isDark ? "bg-[#1C1C1C] bg-opacity-50 " :  "bg-[#F9F9F9]"}   text-sm !rounded-xl !border-none w-52`}
                                    setSelect={setToken1 as any}
                                    selected={token1 as any}
                                    displaySelector={"symbol"}
                                    list={Object.values(GetCoins)}
                                />
                            </div>
                            <div>
                                <input ref={token1Input} onChange={async (e) => { 
                                    setToken1Amount(parseFloat((e.target.value))); 
                                    await change(parseFloat((e.target.value))); 
                                }} 
                                type="number" 
                                className=" text-[22px] bg-transparent outline-none unvisibleArrow ml-4 max-w-[8.125rem]" 
                                placeholder="0" min="0" step="any" />
                            </div>
                        </div>
                        <div className="flex flex-col space-y-7 items-end ">
                            <div className="text-lg">
                                Balance: {token1 && token1.name && balances[token1.symbol] ? (balances[token1.symbol]?.amount.toFixed(2) ?? 0) : 0}
                            </div>
                            <div className="flex space-x-2">
                                <button className={`${isDark ? "bg-[#1C1C1C] bg-opacity-50" : "bg-[#F9F9F9]"} px-3 py-1 rounded-lg text-xs`} onClick={
                                    () => {
                                        if (balances && token1 && balances[token1.symbol] && balances[token1.symbol]!.amount > 0) {
                                            const amount = balances[token1.symbol]!.amount * 0.5
                                            token1Input.current!.value = amount.toFixed(2)
                                            setToken1Amount(amount)
                                        }
                                    }
                                }>
                                    50%
                                </button>
                                <button className={` ${isDark ? "bg-[#1C1C1C] bg-opacity-50" : "bg-[#F9F9F9]"} px-3 py-1 rounded-lg text-xs`} onClick={() => {
                                    if (balances && token1 && balances[token1.symbol] && balances[token1.symbol]!.amount > 0) {
                                        const amount = balances[token1.symbol]!.amount
                                        token1Input.current!.value = amount.toFixed(2)
                                        setToken1Amount(amount)
                                    }
                                }}>
                                    MAX
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center">
                        <div className={` ${isDark ? "bg-[rgb(36,36,36)]" : "bg-[#F9F9F9]"}  my-2 py-1 px-1 rounded-lg cursor-pointer `} onClick={changeSwap}>
                            <div className={` ${isDark ? "" : "bg-[#f5F5F5]"} py-1 px-3`}>
                                <img src="/icons/arrowdown.svg" className="dark:invert dark:brightness-0" alt="" />
                            </div>
                        </div>
                    </div>
                    <div className={`${isDark ? "bg-[rgb(36,36,36)]" : "bg-[#F5F5F5]"}  min-h-[6.25rem]  flex justify-between rounded-xl py-3 px-4`}>
                        <div className="flex flex-col space-y-2 w-[9rem]">
                            <div>
                                <Dropdown
                                    runFn={val => () => {
                                        if (val.name === token1.name) {
                                            setToken1(token2)
                                        }
                                    }}
                                    setSelect={setToken2 as any}
                                    sx={{ '.MuiSelect-select': { paddingTop: '5px', paddingBottom: '5px', maxHeight: '32px' }, '.MuiOutlinedInput-notchedOutline': { border: 0 } }}
                                    className={`${isDark ? "bg-[#1C1C1C] bg-opacity-50" :  "bg-[#F9F9F9]"}  text-sm !rounded-xl !border-none w-52`}
                                    selected={token2 as any}
                                    list={Object.values(GetCoins)}
                                />
                            </div>
                            <div>
                                {!(!token1Amount) && (!isLoading ?
                                    <>
                                        <div className="text-[22px] bg-transparent outline-none unvisibleArrow ml-4 max-w-[8.125rem]">
                                            {parseFloat(appAmount).toFixed(2)}
                                        </div>
                                    </> : <div className="text-center"><Loader /></div>)
                                }
                            </div>
                        </div>
                        <div className="flex justify-end h-full">
                            <div className="text-right text-lg outline-none unvisibleArrow">
                                Balance: {token2 && token2.name && balances[token2.symbol] ? (balances[token2.symbol]?.amount.toFixed(2) ?? 0) : 0}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="px-3 py-3 font-extralight text-sm">
                    <div className="flex justify-between">
                        <div>Rate:</div>
                        <div className="flex">1 {token1.name} = {!isLoading ? parseFloat(oneCoinPrice).toFixed(2) : <div className="px-3"><Loader /></div>} {token2.name}</div>
                    </div>
                    <div className="flex justify-between">
                        <div>Fee:</div>
                        <div className="flex">{!isLoading ? fee : <div className="px-3"><Loader /> </div>} </div>
                    </div>
                </div>
                <div className="text-center ">
                    <Button className="w-[97%] text-[20px] !rounded-2xl" 
                    // isLoading={isLoading || isSwappingLoading}
                    >
                        Swap
                    </Button>
                </div>
                <div className="flex justify-center items-center mt-6 space-x-2">
                    <p className="text-base text-[#707070] ">Powered by</p>
                    {blockchain.name.includes("evm") ? isDark ? <img src="/icons/swap/1inch_color_white.png" className="w-20" alt="1inch"/> : <img src="/icons/swap/1inch_bw_black.png" className="w-20" alt="1inch"/>  : blockchain.name === "celo" ? 
                    <div className="flex space-x-2 items-center">
                        <img src="/icons/swap/ubseSwapLogo.png" className="w-5 h-5" alt="ubeswap" />
                        <p>Ubeswap</p>
                    </div> : <div className="flex space-x-2 items-center">
                        <img src="/icons/swap/jupiter-logo (1) 1.png" className="w-5 h-5" alt="hence" /> 
                        <p>Jupiter</p>
                    </div>
                    } 
                </div>
            </div> 
        </div>
    </>
}

export default Swap;