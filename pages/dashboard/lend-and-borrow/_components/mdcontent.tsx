import { AltCoins } from "types";
import { useState, useEffect, Fragment } from "react";
import Button from "components/button";
import { useAppDispatch, useAppSelector } from 'redux/hooks';
import { changeError, } from 'redux/slices/notificationSlice';
import useLending, { InterestRateMode, LendingBorrowStatus, LendingType, LendingUserComponentData } from "rpcHooks/useLending";
import { useSelector } from 'react-redux'
import Loader from "components/Loader";
import { useWalletKit } from "hooks";
import shortid from "shortid";
import Dropdown from "components/general/dropdown";
import { SelectBalance, SelectSelectedAccountAndBudget } from "redux/slices/account/selector";

const MdContent = ({ type, setModal, box }: { type: "withdraw" | "repay" | "borrow" | "deposit", setModal: React.Dispatch<React.SetStateAction<boolean>>, box: LendingUserComponentData }) => {
    const [selectedType, setSelectedType] = useState(true)
    const { GetCoins } = useWalletKit()
    const SelectedAccountAndBudget = useAppSelector(SelectSelectedAccountAndBudget)

    const [inputs, setInput] = useState<{ id: string, amount: number, wallet: AltCoins }[]>([
        {
            id: shortid(),
            amount: 0,
            wallet: GetCoins[0]
        }
    ])

    const dispatch = useAppDispatch()
    const balances = useSelector(SelectBalance)

    const [componentData, setComponentData] = useState(box)
    const [coinLoading, setCoinLoading] = useState(true)
    const [status, setStatus] = useState<LendingBorrowStatus>()

    const maxAmount = type === "deposit" ? balances[componentData.currency.name].amount : type === "withdraw" ? componentData.lendingBalance : componentData.loanBalance
    const {
        borrow,
        deposit,
        withdraw,
        repay,
        getContract,
        getSingleInitialUserData,
        refresh,
        getBorrowInfo,
        loading
    } = useLending(SelectedAccountAndBudget.account!)

    useEffect(() => {
        (async () => {
            if (inputs[0].wallet) {
                try {
                    setCoinLoading(true)
                    const coin = inputs[0].wallet;
                    let userData = await getSingleInitialUserData(coin)
                    setComponentData(userData)

                    setTimeout(() => setCoinLoading(false), 550)
                } catch (error: any) {
                    setTimeout(() => setCoinLoading(false), 550)
                    console.error(error.message)
                }
            }
        })()
    }, [inputs])

    useEffect(() => {
        (async () => {
            if (inputs[0]) {
                const info = await getBorrowInfo(inputs[0].amount, inputs[0].wallet)
                if (info) setStatus(info)
            }
        })()
    }, [inputs])

    const dynamicText = (action: string, money: string, currency: string, hash: string) => {
        return <div className="flex flex-col space-y-5 items-center">
            <div className="font-semibold">You have succesfully {action} your {currency} </div>
            <div className="font-bold text-xl">{money} {currency}</div>
            <div className="font-semibold">You can view the transaction on <span className="underline text-primary pointer cursor-pointer" onClick={() => window.open(`https://explorer.celo.org/tx/${hash}/token-transfers`, "_blank")}>Explorer</span></div>
        </div>
    }

    const create = async () => {
        try {
            if (inputs.length > 0) {
                await getContract()
                let hash;
                for (const input of inputs) {
                    switch (type) {
                        case "withdraw":
                            hash = await withdraw(componentData.currency.address, input.amount)
                            break;
                        case "repay":
                            hash = await repay(componentData.currency.address, input.amount, selectedType ? InterestRateMode.Variable : InterestRateMode.Stable)
                            break;
                        case "borrow":
                            hash = await borrow(componentData.currency.address, input.amount, selectedType ? InterestRateMode.Variable : InterestRateMode.Stable)
                            break;
                        case "deposit":
                            hash = await deposit(componentData.currency.address, input.amount.toString())
                            break;
                        default:
                            break;
                    }
                }
                await refresh()

                let text = LendingType(type)
                // dispatch(changeSuccess({ activate: true, text: dynamicText(text, amountState.toLocaleString(), wallets[0].name, hash) }))
                setModal(false)
            }
        } catch (error) {
            console.error(error)
            dispatch(changeError({ activate: true, text: `Failed to ${type}` }))
            setModal(false)
        }

    }

    return <>
        <div className="flex flex-col space-y-8">
            <div className="font-semibold text-2xl flex justify-center py-4">
                {`${type[0].toUpperCase()}${type.substring(1)}`} Funds
            </div>
            <div className="bg-greylish bg-opacity-5 p-4">
                <div className={`grid ${type === "deposit" ? "grid-cols-2" : ""} text-center`}>
                    <div className="flex flex-col ">
                        <p className=" text-xl pb-2 ">
                            {type === "deposit" && "Wallet Balance"}
                            {(type === "withdraw" || type === "borrow") && "Current Lending Balance"}
                            {type === "repay" && "Current Loan Amount"}
                        </p>
                        <p className="text-lg">
                            {type === "deposit" && componentData.walletBalance.toFixed(2)}
                            {(type === "withdraw" || type === "borrow") && componentData.lendingBalance.toFixed(2)}
                            {type === "repay" && componentData.loanBalance.toFixed(2)} <span className="opacity-50 text-sm">{componentData.currency.name}</span>
                        </p>
                    </div>
                    {type === "deposit" && <div className="flex flex-col border-l-[2px]">
                        <p className="text-xl pb-2">
                            Available Liquidity
                        </p>
                        <p className="text-lg">{Number(componentData.coinData.availableLiquidity).toLocaleString()} <span className="opacity-50 text-sm">{componentData.currency.name}</span> </p>
                    </div>
                    }
                </div>
            </div>
            <div className="flex justify-center py-4 pb-0">
                <p>How much would you like to {type} ?</p>
            </div>
            <div className=" py-4 px-12 pt-0">
                <p className="text-greylish">{`${type[0].toUpperCase()}${type.substring(1)}`} Amount</p>
                {inputs.map((input, index) => {
                    const { id, amount, wallet } = input
                    return <Fragment key={id}>
                        <div className="sm:h-[2.5rem] sm:w-full md:col-span-1 border dark:border-darkSecond dark:bg-darkSecond text-black dark:text-white rounded-md grid  grid-cols-[50%,50%]">
                            <input
                                className="outline-none unvisibleArrow pl-2dark:bg-darkSecond dark:text-white"
                                placeholder="Amount"
                                value={amount === -1 ? '' : amount}
                                type="number" name={`amount__${0}`}
                                onChange={(e) => {
                                    const thatInput = { ...input }
                                    thatInput.amount = +e.target.value
                                    setInput([...inputs.filter((s, i) => i === index), thatInput])
                                }}
                                required
                                step={'any'}
                            />
                            <Dropdown className="border-transparent text-sm border-none"
                                runFn={val => async () => {
                                    const thatInput = { ...input }
                                    thatInput.wallet = val
                                    setInput([...inputs.filter((s, i) => i === index), thatInput])
                                }}
                                label="Token"
                                selected={wallet as any}
                                list={Object.values(GetCoins)} />
                        </div>
                        <div className="pt-1 text-xs col-span-2 truncate">max: {maxAmount} {wallet.name}</div>
                    </Fragment>
                })}
            </div>
            {(type === "borrow" || type === "repay") && inputs.length > 0 && ((!coinLoading && status) ? <div className="py-4 px-12 text-center">
                <p className="pb-4">Loan Terms</p>
                <div className="grid grid-cols-2 px-20 gap-10 pb-4">
                    <div className="flex gap-2">
                        <input type="radio" className="w-4 h-4 peer accent-[#ff501a] cursor-pointer" name="paymentType" value="token" onChange={(e) => setSelectedType(true)} checked={selectedType} />
                        <label className="font-semibold peer-checked:text-primary text-sm pb-1">
                            Variable Loan
                        </label>
                    </div>
                    {componentData.coinData.coinReserveConfig.StableEnabled &&
                        <div className="flex gap-2">
                            <input type="radio" className="w-4 h-4 peer accent-[#ff501a] cursor-pointer" name="paymentType" value="fiat" onChange={(e) => setSelectedType(false)} checked={!selectedType} disabled={!componentData.coinData.coinReserveConfig.StableEnabled} />
                            <label className="font-semibold peer-checked:text-primary text-sm pb-1">
                                Stable Loan
                            </label>
                        </div>
                    }
                </div>
                <p className="flex justify-center pb-2">Loan Status</p>
                <div className="grid grid-rows-5">
                    <div className="grid grid-cols-2 gap-x-5 items-center">
                        <div className="flex justify-between space-x-2"><p>Debt:</p><span className="opacity-80">$ {status.debt}</span></div>
                        <div className="flex justify-between space-x-2"><p>Health Factor:</p><span className={`${parseFloat(status.healthFactor) < 1.25 ? "text-red-500" : "text-green-500"}`}>{parseFloat(status.healthFactor) < 1.25 ? "Riskier" : "Safer"}</span></div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-5 items-center">
                        <div className="flex justify-between space-x-2"><p>New LTV:</p><span className="opacity-80">{status.ltv}%</span></div>
                        <div className="flex justify-between space-x-2"><p>Maximum LTV:</p><span className="opacity-80">{componentData.coinData.coinReserveConfig.LoanToValue}</span></div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-5 items-center">
                        <div className="flex justify-between space-x-2 items-center"><p>Liquidation <br />Threshold:</p><span className="opacity-80">{componentData.coinData.coinReserveConfig.LiquidationThreshold}</span></div>
                        <div className="flex justify-between space-x-2"><p>Collateral Assets:</p><span className="opacity-80">{status.colList.join(", ")}</span></div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-5 items-center">
                        <div className="flex justify-between space-x-2"><p>Interest Rate:</p><span className="opacity-80">{selectedType ? componentData.coinData.variableBorrowRate : componentData.coinData.stableBorrowRate}</span></div>
                        <div className="flex justify-between space-x-2"><p>Debt Assets:</p><span className="opacity-80">{status.debtList.join(", ")}</span></div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-5 items-center">
                        <div className="flex justify-between space-x-2"><p>Loan Terms:</p><span className="opacity-80">{selectedType ? "Variable" : "Stable"}</span></div>
                    </div>
                </div>
            </div> : <div className="flex items-center justify-center"><Loader /></div>)
            }
        </div>
        <div className="flex justify-center pt-5 sm:pt-10">
            <div className="flex flex-row gap-10 sm:grid grid-cols-2  sm:justify-center sm:gap-5">
                <Button version="second" onClick={() => setModal(false)} >Close</Button>
                <Button type="submit" onClick={create} isLoading={loading} className=" bg-primary text-white">{`${type[0].toUpperCase()}${type.substring(1)}`}</Button>
            </div>
        </div>
    </>

}

export default MdContent; 