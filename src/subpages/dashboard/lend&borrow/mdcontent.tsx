import Input from "subpages/dashboard/lend&borrow/input";
import { DropDownItem } from "types";
import { useState, useRef, useEffect } from "react";
import Button from "components/button";
import { useAppDispatch } from 'redux/hooks';
import { changeError, changeSuccess } from 'redux/reducers/notificationSlice';
import useMoola, { InterestRateMode, MoolaUserComponentData } from "API/useMoola";
import { useSelector } from 'react-redux'
import { SelectCurrencies, SelectBalances } from 'redux/reducers/currencies'
import { fromWei, printRayRate } from "utils/ray";
import { Coins } from 'types'
import { ClipLoader } from "react-spinners";

const MdContent = ({ type, setModal, box }: { type: "withdraw" | "repay" | "borrow" | "deposit", setModal: React.Dispatch<React.SetStateAction<boolean>>, box: MoolaUserComponentData }) => {
    const [selectedType, setSelectedType] = useState(true)
    const [amountState, setAmountState] = useState<number>(-1)
    const [wallets, setWallets] = useState<DropDownItem[]>([])

    const dispatch = useAppDispatch()
    const currencies = useSelector(SelectCurrencies)
    const balances = useSelector(SelectBalances)
    
    const [componentData, setComponentData] = useState(box)
    const [coinLoading, setCoinLoading] = useState(true)
    
    const maxAmount = type === "deposit" ? balances[componentData.currency.name].amount : type === "withdraw" ? componentData.lendingBalance : componentData.loanBalance
    const {
        borrow,
        deposit,
        withdraw,
        repay,
        getContract,
        getSingleInitialUserData,
        refresh,
        loading
    } = useMoola()

    useEffect(() => {
        (async () => {
            if (wallets[0]?.name) {
                try {
                    setCoinLoading(true)
                    const coin = Coins[wallets[0].name as unknown as keyof Coins]
                    let userData = await getSingleInitialUserData(coin)

                    setComponentData(userData)
                    setTimeout(() => setCoinLoading(false), 550)
                } catch (error: any) {
                    setTimeout(() => setCoinLoading(false), 550)
                    console.error(error.message)
                }
            }
        })()
    }, [wallets])

    const dynamicText = (action: string, money: string, currency: string, hash: string) => {
        return <div className="flex flex-col space-y-5 items-center">
            <div className="font-semibold">You have succesfully {action} your {currency} </div>
            <div className="font-bold text-xl">{money} {currency}</div>
            <div className="font-semibold">You can view the transaction on <span className="underline text-primary pointer cursor-pointer" onClick={() => window.open(`https://explorer.celo.org/tx/${hash}/token-transfers`, "_blank")}>Explorer</span></div>
        </div>
    }

    const create = async () => {
        try {
            if (wallets.length > 0 && amountState > 0) {
                await getContract()
                let hash;
                switch (type) {
                    case "withdraw":
                        hash = await withdraw(componentData.currency.contractAddress, amountState)
                        break;
                    case "repay":
                        hash = await repay(componentData.currency.contractAddress, amountState, selectedType ? InterestRateMode.Variable : InterestRateMode.Stable)
                        break;
                    case "borrow":
                        hash = await borrow(componentData.currency.contractAddress, amountState, selectedType ? InterestRateMode.Variable : InterestRateMode.Stable)
                        break;
                    case "deposit":
                        hash = await deposit(componentData.currency.contractAddress, amountState.toString())
                        break;
                    default:
                        break;
                }
                await refresh()

                let text = type === "withdraw" ? "Withdrawn" : type === "borrow" ? "Borrowed" : type === "repay" ? "Repaid" : "Deposited"
                dispatch(changeSuccess({ activate: true, text: dynamicText(text, amountState.toLocaleString(), wallets[0].name, hash) }))
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
                <Input setAmount={setAmountState} amount={amountState} selectedWallet={wallets} setWallet={setWallets} customCurreny={componentData.currency.name} maxAmount={maxAmount} />
            </div>
            {(type === "borrow" || type === "repay") && (!coinLoading ? <div className="py-4 px-12 text-center">
                <p className="pb-4">Loan Terms</p>
                <div className="grid grid-cols-2 px-20 gap-10 pb-4">
                    <div className="flex gap-2">
                        <input type="radio" className="w-4 h-4 peer cursor-pointer" name="paymentType" value="token" onChange={(e) => setSelectedType(true)} checked={selectedType} />
                        <label className="font-semibold peer-checked:text-primary text-sm pb-1">
                            Variable Loan
                        </label>
                    </div>
                    <div className="flex gap-2">
                        <input type="radio" className="w-4 h-4 peer cursor-pointer" name="paymentType" value="fiat" onChange={(e) => setSelectedType(false)} checked={!selectedType} disabled={!componentData.coinData.coinReserveConfig.StableEnabled} />
                        <label className="font-semibold peer-checked:text-primary text-sm pb-1">
                            Stable Loan
                        </label>
                    </div>
                </div>
                <p className="flex justify-center pb-2">Loan Status</p>
                <div className="grid grid-rows-5">
                    <div className="grid grid-cols-2 gap-x-5 items-center">
                        <div className="flex justify-between space-x-2"><p>Debt:</p><span className="opacity-80">${((parseFloat(fromWei(componentData.userData.currentStableDebt)) * parseFloat(fromWei(componentData.userData.currentVariableDebt))) * currencies[componentData.currency.name].price).toFixed(4)}</span></div>
                        <div className="flex justify-between space-x-2"><p>Health Factor:</p><span className="text-green-500">Safer</span></div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-5 items-center">
                        <div className="flex justify-between space-x-2"><p>New LTV:</p><span className="opacity-80">{componentData.coinData.coinReserveConfig.LoanToValue}</span></div>
                        <div className="flex justify-between space-x-2"><p>Maximum LTV:</p><span className="opacity-80">{componentData.coinData.coinReserveConfig.LoanToValue}</span></div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-5 items-center">
                        <div className="flex justify-between space-x-2 items-center"><p>Liquidation <br />Threshold:</p><span className="opacity-80">{componentData.coinData.coinReserveConfig.LiquidationThreshold}</span></div>
                        <div className="flex justify-between space-x-2"><p>Collateral Assets:</p><span className="opacity-80">{componentData.currency.name}</span></div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-5 items-center">
                        <div className="flex justify-between space-x-2"><p>Interest Rate:</p><span className="opacity-80">{componentData.userData.stableBorrowRate}</span></div>
                        <div className="flex justify-between space-x-2"><p>Debt Assets:</p><span className="opacity-80">{componentData.currency.name}</span></div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-5 items-center">
                        <div className="flex justify-between space-x-2"><p>Loan Terms:</p><span className="opacity-80">{selectedType ? "Variable" : "Stable"}</span></div>
                    </div>
                </div>
            </div> : <div className="flex items-center justify-center"><ClipLoader /></div>)
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