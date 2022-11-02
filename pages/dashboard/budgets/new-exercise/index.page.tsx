import React, { useState } from 'react'
import Button from '../../../../components/button';
import { useForm, SubmitHandler } from "react-hook-form";
import Dropdown from "components/general/dropdown";
import { DropDownItem } from "types";
import { useWalletKit } from 'hooks';
import { GetTime } from 'utils';
import { process } from 'uniqid'
import { ToastRun } from 'utils/toast';
import useLoading from 'hooks/useLoading';
import { useRouter } from 'next/router';
import { useAppDispatch, useAppSelector } from 'redux/hooks';
import { Create_Budget_Exercise_Thunk } from 'redux/slices/account/thunks/budgetThunks/budgetExercise';
import { SelectAccountType, SelectCurrencies, SelectDarkMode, SelectFiatPreference, SelectPriceCalculation, SelectRemoxAccount } from 'redux/slices/account/selector';
import { TextField } from '@mui/material';
import DatePicker from 'react-multi-date-picker';
import DatePanel from 'react-multi-date-picker/plugins/date_panel';
import dateFormat from 'dateformat'
import datentime from 'date-and-time'
import PriceInputField from 'components/general/PriceInputField';
import { FiatMoneyList } from 'firebaseConfig';
import { AiOutlinePlusCircle } from 'react-icons/ai';
import { IoMdRemoveCircle } from 'react-icons/io';

interface IFormInput {
    name: string;
    from?: Date;
    to?: Date;
}

