import React, { useState, useEffect, useRef, useMemo } from 'react'
import Dropdown from "../../../../components/general/dropdown";
import { useWalletKit } from "../../../../hooks";
import Button from '../../../../components/button';
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { generate } from 'shortid'
import { useRouter } from 'next/router';
import { SelectBalance, SelectCurrencies, SelectDarkMode } from 'redux/slices/account/remoxData';

import { AltCoins, Coins } from 'types/coins';
import { useForm, SubmitHandler } from "react-hook-form";
import { GetTime } from 'utils';
import useLoading from 'hooks/useLoading';
import { Create_Budget_Thunk } from 'redux/slices/account/thunks/budgetThunks/budget';
import { AiOutlinePlusCircle } from 'react-icons/ai'
import { FormControlLabel, Radio, RadioGroup, Step, StepLabel, Stepper } from '@mui/material';
import TextField from '@mui/material/TextField';
import PriceInputField, { fiatList } from 'components/general/PriceInputField';
import { IoIosAddCircleOutline, IoMdRemoveCircle } from 'react-icons/io';
import { FiatMoneyList } from 'firebaseConfig';
import { ToastRun } from 'utils/toast';
import { nanoid } from '@reduxjs/toolkit';
import FormHelperText from '@mui/material/FormHelperText';

interface IFormInput {
    name: string;
    amount: number;
    amount2?: number;
    subName: string;
}
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

const radioColor = {
    color: "#FF7348",
    '&.Mui-checked': {
        color: "#FF7348"
    },
}

interface IProps {
    exerciseId: string;
    onBack: () => void
}

