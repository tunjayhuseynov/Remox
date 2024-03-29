import React, { useState } from 'react'
import Button from '../../../../components/button';
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { SelectCurrencies, SelectHistoricalPrices, SelectPriceCalculation } from 'redux/slices/account/remoxData';

import { AltCoins } from 'types/coins';
import { GetTime } from 'utils';
import useLoading from 'hooks/useLoading';
import { Update_Budget_Thunk } from 'redux/slices/account/thunks/budgetThunks/budget';
import { AiOutlinePlusCircle } from 'react-icons/ai'
import { Step, StepLabel, Stepper } from '@mui/material';
import TextField from '@mui/material/TextField';
import PriceInputField, { fiatList } from 'components/general/PriceInputField';
import { IoMdRemoveCircle } from 'react-icons/io';
import { FiatMoneyList, IBudget, IBudgetExercise, IBudgetTX } from 'firebaseConfig';
import { ToastRun } from 'utils/toast';
import { nanoid } from '@reduxjs/toolkit';
import FormHelperText from '@mui/material/FormHelperText';
import { BiTrash } from 'react-icons/bi';
import { IBudgetCoin, IBudgetORM } from 'pages/api/budget/index.api';
import { generatePriceCalculation, generateTokenPriceCalculation } from 'utils/const';

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
    budget: IBudgetORM;
    exercise: IBudgetExercise;
    onBack: () => void
}

