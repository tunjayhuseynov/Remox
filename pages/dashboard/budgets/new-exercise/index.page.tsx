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
import { SelectAccountType, SelectRemoxAccount } from 'redux/slices/account/selector';
import { TextField } from '@mui/material';

interface IFormInput {
    name: string;
    from?: Date;
    to?: Date;
}

function NewExercise() {

    const { register, handleSubmit } = useForm<IFormInput>();
    const paymentType: DropDownItem[] = [{ name: "Current full year" }, { name: "Custom period" }]
    const [selectedPayment, setSelectedPayment] = useState(paymentType[0])
    const { blockchain } = useWalletKit()

    const remoxAccount = useAppSelector(SelectRemoxAccount)
    const remoxAccountType = useAppSelector(SelectAccountType)

    const navigate = useRouter()
    const dispatch = useAppDispatch()
    let today = new Date()
    let From = today.getFullYear() + '/' + (today.getMonth() + 1) + '/' + today.getDate();
    let To = (today.getFullYear() + 1) + '/' + (today.getMonth() + 1) + '/' + today.getDate();


    const onSubmit: SubmitHandler<IFormInput> = async (data) => {
        try {
            if (!remoxAccountType) return ToastRun(<>Please. sign in first</>, "warning")
            if (!remoxAccount) throw new Error("No remox account found")
            if (selectedPayment.name === "Custom period" && (!data.from || data.to)) throw new Error("Custom period has not been selected")
            const fromDate = data.from ? new Date(data.from) : new Date(From);
            const toDate = data.to ? new Date(data.to) : new Date(To);

            await dispatch(Create_Budget_Exercise_Thunk({
                budgetExercise: {
                    blockchain,
                    budgets: [],
                    created_at: GetTime(),
                    from: GetTime(fromDate),
                    to: GetTime(toDate),
                    id: process(),
                    name: data.name,
                    parentId: remoxAccount.id,
                    parentType: remoxAccountType,
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
        <button onClick={() => navigate.back()} className="absolute left-0 w-[4rem] top-0 tracking-wider font-bold transition-all hover:text-primary hover:transition-all flex items-center text-xl gap-2">
            {/* <img src="/icons/cross_greylish.png" alt="" /> */}
            <span className="text-4xl pb-1">&#171;</span> Back
        </button>
        <form onSubmit={handleSubmit(submit)} className="w-1/2 mx-auto pt-10">
            <div className="text-2xl text-center font-medium py-6">Define  of your budgetary exercise</div>
            <div className="px-12 flex flex-col space-y-12">
                <TextField type="text" {...register("name", { required: true })} label="Name  of your budgetary exercise" className="border w-full py-2 px-1 rounded-lg dark:bg-darkSecond" />
                <div>
                    <Dropdown
                        parentClass={'bg-white dark:bg-darkSecond w-full rounded-lg h-full'}
                        label="Dates  of the budgetary exercise"
                        list={paymentType}
                        selected={selectedPayment}
                        setSelect={setSelectedPayment} />
                </div>
                <div className="flex">
                    {selectedPayment.name === "Current full year" ?
                        <div className="flex w-full gap-4 items-center justify-center">
                            <div className="flex flex-col gap-1 w-full">
                                <div className="text-sm text-greylish ">From</div>
                                <div className="border w-full py-2 px-1 rounded-lg bg-greylish dark:bg-darkSecond bg-opacity-20"  >
                                    {From}
                                </div>
                            </div>
                            <div className="flex  border-b w-[10%] pt-4"></div>
                            <div className="flex flex-col gap-1 w-full">
                                <div className="text-sm text-greylish">To</div>
                                <div className="border w-full py-2 px-1 rounded-lg bg-greylish  dark:bg-darkSecond bg-opacity-20">
                                    {To}
                                </div>
                            </div>
                        </div>
                        :
                        <div className="flex w-full gap-4 items-center justify-center">
                            <div className="flex flex-col gap-1 w-full">
                                <div className="text-sm text-greylish black:text-white">From</div>
                                <input type="date" {...register("to", { required: true })} className="border w-full py-2 px-1 rounded-lg  dark:bg-darkSecond bg-opacity-20" />
                            </div>
                            <div className="flex  border-b w-[10%] pt-4"></div>
                            <div className="flex flex-col gap-1 w-full">
                                <div className="text-sm text-greylish black:text-white ">To</div>
                                <input type="date" {...register("from", { required: true })} className="border w-full py-2 px-1 rounded-lg  dark:bg-darkSecond bg-opacity-20" />
                            </div>
                        </div>}
                </div>

                <div className="flex flex-col-reverse sm:grid grid-cols-2 w-full justify-center gap-12 pt-6">
                    <Button version="second" className="!rounded-xl" onClick={() => navigate.back()}>Cancel</Button>
                    <Button isLoading={isLoading} type="submit" className="bg-primary text-sm xl:text-base !rounded-xl !px-0 py-2 text-white flex items-center justify-center" >Create</Button>
                </div>
            </div>

        </form>
    </div>
}

export default NewExercise