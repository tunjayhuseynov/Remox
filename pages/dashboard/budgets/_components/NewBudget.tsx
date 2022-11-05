import React, { useState } from 'react'
import Dropdown from "../../../../components/general/dropdown";
import { useWalletKit } from "../../../../hooks";
import Button from '../../../../components/button';
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { generate } from 'shortid'
import { SelectCurrencies, SelectHistoricalPrices, SelectPriceCalculation, SelectPriceCalculationFn } from 'redux/slices/account/remoxData';

import { AltCoins } from 'types/coins';
import { SubmitHandler } from "react-hook-form";
import { GetTime } from 'utils';
import useLoading from 'hooks/useLoading';
import { Create_Budget_Thunk } from 'redux/slices/account/thunks/budgetThunks/budget';
import { AiOutlinePlusCircle } from 'react-icons/ai'
import { Step, StepLabel, Stepper } from '@mui/material';
import TextField from '@mui/material/TextField';
import PriceInputField, { fiatList } from 'components/general/PriceInputField';
import { IoMdRemoveCircle } from 'react-icons/io';
import { FiatMoneyList, IBudget, IBudgetExercise } from 'firebaseConfig';
import { ToastRun } from 'utils/toast';
import { nanoid } from '@reduxjs/toolkit';
import FormHelperText from '@mui/material/FormHelperText';
import { BiTrash } from 'react-icons/bi';
import { generateTokenPriceCalculation, GetFiatPrice } from 'utils/const';

export interface ISubInputs {
    id: string;
    name: string;
    amount: number;
    amount2: number;
    wallet: AltCoins;
    wallet2: AltCoins;
    subAnotherToken: boolean;
}[]

const steps = ['Budget', 'Budget Labels'];
interface IProps {
    exercise: IBudgetExercise;
    onBack: () => void
}

