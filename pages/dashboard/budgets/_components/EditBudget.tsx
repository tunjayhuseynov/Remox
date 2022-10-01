import React, { useState } from 'react'
import Dropdown from "../../../../components/general/dropdown";
import { useWalletKit } from "../../../../hooks";
import Button from '../../../../components/button';
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { generate } from 'shortid'
import { SelectCurrencies, SelectPriceCalculation } from 'redux/slices/account/remoxData';

import { AltCoins } from 'types/coins';
import { SubmitHandler } from "react-hook-form";
import { GetTime } from 'utils';
import useLoading from 'hooks/useLoading';
import { Create_Budget_Thunk, Update_Budget_Thunk } from 'redux/slices/account/thunks/budgetThunks/budget';
import { AiOutlinePlusCircle } from 'react-icons/ai'
import { Step, StepLabel, Stepper } from '@mui/material';
import TextField from '@mui/material/TextField';
import PriceInputField, { fiatList } from 'components/general/PriceInputField';
import { IoMdRemoveCircle } from 'react-icons/io';
import { FiatMoneyList, IBudget, IBudgetTX } from 'firebaseConfig';
import { ToastRun } from 'utils/toast';
import { nanoid } from '@reduxjs/toolkit';
import FormHelperText from '@mui/material/FormHelperText';
import { BiTrash } from 'react-icons/bi';
import { IBudgetCoin, IBudgetORM } from 'pages/api/budget/index.api';
import { ITag } from 'pages/api/tags/index.api';

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
    onBack: () => void
}

