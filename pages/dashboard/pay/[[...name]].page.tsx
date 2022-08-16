import { useState, useRef, useEffect, useMemo } from "react";
import { generate } from 'shortid'
import { csvFormat } from 'utils/CSV'
import { useSelector } from "react-redux";
import { useAppDispatch } from "redux/hooks";
import { SelectDarkMode } from 'redux/slices/account/remoxData';
import { SelectBalances } from "redux/slices/currencies";
import Button from "components/button";
import Select from 'react-select';
import { Coins } from "types";
import { useWalletKit } from "hooks";
import { useRouter } from "next/router";
import { addPayInput, changeBasedValue, IPayInput, resetPayInput, SelectInputs } from "redux/slices/payinput";
import AnimatedTabBar from 'components/animatedTabBar';
import { useAppSelector } from 'redux/hooks';
import Loader from "components/Loader";
import { DropDownItem } from 'types';
import { useForm, SubmitHandler } from "react-hook-form";
import Dropdown from 'components/general/dropdown';
import { colourStyles, SelectType } from "utils/const";
import { SelectSelectedAccountAndBudget, SelectStats, SelectTags } from "redux/slices/account/remoxData";
import useLoading from "hooks/useLoading";
import { IPaymentInput } from "pages/api/payments/send/index.api";
import { ITag } from "pages/api/tags/index.api";
import { ToastRun } from "utils/toast";
import { GetTime } from "utils";
import Input from "./_components/payinput";

export interface IFormInput {
    description?: string;
}

