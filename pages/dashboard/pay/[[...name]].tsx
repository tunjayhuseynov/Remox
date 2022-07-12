import { useState, useRef, useEffect, SyntheticEvent, useContext } from "react";
import shortid, { generate } from 'shortid'
import { MultipleTransactionData } from "types/sdk";
import { csvFormat } from 'utils/CSV'
import { useSelector } from "react-redux";
import { selectStorage } from "redux/slices/account/storage";
import Input from "subpages/pay/payinput";
import { useAppDispatch } from "redux/hooks";
import { changeError, selectDarkMode, selectError } from "redux/slices/notificationSlice";
import { SelectSelectedAccount } from "redux/slices/account/selectedAccount";
import { SelectBalances, SelectTotalBalance } from "redux/slices/currencies";
import Button from "components/button";
import { PaymentInput } from "rpcHooks/useCeloPay";
import useMultisig from 'hooks/walletSDK/useMultisig'
import Select, { StylesConfig } from 'react-select';
import { Tag } from "rpcHooks/useTags";
import { selectTags } from "redux/slices/tags";
import { AltCoins, Coins } from "types";
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

export interface IFormInput {
    nftAddress?: string;
    nftTokenId?: number;
    name?: string;

}

const Pay = () => {
    const { register, handleSubmit } = useForm<IFormInput>();
    const storage = useSelector(selectStorage)
    const selectedAccount = useSelector(SelectSelectedAccount)
    const MyInputs = useSelector(SelectInputs)
    const [stream, setStream] = useState(false)

    const dispatch = useAppDispatch()
    const router = useRouter();
    const { GetCoins, blockchain, SendTransaction, SendBatchTransaction } = useWalletKit()

    const balance = useSelector(SelectBalances)
    const prevBalance = useRef(balance)

    const { submitTransaction } = useMultisig()

    const [isPaying, setIsPaying] = useState(false)
    const [isSuccess, setSuccess] = useState(false)
    const [selectedType, setSelectedType] = useState(false)
    const [selectedTags, setSelectedTags] = useState<Tag[]>([])

    const tags = useSelector(selectTags)
    const dark = useSelector(selectDarkMode)

    const [csvImport, setCsvImport] = useState<csvFormat[]>([]);

    const fileInput = useRef<HTMLInputElement>(null);

    const [selectedItem, setItem] = useState<DropDownItem>({ name: "Treasury vault", totalValue: '$4500', photo: "nftmonkey" })
    const paymentname: DropDownItem[] = [{ name: "CELO" }, { name: "SOLANA" }]
    const [selectedPayment, setSelectedPayment] = useState(paymentname[0])
    const paymentname2: DropDownItem[] = [{ name: "Security" }, { name: "Development" }]
    const [selectedPayment2, setSelectedPayment2] = useState(paymentname2[0])
    const paymentname3: DropDownItem[] = [{ name: "Pay with USD-based Amounts" }, { name: "Pay with Token Amounts" }]
    const [selectedPayment3, setSelectedPayment3] = useState(paymentname3[0])
    const paymentname4: DropDownItem[] = [{ name: "Days" }, { name: "Weeks" }, { name: "Months" }]
    const [selectedPayment4, setSelectedPayment4] = useState(paymentname4[0])

    useEffect(() => {
        return () => {
            dispatch(resetPayInput())
        }
    }, [])

    let totalBalance = useAppSelector(SelectTotalBalance)
    let balance2;
    if (totalBalance !== undefined) balance2 = parseFloat(`${totalBalance}`).toFixed(2)
    const balanceRedux = useAppSelector(SelectBalances)

    useEffect(() => {
        prevBalance.current = balance
    }, [balance])



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


    const Submit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsPaying(true)

        try {
            const result: Array<MultipleTransactionData> = []

            for (let index = 0; index < MyInputs.length; index++) {
                const one = MyInputs[index]
                if (one.address && one.amount && one.wallet?.name) {
                    let amount = one.amount;
                    if (selectedType) {
                        let value = (balance[one.wallet.name as keyof typeof balance]?.tokenPrice ?? 1)
                        amount = amount / value
                    }
                    result.push({
                        toAddress: one.address,
                        amount: amount.toFixed(4),
                        tokenName: one.wallet.name,
                    })
                }
            }
            if (!GetCoins) return
            if (storage?.lastSignedProviderAddress.toLowerCase() === selectedAccount.toLowerCase()) {
                if (result.length === 1) {
                    // await Pay({ coin: (isPrivate ? PoofCoins[result[0].tokenName as keyof PoofCoins] : CeloCoins[result[0].tokenName as keyof Coins]) as AltCoins, recipient: result[0].toAddress, amount: result[0].amount }, undefined, selectedTags)
                    await SendTransaction({ coin: GetCoins[result[0].tokenName as keyof Coins] as AltCoins, recipient: result[0].toAddress, amount: result[0].amount }, undefined, selectedTags)
                }
                else if (result.length > 1) {
                    const arr: Array<PaymentInput> = result.map(w => ({
                        coin: (GetCoins[w.tokenName as keyof Coins]) as AltCoins,
                        recipient: w.toAddress,
                        amount: w.amount,
                        from: true
                    }))

                    // await BatchPay(arr, undefined, selectedTags)
                    await SendBatchTransaction(arr, undefined, selectedTags)
                }
            } else {
                if (result.length === 1) {
                    await submitTransaction(selectedAccount, [{ recipient: result[0].toAddress, amount: result[0].amount, coin: GetCoins[result[0].tokenName as keyof Coins] }])
                }
                else if (result.length > 1) {
                    const arr: Array<PaymentInput> = result.map(w => ({
                        coin: GetCoins[w.tokenName as keyof Coins],
                        recipient: w.toAddress,
                        amount: w.amount,
                        from: true
                    }))

                    await submitTransaction(selectedAccount, arr)
                }
            }
            setSuccess(true);
            //refetch()

        } catch (error: any) {
            console.error(error)
            dispatch(changeError({ activate: true, text: error.message }));
        }

        setIsPaying(false);
    }




    const onChange = (value: any) => {
        setSelectedTags(value.map((s: SelectType) => ({ color: s.color, id: s.value, name: s.label, transactions: s.transactions, isDefault: s.isDefault })));
    }

    const onChangeType = (value: boolean) => {
        setSelectedType(value)
        dispatch(changeBasedValue(value))
    }


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



    const [openNotify, setNotify] = useState(false)
    const [openNotify2, setNotify2] = useState(false)

    const onSubmit: SubmitHandler<IFormInput> = data => {
        const Wallet = selectedItem
        const Budget = selectedPayment
        const subBudget = selectedPayment2
        console.log(Wallet, Budget, subBudget)

    }

    return <>
        <div className="overflow-hidden z-[9999] fixed  h-[87.5%] pr-1 w-[85%] overflow-y-auto  overflow-x-hidden bottom-0 right-0  cursor-default ">
            <div className="relative bg-light dark:bg-dark">
                <button onClick={() => { router.back() }} className=" absolute right-full w-[4rem] top-0 translate-x-[175%] translate-y-[25%] tracking-wider font-bold transition-all hover:text-primary hover:transition-all text-xl flex items-center gap-2">
                    {/* <img src="/icons/cross_greylish.png" alt="" /> */}
                    <span className="text-4xl pb-1">&#171;</span> Back
                </button>
                <form onSubmit={handleSubmit(onSubmit)} >
                    <div className="sm:flex flex-col items-center justify-center min-h-screen">
                        <div className="sm:min-w-[50vw] min-h-[75vh] h-auto ">
                            <div className="pt-12 pb-4 text-center w-full">
                                <div className="text-2xl font-bold">Remox Pay</div>
                            </div>
                            <div className="w-full flex justify-center py-4">
                                <div className="flex justify-between w-[30%] xl:w-[23%] "><AnimatedTabBar data={data} index={index} className={'!text-lg'} /></div>
                            </div>
                            <div className="w-full flex flex-col   px-3 py-2">
                                <div className={`grid ${index === 1 ? "grid-cols-[30%,30%,40%]" : "grid-cols-[40%,60%]"} `}>
                                    <div className="flex flex-col gap-2 mb-4 border-r">
                                        <div className="font-semibold text-lg text-greylish dark:text-white ">Total Treasury</div>
                                        <div className="text-2xl font-bold">{(balance2 && balanceRedux) || (balance2 !== undefined && parseFloat(balance2) === 0 && balanceRedux) ? `$${balance2} USD` : <Loader />}</div>

                                    </div>
                                    {index === 1 && <div className="flex flex-col gap-2 mb-4 border-r">
                                        <div className="font-semibold pl-5 text-lg text-greylish dark:text-white ">Wallet Balance</div>
                                        <div className="text-xl pl-5  font-bold">{(balance2 && balanceRedux) || (balance2 !== undefined && parseFloat(balance2) === 0 && balanceRedux) ? `$${balance2} USD` : <Loader />}</div>

                                    </div>}
                                    <div className="flex flex-col gap-2 mb-4">
                                        <div className="font-semibold pl-5 text-lg text-greylish dark:text-white ">Token Allocation</div>
                                        <div className="text-2xl font-bold">{(balance2 && balanceRedux) || (balance2 !== undefined && parseFloat(balance2) === 0 && balanceRedux) ? `$${balance2} USD` : <Loader />}</div>

                                    </div>
                                </div>
                            </div>
                            <div className="sm:flex flex-col gap-3  py-5 xl:py-10">
                                <div className="sm:flex flex-col  gap-y-10  ">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="flex flex-col">
                                            <span className="text-left pb-1 text-sm ml-1 font-semibold">Amount Type</span>
                                            <Dropdown parentClass={'bg-white dark:bg-darkSecond w-full rounded-lg h-[3.4rem]'} className={'!rounded-lg h-[3.4rem]'} list={paymentname3} selected={selectedPayment3} onSelect={(e) => {
                                                setSelectedPayment3(e)
                                            }} />

                                        </div>

                                        <div className="flex flex-col">
                                            <span className="text-left pb-1 text-sm ml-1 font-semibold">Transaction Tags</span>
                                            <div className="w-full  gap-x-3 sm:gap-x-10 ">
                                                {tags && tags.length > 0 && <Select
                                                    closeMenuOnSelect={true}
                                                    isMulti
                                                    isClearable={false}
                                                    options={tags.map(s => ({ value: s.id, label: s.name, color: s.color, transactions: s.transactions, isDefault: s.isDefault }))}
                                                    styles={colourStyles(dark)}
                                                // onChange={onChange}
                                                />}
                                                {tags.length === 0 && <div>No tag yet</div>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col">
                                        {/* <div className="flex space-x-5 sm:space-x-0 sm:justify-between py-4 items-center">
                                        <input ref={fileInput} type="file" className="hidden" onChange={(e) => e.target.files!.length > 0 ? CSV.Import(e.target.files![0]).then(e => setCsvImport(e)).catch(e => console.error(e)) : null} />
                                    </div> */}

                                        <div className="grid grid-cols-2  gap-8">
                                            {MyInputs.map((e, i) => {
                                                return <Input key={e.index} index={index} stream={stream} incomingIndex={e.index} />
                                            })
                                            }
                                        </div>
                                    </div>
                                    {index === 1 && <div className="w-full grid grid-cols-2 gap-8">
                                        <div className="w-full flex flex-col">
                                            <span className="text-left text-sm pb-1 ml-1 font-semibold">Start time</span>
                                            <div className="w-full grid grid-cols-[60%,35%] gap-5">
                                                <input type="date" className="w-full bg-white dark:bg-darkSecond border dark:border-darkSecond p-2 rounded-lg " />
                                                <input type="time" className="w-full bg-white dark:bg-darkSecond border dark:border-darkSecond p-2 rounded-lg" />
                                            </div>
                                        </div>

                                        <div className="w-full flex flex-col">
                                            <span className="text-left text-sm pb-1 ml-1 font-semibold">Completion time</span>
                                            <div className="w-full grid grid-cols-[60%,35%] gap-5 ">
                                                {stream && index === 1 ? <input type="date" className=" w-full border dark:border-darkSecond p-2 rounded-lg mr-5 bg-gray-300 dark:bg-gray-600" readOnly /> : <input type="date" className="w-full bg-white dark:bg-darkSecond border dark:border-darkSecond p-2 rounded-lg mr-5" />}
                                                {stream && index === 1 ? <input type="time" className="w-full border dark:border-darkSecond p-2 rounded-lg mr-5 bg-gray-300 dark:bg-gray-600" readOnly /> : <input type="time" className="w-full bg-white dark:bg-darkSecond border dark:border-darkSecond p-2 rounded-lg mr-5" />}
                                            </div>
                                        </div>
                                    </div>}

                                    <div className="py-5 sm:py-0 w-full gap-16">
                                        {index === 0 ? <div className="w-[50%] flex gap-4">
                                            <Button version="second" className="min-w-[12.5rem] bg-white text-left !px-6 font-semibold tracking-wide shadow-none" onClick={() => {
                                                dispatch(addPayInput({
                                                    index: shortid()
                                                }))
                                            }}>
                                                + Add More
                                            </Button>
                                            <Button version="second" onClick={() => {
                                                fileInput.current?.click()
                                            }} className="min-w-[12.5rem] bg-white text-left !px-6 font-semibold tracking-wide shadow-none">
                                                Import CSV file
                                            </Button>
                                        </div> : <div className="flex items-center">
                                            <label htmlFor="toggleB" className="flex items-center cursor-pointer">
                                                <div className="relative">
                                                    <input type="checkbox" id="toggleB" className="sr-only peer" onClick={() => { setStream(!stream) }} />
                                                    <div className="block bg-gray-600 peer-checked:bg-primary w-14 h-8 rounded-full"></div>
                                                    <div className="peer-checked:transform peer-checked:translate-x-full  absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition"></div>
                                                </div>
                                                <div className="ml-3 text-gray-700 dark:text-white font-semibold">
                                                    Enable Stream rate
                                                </div>
                                            </label>
                                        </div>}
                                    </div>
                                    {stream && index === 1 && <div className="w-full">
                                        <div className="font-semibold  pb-4">Stream Rate <span className="text-greylish">(Eg. 20 SOL per 2 weeks)</span></div>
                                        <div className="grid grid-cols-[31%,7%,31%,31%] items-center">
                                            <div className="w-full flex flex-col">
                                                <span className="text-left text-sm ml-1 font-semibold pb-1">Token Amount</span>
                                                <div className="w-full flex ">
                                                    <input type="number" className="bg-white dark:bg-darkSecond dark:border-none w-full border p-2 rounded-lg unvisibleArrow" placeholder="0.00" />
                                                </div>
                                            </div>
                                            <div className=" pt-7 mx-3 flex justify-center items-center">Per</div>
                                            <div className="w-full flex flex-col ">
                                                <span className="text-left text-sm ml-1 font-semibold pb-1">Number of times</span>
                                                <div className="w-full flex ">
                                                    <input type="number" className="bg-white dark:bg-darkSecond dark:border-darkSecond w-full border p-2 rounded-lg unvisibleArrow" placeholder="0.00" />
                                                </div>
                                            </div>
                                            <div className="flex flex-col ml-2">
                                                <span className="text-left text-sm ml-1 font-semibold pb-1">Time interval</span>
                                                <Dropdown parentClass={'bg-white dark:bg-darkSecond w-full rounded-lg '} className={'!rounded-lg !py-1 h-[2.75rem]'} list={paymentname4} selected={selectedPayment4} onSelect={(e) => {
                                                    setSelectedPayment4(e)
                                                }} />
                                            </div>
                                        </div>
                                    </div>}
                                    <div className="flex flex-col space-y-3">
                                        <span className="text-left">Description <span className="text-greylish">(Optional)</span></span>
                                        <div className="grid grid-cols-1">
                                            <textarea placeholder="Paid 50 CELO to Ermak....." className="border-2 dark:border-darkSecond rounded-xl p-3 outline-none dark:bg-darkSecond" name="description" id="" cols={28} rows={5}></textarea>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-center pt-5">
                                    <div className="flex flex-col-reverse sm:grid grid-cols-2 w-[12.5rem] sm:w-full justify-center gap-8">
                                        <Button version="second" onClick={() => setNotify2(false)}>Close</Button>
                                        <Button type="submit" className="bg-primary px-3 py-2 text-white flex items-center justify-center rounded-lg" isLoading={isPaying}>Send</Button>
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