function EditBudget({ onBack, budget }: IProps) {

    const [activeStep, setActiveStep] = useState(0);
    const coins = useAppSelector(SelectCurrencies)
    const dispatch = useAppDispatch()
    const priceCalculation = useAppSelector(SelectPriceCalculation)
    const PC = priceCalculation == "current" ? "Current Price" : `${priceCalculation} days average price`

    const [anotherToken, setAnotherToken] = useState(!!budget.secondAmount)
    const [budgetName, setBudgetName] = useState(budget.name)
    const [budgetAmount, setBudgetAmount] = useState<number | null>(budget.amount)
    const [budgetAmount2, setBudgetAmount2] = useState<number | null>(budget.secondAmount)
    const [budgetCoin, setBudgetCoin] = useState(coins[budget.token])
    const [budgetCoin2, setBudgetCoin2] = useState(budget.secondToken ? coins[budget.secondToken] : Object.values(coins)[0])
    const [budgetFiat, setBudgetFiat] = useState<FiatMoneyList | undefined>(budget.fiatMoney ?? undefined)
    const [budgetFiat2, setBudgetFiat2] = useState<FiatMoneyList | undefined>(budget.secondFiatMoney ?? undefined)

    const [selectedPriceOption, setSelectedPriceOption] = useState(budget.customPrice ? { name: "Custom Price" } : { name: PC })
    const [selectedPriceOption2, setSelectedPriceOption2] = useState(budget.secondCustomPrice ? { name: "Custom Price" } : { name: PC })
    const [customPrice, setCustomPrice] = useState<number | null>(budget.customPrice)
    const [customPrice2, setCustomPrice2] = useState<number | null>(budget.secondCustomPrice)

    const onNext = () => {
        if (!budgetName) return ToastRun(<>Please enter a budget name</>, 'error')
        if (!budgetAmount) return ToastRun(<>Please, input an amount</>, "error")
        if (anotherToken && !budgetAmount2) return ToastRun(<>Please, input an amount for the second amount field</>, "error")

        setActiveStep(1)
        // setLabels([
        //     {
        //         id: nanoid(),
        //         labelName: '',
        //         labelAmount: null,
        //         labelCoin: budgetCoin,
        //         labelFiat: budgetFiat ?? null,
        //         txs: [],
        //         budgetCoins: {
        //             coin: budgetCoin.symbol,
        //             totalAmount: 0,
        //             totalPending: 0,
        //             totalUsedAmount: 0,
        //             second: anotherToken ? {
        //                 secondCoin: budgetCoin2.symbol,
        //                 secondTotalAmount: 0,
        //                 secondTotalPending: 0,
        //                 secondTotalUsedAmount: 0,
        //             } : null
        //         },
        //         second: anotherToken ? {
        //             labelAmount: null,
        //             labelCoin: budgetCoin2,
        //             labelFiat: budgetFiat2 ?? null,
        //         } : null
        //     }
        // ])
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
                txs: [],
                budgetCoins: {
                    coin: budgetCoin.symbol,
                    totalAmount: 0,
                    totalPending: 0,
                    totalUsedAmount: 0,
                    second: anotherToken ? {
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
        budget.subbudgets.map(s => {
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
        })
    )

    const onSubmit = async () => {
        if (!budgetName) return ToastRun(<>Please enter a budget name</>, 'error')
        if (!budgetAmount) return ToastRun(<>Please, input an amount</>, "error")
        if (!budgetCoin) return ToastRun(<>Please, select a coin</>, "error")
        if (anotherToken && !budgetAmount2) return ToastRun(<>Please, input an amount for the second amount field</>, "error")
        if (anotherToken && !budgetCoin2) return ToastRun(<>Please, select a coin for the second amount field</>, "error")

        if (labels.some(label => !label.labelAmount || !label.labelCoin || !label.labelName)
            ||
            (anotherToken && labels.some(label => !label.second?.labelAmount || !label.second?.labelCoin))
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
                amount: budgetAmount,

                secondToken: budgetCoin2.symbol,
                secondAmount: budgetAmount2 ?? null,
                secondCustomPrice: customPrice2,
                secondFiatMoney: budgetFiat2 ?? null,
                tags: budget.tags,
                budgetCoins: {
                    coin: budgetCoin.symbol,
                    second: anotherToken ? {
                        secondCoin: budgetCoin2.symbol,
                        secondTotalAmount: budgetAmount2 ?? 0,
                        secondTotalPending: budget.budgetCoins.second?.secondTotalPending ?? 0,
                        secondTotalUsedAmount: budget.budgetCoins.second?.secondTotalUsedAmount ?? 0,
                    } : null,
                    totalAmount: budgetAmount,
                    totalPending: budget.budgetCoins.totalPending,
                    totalUsedAmount: budget.budgetCoins.totalUsedAmount,
                },

                subbudgets: labels.map(s => ({
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
                        coin: s.labelCoin.symbol,
                        totalAmount: s.labelAmount ?? 0,
                        totalPending: s.budgetCoins.totalPending,
                        totalUsedAmount: s.budgetCoins.totalUsedAmount,
                        second: s.budgetCoins.second ? {
                            secondCoin: s.second?.labelCoin?.symbol ?? "",
                            secondTotalAmount: s.second?.labelAmount ?? 0,
                            secondTotalPending: s.budgetCoins.second?.secondTotalPending,
                            secondTotalUsedAmount: s.budgetCoins.second?.secondTotalUsedAmount,
                        } : null
                    }
                })),
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
                    <TextField label="Name" placeholder='E.g. Remox Budget Q4 2023' value={budgetName} className='w-full bg-white dark:bg-darkSecond' onChange={(e) => setBudgetName(e.target.value)} />

                    <PriceInputField coins={coins} defaultCoin={budgetCoin} defaultFiat={budgetFiat} defaultValue={budgetAmount} onChange={(val, coin, fiatMoney) => {
                        setBudgetAmount(val)
                        setBudgetCoin(coin)
                        setBudgetFiat(fiatMoney)
                    }} />

                    {(budgetFiat) && <div>
                        <div className='grid grid-cols-2 gap-x-5'>
                            <Dropdown
                                list={[{ name: PC }, { name: "Custom Price" }]}
                                setSelect={setSelectedPriceOption}
                                selected={selectedPriceOption}
                                className="bg-white dark:bg-darkSecond"
                            />
                            <TextField disabled={selectedPriceOption.name === PC} value={customPrice?.toString() ?? ""} className="w-full bg-white dark:bg-darkSecond" type={'number'} inputProps={{ step: 0.01 }} label="Custom Price" variant="outlined" onChange={(e) => setCustomPrice(+e.target.value)} />
                        </div>
                    </div>}

                    {anotherToken ? <div className="relative">
                        <PriceInputField defaultCoin={budgetCoin2} defaultFiat={budgetFiat2} defaultValue={budgetAmount2} isMaxActive coins={coins} onChange={(val, coin, fiatMoney) => {
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
                        <div className="col-span-2 relative cursor-pointer grid grid-cols-[20%,80%] gap-x-1 w-[5rem]" onClick={() => setAnotherToken(true)}>
                            <div className="self-center">
                                <AiOutlinePlusCircle className='text-primary' />
                            </div>
                            <span className="text-primary font-medium">Add</span>
                        </div>
                    }

                    {(budgetFiat2) && <div>
                        <div className='grid grid-cols-2 gap-x-5'>
                            <Dropdown
                                list={[{ name: PC }, { name: "Custom Price" }]}
                                setSelect={setSelectedPriceOption2}
                                selected={selectedPriceOption2}
                                className="bg-white dark:bg-darkSecond"
                            />
                            <TextField disabled={selectedPriceOption2.name === PC} value={customPrice2?.toString() ?? ""} className="w-full bg-white dark:bg-darkSecond" type={'number'} inputProps={{ step: 0.01 }} label="Custom Price" variant="outlined" onChange={(e) => setCustomPrice2(+e.target.value)} />
                        </div>
                    </div>}
                    <div className="grid grid-cols-2 w-full sm:w-full justify-center gap-8  pt-6">
                        <Button version="second" className="!rounded-xl" onClick={onBack}>Cancel</Button>
                        <Button type="submit" className="!rounded-xl bg-primary  px-3 py-2 text-white flex items-center justify-center" onClick={onNext}>Next</Button>
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
                            <div className='text-xl font-semibold text-center'>Budget Labels {index > 0 ? `${index + 1}` : ""}</div>
                            <div className='relative'>
                                <TextField label="Label name" value={label.labelName} placeholder='E.g. Remox Budget Q4 2023' className='w-full bg-white dark:bg-darkSecond' onChange={(e) => setLabels(labels.map(s => {
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
                        <div className='col-span-2 bg-gray-100 dark:bg-darkSecond py-2 px-3 rounded-md text-center text-primary cursor-pointer font-semibold' onClick={onAddLabel}>
                            + Add Budget Labels
                        </div>
                        <Button version="second" className="!rounded-xl" onClick={() => {
                            setActiveStep(0)
                            setBudgetFiat2(undefined)
                            setBudgetFiat(undefined)
                        }}>Back</Button>
                        <Button type="submit" className="!rounded-xl bg-primary  px-3 py-2 text-white flex items-center justify-center" isLoading={isLoading} onClick={OnSubmit}>Create</Button>
                    </div>
                </div>
            }
        </div>
    </div >
}

export default EditBudget