function NewBudget({ exercise, onBack }: IProps) {

    const [activeStep, setActiveStep] = useState(0);
    const coins = useAppSelector(SelectCurrencies)
    const dispatch = useAppDispatch()

    const [anotherToken, setAnotherToken] = useState(false)
    const [budgetName, setBudgetName] = useState('')
    const [budgetAmount, setBudgetAmount] = useState<number | null>(null)
    const [budgetAmount2, setBudgetAmount2] = useState<number | null>(null)
    const [budgetCoin, setBudgetCoin] = useState(Object.values(coins)[0])
    const [budgetCoin2, setBudgetCoin2] = useState(Object.values(coins)[0])
    const [budgetFiat, setBudgetFiat] = useState<FiatMoneyList | undefined>(exercise.coins.fiat)
    const [budgetFiat2, setBudgetFiat2] = useState<FiatMoneyList | undefined>(exercise.coins.second?.fiat ?? undefined)

    const hp = useAppSelector(SelectHistoricalPrices)

    let helperCoin = 0;
    if (exercise.coins.calculation !== "Custom Price" && budgetAmount) {
        helperCoin = generateTokenPriceCalculation({ ...budgetCoin, amount: budgetAmount, coin: budgetCoin }, hp, exercise.coins.calculation, exercise.coins.fiat)
    } else if (exercise.coins.calculation === "Custom Price" && budgetAmount && exercise.coins.customPrice) {
        helperCoin = budgetAmount / exercise.coins.customPrice
    }

    let helperCoin2 = 0;
    if (exercise.coins.second?.calculation !== "Custom Price" && budgetAmount2 && exercise.coins.second?.fiat && exercise.coins.second?.calculation) {
        helperCoin2 = generateTokenPriceCalculation({ ...budgetCoin2, amount: budgetAmount2, coin: budgetCoin2 }, hp, exercise.coins.second.calculation, exercise.coins.second.fiat)
    } else if (exercise.coins.second?.calculation === "Custom Price" && budgetAmount2 && exercise.coins.second.customPrice) {
        helperCoin2 = budgetAmount2 / exercise.coins.second.customPrice
    }

    const onNext = () => {
        if (!budgetName) return ToastRun(<>Please enter a budget name</>, 'error')
        if (!budgetAmount) return ToastRun(<>Please, input an amount</>, "error")
        if (anotherToken && !budgetAmount2) return ToastRun(<>Please, input an amount for the second amount field</>, "error")

        setActiveStep(1)
        setLabels([
            {
                id: nanoid(),
                labelName: '',
                labelAmount: null,
                labelCoin: budgetCoin,
                labelFiat: budgetFiat ?? null,
                second: anotherToken ? {
                    labelAmount: null,
                    labelCoin: budgetCoin2,
                    labelFiat: budgetFiat2 ?? null,
                } : null
            }
        ])
    }

    const onAddLabel = () => {
        setLabels([
            ...labels,
            {
                id: nanoid(),
                labelName: '',
                labelAmount: null,
                labelCoin: budgetCoin,
                labelFiat: budgetFiat ?? null,
                second: anotherToken ? {
                    labelAmount: null,
                    labelCoin: budgetCoin2,
                    labelFiat: budgetFiat2 ?? null,
                } : null
            }
        ])
    }

    const [labels, setLabels] = useState<{
        id: string,
        labelName: string,
        labelAmount: number | null,
        labelCoin: AltCoins,
        labelFiat: FiatMoneyList | null,
        second: {
            labelAmount: number | null,
            labelFiat: FiatMoneyList | null,
            labelCoin: AltCoins | null,
        } | null
    }[]>([])

    const maxAmount = exercise.coins.amount - (exercise.budgets as IBudget[]).reduce((acc, curr) => acc + curr.amount, 0)
    const maxSecAmount = (exercise.coins.second?.amount ?? 0) - (exercise.budgets as IBudget[]).reduce((acc, curr) => acc + (curr.secondAmount ?? 0), 0)


    const onSubmit = async () => {
        if (!budgetName) return ToastRun(<>Please enter a budget name</>, 'error')
        if (!budgetAmount) return ToastRun(<>Please, input an amount</>, "error")
        if (!budgetCoin) return ToastRun(<>Please, select a coin</>, "error")
        if (budgetAmount > maxAmount) return ToastRun(<>The amount you entered is greater than the amount you have left</>, "error")
        if ((budgetAmount2 ?? 0) > maxSecAmount) return ToastRun("The amount you entered is greater than the amount you have left", "error")
        if (anotherToken && !budgetAmount2) return ToastRun(<>Please, input an amount for the second amount field</>, "error")
        if (anotherToken && !budgetCoin2) return ToastRun(<>Please, select a coin for the second amount field</>, "error")

        if (labels.length === 1 && (labels[0].labelName && !labels[0].labelAmount)) return ToastRun(<>Please, input an amount for the label</>, "error")
        if (labels.length === 1 && (labels[0].labelAmount && !labels[0].labelName)) return ToastRun(<>Please, input a name for the label</>, "error")
        if (labels.length === 1 && (labels[0].second && (!labels[0].second.labelAmount || !labels[0].second.labelCoin))) return ToastRun(<>Please, input an amount for the second amount field</>, "error")

        if (labels.length > 1 && labels.some(label => label.labelAmount === undefined || label.labelAmount === null || !label.labelCoin || !label.labelName)
            ||
            (anotherToken && labels.some(label => label.second?.labelAmount === null || label.second?.labelAmount === undefined || !label.second?.labelCoin))
        ) return ToastRun(<>Please, fill all the fields</>, "error")

        const allLabelAmount = labels.reduce((acc, curr) => acc + (curr.labelAmount ?? 0), 0)
        const allSecondLabelAmount = labels.reduce((acc, curr) => acc + (curr.second?.labelAmount ?? 0), 0)

        if (allLabelAmount > (budgetAmount ?? 0)) return ToastRun(<>The total amount of the labels is greater than the budget amount</>, "error")
        if (anotherToken && allSecondLabelAmount > (budgetAmount2 ?? 0)) return ToastRun(<>The total amount of the labels is greater than the budget amount</>, "error")

        let id = generate();

        let subbudgets = labels[0].labelName && labels[0].labelAmount ? labels.map(s => ({
            id: s.id,
            name: s.labelName,
            amount: s.labelAmount ?? 0,
            token: s.labelCoin.symbol,

            secondAmount: s.second?.labelAmount ?? null,
            secondToken: (s.second?.labelCoin && (s.second?.labelAmount ?? 0) > 0) ? s.second.labelCoin.symbol : null,

            fiatMoney: budgetFiat ?? null,
            customPrice: exercise.coins.customPrice,

            secondFiatMoney: budgetFiat2 ?? null,
            secondCustomPrice: exercise.coins.second?.customPrice ?? null,

            txs: [],
            parentId: id,
            created_at: GetTime(),
        })) : [];

        if (labels.length === 1 && (!labels[0].labelName || !labels[0].labelAmount)) subbudgets = []


        let budget = {
            budget: {
                txs: [],
                id: id,
                created_at: GetTime(),
                name: budgetName,
                parentId: exercise.id,

                token: budgetCoin.symbol,
                customPrice: exercise.coins.customPrice,
                fiatMoney: budgetFiat ?? null,
                amount: helperCoin,

                secondToken: budgetCoin2.symbol,
                secondAmount: helperCoin2 ?? null,
                secondCustomPrice: exercise.coins.second?.customPrice ?? null,
                secondFiatMoney: budgetFiat2 ?? null,

                subbudgets: subbudgets
            }
        }
        console.log(budget)

        await dispatch(Create_Budget_Thunk(budget)).unwrap()

        onBack()
    }


    const [isLoading, OnSubmit] = useLoading(onSubmit)




    return <div className="w-full relative pb-16">
        <div className="w-[40%] mx-auto flex flex-col space-y-[5rem]">
            <div className='w-full flex justify-center'>
                <div className='w-full fixed bg-light dark:bg-dark z-[9999] py-1'>
                    <div className='w-[18rem] mx-auto '>
                        <Stepper activeStep={activeStep}>
                            {steps.map((label, index) => {
                                const stepProps: { completed?: boolean } = {};

                                if (index < activeStep) {
                                    stepProps.completed = true;
                                }

                                return (
                                    <Step key={label} {...stepProps} sx={{
                                        '& .MuiStepLabel-root .Mui-active': {
                                            color: '#FF7348', // circle color (ACTIVE)
                                        },
                                        '& .MuiStepLabel-root .Mui-completed': {
                                            color: '#FF7348', // circle color (COMPLETED)
                                        },
                                    }}>
                                        <StepLabel>{label}</StepLabel>
                                    </Step>
                                );
                            })}
                        </Stepper>
                    </div>
                </div>
            </div>

            {
                activeStep === 0 &&
                <div className='flex flex-col space-y-5'>
                    <div className='text-xl text-center mb-3 font-semibold'>Budget</div>
                    <TextField
                        InputProps={{ style: { fontSize: '0.875rem' } }}
                        InputLabelProps={{ style: { fontSize: '0.875rem' } }}
                        label="Name" placeholder='E.g. Marketing' className='w-full bg-white dark:bg-darkSecond' onChange={(e) => setBudgetName(e.target.value)} />

                    <PriceInputField helper={`Price Calculation: ${helperCoin.toFixed(2)} ${exercise.coins.coin}`} isMaxActive maxRegularCalc setMaxAmount={maxAmount} coins={{ [exercise.coins.coin]: coins[exercise.coins.coin] }} customFiatList={[fiatList.find(s => s.name === exercise.coins.fiat)!]} defaultFiat={exercise.coins.fiat} disableFiatNoneSelection onChange={(val, coin, fiatMoney) => {
                        setBudgetAmount(val)
                        setBudgetCoin(coin)
                        setBudgetFiat(fiatMoney)
                    }} />

                    {/* {(budgetFiat) && <div>
                        <div className='grid grid-cols-2 gap-x-5'>
                            <Dropdown
                                sx={{
                                    fontSize: "0.875rem"
                                }}
                                labelSX={{
                                    fontSize: "0.875rem"
                                }}
                                list={[{ name: PC }, { name: "Custom Price" }]}
                                setSelect={setSelectedPriceOption}
                                selected={selectedPriceOption}
                                className="bg-white dark:bg-darkSecond"
                            />
                            <TextField
                                InputProps={{ style: { fontSize: '0.875rem' } }}
                                InputLabelProps={{ style: { fontSize: '0.875rem' } }}
                                disabled={selectedPriceOption.name === (PC)} className="w-full bg-white dark:bg-darkSecond" type={'number'} inputProps={{ step: 0.01 }} label="Custom Price" variant="outlined" onChange={(e) => setCustomPrice(+e.target.value)} />
                        </div>
                    </div>} */}

                    {anotherToken && exercise.coins.second && exercise.coins.second.coin ? <div className="relative">
                        <PriceInputField helper={`Price Calculation: ${helperCoin2.toFixed(2)} ${exercise.coins.second?.coin}`} isMaxActive maxRegularCalc setMaxAmount={maxSecAmount} coins={{ [exercise.coins.second.coin]: coins[exercise.coins.second.coin] }} customFiatList={[fiatList.find(s => s.name === exercise.coins.second?.fiat)!]} defaultFiat={exercise.coins.second?.fiat ?? undefined} disableFiatNoneSelection onChange={(val, coin, fiatMoney) => {
                            setBudgetAmount2(val)
                            setBudgetCoin2(coin)
                            setBudgetFiat2(fiatMoney)
                        }} />

                        <div className="absolute -right-6 top-5 cursor-pointer" onClick={() => {
                            setAnotherToken(false)
                            setBudgetAmount2(null)
                            setBudgetFiat2(undefined)
                        }}>
                            <IoMdRemoveCircle color="red" />
                        </div>
                        {/* {(budgetFiat2) && <div className="mt-4">
                            <div className='grid grid-cols-2 gap-x-5'>
                                <Dropdown
                                    sx={{
                                        fontSize: "0.875rem"
                                    }}
                                    labelSX={{
                                        fontSize: "0.875rem"
                                    }}
                                    list={[{ name: (PC) }, { name: "Custom Price" }]}
                                    setSelect={setSelectedPriceOption2}
                                    selected={selectedPriceOption2}
                                    className="bg-white dark:bg-darkSecond"
                                />
                                <TextField
                                    InputProps={{ style: { fontSize: '0.875rem' } }}
                                    InputLabelProps={{ style: { fontSize: '0.875rem' } }}
                                    disabled={selectedPriceOption2.name === (PC)} className="w-full bg-white dark:bg-darkSecond" type={'number'} inputProps={{ step: 0.01 }} label="Custom Price" variant="outlined" onChange={(e) => setCustomPrice2(+e.target.value)} />
                            </div>
                        </div>} */}
                    </div> :
                        exercise.coins.second && exercise.coins.second.coin ? <div className="col-span-2 relative cursor-pointer grid grid-cols-[20%,80%] gap-x-1 w-[5rem]" onClick={() => setAnotherToken(true)}>
                            <div className="self-center">
                                <AiOutlinePlusCircle className='text-primary' />
                            </div>
                            <span className="text-primary font-medium">Add</span>
                        </div> : <></>
                    }

                    <div className="grid grid-cols-2 w-full sm:w-full justify-center gap-8  pt-6">
                        <Button version="second" className="!rounded-xl !py-2 !text-sm" onClick={onBack}>Cancel</Button>
                        <Button type="submit" className="!rounded-xl bg-primary  px-3 py-2 text-white flex items-center justify-center !text-sm" onClick={onNext}>Next</Button>
                    </div>
                </div>
            }



            {
                activeStep === 1 &&
                <div className='flex flex-col space-y-16'>
                    {labels.map((label, index) => {
                        const max = (budgetAmount ?? 0) - labels.reduce((a, c) => a + (c.labelAmount ?? 0), 0)
                        const max2 = (budgetAmount2 ?? 0) - labels.reduce((a, c) => a + (c?.second?.labelAmount ?? 0), 0)

                        let helperCoin = 0;
                        if (exercise.coins.calculation !== "Custom Price" && label.labelAmount && label.labelFiat && exercise.coins.calculation) {
                            helperCoin = generateTokenPriceCalculation({ ...label.labelCoin, amount: label.labelAmount, coin: label.labelCoin }, hp, exercise.coins.calculation, label.labelFiat)
                        } else if (exercise.coins.second?.calculation === "Custom Price" && label.labelAmount && exercise.coins.customPrice) {
                            helperCoin = label.labelAmount / exercise.coins.customPrice
                        }

                        let helperCoin2 = 0;
                        if (exercise.coins.second?.calculation !== "Custom Price" && label.second?.labelAmount && label.second?.labelFiat && exercise.coins.second?.calculation && label.second?.labelCoin) {
                            helperCoin2 = generateTokenPriceCalculation({ ...label.second?.labelCoin, amount: label.second.labelAmount, coin: label.second.labelCoin }, hp, exercise.coins.second.calculation, label.second.labelFiat)
                        } else if (exercise.coins.second?.calculation === "Custom Price" && label.second?.labelAmount && exercise.coins.second?.customPrice) {
                            helperCoin2 = label.second.labelAmount / exercise.coins.second.customPrice
                        }

                        return <div key={label.id} className='flex flex-col space-y-5'>
                            <div className='text-xl font-semibold text-center'>Budget Label {index > 0 ? `${index + 1}` : ""}</div>
                            <div className='relative'>
                                <TextField
                                    InputProps={{ style: { fontSize: '0.875rem' } }}
                                    InputLabelProps={{ style: { fontSize: '0.875rem' } }}
                                    label="Label name" placeholder='E.g. Payroll' className='w-full bg-white dark:bg-darkSecond' onChange={(e) => setLabels(labels.map(s => {
                                        if (s.id === label.id) {
                                            return { ...s, labelName: e.target.value }
                                        }
                                        return s;
                                    }))} />
                                {labels.length > 1 &&
                                    <div className='absolute -right-8 top-1/2 -translate-y-1/2' onClick={() => {
                                        setLabels(labels.filter(s => s.id !== label.id))
                                    }}>
                                        <BiTrash className='hover:text-red-500 cursor-pointer' />
                                    </div>}
                            </div>

                            <PriceInputField coins={{ [budgetCoin.symbol]: budgetCoin }} disableFiatNoneSelection={true} defaultFiat={budgetFiat} customFiatList={budgetFiat ? [fiatList.find(s => s.name == budgetFiat)!] : []} onChange={(val, coin, fiatMoney) => {
                                setLabels(labels.map(s => {
                                    if (s.id === label.id) {
                                        return { ...s, labelAmount: val }
                                    }
                                    return s;
                                }))
                            }} />
                            <FormHelperText className='!mt-1 flex justify-between' error={max < 0}>
                                <div>Remains: {max} {budgetFiat ?? budgetCoin.symbol} {max < 0 ? "You exceed the max amount" : ""}</div>
                                <div>Price Calculation: {helperCoin.toFixed(2)} {exercise.coins.second?.coin}</div>
                            </FormHelperText>

                            {budgetAmount2 && budgetCoin2 && <PriceInputField coins={{ [budgetCoin2.symbol]: budgetCoin2 }} defaultFiat={budgetFiat2} disableFiatNoneSelection={true} customFiatList={budgetFiat2 ? [fiatList.find(s => s.name == budgetFiat2)!] : []} onChange={(val, coin, fiatMoney) => {
                                setLabels(labels.map(s => {
                                    if (s.id === label.id) {
                                        return {
                                            ...s,
                                            second: {
                                                ...s.second,
                                                labelCoin: budgetCoin2,
                                                labelAmount: val,
                                                labelFiat: budgetFiat2 ?? null
                                            }
                                        }
                                    }
                                    return s;
                                }))
                            }} />}
                            {budgetAmount2 && <FormHelperText className='!mt-1 flex justify-between' error={max2 < 0}>
                                <div>Remains: {max2} {budgetFiat2 ?? budgetCoin2.symbol} {max2 < 0 ? "You exceed the max amount" : ""}</div>
                                <div>Price Calculation: {helperCoin2.toFixed(2)} {exercise.coins.second?.coin}</div>
                            </FormHelperText>}
                        </div>
                    })}
                    <div className="grid grid-cols-2 w-full sm:w-full justify-center gap-8 pt-6">
                        <div className='col-span-2 bg-gray-100 dark:bg-darkSecond py-2 px-3 rounded-md text-center text-primary cursor-pointer font-medium text-sm' onClick={onAddLabel}>
                            + Add Budget Label
                        </div>
                        <Button version="second" className="!rounded-xl !py-2 !text-sm" onClick={() => {
                            setActiveStep(0)
                            setBudgetAmount(null)
                            setBudgetAmount2(null)
                            setBudgetName("")
                        }}>Back</Button>
                        <Button type="submit" className="!rounded-xl bg-primary  px-3 py-2 text-white flex items-center justify-center !text-sm" isLoading={isLoading} onClick={OnSubmit}>Create</Button>
                    </div>
                </div>
            }
        </div>
    </div >
}

export default NewBudget