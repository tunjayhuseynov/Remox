import { nanoid } from "@reduxjs/toolkit"
import Button from "components/button"
import { IAddressBook, IRemoxPayTransactions } from "firebaseConfig"
import useLoading from "hooks/useLoading"
import { IAccountORM } from "pages/api/account/index.api"
import { IPaymentInput } from "pages/api/payments/send/index.api"
import { useAppDispatch, useAppSelector } from "redux/hooks"
import { SelectAddressBooks, SelectFiatPreference, SelectFiatSymbol, SelectHistoricalPrices, SelectPriceCalculation } from "redux/slices/account/selector"
import { AltCoins } from "types"
import { AddressReducer, GetTime } from "utils"
import { generatePriceCalculation, GetFiatPrice } from "utils/const"
import { ToastRun } from "utils/toast"
import { IPaymentInputs } from "../[[...name]].page"
import { v4 as uuidv4 } from 'uuid'
import { useWalletKit } from "hooks"
import { Set_Address_Book } from "redux/slices/account/thunks/addressbook"
import { useRouter } from "next/router"
import { IBudgetORM, ISubbudgetORM } from "pages/api/budget/index.api"

interface IProps {
    data: IPaymentInputs[],
    account: IAccountORM | null,
    budget?: IBudgetORM,
    subbudget?: ISubbudgetORM,
    onBack: () => void
}
const CsvModal = ({ data, account, onBack, budget, subbudget }: IProps) => {
    const preference = useAppSelector(SelectFiatPreference)
    const hp = useAppSelector(SelectHistoricalPrices)
    const pc = useAppSelector(SelectPriceCalculation)
    const symbol = useAppSelector(SelectFiatSymbol)
    const { SendTransaction } = useWalletKit()

    let totalBalance = account?.coins.reduce((a, c) => {
        return a + generatePriceCalculation(c, hp, pc, preference);
    }, 0)

    let spending = data?.reduce((a, c) => {
        if (!c.coin) return a;
        let samount = c.second?.amount ?? 0;
        let scoin = c.second?.coin ?? c.coin;
        let price = generatePriceCalculation({ ...scoin, amount: samount ?? 0, coin: scoin }, hp, pc, preference)
        return a + generatePriceCalculation({ ...c.coin, amount: c.amount ?? 0, coin: c.coin }, hp, pc, preference) + price;
    }, 0)

    let allocation = data.reduce<{ [coin: string]: { coin: AltCoins, amount: number, remain: number } }>((a, c) => {
        if (!c.coin) return a;
        let accountAmount = account?.coins.find(x => x.symbol === c.coin?.symbol)?.amount ?? 0;
        let scoin = c.second
        if (scoin && scoin.coin) {
            if (!a[scoin.coin.symbol]) a[scoin.coin.symbol] = {
                coin: scoin.coin,
                amount: scoin.amount ?? 0,
                remain: accountAmount - (scoin.amount ?? 0)
            };
            else a[scoin.coin.symbol] = {
                coin: scoin.coin,
                amount: a[scoin.coin.symbol].amount + (scoin.amount ?? 0),
                remain: accountAmount - (a[scoin.coin.symbol].amount + (scoin.amount ?? 0))
            };
        }
        if (!a[c.coin.symbol]) a[c.coin.symbol] = {
            coin: c.coin,
            amount: c.amount ?? 0,
            remain: accountAmount - (c.amount ?? 0)
        };
        else a[c.coin.symbol] = {
            coin: c.coin,
            amount: a[c.coin.symbol].amount + (c.amount ?? 0),
            remain: accountAmount - (a[c.coin.symbol].amount + (c.amount ?? 0))
        };
        return a;
    }, {})

    const dispatch = useAppDispatch()
    const router = useRouter()

    const books = useAppSelector(SelectAddressBooks)


    const onSubmit = async () => {
        try {
            const Wallet = account
            if (!Wallet) throw new Error("No wallet selected")
            const Budget = budget
            const subBudget = subbudget


            let payTxs: IRemoxPayTransactions[] = []

            const pays: IPaymentInput[] = []
            const newAddressBooks: IAddressBook[] = []
            for (const input of data) {
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

            // let startDate: Date | null = null;
            // let endDate: Date | null = null;
            // if (startDateState) {
            //     startDate = new Date(startDateState)
            // }
            // if (endDateState) {
            //     endDate = new Date(endDateState)
            // }
            // if (index === 1 && (!startDate || !endDate)) {
            //     throw new Error("Please select start and end date")
            // }

            // let notes: INotes | undefined;

            // if (note || attachLink) {
            //     notes = {
            //         address: "",
            //         attachLink: attachLink ?? null,
            //         hashOrIndex: "",
            //         notes: note ?? null
            //     }
            // }


            await SendTransaction(Wallet, pays, {
                budget: Budget ?? undefined,
                subbudget: subBudget ?? undefined,
                createStreaming: false,//index === 1,
                endTime: undefined, //index === 1 && endDate ? GetTime(endDate) : undefined,
                startTime: undefined,//index === 1 && startDate ? GetTime(startDate) : undefined,
                tags: [], //selectedTags,
                notes: undefined, //notes,
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


    return <div className="px-10 pb-20">
        <h1 className="font-semibold text-2xl mb-7">Uploaded CSV</h1>
        <div>
            <table className="w-full" style={{
                emptyCells: "hide"
            }}>
                <tr className="pl-5 grid grid-cols-[20%,30%,50%] text-gray-500 dark:text-gray-300 text-sm font-normal bg-gray-100 dark:bg-darkSecond rounded-md">
                    <th className="py-2 self-center text-left">Name</th>
                    <th className="py-2 self-center text-left">Wallet Address</th>
                    <th className="py-2 self-center text-left">Amount</th>
                </tr>
                {data.map(s => {
                    return <>
                        <tr className="bg-white dark:bg-darkSecond py-[1.6875rem] pl-5 grid grid-cols-[20%,30%,50%] mt-5 rounded-md shadow-custom">
                            <td className="font-semibold text-sm text-greylish">
                                {s.name}
                            </td>
                            <td className="font-semibold text-sm text-greylish">
                                {AddressReducer(s.address ?? "")}
                            </td>
                            <td className="flex space-x-1 items-center font-medium">
                                <img src={s.coin?.logoURI} alt="" className="rounded-full object-cover w-5 aspect-square" />
                                <div> {s.amount}</div>
                            </td>
                        </tr>
                        {s.second && <tr className="bg-white dark:bg-darkSecond py-[1.6875rem] pl-5 grid grid-cols-[20%,30%,50%] mt-5 rounded-md shadow-custom">
                            <td className="font-semibold text-sm text-greylish">
                                {s.name}
                            </td>
                            <td className="font-semibold text-sm text-greylish">
                                {AddressReducer(s.address ?? "")}
                            </td>
                            <td className="flex space-x-1 items-center font-medium">
                                <img src={s.second.coin?.logoURI} alt="" className="rounded-full object-cover w-5 aspect-square" />
                                <div> {s.second.amount}</div>
                            </td>
                        </tr>}
                    </>
                })}
            </table>
        </div>
        {account &&
            <div className="bg-white dark:bg-darkSecond flex flex-col mt-7 px-5 py-5 min-h-[250px] relative">
                <div className="absolute h-[1px] bottom-16 left-0 w-[97.5%] translate-x-[1.25%] bg-[#D6D6D6] dark:bg-white"></div>
                <div className="font-semibold text-2xl mb-5">Review Treasury Impact</div>
                <div className="flex">
                    <div className="w-[30%]">
                        <div className="text-sm font-medium mb-3">Treasury Balance</div>
                        <div className="inline-flex flex-col">
                            <span className="font-medium text-2xl relative text-right">
                                {symbol}{totalBalance?.toFixed(2)}
                            </span>
                            <span className="font-medium text-xl mt-2 text-right">
                                -{spending.toFixed(2)}
                            </span>
                            <div className=" font-medium text-2xl mt-7 leading-none">
                                {symbol}{((totalBalance ?? 0) - spending).toFixed(2)}
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="text-sm font-medium mb-3">Token Allocation</div>
                        <div className="flex space-x-10">
                            {
                                Object.values(allocation).map(a => {

                                    return <div className="font-medium text-xl relative">
                                        <div className="flex space-x-1 items-center">
                                            <img src={a.coin.logoURI} alt="" className="w-6 h-6 rounded-full object-cover" />
                                            <span>{account.coins.find(s => s.symbol === a.coin.symbol)?.amount?.toFixed(2)}</span>
                                        </div>
                                        <div className="flex space-x-1 items-center mt-2">
                                            <img src={a.coin.logoURI} alt="" className="w-6 h-6 rounded-full object-cover" />
                                            <span>-{a.amount.toFixed(2)}</span>
                                        </div>
                                        <div className="font-medium text-xl flex items-center space-x-1 relative mt-7">
                                            <img src={a.coin.logoURI} alt="" className="w-6 h-6 rounded-full object-cover" />
                                            <span>{a.remain.toFixed(2)}</span>
                                        </div>
                                    </div>
                                })
                            }
                        </div>
                    </div>
                </div>
            </div>
        }
        <div className="flex justify-end space-x-5 mt-7">
            <Button className="!min-w-[15.625rem] h-[2.5rem]" onClick={onBack}>
                Cancel
            </Button>
            <Button className="!min-w-[15.625rem] h-[2.5rem]" isLoading={isLoading} onClick={() => submit()}>
                Send
            </Button>
        </div>
    </div>
}

export default CsvModal