function NewBudget({ exerciseId, onBack }: IProps) {

    const [activeStep, setActiveStep] = useState(0);
    const coins = useAppSelector(SelectCurrencies)


    const { GetCoins } = useWalletKit()
    const dispatch = useAppDispatch()

    const [anotherToken, setAnotherToken] = useState(false)
    const [budgetName, setBudgetName] = useState('')
    const [budgetAmount, setBudgetAmount] = useState<number | null>(null)
    const [budgetAmount2, setBudgetAmount2] = useState<number | null>(null)
    const [budgetCoin, setBudgetCoin] = useState(Object.values(coins)[0])
    const [budgetCoin2, setBudgetCoin2] = useState(Object.values(coins)[0])
    const [budgetFiat, setBudgetFiat] = useState<FiatMoneyList>()
    const [budgetFiat2, setBudgetFiat2] = useState<FiatMoneyList>()

    const [selectedPriceOption, setSelectedPriceOption] = useState({ name: "Current Price" })
    const [selectedPriceOption2, setSelectedPriceOption2] = useState({ name: "Current Price" })
    const [customPrice, setCustomPrice] = useState<number | null>(null)
    const [customPrice2, setCustomPrice2] = useState<number | null>(null)

    const onNext = () => {
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
                    labelAmount: budgetAmount2,
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

    const onSubmit: SubmitHandler<IFormInput> = async data => {
        // const coin = wallet
        // const coin2 = wallet2
        // const subbudgets = inputs

        // let secondCoin = null, secondAmount = null, id = generate();

        // if (data.amount2 && data.amount2 > 0) {
        //     secondCoin = coin2.symbol
        //     secondAmount = data.amount2
        // }

        // await dispatch(Create_Budget_Thunk({
        //     budget: {
        //         txs: [],
        //         id: id,
        //         amount: data.amount,
        //         created_at: GetTime(),
        //         name: data.name,
        //         parentId,
        //         token: coin.symbol,
        //         secondAmount,
        //         secondToken: secondCoin,
        //         subbudgets: subbudgets.map(s => ({
        //             amount: s.amount,
        //             created_at: GetTime(),
        //             id: s.id,
        //             name: s.name,
        //             parentId: id,
        //             secondAmount: s.amount2 ?? null,
        //             secondToken: (s.amount2 && s.wallet2 && s.amount2 > 0) ? s.wallet2.symbol : null,
        //             token: s.wallet.symbol,
        //             txs: [],
        //         })),
        //     }
        // })).unwrap()

        // onBack()
    }


    const [isLoading, OnSubmit] = useLoading(onSubmit)

    return <div className="w-full relative pb-10">
        <div className="w-[50%] mx-auto flex flex-col space-y-[10rem]">
            <div className='w-[18rem] mx-auto'>
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

            {
                activeStep === 0 &&
                <div className='flex flex-col space-y-5'>
                    <TextField label="Name" placeholder='E.g. Remox Budget Q4 2023' className='w-full bg-white dark:bg-darkSecond' onChange={(e) => setBudgetName(e.target.value)} />

                    <PriceInputField coins={coins} onChange={(val, coin, fiatMoney) => {
                        setBudgetAmount(val)
                        setBudgetCoin(coin)
                        setBudgetFiat(fiatMoney)
                    }} />

                    {(budgetFiat) && <div>
                        <div className='grid grid-cols-2 gap-x-5'>
                            <Dropdown
                                list={[{ name: "Current Price" }, { name: "Custom Price" }]}
                                setSelect={setSelectedPriceOption}
                                selected={selectedPriceOption}
                                className="bg-white dark:bg-darkSecond"
                            />
                            <TextField disabled={selectedPriceOption.name === "Current Price"} className="w-full bg-white dark:bg-darkSecond" type={'number'} inputProps={{ step: 0.01 }} label="Custom Price" variant="outlined" onChange={(e) => setCustomPrice(+e.target.value)} />
                        </div>
                    </div>}

                    {anotherToken ? <div className="relative">
                        <PriceInputField isMaxActive coins={coins} onChange={(val, coin, fiatMoney) => {
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
                                list={[{ name: "Current Price" }, { name: "Custom Price" }]}
                                setSelect={setSelectedPriceOption2}
                                selected={selectedPriceOption2}
                                className="bg-white dark:bg-darkSecond"
                            />
                            <TextField disabled={selectedPriceOption2.name === "Current Price"} className="w-full bg-white dark:bg-darkSecond" type={'number'} inputProps={{ step: 0.01 }} label="Custom Price" variant="outlined" onChange={(e) => setCustomPrice2(+e.target.value)} />
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
                <div className='flex flex-col space-y-5'>
                    {labels.map((label, index) => {
                        const max = labels.reduce((a, c) => (budgetAmount ?? 0) - (a + (c.labelAmount ?? 0)), 0)
                        return <>
                            <div className='text-lg font-semibold'>Budget Labels {index > 0 ? `${index + 1}` : ""}</div>
                            <TextField label="Label name" placeholder='E.g. Remox Budget Q4 2023' className='w-full bg-white dark:bg-darkSecond' onChange={(e) => setLabels(labels.map(s => {
                                if (s.id === label.id) {
                                    return { ...s, name: e.target.value }
                                }
                                return s;
                            }))} />

                            <PriceInputField coins={{ [budgetCoin.symbol]: budgetCoin }} disableFiatNoneSelection={true} defaultFiat={budgetFiat} customFiatList={budgetFiat ? [fiatList.find(s => s.name == budgetFiat)!] : []} onChange={(val, coin, fiatMoney) => {
                                setLabels(labels.map(s => {
                                    if (s.id === label.id) {
                                        return { ...s, labelAmount: val }
                                    }
                                    return s;
                                }))
                            }} />
                            <FormHelperText className={`${max < (budgetAmount ?? 0) ? "text-red-500" : ""}`}>Max: {max} {max < (budgetAmount ?? 0) ? "You exceed the max amount" : ""}</FormHelperText>

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


                        </>
                    })}
                    <div className="grid grid-cols-2 w-full sm:w-full justify-center gap-8  pt-6">
                        <Button version="second" className="!rounded-xl" onClick={() => setActiveStep(0)}>Back</Button>
                        <Button type="submit" className="!rounded-xl bg-primary  px-3 py-2 text-white flex items-center justify-center" isLoading={isLoading}>Create</Button>
                    </div>
                </div>
            }
        </div>
    </div >
}

export default NewBudget