function EditBudget({ onBack, budget, exercise }: IProps) {

    const [activeStep, setActiveStep] = useState(0);
    const coins = useAppSelector(SelectCurrencies)
    const dispatch = useAppDispatch()
    const priceCalculation = useAppSelector(SelectPriceCalculation)
    const PC = priceCalculation == "current" ? "Current Price" : `${priceCalculation} days average price`
    const hp = useAppSelector(SelectHistoricalPrices)

    const [anotherToken, setAnotherToken] = useState(!!budget.secondAmount)
    const [budgetName, setBudgetName] = useState(budget.name)
    let bAmount = 0;
    if (exercise.coins.calculation !== "Custom Price") {
        bAmount = generatePriceCalculation({ ...coins[budget.token], amount: budget.amount, coin: coins[budget.token] }, hp, exercise.coins.calculation, exercise.coins.fiat)
    } else if (exercise.coins.calculation === "Custom Price" && exercise.coins.customPrice) {
        bAmount = budget.amount * exercise.coins.customPrice
    }

    let bAmount2: number | null = null;
    if (exercise.coins.second?.calculation !== "Custom Price" && budget.secondAmount && budget.secondToken && exercise.coins.second?.calculation && exercise.coins.second?.fiat) {
        bAmount2 = generatePriceCalculation({ ...coins[budget.secondToken], amount: budget.secondAmount, coin: coins[budget.secondToken] }, hp, exercise.coins.second.calculation, exercise.coins.second.fiat)
    } else if (exercise.coins.second?.calculation === "Custom Price" && exercise.coins.second?.customPrice && budget.secondAmount) {
        bAmount2 = budget.secondAmount * exercise.coins.second?.customPrice
    }

    const [budgetAmount, setBudgetAmount] = useState<number | null>(bAmount)
    const [budgetAmount2, setBudgetAmount2] = useState<number | null>(bAmount2)
    const [budgetCoin, setBudgetCoin] = useState(coins[budget.token])
    const [budgetCoin2, setBudgetCoin2] = useState(budget.secondToken ? coins[budget.secondToken] : Object.values(coins)[0])
    const [budgetFiat, setBudgetFiat] = useState<FiatMoneyList | undefined>(budget.fiatMoney ?? undefined)
    const [budgetFiat2, setBudgetFiat2] = useState<FiatMoneyList | undefined>(budget.secondFiatMoney ?? undefined)

    const [selectedPriceOption, setSelectedPriceOption] = useState(budget.customPrice ? { name: "Custom Price" } : { name: PC })
    const [selectedPriceOption2, setSelectedPriceOption2] = useState(budget.secondCustomPrice ? { name: "Custom Price" } : { name: PC })
    const [customPrice, setCustomPrice] = useState<number | null>(budget.customPrice)
    const [customPrice2, setCustomPrice2] = useState<number | null>(budget.secondCustomPrice)


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
    }

    const maxAmount = exercise.coins.amount - (exercise.budgets as IBudget[]).reduce((acc, curr) => acc + curr.amount, 0) + budget.amount
    const maxSecAmount = (exercise.coins.second?.amount ?? 0) - (exercise.budgets as IBudget[]).reduce((acc, curr) => acc + (curr.secondAmount ?? 0), 0) + (budget.secondAmount ?? 0)

    const onAddLabel = () => {
        setLabels([
            ...labels,
            {
                id: nanoid(),
                labelName: '',
                labelAmount: null,
                labelCoin: budgetCoin,
                labelFiat: budgetFiat ?? null,
                txs: [],
                budgetCoins: {
                    id: nanoid(),
                    coin: budgetCoin.symbol,
                    totalAmount: 0,
                    totalPending: 0,
                    totalUsedAmount: 0,
                    fiat: budgetFiat ?? null,
                    second: anotherToken ? {
                        fiat: budgetFiat2 ?? null,
                        secondCoin: budgetCoin2.symbol,
                        secondTotalAmount: 0,
                        secondTotalPending: 0,
                        secondTotalUsedAmount: 0,
                    } : null
                },
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
        budgetCoins: IBudgetCoin,
        txs: IBudgetTX[],
        second: {
            labelAmount: number | null,
            labelFiat: FiatMoneyList | null,
            labelCoin: AltCoins | null,
        } | null
    }[]>(
        budget.subbudgets.length > 0 ? budget.subbudgets.map(s => {
            return {
                id: s.id,
                labelAmount: s.amount,
                labelCoin: coins[s.token],
                labelFiat: s.fiatMoney ?? null,
                labelName: s.name,
                txs: s.txs,
                budgetCoins: s.budgetCoins,
                second: s.secondToken ? {
                    labelAmount: s.secondAmount,
                    labelCoin: coins[s.secondToken],
                    labelFiat: s.secondFiatMoney ?? null,
                } : null
            }
        }) : [{
            id: nanoid(),
            labelName: '',
            labelAmount: null,
            labelCoin: budgetCoin,
            labelFiat: budgetFiat ?? null,
            txs: [],
            budgetCoins: {
                id: nanoid(),
                coin: "",
                totalAmount: 0,
                totalPending: 0,
                totalUsedAmount: 0,
                fiat: budgetFiat ?? null,
                second: anotherToken ? {
                    fiat: budgetFiat2 ?? null,
                    secondCoin: "",
                    secondTotalAmount: 0,
                    secondTotalPending: 0,
                    secondTotalUsedAmount: 0,
                } : null
            },
            second: anotherToken ? {
                labelAmount: null,
                labelCoin: budgetCoin2,
                labelFiat: budgetFiat2 ?? null,
            } : null
        }]
    )

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

        let budgetObj: { budget: IBudgetORM } = {
            budget: {
                txs: budget.txs,
                id: budget.id,
                created_at: budget.created_at,
                name: budgetName,
                parentId: budget.parentId,

                token: budgetCoin.symbol,
                customPrice,
                fiatMoney: budgetFiat ?? null,
                amount: helperCoin,

                secondToken: budgetCoin2.symbol,
                secondAmount: helperCoin2 ?? null,
                secondCustomPrice: customPrice2,
                secondFiatMoney: budgetFiat2 ?? null,
                tags: budget.tags,
                budgetCoins: {
                    id: nanoid(),
                    fiat: budgetFiat ?? null,
                    coin: budgetCoin.symbol,
                    second: anotherToken ? {
                        fiat: budgetFiat2 ?? null,
                        secondCoin: budgetCoin2.symbol,
                        secondTotalAmount: helperCoin2 ?? 0,
                        secondTotalPending: budget.budgetCoins.second?.secondTotalPending ?? 0,
                        secondTotalUsedAmount: budget.budgetCoins.second?.secondTotalUsedAmount ?? 0,
                    } : null,
                    totalAmount: helperCoin,
                    totalPending: budget.budgetCoins.totalPending,
                    totalUsedAmount: budget.budgetCoins.totalUsedAmount,
                },

                subbudgets: labels[0].labelName && labels[0].labelAmount ? labels.map(s => ({
                    id: s.id,
                    name: s.labelName,
                    amount: s.labelAmount ?? 0,
                    token: s.labelCoin.symbol,

                    secondAmount: s.second?.labelAmount ?? null,
                    secondToken: (s.second?.labelCoin && (s.second?.labelAmount ?? 0) > 0) ? s.second.labelCoin.symbol : null,

                    fiatMoney: budgetFiat ?? null,
                    customPrice: customPrice,

                    secondFiatMoney: budgetFiat2 ?? null,
                    secondCustomPrice: customPrice2,

                    txs: [],
                    parentId: budget.id,
                    created_at: GetTime(),



                    budgetCoins: {
                        id: nanoid(),
                        coin: s.labelCoin.symbol,
                        fiat: s.labelFiat ?? null,
                        totalAmount: s.labelAmount ?? 0,
                        totalPending: s.budgetCoins.totalPending,
                        totalUsedAmount: s.budgetCoins.totalUsedAmount,
                        second: s.budgetCoins.second ? {
                            fiat: s.budgetCoins.second.fiat ?? null,
                            secondCoin: s.second?.labelCoin?.symbol ?? "",
                            secondTotalAmount: s.second?.labelAmount ?? 0,
                            secondTotalPending: s.budgetCoins.second?.secondTotalPending,
                            secondTotalUsedAmount: s.budgetCoins.second?.secondTotalUsedAmount,
                        } : null
                    }
                })) : [],
            }
        }

        await dispatch(Update_Budget_Thunk(budgetObj)).unwrap()

        onBack()
    }



    const [isLoading, OnSubmit] = useLoading(onSubmit)

    return <div className="w-full relative pb-14">
        <div className="w-[50%] mx-auto flex flex-col space-y-[5rem]">
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
                        label="Name" placeholder='E.g. Remox Budget Q4 2023' value={budgetName} className='w-full bg-white dark:bg-darkSecond' onChange={(e) => setBudgetName(e.target.value)} />

                    <PriceInputField helper={`Price Calculation: ${helperCoin.toFixed(2)} ${exercise.coins.coin}`} isMaxActive maxRegularCalc setMaxAmount={maxAmount} coins={{ [exercise.coins.coin]: coins[exercise.coins.coin] }} customFiatList={[fiatList.find(s => s.name === exercise.coins.fiat)!]} defaultFiat={exercise.coins.fiat} disableFiatNoneSelection defaultValue={budgetAmount} onChange={(val, coin, fiatMoney) => {
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
                                disabled={selectedPriceOption.name === PC} value={customPrice?.toString() ?? ""} className="w-full bg-white dark:bg-darkSecond" type={'number'} inputProps={{ step: 0.01 }} label="Custom Price" variant="outlined" onChange={(e) => setCustomPrice(+e.target.value)} />
                        </div>
                    </div>} */}

                    {anotherToken && budget.secondToken ? <div className="relative">
                        <PriceInputField defaultCoin={coins[budget.secondToken]} defaultValue={budgetAmount2} isMaxActive maxRegularCalc helper={`Price Calculation: ${helperCoin2.toFixed(2)} ${exercise.coins.second?.coin}`} coins={{ [exercise.coins.second?.coin!]: coins[exercise.coins.second?.coin!] }} setMaxAmount={maxSecAmount} defaultFiat={exercise.coins.second?.fiat ?? "USD"} customFiatList={[fiatList.find(s => s.name === exercise.coins.second?.fiat!)!]} disableFiatNoneSelection onChange={(val, coin, fiatMoney) => {
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
                    </div> :
                        exercise.coins.second && exercise.coins.second.coin ? <div className="col-span-2 relative cursor-pointer grid grid-cols-[20%,80%] gap-x-1 w-[5rem]" onClick={() => setAnotherToken(true)}>
                            <div className="self-center">
                                <AiOutlinePlusCircle className='text-primary' />
                            </div>
                            <span className="text-primary font-medium">Add</span>
                        </div> : <></>
                    }

                    {/* {(budgetFiat2) && <div>
                        <div className='grid grid-cols-2 gap-x-5'>
                            <Dropdown
                                sx={{
                                    fontSize: "0.875rem"
                                }}
                                labelSX={{
                                    fontSize: "0.875rem"
                                }}
                                list={[{ name: PC }, { name: "Custom Price" }]}
                                setSelect={setSelectedPriceOption2}
                                selected={selectedPriceOption2}
                                className="bg-white dark:bg-darkSecond"
                            />
                            <TextField
                                InputProps={{ style: { fontSize: '0.875rem' } }}
                                InputLabelProps={{ style: { fontSize: '0.875rem' } }}
                                disabled={selectedPriceOption2.name === PC} value={customPrice2?.toString() ?? ""} className="w-full bg-white dark:bg-darkSecond" type={'number'} inputProps={{ step: 0.01 }} label="Custom Price" variant="outlined" onChange={(e) => setCustomPrice2(+e.target.value)} />
                        </div>
                    </div>} */}
                    <div className="grid grid-cols-2 w-full sm:w-full justify-center gap-8 text-sm pt-6">
                        <Button version="second" className="!rounded-xl" onClick={onBack}>Cancel</Button>
                        <Button type="submit" className="!rounded-xl bg-primary  px-3 py-2 text-white flex items-center justify-center text-sm" onClick={onNext}>Next</Button>
                    </div>
                </div>
            }

            {
                activeStep === 1 &&
                <div className='flex flex-col space-y-16'>
                    {labels.map((label, index) => {
                        const max = (budgetAmount ?? 0) - labels.reduce((a, c) => a + (c.labelAmount ?? 0), 0)
                        const max2 = (budgetAmount2 ?? 0) - labels.reduce((a, c) => a + (c?.second?.labelAmount ?? 0), 0)
                        return <div key={label.id} className='flex flex-col space-y-5'>
                            <div className='text-xl font-semibold text-center'>Budget Label {index > 0 ? `${index + 1}` : ""}</div>
                            <div className='relative'>
                                <TextField
                                    InputProps={{ style: { fontSize: '0.875rem' } }}
                                    InputLabelProps={{ style: { fontSize: '0.875rem' } }}
                                    label="Label name" value={label.labelName} placeholder='E.g. Remox Budget Q4 2023' className='w-full bg-white dark:bg-darkSecond' onChange={(e) => setLabels(labels.map(s => {
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

                            <PriceInputField coins={{ [budgetCoin.symbol]: budgetCoin }} defaultCoin={label.labelCoin} defaultFiat={label.labelFiat ?? undefined} defaultValue={label.labelAmount} disableFiatNoneSelection={true} customFiatList={budgetFiat ? [fiatList.find(s => s.name == budgetFiat)!] : []} onChange={(val, coin, fiatMoney) => {
                                setLabels(labels.map(s => {
                                    if (s.id === label.id) {
                                        return {
                                            ...s, labelAmount: val, budgetCoins: {
                                                ...s.budgetCoins,
                                                coin: coin.symbol,
                                                totalAmount: (val ?? 0),
                                            }
                                        }
                                    }
                                    return s;
                                }))
                            }} />
                            <FormHelperText className='!mt-1' error={max < 0}>Remains: {max} {budgetFiat ?? budgetCoin.symbol} {max < 0 ? "You exceed the max amount" : ""}</FormHelperText>

                            {budgetAmount2 && budgetCoin2 && <PriceInputField coins={{ [budgetCoin2.symbol]: budgetCoin2 }} defaultCoin={label.second?.labelCoin ?? undefined} defaultFiat={label.second?.labelFiat ?? undefined} defaultValue={label.second?.labelAmount} disableFiatNoneSelection={true} customFiatList={budgetFiat2 ? [fiatList.find(s => s.name == budgetFiat2)!] : []} onChange={(val, coin, fiatMoney) => {
                                setLabels(labels.map(s => {
                                    if (s.id === label.id) {
                                        return {
                                            ...s,
                                            budgetCoins: {
                                                ...s.budgetCoins,
                                                second: {
                                                    ...s.budgetCoins.second,
                                                    secondCoin: coin.symbol,
                                                    fiat: fiatMoney ?? null,
                                                    secondTotalAmount: (val ?? 0),
                                                    secondTotalPending: s.budgetCoins.second?.secondTotalPending ?? 0,
                                                    secondTotalUsedAmount: s.budgetCoins.second?.secondTotalUsedAmount ?? 0,
                                                }
                                            },
                                            second: {
                                                ...s.second,
                                                labelCoin: budgetCoin2,
                                                labelAmount: val,
                                                labelFiat: budgetFiat2 ?? null,
                                            }
                                        }
                                    }
                                    return s;
                                }))
                            }} />}
                            {budgetAmount2 && <FormHelperText className='!mt-1' error={max2 < 0}>Remains: {max2} {budgetFiat2 ?? budgetCoin2.symbol} {max2 < 0 ? "You exceed the max amount" : ""}</FormHelperText>}
                        </div>
                    })}
                    <div className="grid grid-cols-2 w-full sm:w-full justify-center gap-8  pt-6">
                        <div className='col-span-2 bg-gray-100 dark:bg-darkSecond py-2 px-3 rounded-md text-center text-primary cursor-pointer font-medium text-sm' onClick={onAddLabel}>
                            + Add Budget Label
                        </div>
                        <Button version="second" className="!rounded-xl" onClick={() => {
                            setActiveStep(0)
                        }}>Back</Button>
                        <Button type="submit" className="!rounded-xl bg-primary px-3 py-2 text-white flex items-center justify-center" isLoading={isLoading} onClick={OnSubmit}>Edit</Button>
                    </div>
                </div>
            }
        </div>
    </div >
}

export default EditBudget