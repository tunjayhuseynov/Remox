import Dropdown from "components/general/dropdown";
import { Coins } from "types/coins";
import { DropDownItem } from 'types'
import { useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SelectBalances } from "redux/reducers/currencies";
import { changeError, changeSuccess, selectError, selectSuccess } from "redux/reducers/notificationSlice";
import Success from "components/general/success";
import Error from "components/general/error";
import { ClipLoader } from "react-spinners";
import Modal from "components/general/modal";
import { useModalSideExit } from 'hooks';
import useMultisig from "hooks/useMultisig";
import Button from "components/button";
import useSwap from "API/useSwap";
import {motion, AnimatePresence} from "framer-motion"

const Swap = () => {
    const [token1, setToken1] = useState<DropDownItem>(Coins.cUSD)
    const [token1Amount, setToken1Amount] = useState<number>()
    const [token2, setToken2] = useState<DropDownItem>(Coins.CELO)

    const { isMultisig } = useMultisig()

    const token1Input = useRef<HTMLInputElement>(null)

    const [appAmount, setAppAmount] = useState<string>("0")
    const [fee, setFee] = useState<string>("")
    const [oneCoinPrice, setOneCoinPrice] = useState<string>("")

    const [isOpen, setOpen] = useState<boolean>(false)
    const [isSetting, setSetting] = useState<boolean>(false)

    const [slippageArr, setSlippageArr] = useState([
        { value: 1, label: '0,1%', selected: false },
        { value: 5, label: '0,5%', selected: true },
        { value: 10, label: '1%', selected: false },
        { value: 0, label: '0%', selected: false, invisible: true }
    ])

    const [deadline, setDeadline] = useState<number>(1.5)

    const balances = useSelector(SelectBalances)
    const isSuccess = useSelector(selectSuccess)
    const isError = useSelector(selectError)

    const dispatch = useDispatch()

    const { Exchange, MinmumAmountOut, isLoading } = useSwap()

    const change = async (value?: number) => {
        if (token1.name && token2.name) {
            try {
                const data = await MinmumAmountOut(
                    Coins[token1.name as keyof Coins],
                    Coins[token2.name as keyof Coins],
                    (value || (token1Amount ?? 0)).toString(),
                    slippageArr.find(item => item.selected)!.value.toString(),
                    Math.floor(deadline * 60)
                )
                setAppAmount(data.minimumAmountOut)
                setFee(data.feeAmount)
                setOneCoinPrice(data.oneTokenValue)
            } catch (error) {
                console.error(error)
            }

        }
    }

    const startSwap = async () => {
        if (token1.name && token2.name && token1Amount && token1Amount > 0) {
            try {
                const data = await Exchange(
                    Coins[token1.name as keyof Coins],
                    Coins[token2.name as keyof Coins],
                    token1Amount.toString(),
                    slippageArr.find(item => item.selected)!.value.toString(),
                    Math.floor(deadline * 60)
                )
                dispatch(changeSuccess({
                    activate: true, text: <div className="flex flex-col items-center space-y-1">
                        <div className="font-semobold text-xl">Successfully Swapped</div>
                        <div className="text-primary text-sm font-semibold cursor-pointer" onClick={() => window.open(`https://explorer.celo.org/tx/${data.hash}/token-transfers`, '_blank')} > View on Celo Explorer</div>
                    </div>
                }))
                setOpen(false)
            } catch (error) {
                console.error(error)
                dispatch(changeError({ activate: true }))
            }

        }
    }

    useEffect(() => {
        if (token1 && token2) {
            change()
        }
    }, [token1, token2, token1Amount, slippageArr])

    const settingRef = useModalSideExit(isSetting, setSetting)


    const changeSwap = () => {
        const token1_copy = { ...token1 }
        const token2_copy = { ...token2 }
        const token2_amount = parseFloat(parseFloat(appAmount).toFixed(2))
        setToken1(token2_copy)
        setToken2(token1_copy)

        setToken1Amount(token2_amount)
        if (token1Input.current) {
            token1Input.current.value = token2_amount.toString();
        }
    }

    if (isMultisig) return <div className="text-center py-2">We are working on bringing Swap into MultiSig account. Please, select a wallet account until we finish it</div>

    return <div className="flex items-center justify-center pt-12">
        <div className="flex flex-col w-[80%]">
            <div className="shadow-custom rounded-xl bg-white dark:bg-darkSecond pt-3 pb-10 px-3 flex flex-col space-y-1">
                <div className="flex justify-between">
                    <div className="font-bold text-xl pb-2">Swap</div>
                    <div className="relative">
                        <img src="/icons/settings.svg" className="cursor-pointer dark:invert dark:brightness-0" onClick={() => setSetting(!isSetting)} />
                        <AnimatePresence>
                        {isSetting && <motion.div initial={ {opacity:0}} animate={{opacity:1}} exit={{opacity:0}}  ref={settingRef} className="absolute z-[300] shadow-custom bg-white dark:bg-darkSecond rounded-xl min-w-[250px] left-0 translate-x-[-90%] bottom-0 translate-y-full p-3 text-sm">
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
                                            <input placeholder="0.5" type="number" value={((slippageArr[slippageArr.length - 1]!.value / 10) || undefined)} className="outline-none text-right bg-transparent max-w-[50px] unvisibleArrow" min={0} step={"any"} max={100} onChange={(event) => {
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
                                        }} className="bg-greylish bg-opacity-10 rounded-xl py-1 w-[100px] outline-none px-2 text-right unvisibleArrow" placeholder="1.5" />
                                        <div>minutes</div>
                                    </div>
                                </div>

                            </div>
                        </motion.div>}
                        </AnimatePresence>
                    </div>
                </div>
                <div className="bg-greylish bg-opacity-10 min-h-[100px] items-center flex justify-between rounded-md py-3 px-3">
                    <div className="flex flex-col space-y-2 w-[130px]">
                        <div>
                            <Dropdown onChange={(w: DropDownItem, selected: DropDownItem) => {
                                if (w.name === token2.name) {
                                    setToken2(selected)
                                }
                            }} parentClass="shadow-custom bg-white dark:bg-darkSecond rounded-md" onSelect={setToken1} className="border-none py-1 space-x-4 text-sm" nameActivation={true} selected={token1} list={Object.values(Coins).map(w => ({ name: w.name, coinUrl: w.coinUrl, id: w.name, className: "text-sm" }))} />
                        </div>
                        <div>
                            <input ref={token1Input} onChange={async (e) => { setToken1Amount(parseFloat((e.target.value))); await change(parseFloat((e.target.value))); }} type="number" className="font-bold text-2xl bg-transparent text-center outline-none unvisibleArrow max-w-[130px]" placeholder="0" min="0" step="any" />
                        </div>
                    </div>
                    <div className="flex flex-col space-y-2 items-end ">
                        <div className="text-xl">
                            Balance: {token1 && token1.name && balances[token1.name as keyof typeof balances] ? (balances[token1.name as keyof typeof balances]?.amount.toFixed(2) ?? 0) : 0}
                        </div>
                        <div className="flex space-x-2">
                            <button className="shadow-custom bg-white dark:bg-darkSecond px-5 py-2 rounded-xl text-xs" onClick={
                                () => {
                                    if (balances && token1 && balances[token1.name as keyof typeof balances] && balances[token1.name as keyof typeof balances]!.amount > 0) {
                                        const amount = balances[token1.name as keyof typeof balances]!.amount * 0.5
                                        token1Input.current!.value = amount.toFixed(2)
                                        setToken1Amount(amount)
                                    }
                                }
                            }>
                                50%
                            </button>
                            <button className="shadow-custom bg-white dark:bg-darkSecond px-5 py-2 rounded-xl text-xs" onClick={() => {
                                if (balances && token1 && balances[token1.name as keyof typeof balances] && balances[token1.name as keyof typeof balances]!.amount > 0) {
                                    const amount = balances[token1.name as keyof typeof balances]!.amount
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
                    <div className="bg-greylish bg-opacity-10 my-2 px-3 py-1 rounded-lg cursor-pointer" onClick={changeSwap}>
                        <img src="/icons/arrowdown.svg" className="dark:invert dark:brightness-0" alt="" />
                    </div>
                </div>
                <div className="flex min-h-[100px] bg-greylish bg-opacity-10 justify-between rounded-md py-3 px-3">
                    <div className="flex flex-col space-y-2 w-[130px]">
                        <div>
                            <Dropdown onChange={(w: DropDownItem, selected: DropDownItem) => {
                                if (w.name === token1.name) {
                                    setToken1(selected)
                                }
                            }} parentClass="shadow-custom bg-white dark:bg-darkSecond rounded-md" onSelect={setToken2} className="border-none py-1 space-x-4 text-sm" nameActivation={true} selected={token2} list={Object.values(Coins).map(w => ({ name: w.name, coinUrl: w.coinUrl, className: "text-sm" }))} />
                        </div>
                        <div>
                            {!(!token1Amount) && (!isLoading ?
                                <>
                                    <div className="font-bold text-2xl text-center outline-none unvisibleArrow">
                                        {parseFloat(appAmount).toFixed(2)}
                                    </div>
                                </> : <div className="text-center"><ClipLoader size="24px" /></div>)
                            }
                        </div>
                    </div>
                    <div className="flex flex-col items-end h-full">
                        <div className="text-right text-xl outline-none unvisibleArrow">
                            Balance: {token2 && token2.name && balances[token2.name as keyof typeof balances] ? (balances[token2.name as keyof typeof balances]?.amount.toFixed(2) ?? 0) : 0}

                        </div>
                    </div>
                </div>
            </div>
            <div className="px-8 py-3 font-extralight text-sm">
                <div className="flex justify-between">
                    <div>Rate:</div>
                    <div className="flex">1 {token1.name} = {!isLoading ? parseFloat(oneCoinPrice).toFixed(2) : <div className="px-3"><ClipLoader size={18} /></div>} {token2.name}</div>
                </div>
                <div className="flex justify-between">
                    <div>Fee:</div>
                    <div className="flex">{!isLoading ? fee : <div className="px-3"><ClipLoader size={18} /> </div>} {token1.name}</div>
                </div>
            </div>
            <div className="text-center mx-8">
                <Button className="w-[70%] text-2xl" onClick={() => setOpen(true)} isLoading={isLoading}>
                    Swap
                </Button>
            </div>
        </div>
        {isOpen && <Modal onDisable={setOpen} title="Confirm Swap" className="lg:left-[55.5%]">
            <div className="flex flex-col -mx-5 space-y-5">
                <div className="flex flex-col py-2 pb-10 space-y-7 border-b-2 px-5">
                    <div className="grid grid-cols-[7%,73%,20%] items-center">
                        <div>
                            <img src={`${token1.coinUrl}`} alt="" className="w-[20px[ h-[20px]" />
                        </div>
                        <div className="font-bold">
                            {token1Amount}
                        </div>
                        <div className="text-right">
                            {token1.name}
                        </div>
                    </div>
                    <div className="grid grid-cols-[7%,73%,20%] items-center">
                        <div>
                            <img src={`/icons/longdown.svg`} alt="" className="dark:invert dark:brightness-0" />
                        </div>
                    </div>
                    <div className="grid grid-cols-[7%,73%,20%] items-center">
                        <div>
                            <img src={`${token2.coinUrl}`} className="w-[20px[ h-[20px]" alt="" />
                        </div>
                        <div className="font-bold">
                            {parseFloat(appAmount).toFixed(2)}
                        </div>
                        <div className="text-right">
                            {token2.name}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col px-5 text-xs space-y-1">
                    <div className="flex justify-between">
                        <div>Rate:</div>
                        <div className="flex">1 {token1.name} = {!isLoading ? parseFloat(oneCoinPrice).toFixed(2) : <div className="px-3"><ClipLoader size={18} /></div>} {token2.name}</div>
                    </div>
                    <div className="flex justify-between">
                        <div>Fee:</div>
                        <div className="flex">{!isLoading ? fee : <div className="px-3"><ClipLoader size={18} /> </div>} {token1.name}</div>
                    </div>
                </div>
                <div className="flex justify-center">
                    <Button className="w-3/5" onClick={startSwap} isLoading={isLoading}>Confirm Swap</Button>
                </div>
            </div>
        </Modal>}
        {isSuccess && <Success onClose={(val: boolean) => dispatch(changeSuccess({ activate: val }))} />}
        {isError && <Error onClose={(val: boolean) => dispatch(changeError({ activate: val }))} />}
    </div>
}

export default Swap;