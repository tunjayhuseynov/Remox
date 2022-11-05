import { useState, useRef, useEffect, useMemo } from "react";
import CSV, { csvFormat } from 'utils/CSV'
import { useSelector } from "react-redux";
import { useAppDispatch } from "redux/hooks";
import { SelectAccounts, SelectAddressBooks, SelectBalance, SelectDarkMode, SelectFiatPreference, SelectFiatSymbol, SelectPriceCalculationFn, SelectTotalBalance } from 'redux/slices/account/remoxData';
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
import { FiatMoneyList, IAddressBook, INotes, IRemoxPayTransactions } from "firebaseConfig";
import { nanoid } from "@reduxjs/toolkit";
import { AiOutlineDownload } from "react-icons/ai";
import { Tooltip } from "@mui/material";
import TextField from '@mui/material/TextField';
import Select from 'react-select';
import { Set_Address_Book } from "redux/slices/account/thunks/addressbook";
import { NG } from "utils/jsxstyle";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import moment from "moment";
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { IPrice } from "utils/api";
import { v4 as uuidv4 } from 'uuid';
import Modal from "components/general/modal";
import CsvModal from "./_components/csv";

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
    const fiatPreference = useAppSelector(SelectFiatPreference)

    const books = useAppSelector(SelectAddressBooks)

    const dispatch = useAppDispatch()

    const [startDateState, setStartDate] = useState<number>()

    const [endDateState, setEndDate] = useState<number>()

    const [note, setNote] = useState<string>()
    const [attachLink, setAttachLink] = useState<string>()

    const labels = useSelector(SelectTags)
    const dark = useAppSelector(SelectDarkMode)
    const coins = useAppSelector(SelectBalance)

    const [modalVisibility, setModalVisible] = useState(false)

    const router = useRouter();
    const { GetCoins, SendTransaction, blockchain } = useWalletKit()

    const symbol = useAppSelector(SelectFiatSymbol)

    const [selectedTags, setSelectedTags] = useState<ITag[]>([])

    const [csvImport, setCsvImport] = useState<csvFormat[]>([]);

    const fileInput = useRef<HTMLInputElement>(null);

    const [inputs, setInputs] = useState<IPaymentInputs[]>([
        {
            id: nanoid(),
            address: '',
            amount: null,
            coin: selectedAccountAndBudget.account?.coins.filter(s => s.amount > 0).reduce<{ [key: string]: IPrice[0] }>((acc, cur) => {
                acc[cur.coin.symbol] = cur
                return acc
            }, {})?.[0] ?? null,
            fiatMoney: null,
            second: null
        }
    ])

    const [csvInputs, setCsvInputs] = useState<IPaymentInputs[]>([

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
                    amount: (a[c.coin.symbol]?.amount || 0) + (c.amount / (c.fiatMoney ? GetFiatPrice(c.coin, c.fiatMoney) : 1))
                }
                if (c.second && c.second.amount && c.second.coin) {
                    a[c.second.coin.symbol] = {
                        coin: c.second.coin,
                        amount: (a[c.second.coin.symbol]?.amount || 0) + (c.second.amount / (c.second.fiatMoney ? GetFiatPrice(c.second.coin, c.second.fiatMoney) : 1))
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
            setCsvInputs(s => [...s, ...newInputs])
            // setRefreshPage(generate())
            fileInput.current!.files = new DataTransfer().files;
        }
    }, [csvImport])

    useEffect(() => {
        if (csvInputs.length > 0) {
            setModalVisible(true)
        }
    }, [csvInputs])


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

            let payTxs: IRemoxPayTransactions[] = []

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


                    payTxs.push({
                        id: uuidv4(),
                        amount: parsedAmount,
                        contract: Wallet.address,
                        contractType: Wallet.signerType,
                        customPrice: null,
                        fiat: fiatMoney,
                        fiatAmount: fiatMoney ? amount : null,
                        hashOrIndex: "",
                        isSendingOut: true,
                        priceCalculation: null,
                        timestamp: GetTime(),
                        token: coin.symbol,
                        second: second && second.amount && second.coin?.symbol ? {
                            amount: second.amount,
                            customPrice: null,
                            fiat: second.fiatMoney,
                            fiatAmount: second.fiatMoney ? (second.amount ?? 0) : null,
                            priceCalculation: null,
                            token: second.coin.symbol
                        } : null,
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
            if (startDateState) {
                startDate = new Date(startDateState)
            }
            if (endDateState) {
                endDate = new Date(endDateState)
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
                notes,
                payTransactions: payTxs
            })

            dispatch(Set_Address_Book([...books.filter(s => !newAddressBooks.find(w => w.name === s.name)), ...newAddressBooks]))

            ToastRun(<>Successfully processed. Wait for a confirmation</>, "success")
            router.push('/dashboard/transactions')
        } catch (error) {
            const message = (error as any).message || "Something went wrong"
            console.error(error)
            ToastRun(<>{message}</>, "error")
        }

    }

    const [isLoading, submit] = useLoading(onSubmit)

    const isSingle = selectedAccountAndBudget.account?.signerType === "single"


    const TotalBudget = useMemo(() => {
        const b = selectedAccountAndBudget.budget;
        if (!b) return null;
        const MainFiatPrice = GetFiatPrice(coins[b.token], fiatPreference)

        const fiatPrice = GetFiatPrice(coins[b.token], b.fiatMoney ?? fiatPreference)
        const totalAmount = b.budgetCoins.fiat ? b.budgetCoins.totalAmount / fiatPrice : b.budgetCoins.totalAmount
        const totalUsedAmount = b.budgetCoins.fiat ? b.budgetCoins.totalUsedAmount / fiatPrice : b.budgetCoins.totalUsedAmount
        const totalPendingAmount = b.budgetCoins.fiat ? b.budgetCoins.totalPending / fiatPrice : b.budgetCoins.totalPending

        const MainFiatPriceSecond = b.secondToken ? GetFiatPrice(coins[b.secondToken], fiatPreference) : 0

        const fiatPriceSecond = b.secondToken ? GetFiatPrice(coins[b.secondToken], b.secondFiatMoney ?? fiatPreference) : 0;
        const totalAmountSecond = b.budgetCoins.second?.fiat ? b.budgetCoins.second.secondTotalAmount / fiatPriceSecond : b.budgetCoins.second?.secondTotalAmount

        const totalUsedAmountSecond = b.budgetCoins.second?.fiat ? b.budgetCoins.second.secondTotalUsedAmount / fiatPriceSecond : b.budgetCoins.second?.secondTotalUsedAmount
        const totalPendingAmountSecond = b.budgetCoins.second?.fiat ? b.budgetCoins.second.secondTotalPending / fiatPriceSecond : b.budgetCoins.second?.secondTotalPending
        return {
            totalAmount: ((b.customPrice ?? MainFiatPrice) * totalAmount) + ((b.secondCustomPrice ?? MainFiatPriceSecond) * (totalAmountSecond ?? 0)),
            totalUsedAmount: ((b.customPrice ?? MainFiatPrice) * totalUsedAmount) + ((b.secondCustomPrice ?? MainFiatPriceSecond) * (totalUsedAmountSecond ?? 0)),
            totalPending: ((b.customPrice ?? MainFiatPrice) * totalPendingAmount) + ((b.secondCustomPrice ?? MainFiatPriceSecond) * (totalPendingAmountSecond ?? 0))
        }
    }, [])


    const TotalBudgetLabel = useMemo(() => {
        const b = selectedAccountAndBudget.subbudget;
        if (!b) return null;
        const MainFiatPrice = GetFiatPrice(coins[b.token], fiatPreference)

        const fiatPrice = GetFiatPrice(coins[b.token], b.fiatMoney ?? fiatPreference)
        const totalAmount = b.budgetCoins.fiat ? b.budgetCoins.totalAmount / fiatPrice : b.budgetCoins.totalAmount
        const totalUsedAmount = b.budgetCoins.fiat ? b.budgetCoins.totalUsedAmount / fiatPrice : b.budgetCoins.totalUsedAmount
        const totalPendingAmount = b.budgetCoins.fiat ? b.budgetCoins.totalPending / fiatPrice : b.budgetCoins.totalPending

        const MainFiatPriceSecond = b.secondToken ? GetFiatPrice(coins[b.secondToken], fiatPreference) : 0

        const fiatPriceSecond = b.secondToken ? GetFiatPrice(coins[b.secondToken], b.secondFiatMoney ?? fiatPreference) : 0;
        const totalAmountSecond = b.budgetCoins.second?.fiat ? b.budgetCoins.second.secondTotalAmount / fiatPriceSecond : b.budgetCoins.second?.secondTotalAmount

        const totalUsedAmountSecond = b.budgetCoins.second?.fiat ? b.budgetCoins.second.secondTotalUsedAmount / fiatPriceSecond : b.budgetCoins.second?.secondTotalUsedAmount
        const totalPendingAmountSecond = b.budgetCoins.second?.fiat ? b.budgetCoins.second.secondTotalPending / fiatPriceSecond : b.budgetCoins.second?.secondTotalPending
        return {
            totalAmount: ((b.customPrice ?? MainFiatPrice) * totalAmount) + ((b.secondCustomPrice ?? MainFiatPriceSecond) * (totalAmountSecond ?? 0)),
            totalUsedAmount: ((b.customPrice ?? MainFiatPrice) * totalUsedAmount) + ((b.secondCustomPrice ?? MainFiatPriceSecond) * (totalUsedAmountSecond ?? 0)),
            totalPending: ((b.customPrice ?? MainFiatPrice) * totalPendingAmount) + ((b.secondCustomPrice ?? MainFiatPriceSecond) * (totalPendingAmountSecond ?? 0))
        }
    }, [])

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
                    <div className="w-full px-3 py-3 bg-white dark:bg-darkSecond shadow-custom">
                        <div className={`grid grid-cols-[30%,30%,40%]`}>
                            <div className="flex flex-col gap-2 mb-4 border-r">
                                <div className="font-medium text-greylish dark:text-white text-sm">Total Treasury</div>
                                <div className="text-3xl font-medium leading-none">{`${symbol}`}<NG number={totalBalance} fontSize={1.75} /></div>
                            </div>
                            <div className="flex flex-col gap-2 mb-4 border-r pl-5">
                                <div className="font-medium text-greylish dark:text-white text-sm">Wallet Balance</div>
                                <div className="text-xl font-medium leading-none">{`${symbol}`}<NG number={walletBalance} fontSize={1.25} /></div>

                            </div>
                            <div className="flex flex-col gap-2 mb-4 pl-5">
                                <div className="font-medium  text-greylish dark:text-white text-sm">Token Allocation</div>
                                <div className="flex flex-col space-y-4">{tokenAllocation.map((s, i) => {
                                    return <div key={i} className="grid grid-cols-[8.5%,1fr] gap-x-1">
                                        <div className="self-center">
                                            <img className="rounded-full w-full aspect-square" src={s.coin.logoURI} alt={s.coin.name} />
                                        </div>
                                        <div>
                                            <div className="text-xl">{s.amount.toFixed(2)}</div>
                                        </div>
                                        <div></div>
                                        <div className="text-sm text-gray-400">{symbol}<NG number={s.fiatAmount} fontSize={0.875} /></div>
                                    </div>
                                })}
                                </div>
                            </div>
                        </div>
                    </div>
                    {selectedAccountAndBudget.budget && <div className="flex justify-center">
                        <div className={`mt-[1px] shadow-custom px-5 bg-white dark:bg-darkSecond py-2`}>
                            <div className="grid grid-cols-2">
                                <div className="flex flex-col gap-2 mb-4 border-r">
                                    <div className="font-medium text-greylish dark:text-white text-sm">Budget Balance</div>
                                    <div className="text-xl font-medium leading-none">{`${symbol}`}<NG number={(TotalBudget?.totalAmount ?? 0) - (TotalBudget?.totalPending ?? 0) + (TotalBudget?.totalUsedAmount ?? 0)} fontSize={1.25} /></div>
                                </div>
                                <div className="flex flex-col gap-2 mb-4 pl-5">
                                    <div className="font-medium text-greylish dark:text-white text-sm">Budget-label Balance</div>
                                    <div className="text-xl font-medium leading-none">{`${symbol}`}<NG number={(TotalBudgetLabel?.totalAmount ?? 0) - (TotalBudgetLabel?.totalPending ?? 0) + (TotalBudgetLabel?.totalUsedAmount ?? 0)} fontSize={1.25} /></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    }
                    <div className="sm:flex flex-col gap-3 py-5">
                        <div className="sm:flex flex-col gap-y-6">
                            <div className="flex flex-col">
                                <div className="font-semibold tracking-wide my-5">General</div>
                                <div className="flex flex-col space-y-10">
                                    {inputs.map((e, i) => <Input disableFiat={index === 1} account={selectedAccountAndBudget.account!} key={e.id} input={e} allowSecond={index === 0} length={inputs.length}
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
                                <div className="flex gap-4 items-center">
                                    <Button version="second" className="min-w-[8rem] bg-white !px-3 font-semibold tracking-wide shadow-none text-xs text-center" onClick={() => {
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
                                    }} className="min-w-[8rem] bg-white text-left !px-3 font-semibold tracking-wide shadow-none text-xs">
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
                                        <div className="bg-[#D6D6D6] dark:bg-greylish rounded-full p-1 cursor-pointer" onClick={() => {
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
                                        <span className="text-left text-xs pb-1 ml-1 font-medium">Start time</span>
                                        <LocalizationProvider dateAdapter={AdapterMoment}>
                                            <DateTimePicker
                                                value={startDateState}
                                                className="bg-white dark:bg-darkSecond"
                                                InputProps={{
                                                    style: {
                                                        fontSize: "0.875rem",
                                                    }
                                                }}
                                                onChange={(newValue) => setStartDate(moment(newValue).unix() * 1e3)}
                                                renderInput={(params) => (
                                                    <TextField {...params} />
                                                )}
                                            />
                                        </LocalizationProvider>
                                    </div>
                                    <div className="w-full flex flex-col">
                                        <span className="text-left text-xs pb-1 ml-1 font-medium">Completion time</span>
                                        <LocalizationProvider dateAdapter={AdapterMoment}>
                                            <DateTimePicker
                                                value={endDateState}
                                                className="bg-white dark:bg-darkSecond"
                                                InputProps={{
                                                    style: {
                                                        fontSize: "0.875rem",
                                                    }
                                                }}
                                                onChange={(newValue) => setEndDate(moment(newValue).unix() * 1e3)}
                                                renderInput={(params) => (
                                                    <TextField {...params} />
                                                )}
                                            />
                                        </LocalizationProvider>
                                    </div>
                                </div>}
                            <div>
                                <div className="font-semibold pb-5 pt-7">Details</div>
                                <div className="grid grid-cols-2 gap-x-10">
                                    <div>
                                        {labels && labels.length > 0 &&
                                            <Select
                                                closeMenuOnSelect={true}
                                                isMulti
                                                isClearable={false}
                                                placeholder="Select labels"
                                                options={labels.map(s => ({ value: s.id, label: s.name, color: s.color, transactions: s.transactions, isDefault: s.isDefault }))}
                                                styles={{
                                                    control: (styles: any) => {
                                                        return {
                                                            ...colourStyles(dark).control(styles),
                                                            backgroundColor: dark ? "#1F1F1F" : "white",
                                                            border: `1px solid ${dark ? "rgba(255, 255, 255, 0.23)" : "rgba(0,0,0,0.23)"}`,
                                                        }
                                                    },
                                                    option: (styles: any, { data, isDisabled, isFocused, isSelected }: any) => {
                                                        return {
                                                            ...colourStyles(dark).option(styles, { data, isDisabled, isFocused, isSelected }),
                                                            backgroundColor: dark ? "#1F1F1F" : "#FFFFFF",
                                                            ":hover": {
                                                                backgroundColor: dark ? "#707070" : "#eaeaea",
                                                                cursor: "pointer"
                                                            },
                                                        }
                                                    },
                                                    container: (styles: any) => {
                                                        return {
                                                            ...styles,
                                                            backgroundColor: dark ? "#1F1F1F" : "#F9F9F9",

                                                        }
                                                    },
                                                    multiValueLabel: (styles: any, { data }) => {
                                                        return {
                                                            ...styles,
                                                            color: data.color,
                                                            backgroundColor: dark ? "#1C1C1C" : "#F9F9F9",

                                                        }
                                                    },
                                                    multiValue: (styles: any, { data }) => {
                                                        return {
                                                            ...styles,
                                                            color: data.color,
                                                            backgroundColor: dark ? "#1C1C1C" : "#F9F9F9",

                                                        }
                                                    },
                                                    multiValueRemove: (styles: any) => {
                                                        return {
                                                            ...styles,
                                                            color: dark ? "white" : "black",
                                                            backgroundColor: dark ? "#1C1C1C" : "#F9F9F9",
                                                            ":hover": {
                                                                backgroundColor: dark ? "#707070" : "#eaeaea",
                                                            }

                                                        }
                                                    },
                                                    menuList: (styles: any) => {
                                                        return {
                                                            ...styles,
                                                            backgroundColor: dark ? "#1F1F1F" : "#FFFFFF",
                                                            border: `1px solid ${dark ? "rgba(255, 255, 255, 0.23)" : "rgba(0,0,0,0.23)"}`,

                                                        }
                                                    }
                                                }}
                                                className="h-full"
                                                onChange={onTagChange}
                                            />}
                                    </div>
                                    <div>
                                        <TextField
                                            InputProps={{ style: { fontSize: '0.875rem' } }}
                                            InputLabelProps={{ style: { fontSize: '0.875rem' } }}
                                            className="w-full bg-white dark:bg-darkSecond" label="Attach Link (Optional)" variant="outlined" onChange={(e) => setAttachLink(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col space-y-3">
                                <span className="text-left text-xs">Note <span className="text-greylish text-xs">(Optional)</span></span>
                                <div className="grid grid-cols-1">
                                    <textarea placeholder="Paid 50 CELO to Ermak....." onChange={(e) => setNote(e.target.value)} className="border-2 dark:border-darkSecond rounded-xl p-3 outline-none dark:bg-darkSecond text-xs" name="description" id="" cols={28} rows={5}></textarea>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center pt-5">
                            <div className="flex flex-col-reverse w-[12.5rem] sm:w-full justify-center gap-8">
                                {/* <Button version="second" onClick={() => router.back()}>Close</Button> */}
                                <Button type="submit" className="bg-primary px-3 py-2 text-white flex items-center justify-center rounded-lg" isLoading={isLoading} onClick={() => submit()}>Send</Button>
                            </div>
                        </div>
                        {index === 1 && <div className="flex space-x-1 justify-center text-xxs font-medium text-greylish mt-2">
                            <span>Powered by</span>
                            <img src={blockchain.streamingProtocols[0].secondLogoUrl ?? blockchain.streamingProtocols[0].logoURL} alt="" />
                        </div>}
                    </div>
                </div>
            </div>
            <Modal onDisable={setModalVisible} disableX openNotify={modalVisibility} className="z-[99999999]">
                <CsvModal account={selectedAccountAndBudget.account} data={csvInputs} />
            </Modal>
        </div>
    </>

}

export default Pay;