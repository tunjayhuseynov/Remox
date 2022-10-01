import { useState, useRef, useEffect, useMemo } from "react";
import CSV, { csvFormat } from 'utils/CSV'
import { useSelector } from "react-redux";
import { useAppDispatch } from "redux/hooks";
import { SelectAccounts, SelectAddressBooks, SelectBalance, SelectDarkMode, SelectFiatSymbol, SelectPriceCalculationFn, SelectTotalBalance } from 'redux/slices/account/remoxData';
import Button from "components/button";
import { AltCoins, Coins } from "types";
import { useWalletKit } from "hooks";
import { useRouter } from "next/router";
import AnimatedTabBar from 'components/animatedTabBar';
import { useAppSelector } from 'redux/hooks';
import { SelectType, colourStyles, GetFiatPrice } from "utils/const";
import { SelectSelectedAccountAndBudget, SelectTags } from "redux/slices/account/remoxData";
import useLoading from "hooks/useLoading";
import { IPaymentInput } from "pages/api/payments/send/index.api";
import { ITag } from "pages/api/tags/index.api";
import { ToastRun } from "utils/toast";
import { GetTime, SetComma } from "utils";
import Input from "./_components/payinput";
import { FiatMoneyList, IAddressBook, INotes } from "firebaseConfig";
import { nanoid } from "@reduxjs/toolkit";
import { AiOutlineDownload } from "react-icons/ai";
import { Tooltip } from "@mui/material";
import TextField from '@mui/material/TextField';
import Select from 'react-select';
import { Set_Address_Book } from "redux/slices/account/thunks/addressbook";

