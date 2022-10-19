import Dropdown from "components/general/dropdown";
import { AltCoins } from 'types'
import { useCallback, useEffect, useRef, useState } from "react";
import { useModalSideExit, useWalletKit } from 'hooks';
import Button from "components/button";
import useSwap from "hooks/walletSDK/useSwap";
import { AnimatePresence, motion } from 'framer-motion';
import Loader from "components/Loader";
import { useAppSelector } from "redux/hooks";
import { SelectBalance, SelectDarkMode, SelectSelectedAccountAndBudget } from "redux/slices/account/selector";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ClickAwayListener, FormControl, InputAdornment, TextField } from "@mui/material";
import { BiSearch } from "react-icons/bi";
import { ToastRun } from "utils/toast";
import useLoading from "hooks/useLoading";
import Modal from "components/general/modal";
import ChooseBudget from "components/general/chooseBudget";
import { IAccountORM } from "pages/api/account/index.api";
import { IBudgetORM, ISubbudgetORM } from "pages/api/budget/index.api";


const Swap = () => {
    const { SendTransaction, GetCoins, blockchain } = useWalletKit()
    const { MinmumAmountOut, isLoading } = useSwap()
    const isDark = useAppSelector(SelectDarkMode)
    const balances = useAppSelector(SelectBalance)
    const [token1, setToken1] = useState<AltCoins>(Object.values(GetCoins)[0])
    const [token1Amount, setToken1Amount] = useState<number>()
    const [token2, setToken2] = useState<AltCoins>(Object.values(GetCoins)[1])


    const [dropdown, setDropdown] = useState<boolean>(false)
    const [dropdown2, setDropdown2] = useState<boolean>(false)
    const [coinsList, setCoinsList] = useState<AltCoins[]>(Object.values(GetCoins))

    const token1Input = useRef<HTMLInputElement>(null)

    const [appAmount, setAppAmount] = useState<string>("0")
    const [fee, setFee] = useState<string>("")
    const [oneCoinPrice, setOneCoinPrice] = useState<string>("")
    const [isSetting, setSetting] = useState<boolean>(false)

    const [choosingBudget, setChoosingBudget] = useState<boolean>(false)

    const [slippageArr, setSlippageArr] = useState([
        { value: 1, label: '0,1%', selected: false },
        { value: 5, label: '0,5%', selected: true },
        { value: 10, label: '1%', selected: false },
        { value: 0, label: '0%', selected: false, invisible: true }
    ])

    const [deadline, setDeadline] = useState<number>(1.5)

    const searching = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.trim() === "") {
            setCoinsList(Object.values(GetCoins))
        } else {
            const filteredCoins = Object.values(GetCoins).filter((coin) => coin.name.toLowerCase().includes(e.target.value.toLowerCase()) || coin.symbol.toLowerCase().includes(e.target.value.toLowerCase()))
            setCoinsList(filteredCoins)
        }
    }


    const [settingRef, exceptRef] = useModalSideExit<boolean>(isSetting, setSetting, false)

    const change = async (value?: number) => {
        if (token1!.symbol && token2!.symbol) {
            try {
                console.log(GetCoins[token2!.symbol])
                const data = await MinmumAmountOut(
                    GetCoins[token1!.symbol],
                    GetCoins[token2!.symbol],
                    (value || (token1Amount ?? 1)).toString(),
                    slippageArr.find(item => item.selected)!.value.toString(),
                    Math.floor(deadline * 60)
                )

                setAppAmount(data!.minimumAmountOut)
                setFee(data!.feeAmount)
                setOneCoinPrice(data!.oneTokenValue)
            } catch (error) {
                console.error(error)
                setOneCoinPrice("0")
                setAppAmount("0")
                setFee("0")
            }
        }
    }

    const startSwap = async (account?: IAccountORM | undefined, budget?: IBudgetORM | null, subbudget?: ISubbudgetORM | null) => {
        if (token1!.symbol && token2!.symbol && token1Amount && token1Amount > 0 && account) {
            try {
                const data = await SendTransaction(account, [], {
                    swap: {
                        account: account.address,
                        inputCoin: GetCoins[token1!.symbol],
                        outputCoin: GetCoins[token2!.symbol],
                        amount: token1Amount.toString(),
                        slippage: slippageArr.find(item => item.selected)!.value.toString(),
                        deadline: Math.floor(deadline * 60)
                    }
                })

                ToastRun(
                    <div className="flex flex-col items-center space-y-1">
                        <div className="font-semobold text-xl">Successfully Swapped</div>
                    </div>
                )

            } catch (error) {
                const message = (error as any).message || "Something went wrong"
                console.error(message)
                ToastRun(<div>Something went wrong</div>, "error")
            }
        }
    }

    const [isSwappingLoading, swapping] = useLoading(startSwap)

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
            <div className="text-2xl font-semibold">Swap</div>
        </div>
        <div className="flex flex-col items-center justify-center pt-12">
            <div className="flex flex-col w-[45%]">
                <div className="shadow-custom rounded-xl bg-white dark:bg-darkSecond pt-3 pb-10 px-3 flex flex-col space-y-1">
                    <div className="flex justify-end    ">
                        <div className="relative py-3">
                            <div ref={exceptRef}>
                                <img src="/icons/settings.svg" className="cursor-pointer dark:invert dark:brightness-0" onClick={() => setSetting(!isSetting)} />
                            </div>
                            <AnimatePresence>
                                {isSetting && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} ref={settingRef} className="absolute z-[300] shadow-custom bg-white dark:bg-darkSecond rounded-xl min-w-[15.625rem] left-0 translate-x-[-90%] bottom-0 translate-y-full p-3 text-sm">
                                    <div className="flex flex-col space-y-4">
                                        <div className="font-medium text-sm">Transaction Settings</div>
                                        <div className="flex flex-col space-y-3">
                                            <div className="text-sm font-semibold text-[#707070]">Slippage tolerance</div>
                                            <div className="flex space-x-2 ">
                                                {slippageArr.filter(s => !s.invisible).map((item, index) => <div key={index} onClick={() => {
                                                    const arr = [...slippageArr]
                                                    arr.forEach(i => i.selected = false)
                                                    arr[index].selected = true
                                                    setSlippageArr(arr)
                                                }} className={`${item.selected ? "bg-primary bg-opacity-100 text-white" : "bg-[#D6D6D6] dark:bg-[#252525]"}  text-sm font-medium w-12 h-7 flex justify-center items-center cursor-pointer rounded-2xl`}>{item.label}</div>)}
                                                <div className="w-28 h-7 bg-[#D6D6D6] dark:bg-[#252525] rounded-xl flex items-center justify-end pr-2">
                                                    <input placeholder="0.50" type="number" value={((slippageArr[slippageArr.length - 1]!.value / 10) || undefined)} className="outline-none font-medium text-sm text-right bg-transparent max-w-[3.125rem] unvisibleArrow" min={0} step={"any"} max={100} onChange={(event) => {
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
                                                    <span className="text-sm text-[#707070] ml-1">%</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col space-y-3">
                                            <div className="text-sm text-[#707070]">Transaction deadline</div>
                                            <div className="flex space-x-1 px-2 items-center">
                                                <input type="number" value={deadline === 1.5 ? undefined : deadline} onChange={(event) => {
                                                    const value = (event.target as HTMLInputElement).value
                                                    if (value) {
                                                        setDeadline(parseFloat(value))
                                                    } else setDeadline(1.5)
                                                }} className="bg-[#D6D6D6] dark:bg-[#252525] rounded-xl py-1 w-[6.25rem] outline-none px-2 text-right unvisibleArrow" placeholder="1.5" />
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
                            <div className="relative">
                                <div className={`${isDark ? "bg-[#1C1C1C] bg-opacity-50" : "bg-[#F9F9F9]"} flex justify-between items-center px-3 cursor-pointer text-sm !rounded-xl !border-none w-40 pt-[5px] pb-[5px] min-h-[2.3rem] `} onClick={() => setDropdown(!dropdown)}>
                                    {token1 &&
                                        <div className='flex space-x-2 tracking-wide text-base items-center justify-start'>
                                            <img src={token1?.logoURI} className="rounded-full w-5 h-5 mr-2" />
                                            {token1?.symbol}
                                        </div>
                                    }
                                    <motion.div
                                        animate={{ rotate: dropdown ? 180 : 0 }}
                                    >
                                        <ExpandMoreIcon />
                                    </motion.div>
                                </div>
                                <AnimatePresence>
                                    {dropdown &&
                                        <ClickAwayListener onClickAway={() => setDropdown(false)}>
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className='cursor-default absolute w-[20rem] h-[15rem] bg-white dark:bg-darkSecond z-[9999] bottom-0 translate-y-full rounded-md border border-[#a7a7a7] dark:border-[#777777]'>
                                                <div className='pt-2 px-3 border-r border-[#a7a7a7] dark:border-[#777777]'>
                                                    <div className='w-full'>
                                                        <FormControl fullWidth>
                                                            <TextField
                                                                placeholder='Search token'
                                                                inputProps={{ style: { width: '100%' } }}
                                                                onChange={searching}
                                                                InputProps={{
                                                                    style: {
                                                                        fontSize: '0.875rem',
                                                                        width: '100%',
                                                                        height: '35px'
                                                                    },
                                                                    startAdornment: (
                                                                        <InputAdornment position="start">
                                                                            <BiSearch />
                                                                        </InputAdornment>
                                                                    ),
                                                                }}
                                                                variant="outlined"
                                                            />
                                                        </FormControl>
                                                    </div>
                                                    <div className='text-greylish mt-3 mb-2 font-medium text-xs tracking-wide'>Select Token</div>
                                                    <div className='flex flex-col overflow-y-auto pb-2 h-[10rem] hover:scrollbar-thumb-gray-200 dark:hover:scrollbar-thumb-greylish scrollbar-thin'>
                                                        {coinsList.filter((coin) => balances[coin.symbol].amount > 0).map((coin, index) => {
                                                            console.log(coin)
                                                            return <div key={index} onClick={() => {
                                                                if (token2 == coin) {
                                                                    setToken2(token1)
                                                                }
                                                                setToken1(coin)
                                                                setDropdown(false)
                                                            }} className={`flex items-center space-x-2 py-2 hover:bg-gray-400 hover:bg-opacity-20 cursor-pointer px-2 ${token1?.symbol === coin.symbol && "bg-gray-400 bg-opacity-20"}`}>
                                                                <div className='w-6 h-6 rounded-full'>
                                                                    <img className='w-full h-full rounded-full' src={coin.logoURI} />
                                                                </div>
                                                                <div className='text-xs font-medium'>{coin.symbol}</div>
                                                            </div>
                                                        })}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </ClickAwayListener>
                                    }
                                </AnimatePresence>
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
                            <div className="text-sm">
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
                        <div className={` ${isDark ? "bg-[rgb(36,36,36)]" : "bg-[#F5F5F5] border-[#F9F9F9] border-[5px]"}  my-2 py-1 px-2 rounded-lg cursor-pointer w-[15%] flex justify-center `} onClick={changeSwap}>
                                <img src="/icons/arrowdown.svg" className="dark:invert dark:brightness-0" alt="" />
                        </div>
                    </div>
                    <div className={`${isDark ? "bg-[rgb(36,36,36)]" : "bg-[#F5F5F5]"}  min-h-[6.25rem]  flex justify-between rounded-xl py-3 px-4`}>
                        <div className="flex flex-col space-y-2 w-[9rem]">
                            <div className="relative">
                                <div className={`${isDark ? "bg-[#1C1C1C] bg-opacity-50" : "bg-[#F9F9F9]"} flex justify-between items-center px-3 cursor-pointer text-sm !rounded-xl !border-none w-40 pt-[5px] pb-[5px] min-h-[2.3rem] `} onClick={() => setDropdown2(!dropdown)}>
                                    {token2 &&
                                        <div className='flex space-x-2 tracking-wide text-base items-center justify-start'>
                                            <img src={token2?.logoURI} className="rounded-full w-5 h-5 mr-2" />
                                            {token2?.symbol}
                                        </div>
                                    }
                                    <motion.div
                                        animate={{ rotate: dropdown2 ? 180 : 0 }}
                                    >
                                        <ExpandMoreIcon />
                                    </motion.div>
                                </div>
                                <AnimatePresence>
                                    {dropdown2 &&
                                        <ClickAwayListener onClickAway={() => setDropdown2(false)}>
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className='cursor-default absolute w-[20rem] h-[15rem] bg-white dark:bg-darkSecond z-[9999] bottom-0 translate-y-full rounded-md border border-[#a7a7a7] dark:border-[#777777]'>
                                                <div className='pt-2 px-3 border-r border-[#a7a7a7] dark:border-[#777777]'>
                                                    <div className='w-full'>
                                                        <FormControl fullWidth>
                                                            <TextField
                                                                placeholder='Search token'
                                                                inputProps={{ style: { width: '100%' } }}
                                                                onChange={searching}
                                                                InputProps={{
                                                                    style: {
                                                                        fontSize: '0.875rem',
                                                                        width: '100%',
                                                                        height: '35px'
                                                                    },
                                                                    startAdornment: (
                                                                        <InputAdornment position="start">
                                                                            <BiSearch />
                                                                        </InputAdornment>
                                                                    ),
                                                                }}
                                                                variant="outlined"
                                                            />
                                                        </FormControl>
                                                    </div>
                                                    <div className='text-greylish mt-3 mb-2 font-medium text-xs tracking-wide'>Select Token</div>
                                                    <div className='flex flex-col overflow-y-auto pb-2 h-[10rem] hover:scrollbar-thumb-gray-200 dark:hover:scrollbar-thumb-greylish scrollbar-thin'>
                                                        {coinsList.map((coin, index) => {
                                                            return <div key={index} onClick={() => {
                                                                if (token1 == coin) {
                                                                    setToken1(token2)
                                                                }
                                                                setToken2(coin)
                                                                setDropdown2(false)
                                                            }} className={`flex items-center space-x-2 py-2 hover:bg-gray-400 hover:bg-opacity-20 cursor-pointer px-2 ${token2?.symbol === coin.symbol && "bg-gray-400 bg-opacity-20"}`}>
                                                                <div className='w-6 h-6 rounded-full'>
                                                                    <img className='w-full h-full rounded-full' src={coin.logoURI} />
                                                                </div>
                                                                <div className='text-xs font-medium'>{coin.symbol}</div>
                                                            </div>
                                                        })}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </ClickAwayListener>
                                    }
                                </AnimatePresence>
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
                            <div className="text-right text-sm outline-none unvisibleArrow">
                                Balance: {token2 && token2.name && balances[token2.symbol] ? (balances[token2.symbol]?.amount.toFixed(2) ?? 0) : 0}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="px-3 py-3 font-extralight text-sm">
                    <div className="flex justify-between">
                        <div>Rate:</div>
                        <div className="flex">1 {token1.name} = {!isLoading ? parseFloat(oneCoinPrice).toFixed(2) || "No Route for this trade" : <div className="px-3"><Loader /></div>} {token2.name}</div>
                    </div>
                    <div className="flex justify-between">
                        <div>Fee:</div>
                        <div className="flex">{!isLoading ? fee : <div className="px-3"><Loader /> </div>} CELO</div>
                    </div>
                </div>
                <div className="flex justify-center items-center text-center ">
                    {parseFloat(oneCoinPrice) ?
                        balances[token1.symbol].amount > (token1Amount ?? 0) ?
                            <Button className="w-[97%] text-lg !rounded-2xl"
                                onClick={() => setChoosingBudget(true)}
                                isLoading={isLoading || isSwappingLoading}
                            >
                                Swap
                            </Button> :
                            <div className="w-[97%] bg-greylish py-3 text-white rounded-md text-lg">
                                Insufficient {token1.symbol} balance
                            </div>
                        :
                        <div className="w-[97%] bg-greylish py-3 text-white rounded-md text-lg">
                            Insufficient liquidity for this trade
                        </div>
                    }
                </div>
                <div className="flex justify-center items-center mt-6 space-x-2">
                    <p className="text-base text-[#707070] ">Powered by</p>
                    {blockchain.name.includes("evm") ? isDark ? <img src="/icons/swap/1inch_color_white.png" className="w-20" alt="1inch" /> : <img src="/icons/swap/1inch_bw_black.png" className="w-20" alt="1inch" /> : blockchain.name === "celo" ?
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
        <Modal openNotify={choosingBudget} onDisable={setChoosingBudget}>
           <ChooseBudget submit={startSwap}/> 
        </Modal>
    </>
}

export default Swap;