function NewExercise() {

    const { register, handleSubmit } = useForm<IFormInput>();

    const paymentType: DropDownItem[] = [{ name: "Current full year" }, { name: "Custom period" }]
    // const [selectedPayment, setSelectedPayment] = useState(paymentType[0])
    const { blockchain } = useWalletKit()
    const fiatMoney = useAppSelector(SelectFiatPreference)
    const coins = useAppSelector(SelectCurrencies)

    const [anotherToken, setAnotherToken] = useState(false)
    const [budgetAmount, setBudgetAmount] = useState<number | null>(null)
    const [budgetAmount2, setBudgetAmount2] = useState<number | null>(null)
    const [budgetCoin, setBudgetCoin] = useState(Object.values(coins)[0])
    const [budgetCoin2, setBudgetCoin2] = useState(Object.values(coins)[0])
    const [budgetFiat, setBudgetFiat] = useState<FiatMoneyList>(fiatMoney)
    const [budgetFiat2, setBudgetFiat2] = useState<FiatMoneyList>(fiatMoney)

    const [customPrice, setCustomPrice] = useState<number | null>(null)
    const [customPrice2, setCustomPrice2] = useState<number | null>(null)


    const priceCalculation = useAppSelector(SelectPriceCalculation)

    const PC = priceCalculation == "current" ? "Current Price" : `${priceCalculation} days average price`

    const [selectedPriceOption, setSelectedPriceOption] = useState({ name: PC, displayName: PC })
    const [selectedPriceOption2, setSelectedPriceOption2] = useState({ name: PC, displayName: PC })

    const [date, setDate] = useState<number[]>([])

    const remoxAccount = useAppSelector(SelectRemoxAccount)
    const remoxAccountType = useAppSelector(SelectAccountType)

    const navigate = useRouter()
    const dark = useAppSelector(SelectDarkMode)
    const dispatch = useAppDispatch()
    let today = new Date()
    let From = today.getFullYear() + '/' + (today.getMonth() + 1) + '/' + today.getDate();
    let To = (today.getFullYear() + 1) + '/' + (today.getMonth() + 1) + '/' + today.getDate();


    const onSubmit: SubmitHandler<IFormInput> = async (data) => {
        try {
            if (!remoxAccountType) return ToastRun(<>Please. sign in first</>, "warning")
            if (!budgetAmount) return ToastRun(<>Please, enter an amount</>, "warning")
            if (selectedPriceOption.name === "Custom Price" && !customPrice) {
                return ToastRun(<>Please, enter a custom price</>, "warning")
            }
            if (selectedPriceOption2.name === "Custom Price" && !customPrice) {
                return ToastRun(<>Please, enter a custom price</>, "warning")
            }
            if (anotherToken && !budgetAmount2) return ToastRun(<>Please. enter an amount for the second token</>, "warning")
            if (!remoxAccount) throw new Error("No remox account found")
            // if (selectedPayment.name === "Custom period" && (!date[0] || !date[1])) throw new Error("Custom period has not been selected")
            const fromDate = date[0] ? new Date(date[0]) : new Date(From);
            const toDate = date[1] ? new Date(date[1]) : new Date(To);

            await dispatch(Create_Budget_Exercise_Thunk({
                budgetExercise: {
                    blockchain: blockchain.name,
                    budgets: [],
                    created_at: GetTime(),
                    from: GetTime(fromDate),
                    to: GetTime(toDate),
                    id: process(),
                    name: data.name,
                    parentId: remoxAccount.id,
                    parentType: remoxAccountType,
                    coins: {
                        amount: budgetAmount,
                        calculation: selectedPriceOption.name,
                        fiat: budgetFiat,
                        coin: budgetCoin.symbol,
                        customPrice: customPrice,
                        second: anotherToken ? {
                            amount: budgetAmount2,
                            calculation: selectedPriceOption2.name,
                            fiat: budgetFiat2,
                            coin: budgetCoin2.symbol,
                            customPrice: customPrice2
                        } : null
                    }
                },
                remoxAccount,
                remoxAccountType,
            })).unwrap()
            navigate.push('/dashboard/budgets')
        } catch (error) {
            console.error(error as any)
            ToastRun(<div>{(error as any).message}</div>, "error")
        }
    };

    const [isLoading, submit] = useLoading(onSubmit)

    return <div className="w-full relative">
        <form onSubmit={handleSubmit(submit)} className="w-3/5 mx-auto pt-10">
            <div className="text-xl text-center font-medium py-6">Define your budgetary exercise</div>
            <div className="px-12 flex flex-col space-y-6">
                <TextField
                    InputProps={{
                        style: {
                            fontSize: '0.75rem'
                        }
                    }}
                    InputLabelProps={{
                        style: {
                            fontSize: '0.75rem'
                        }
                    }}
                    type="text"
                    {...register("name", { required: true })}
                    label="Name  of your budgetary exercise"
                    className="w-full py-2 px-1 rounded-lg bg-white dark:bg-darkSecond"
                />
                {(budgetFiat) && <div>
                    <div className={`grid ${selectedPriceOption.name === "Custom Price" ? "grid-cols-2" : ""} gap-x-5`}>
                        <Dropdown
                            sx={{
                                fontSize: "0.75rem"
                            }}
                            labelSX={{
                                fontSize: "0.75rem"
                            }}
                            label="Token Price Calculation"
                            textClass='text-xs'
                            list={[
                                { name: "current", displayName: "Current Price" },
                                { name: "5", displayName: "5 days average" },
                                { name: "10", displayName: "10 days average" },
                                { name: "15", displayName: "15 days average" },
                                { name: "20", displayName: "20 days average" },
                                { name: "30", displayName: "30 days average" },
                                { name: "Custom Price", displayName: "Custom Price" }
                            ]}
                            setSelect={setSelectedPriceOption}
                            selected={selectedPriceOption}
                            className="bg-white dark:bg-darkSecond"
                        />
                        {selectedPriceOption.name === "Custom Price" && <TextField
                            InputProps={{ style: { fontSize: '0.75rem' } }}
                            InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                            className="w-full bg-white dark:bg-darkSecond" type={'number'} inputProps={{ step: 0.01 }} label="Custom Price" variant="outlined" onChange={(e) => setCustomPrice(+e.target.value)} />}
                    </div>
                </div>}

                <PriceInputField coins={coins} defaultFiat={fiatMoney} textSize={0.75} disableFiatNoneSelection onChange={(val, coin, fiat) => {
                    setBudgetAmount(val)
                    setBudgetCoin(coin)
                    if (fiat) {
                        setBudgetFiat(fiat)
                    }
                }} />


                {anotherToken ? <div className="relative flex flex-col space-y-6">
                    {(budgetFiat2) && <div>
                        <div className={`grid ${selectedPriceOption2.name === "Custom Price" ? "grid-cols-2" : ""} gap-x-5`}>
                            <Dropdown
                                sx={{
                                    fontSize: "0.75rem"
                                }}
                                labelSX={{
                                    fontSize: "0.75rem"
                                }}
                                label="Token Price Calculation"
                                list={[
                                    { name: "current", displayName: "Current Price" },
                                    { name: "5", displayName: "5 days average" },
                                    { name: "10", displayName: "10 days average" },
                                    { name: "15", displayName: "15 days average" },
                                    { name: "20", displayName: "20 days average" },
                                    { name: "30", displayName: "30 days average" },
                                    { name: "Custom Price", displayName: "Custom Price" }
                                ]}
                                setSelect={setSelectedPriceOption2}
                                selected={selectedPriceOption2}
                                className="bg-white dark:bg-darkSecond"
                                textClass="text-xs"
                            />
                            {selectedPriceOption2.name === "Custom Price" && <TextField
                                InputProps={{ style: { fontSize: '0.75rem' } }}
                                InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                className="w-full bg-white dark:bg-darkSecond" type={'number'} inputProps={{ step: 0.01 }} label="Custom Price" variant="outlined" onChange={(e) => setCustomPrice2(+e.target.value)} />}
                        </div>
                    </div>}
                    <div>
                        <PriceInputField textSize={0.75} isMaxActive defaultFiat={budgetFiat2} disableFiatNoneSelection coins={coins} onChange={(val, coin, fiatMoney) => {
                            setBudgetAmount2(val)
                            setBudgetCoin2(coin)
                            if (fiatMoney) {
                                setBudgetFiat2(fiatMoney)
                            }
                        }} />

                        <div className="absolute -right-6 top-5 cursor-pointer" onClick={() => {
                            setAnotherToken(false)
                            setBudgetAmount2(null)
                        }}>
                            <IoMdRemoveCircle color="red" />
                        </div>
                    </div>
                </div> :
                    <div className="col-span-2 relative cursor-pointer grid grid-cols-[20%,80%] gap-x-1 w-[5rem] text-sm !mt-2" onClick={() => setAnotherToken(true)}>
                        <div className="self-center">
                            <AiOutlinePlusCircle className='text-primary' />
                        </div>
                        <span className="text-primary font-semibold">Add</span>
                    </div>
                }
                <div>
                    <DatePicker render={<CustomRangeInput />} placeholder="-/-/-" plugins={[<DatePanel sort="date" />]} containerClassName="w-full dark:bg-darkSecond bg-white" value={date} onChange={(data) => {
                        if (Array.isArray(data)) {
                            setDate(data.map(s => s.toDate().getTime()))
                        }
                    }} range={true} className={`w-full`} style={
                        {
                            height: "3.25rem",
                            width: "100%",
                        }
                    } />
                </div>

                <div className="flex flex-col-reverse sm:grid grid-cols-2 w-full justify-center gap-12 pt-6">
                    <Button version="second" className="!rounded-xl !text-sm" onClick={() => navigate.back()}>Cancel</Button>
                    <Button isLoading={isLoading} type="submit" className="bg-primary !text-sm !rounded-xl !px-0 py-2 text-white flex items-center justify-center" >Save</Button>
                </div>
            </div>

        </form>
    </div>
}
function CustomRangeInput({ openCalendar, value }: any) {
    let from = value[0] || ""
    let to = value[1] || ""
    console.log(value)
    value = from && to ? "From " + from + " to " + to : from

    return (
        <input
            className='dark:bg-darkSecond h-14 pl-3 text-xs border border-gray-300 dark:border-gray-600 w-full rounded-md'
            onFocus={openCalendar}
            value={value}
            placeholder="From -/-/- to -/-/-"
            readOnly
        />
    )
}

export default NewExercise