const Pay = () => {
    let totalBalance = useAppSelector(SelectStats)?.TotalBalance
    const selectedAccountAndBudget = useAppSelector(SelectSelectedAccountAndBudget)
    const tags = useSelector(SelectTags)
    const dark = useAppSelector(SelectDarkMode)
    const MyInputs = useSelector(SelectInputs)

    let balance = parseFloat(`${totalBalance ?? 0}`).toFixed(2)


    const { register, handleSubmit } = useForm<IFormInput>();
    // const [stream, setStream] = useState(false)

    const dispatch = useAppDispatch()
    const router = useRouter();
    const { GetCoins, SendTransaction } = useWalletKit()


    const [startDateState, setStartDate] = useState<string>()
    const [startTime, setStartTime] = useState<string>()

    const [endDateState, setEndDate] = useState<string>()
    const [endTime, setEndTime] = useState<string>()

    const [selectedTags, setSelectedTags] = useState<ITag[]>([])


    const [csvImport, setCsvImport] = useState<csvFormat[]>([]);

    const fileInput = useRef<HTMLInputElement>(null);

    const amountTypeList: DropDownItem[] = [{ name: "Pay with Token Amounts", id: 0 }, { name: "Pay with USD-based Amounts", id: 1 }]
    const [selectedAmountType, setSelectedAmountType] = useState(amountTypeList[0])


    // const timeInterval: DropDownItem[] = [{ name: "Days" }, { name: "Weeks" }, { name: "Months" }]
    // const [selectedTimeInterval, setSelectedTimeInterval] = useState(timeInterval[0])
    const coins = useMemo(() => Object.values(GetCoins!).map(w => ({ name: w.name, coinUrl: w.coinUrl })), [GetCoins])

    useEffect(() => {
        dispatch(addPayInput({
            index: generate(),
            wallet: coins[0]
        }))
        return () => {
            dispatch(resetPayInput())
        }
    }, [])



    useEffect(() => {
        if (csvImport.length > 0 && GetCoins) {
            const list = csvImport.filter(w => w.address && w.amount && w.coin)
            for (let index = 0; index < list.length; index++) {
                const { name, address, amount, coin, amount2, coin2 } = list[index]

                let newInput: IPayInput = {
                    index: generate(),
                    name,
                    address,
                    amount: parseFloat(amount || "0"),
                    wallet: GetCoins[coin as keyof Coins],
                }

                if (amount2) newInput.amount2 = parseFloat(amount2)
                if (coin2) newInput.wallet2 = GetCoins[coin2 as keyof Coins]
                dispatch(addPayInput(newInput))
            }
            // setRefreshPage(generate())
            fileInput.current!.files = new DataTransfer().files;
        }
    }, [csvImport])


    const index = router.query.name ? (router.query.name as string[]).includes("recurring") ? 1 : 0 : 0

    const data = [
        {
            to: "/dashboard/pay",
            text: "One-Time"
        },
        {
            to: "/dashboard/pay/recurring",
            text: "Recurring"
        }
    ]

    const onTagChange = (value: any) => {
        setSelectedTags(value.map((s: SelectType) => ({ color: s.color, id: s.value, name: s.label, transactions: s.transactions, isDefault: s.isDefault })));
    }

    const onSubmit: SubmitHandler<IFormInput> = async (data) => {
        try {
            const Wallet = selectedAccountAndBudget.account
            if (!Wallet) throw new Error("No wallet selected")
            const Budget = selectedAccountAndBudget.budget
            const subBudget = selectedAccountAndBudget.subbudget
            console.log(MyInputs, data)

            const pays: IPaymentInput[] = []
            for (const input of MyInputs) {
                const { wallet, amount, address, amount2, wallet2 } = input;
                if (wallet && amount && address) {
                    pays.push({
                        coin: wallet.name,
                        recipient: address,
                        amount: amount,
                    })
                }
                if (wallet2 && amount2 && address) {
                    pays.push({
                        coin: wallet2.name,
                        recipient: address,
                        amount: amount2,
                    })
                }
            }
            let startDate: Date | null = null;
            let endDate: Date | null = null;
            if (startDateState && startTime) {
                startDate = new Date(`${startDateState} ${startTime}`)
            }
            if (endDateState && endTime) {
                endDate = new Date(`${endDateState} ${endTime}`)
            }
            if (index === 1 && (!startDate || !endDate)) {
                throw new Error("Please select start and end date")
            }

            await SendTransaction(Wallet, pays, {
                budget: Budget ?? undefined,
                subbudget: subBudget ?? undefined,
                task: startDate && endDate ? {
                    startDate: GetTime(startDate),
                    interval: GetTime(endDate),
                } : undefined,
                isStreaming: index === 1,
                endTime: index === 1 && endDate ? GetTime(endDate) : undefined,
                startTime: index === 1 && startDate ? GetTime(startDate) : undefined,
                tags: selectedTags,
            })

            ToastRun(<>Successfully processed</>, "success")
        } catch (error) {
            const message = (error as any).message || "Something went wrong"
            console.error(error)
            ToastRun(<>{message}</>, "error")
        }

    }

    const [isLoading, submit] = useLoading(onSubmit)

    const isSingle = selectedAccountAndBudget.account?.signerType === "single"
    return <>
        <div >
            <div className="relative bg-light dark:bg-dark">
                <button onClick={() => { router.back() }} className="absolute right-full w-[4rem] top-0 translate-x-[175%] translate-y-[25%] tracking-wider font-bold transition-all hover:text-primary hover:transition-all text-xl flex items-center gap-2">
                    {/* <img src="/icons/cross_greylish.png" alt="" /> */}
                    <span className="text-4xl pb-1">&#171;</span> Back
                </button>
                <form onSubmit={handleSubmit(submit)} >
                    <div className="sm:flex flex-col items-center justify-center min-h-screen">
                        <div className="sm:min-w-[50vw] min-h-[75vh] h-auto ">
                            <div className="pt-12 pb-4 text-center w-full">
                                <div className="text-2xl font-bold">Remox Pay</div>
                            </div>
                            <div className="w-full flex justify-center py-4">
                                <div className="flex justify-between w-[30%] xl:w-[23%] "><AnimatedTabBar data={data} index={index} className={'!text-lg'} /></div>
                            </div>
                            <div className="w-full flex flex-col px-3 py-2">
                                <div className={`grid ${index === 1 ? "grid-cols-[30%,30%,40%]" : "grid-cols-[40%,60%]"} `}>
                                    <div className="flex flex-col gap-2 mb-4 border-r">
                                        <div className="font-semibold text-lg text-greylish dark:text-white ">Total Treasury</div>
                                        <div className="text-2xl font-bold">{(balance) || (balance !== undefined && parseFloat(balance) === 0) ? `$${balance} USD` : <Loader />}</div>

                                    </div>
                                    {index === 0 && <div className="flex flex-col gap-2 mb-4 border-r">
                                        <div className="font-semibold pl-5 text-lg text-greylish dark:text-white ">Wallet Balance</div>
                                        <div className="text-xl pl-5  font-bold">{(balance) || (balance !== undefined && parseFloat(balance) === 0) ? `$${balance} USD` : <Loader />}</div>

                                    </div>}
                                    {index === 1 && <div className="flex flex-col gap-2 mb-4">
                                        <div className="font-semibold pl-5 text-lg text-greylish dark:text-white ">Token Allocation</div>
                                        <div className="text-2xl font-bold">{(balance) || (balance !== undefined && parseFloat(balance) === 0) ? `$${balance} USD` : <Loader />}</div>
                                    </div>}
                                </div>
                            </div>
                            <div className="sm:flex flex-col gap-3 py-5 xl:py-10">
                                <div className="sm:flex flex-col  gap-y-10  ">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            {/* <span className="text-left pb-1 text-sm ml-1 font-semibold">Amount Type</span> */}
                                            <Dropdown
                                                parentClass={'bg-white dark:bg-darkSecond w-full rounded-lg h-[3.4rem]'}
                                                className={'!rounded-lg h-[3.4rem]'}
                                                label="Amount Type"
                                                runFn={e => () => dispatch(changeBasedValue(e.id === 1))}
                                                list={amountTypeList}
                                                selected={selectedAmountType}
                                                setSelect={setSelectedAmountType}
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-left pb-1 text-sm ml-1 font-semibold">Transaction Tags</span>
                                            <div className="w-full  gap-x-3 sm:gap-x-10 ">
                                                {isSingle && tags && tags.length > 0 && <Select
                                                    closeMenuOnSelect={true}
                                                    isMulti
                                                    isClearable={false}
                                                    options={tags.map(s => ({ value: s.id, label: s.name, color: s.color, transactions: s.transactions, isDefault: s.isDefault }))}
                                                    styles={colourStyles(dark)}
                                                    onChange={onTagChange}
                                                />}
                                                {isSingle && tags.length === 0 && <div>No tag yet</div>}
                                                {!isSingle && <div>You can only add tags after execution of the transaction</div>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col">
                                        {/* <div className="flex space-x-5 sm:space-x-0 sm:justify-between py-4 items-center">
                                        <input ref={fileInput} type="file" className="hidden" onChange={(e) => e.target.files!.length > 0 ? CSV.Import(e.target.files![0]).then(e => setCsvImport(e)).catch(e => console.error(e)) : null} />
                                    </div> */}
                                        <div className="grid grid-cols-2  gap-8">
                                            {MyInputs.map((e, i) => <Input key={e.index} index={index} payInput={e} />)}
                                        </div>
                                    </div>
                                    <div className="py-5 sm:py-0 w-full gap-16">
                                        <div className="w-[50%] flex gap-4">
                                            <Button version="second" className="min-w-[12.5rem] bg-white text-left !px-6 font-semibold tracking-wide shadow-none" onClick={() => {
                                                dispatch(addPayInput({
                                                    index: generate(),
                                                    wallet: coins[0]
                                                }))
                                            }}>
                                                + Add More
                                            </Button>
                                            <Button version="second" onClick={() => {
                                                fileInput.current?.click()
                                            }} className="min-w-[12.5rem] bg-white text-left !px-6 font-semibold tracking-wide shadow-none">
                                                Import CSV file
                                            </Button>
                                        </div>
                                    </div>
                                    {index === 1 &&
                                        <div className="w-full grid grid-cols-2 gap-8">
                                            <div className="w-full flex flex-col">
                                                <span className="text-left text-sm pb-1 ml-1 font-semibold">Start time</span>
                                                <div className="w-full grid grid-cols-[60%,35%] gap-5">
                                                    <input type="date" onChange={(e) => {
                                                        setStartDate(e.target.value)
                                                    }} className="w-full bg-white dark:bg-darkSecond border dark:border-darkSecond p-2 rounded-lg " />
                                                    <input type="time" onChange={(e) => {
                                                        setStartTime(e.target.value)
                                                    }} className="w-full bg-white dark:bg-darkSecond border dark:border-darkSecond p-2 rounded-lg" />
                                                </div>
                                            </div>

                                            <div className="w-full flex flex-col">
                                                <span className="text-left text-sm pb-1 ml-1 font-semibold">Completion time</span>
                                                <div className="w-full grid grid-cols-[60%,35%] gap-5 ">
                                                    <input type="date" onChange={(e) => {
                                                        setEndDate(e.target.value)
                                                    }} className=" w-full border dark:border-darkSecond p-2 rounded-lg mr-5 bg-gray-300 dark:bg-darkSecond" />
                                                    <input type="time" onChange={(e) => {
                                                        setEndTime(e.target.value)
                                                    }} className="w-full border dark:border-darkSecond p-2 rounded-lg mr-5 bg-gray-300 dark:bg-darkSecond" />
                                                </div>
                                            </div>
                                        </div>}

                                    <div className="flex flex-col space-y-3">
                                        <span className="text-left">Description <span className="text-greylish">(Optional)</span></span>
                                        <div className="grid grid-cols-1">
                                            <textarea placeholder="Paid 50 CELO to Ermak....." {...register("description")} className="border-2 dark:border-darkSecond rounded-xl p-3 outline-none dark:bg-darkSecond" name="description" id="" cols={28} rows={5}></textarea>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-center pt-5">
                                    <div className="flex flex-col-reverse sm:grid grid-cols-2 w-[12.5rem] sm:w-full justify-center gap-8">
                                        <Button version="second" onClick={() => router.back()}>Close</Button>
                                        <Button type="submit" className="bg-primary px-3 py-2 text-white flex items-center justify-center rounded-lg" isLoading={isLoading}>Send</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </>

}

export default Pay;