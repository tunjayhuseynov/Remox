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
import { SelectAccountType, SelectDarkMode, SelectRemoxAccount } from 'redux/slices/account/selector';
import { TextField } from '@mui/material';
import DatePicker from 'react-multi-date-picker';
import DatePanel from 'react-multi-date-picker/plugins/date_panel';
import dateFormat from 'dateformat'
import datentime from 'date-and-time'

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
            if (!remoxAccount) throw new Error("No remox account found")
            if (selectedPayment.name === "Custom period" && (!date[0] || !date[1])) throw new Error("Custom period has not been selected")
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
            <div className="px-12 flex flex-col space-y-12">
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
                <div>
                    <Dropdown
                        labelSX={{
                            fontSize: '0.875rem'
                        }}
                        sx={{
                            fontSize: '0.875rem'
                        }}
                        textClass="text-xs"
                        parentClass={'bg-white dark:bg-darkSecond w-full rounded-lg h-full'}
                        label="Dates  of the budgetary exercise"
                        list={paymentType}
                        selected={selectedPayment}
                        setSelect={setSelectedPayment} />
                </div>
                <div>
                    {selectedPayment.name === "Current full year" ?
                        <div className="flex gap-4 items-center justify-start w-full dark:bg-gray-600 bg-gray-200 py-4 pl-4 border border-gray-300 dark:border-gray-600 rounded-md text-xs">
                            <div>From {dateFormat(new Date(), "dd/mm/yyyy")} to {dateFormat(datentime.addYears(new Date(), 1), "dd/mm/yyyy")}</div>
                        </div>
                        :
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
                    }
                </div>

                <div className="flex flex-col-reverse sm:grid grid-cols-2 w-full justify-center gap-12 pt-6">
                    <Button version="second" className="!rounded-xl !text-sm" onClick={() => navigate.back()}>Cancel</Button>
                    <Button isLoading={isLoading} type="submit" className="bg-primary !text-sm !rounded-xl !px-0 py-2 text-white flex items-center justify-center" >Create new budgetary exercise</Button>
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