export interface IPaymentInputs {
    id: string,
    name?: string;
    address: string | null;
    amount: number | null;
    coin: AltCoins | null;
    fiatMoney: FiatMoneyList | null,
    second: {
        amount: number | null;
        coin: AltCoins | null;
        fiatMoney: FiatMoneyList | null,
    } | null
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

const Pay = () => {

    const totalBalance = useAppSelector(SelectTotalBalance)
    const accounts = useAppSelector(SelectAccounts)
    const selectedAccountAndBudget = useAppSelector(SelectSelectedAccountAndBudget)
    const priceCalculation = useAppSelector(SelectPriceCalculationFn)

    const books = useAppSelector(SelectAddressBooks)

    const dispatch = useAppDispatch()

    const [startDateState, setStartDate] = useState<string>()
    const [startTime, setStartTime] = useState<string>()

    const [endDateState, setEndDate] = useState<string>()
    const [endTime, setEndTime] = useState<string>()

    const [note, setNote] = useState<string>()
    const [attachLink, setAttachLink] = useState<string>()

    const labels = useSelector(SelectTags)
    const dark = useAppSelector(SelectDarkMode)
    const coins = useAppSelector(SelectBalance)

    const router = useRouter();
    const { GetCoins, SendTransaction } = useWalletKit()

    const symbol = useAppSelector(SelectFiatSymbol)

    const [selectedTags, setSelectedTags] = useState<ITag[]>([])

    const [csvImport, setCsvImport] = useState<csvFormat[]>([]);

    const fileInput = useRef<HTMLInputElement>(null);

    const [inputs, setInputs] = useState<IPaymentInputs[]>([
        {
            id: nanoid(),
            address: '',
            amount: null,
            coin: null,
            fiatMoney: null,
            second: null
        }
    ])

    const walletBalance = useMemo(() => {
        const coins = accounts.find(s => s.id === selectedAccountAndBudget.account?.id)?.coins
        if (coins) {
            return coins.reduce((a, c) => {
                return a + priceCalculation(c);
            }, 0)
        }
        return 0;
    }, [selectedAccountAndBudget])

    const tokenAllocation = useMemo(() => {
        const coins = inputs.reduce<{
            [name: string]: {
                coin: AltCoins,
                amount: number
            }
        }>((a, c) => {
            if (c.amount && c.coin) {
                a[c.coin.symbol] = {
                    coin: c.coin,
                    amount: (a[c.coin.symbol]?.amount || 0) + c.amount
                }
                if (c.second && c.second.amount && c.second.coin) {
                    a[c.second.coin.symbol] = {
                        coin: c.second.coin,
                        amount: (a[c.second.coin.symbol]?.amount || 0) + c.second.amount
                    }
                }
            }
            return a;
        }, {})
        return Object.entries(coins).map(([key, value]) => {
            return {
                ...value,
                fiatAmount: priceCalculation(null, { altcoin: value.coin, amount: value.amount })
            }
        })
    }, [inputs])




    useEffect(() => {
        if (csvImport.length > 0 && GetCoins) {
            console.log(csvImport)
            const list = csvImport.filter(w => w["Wallet address"] && w["Amount 1"] && w["Token 1 id"])
            const newInputs: IPaymentInputs[] = []
            for (let index = 0; index < list.length; index++) {
                const { "Name (optional)": name, "Wallet address": address, "Amount 1": amount, "Token 1 id": coin, "Amount 2 (opt.)": amount2, "Token 2 id (opt.)": coin2 } = list[index]

                let newInput: IPaymentInputs = {
                    id: nanoid(),
                    name,
                    address,
                    amount: parseFloat(amount || "0"),
                    coin: coins[coin as keyof Coins],
                    fiatMoney: null,
                    second: amount2 && coin2 ? {
                        amount: parseFloat(amount2 || "0"),
                        coin: coins[coin2 as keyof Coins],
                        fiatMoney: null,
                    } : null
                }
                newInputs.push(newInput)
            }
            setInputs(s => [...s, ...newInputs])
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

    const onSubmit = async () => {
        try {
            const Wallet = selectedAccountAndBudget.account
            if (!Wallet) throw new Error("No wallet selected")
            const Budget = selectedAccountAndBudget.budget
            const subBudget = selectedAccountAndBudget.subbudget

            const pays: IPaymentInput[] = []
            const newAddressBooks: IAddressBook[] = []
            for (const input of inputs) {
                const { amount, address, coin, fiatMoney, id, second, name } = input;
                if (name && address) {
                    newAddressBooks.push({
                        id: nanoid(),
                        name,
                        address,
                    })
                }

                let parsedAmount = amount;
                if (fiatMoney && coin && amount) {
                    parsedAmount = amount / GetFiatPrice(coin, fiatMoney)
                }
                if (coin && parsedAmount && address) {
                    pays.push({
                        coin: coin.symbol,
                        recipient: address,
                        amount: parsedAmount,
                    })
                }
                if (second && second.coin && second.amount && address) {
                    let parsedAmount = second.amount;
                    if (second.fiatMoney && second.coin && second.amount) {
                        parsedAmount = second.amount / GetFiatPrice(second.coin, second.fiatMoney)
                    }
                    pays.push({
                        coin: second.coin.symbol,
                        recipient: address,
                        amount: parsedAmount,
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

            let notes: INotes | undefined;

            if (note || attachLink) {
                notes = {
                    address: "",
                    attachLink: attachLink ?? null,
                    hashOrIndex: "",
                    notes: note ?? null
                }
            }

            await SendTransaction(Wallet, pays, {
                budget: Budget ?? undefined,
                subbudget: subBudget ?? undefined,
                createStreaming: index === 1,
                endTime: index === 1 && endDate ? GetTime(endDate) : undefined,
                startTime: index === 1 && startDate ? GetTime(startDate) : undefined,
                tags: selectedTags,
                notes
            })

            dispatch(Set_Address_Book([...books.filter(s => !newAddressBooks.find(w => w.name === s.name)), ...newAddressBooks]))

            ToastRun(<>Successfully processed. Wait for a confirmation</>, "success")
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
                <div className="w-[40vw] min-h-[75vh] h-auto mx-auto">
                    <div className="pb-4 text-center w-full">
                        <div className="text-2xl font-bold">Remox Pay</div>
                    </div>
                    <div className="w-full flex justify-center py-4">
                        <div className="flex justify-between w-[45%] ">
                            <AnimatedTabBar data={data} index={index} className={'!text-lg'} />
                        </div>
                    </div>
                    <div className="w-full flex flex-col p-5 bg-white dark:bg-darkSecond shadow-custom">
                        <div className={`grid grid-cols-[30%,30%,40%]`}>
                            <div className="flex flex-col gap-2 mb-4 border-r">
                                <div className="font-medium text-greylish dark:text-white ">Total Treasury</div>
                                <div className="text-3xl font-bold">{`${symbol}${SetComma(totalBalance)}`}</div>
                            </div>
                            <div className="flex flex-col gap-2 mb-4 border-r pl-5">
                                <div className="font-medium text-greylish dark:text-white ">Wallet Balance</div>
                                <div className="text-xl font-bold">{`${symbol}${SetComma(walletBalance)}`}</div>

                            </div>
                            <div className="flex flex-col gap-2 mb-4 pl-5">
                                <div className="font-medium  text-greylish dark:text-white ">Token Allocation</div>
                                <div className="flex flex-col space-y-4">{tokenAllocation.map((s, i) => {
                                    return <div key={i} className="grid grid-cols-[8.5%,1fr] gap-x-2">
                                        <div className="self-center">
                                            <img className="rounded-full w-full aspect-square" src={s.coin.logoURI} alt={s.coin.name} />
                                        </div>
                                        <div className="flex flex-col">
                                            <div>{s.amount}</div>
                                            <div className="text-xs text-gray-400">{symbol}{s.fiatAmount.toLocaleString()}</div>
                                        </div>
                                    </div>
                                })}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="sm:flex flex-col gap-3 py-5 xl:py-10">
                        <div className="sm:flex flex-col gap-y-10">
                            <div className="flex flex-col">
                                <div className="text-xl font-semibold tracking-wide mb-5">General</div>
                                <div>
                                    {inputs.map((e, i) => <Input key={e.id} input={e} allowSecond={index === 0} length={inputs.length}
                                        onDelete={() => {
                                            if (inputs.length > 1) {
                                                setInputs(inputs.filter((r, index) => r.id !== e.id))
                                            }
                                        }}
                                        onDeleteSecond={() => {
                                            setInputs(inputs.map((input, index) => {
                                                if (e.id === input.id) {
                                                    return { ...input, second: null }
                                                }
                                                return input;
                                            }))
                                        }}
                                        onChange={(amount, address, coin, fiat, name, amountSecond, coinSecond, fiatSecond) => {
                                            setInputs(inputs.map((input, index) => {
                                                if (input.id === e.id) {
                                                    return {
                                                        ...input, amount, address, coin, fiatMoney: fiat, name: name ?? undefined, second: amountSecond ?
                                                            {
                                                                amount: amountSecond,
                                                                coin: coinSecond,
                                                                fiatMoney: fiatSecond
                                                            } : null
                                                    }
                                                }
                                                return input;
                                            }))
                                        }}
                                        addressBook={books}
                                    />
                                    )}
                                </div>
                            </div>
                            {index === 0 && <div className="py-5 sm:py-0 w-full gap-16">
                                <div className="w-[50%] flex gap-4 items-center">
                                    <Button version="second" className="min-w-[11rem] bg-white text-left !px-6 font-semibold tracking-wide shadow-none" onClick={() => {
                                        setInputs([...inputs, {
                                            id: nanoid(),
                                            amount: null,
                                            address: null,
                                            coin: Object.values(coins)[0],
                                            fiatMoney: null,
                                            name: undefined,
                                            second: null
                                        }])
                                    }}>
                                        Add receiver
                                    </Button>
                                    <Button version="second" onClick={() => {
                                        fileInput.current?.click()
                                    }} className="min-w-[11rem] bg-white text-left !px-6 font-semibold tracking-wide shadow-none">
                                        Import CSV file
                                    </Button>
                                    <input ref={fileInput} type={'file'} className="hidden" onChange={async (e) => {
                                        try {
                                            if (e.target.files && e.target.files[0]) {
                                                const res = await CSV.Import(e.target.files[0])
                                                setCsvImport(res)
                                            }
                                        } catch (error) {
                                            ToastRun(<>{(error as any)?.message}</>, "error")
                                            fileInput.current!.files = new DataTransfer().files;
                                        }
                                    }} />
                                    <Tooltip title="Download an example file">
                                        <div className="bg-greylish rounded-full p-1 cursor-pointer" onClick={() => {
                                            window.open("/Example/Remox_Example.csv")
                                        }}>
                                            <AiOutlineDownload />
                                        </div>
                                    </Tooltip>
                                </div>
                            </div>}
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
                                            }} className=" w-full border dark:border-darkSecond p-2 rounded-lg mr-5 dark:bg-darkSecond" />
                                            <input type="time" onChange={(e) => {
                                                setEndTime(e.target.value)
                                            }} className="w-full border dark:border-darkSecond p-2 rounded-lg mr-5 dark:bg-darkSecond" />
                                        </div>
                                    </div>
                                </div>}
                            <div>
                                <div className="text-xl font-semibold">Details</div>
                                <div className="grid grid-cols-2 gap-x-10">
                                    <div>
                                        {labels && labels.length > 0 &&
                                            <Select
                                                closeMenuOnSelect={true}
                                                isMulti
                                                isClearable={false}
                                                options={labels.map(s => ({ value: s.id, label: s.name, color: s.color, transactions: s.transactions, isDefault: s.isDefault }))}
                                                styles={{
                                                    control: (styles: any) => {
                                                        return {
                                                            ...colourStyles(dark).control(styles),
                                                            backgroundColor: dark ? "#1F1F1F" : "#F9F9F9",
                                                        }
                                                    },
                                                    option: (styles: any, { data, isDisabled, isFocused, isSelected }: any) => {
                                                        return {
                                                            ...colourStyles(dark).option(styles, { data, isDisabled, isFocused, isSelected }),
                                                            backgroundColor: dark ? "#1F1F1F" : "#F9F9F9",
                                                        }
                                                    },
                                                }}
                                                className="h-full"
                                                onChange={onTagChange}
                                            />}
                                    </div>
                                    <div>
                                        <TextField className="w-full bg-white dark:bg-darkSecond" label="Attach Link (Optional)" variant="outlined" onChange={(e) => setAttachLink(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col space-y-3">
                                <span className="text-left">Note <span className="text-greylish">(Optional)</span></span>
                                <div className="grid grid-cols-1">
                                    <textarea placeholder="Paid 50 CELO to Ermak....." onChange={(e) => setNote(e.target.value)} className="border-2 dark:border-darkSecond rounded-xl p-3 outline-none dark:bg-darkSecond" name="description" id="" cols={28} rows={5}></textarea>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center pt-5">
                            <div className="flex flex-col-reverse sm:grid grid-cols-2 w-[12.5rem] sm:w-full justify-center gap-8">
                                <Button version="second" onClick={() => router.back()}>Close</Button>
                                <Button type="submit" className="bg-primary px-3 py-2 text-white flex items-center justify-center rounded-lg" isLoading={isLoading} onClick={() => submit()}>Send</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>

}

export default Pay;