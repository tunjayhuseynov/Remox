import React, { useState } from 'react'
import Button from '../../../../components/button';
import { useForm, SubmitHandler } from "react-hook-form";
import Dropdown from "components/general/dropdown";
import { DropDownItem } from "types";
import { useWalletKit } from 'hooks';
import { GetTime } from 'utils';
import { ToastRun } from 'utils/toast';
import useLoading from 'hooks/useLoading';
import { useRouter } from 'next/router';
import { useAppDispatch, useAppSelector } from 'redux/hooks';
import { Update_Budget_Exercise_Thunk } from 'redux/slices/account/thunks/budgetThunks/budgetExercise';
import { SelectAccountType, SelectDarkMode, SelectRemoxAccount } from 'redux/slices/account/selector';
import { TextField } from '@mui/material';
import DatePicker from 'react-multi-date-picker';
import DatePanel from 'react-multi-date-picker/plugins/date_panel';
import dateFormat from 'dateformat'
import datentime from 'date-and-time'
import { IBudgetExerciseORM } from 'pages/api/budget/index.api';

interface IFormInput {
    name: string;
    from?: Date;
    to?: Date;
}

function EditExercise({ exercise, onBack }: { exercise: IBudgetExerciseORM, onBack: () => void }) {

    const { register, handleSubmit } = useForm<IFormInput>();

    const paymentType: DropDownItem[] = [{ name: "Current full year" }, { name: "Custom period" }]
    const [selectedPayment, setSelectedPayment] = useState(paymentType[1])

    const [date, setDate] = useState<number[]>([exercise.from * 1e3, exercise.to * 1e3])

    const remoxAccount = useAppSelector(SelectRemoxAccount)
    const remoxAccountType = useAppSelector(SelectAccountType)

    const navigate = useRouter()
    const dark = useAppSelector(SelectDarkMode)
    const dispatch = useAppDispatch()
    let today = new Date(exercise.from * 1e3)
    let future = new Date(exercise.to * 1e3)
    let From = today.getFullYear() + '/' + (today.getMonth() + 1) + '/' + today.getDate();
    let To = (future.getFullYear() + 1) + '/' + (future.getMonth() + 1) + '/' + future.getDate();


    const onSubmit: SubmitHandler<IFormInput> = async (data) => {
        try {
            if (!remoxAccountType) return ToastRun(<>Please. sign in first</>, "warning")
            if (!remoxAccount) throw new Error("No remox account found")
            if(!data.name) throw new Error("Please enter a name")
            if (selectedPayment.name === "Custom period" && (!date[0] || !date[1])) throw new Error("Custom period has not been selected")
            const fromDate = date[0] ? new Date(date[0]) : new Date(From);
            const toDate = date[1] ? new Date(date[1]) : new Date(To);

            await dispatch(Update_Budget_Exercise_Thunk({
                budgetExercise: {
                    budgetCoins: exercise.budgetCoins,
                    blockchain: exercise.blockchain,
                    budgets: exercise.budgets,
                    created_at: exercise.created_at,
                    from: GetTime(fromDate),
                    to: GetTime(toDate),
                    id: exercise.id,
                    name: data.name,
                    parentId: exercise.parentId,
                    parentType: exercise.parentType,
                },
            })).unwrap()
            onBack()
        } catch (error) {
            console.error(error as any)
            ToastRun(<div>{(error as any).message}</div>, "error")
        }
    };

    const [isLoading, submit] = useLoading(onSubmit)

    return <div className="w-full relative">
        <form onSubmit={handleSubmit(submit)} className="w-3/5 mx-auto pt-10">
            <div className="text-xl text-center font-medium py-6">Define  of your budgetary exercise</div>
            <div className="px-12 flex flex-col space-y-12">
                <TextField
                    InputProps={{
                        style: {
                            fontSize: '0.875rem'
                        }
                    }}
                    InputLabelProps={{
                        style: {
                            fontSize: '0.875rem'
                        }
                    }}
                    type="text" {...register("name", { required: true })} defaultValue={exercise.name} label="Name  of your budgetary exercise" className="border w-full py-2 px-1 rounded-lg dark:bg-darkSecond" />
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
                            From {dateFormat(new Date(), "dd/mm/yyyy")} to {dateFormat(datentime.addYears(new Date(), 1), "dd/mm/yyyy")}
                        </div>
                        :
                        <DatePicker render={<CustomRangeInput />} plugins={[<DatePanel sort="date" />]} containerClassName="w-full dark:bg-darkSecond bg-white" value={date} onChange={(data) => {
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
                    <Button version="second" className="!rounded-xl !text-sm" onClick={() => onBack()}>Cancel</Button>
                    <Button isLoading={isLoading} type="submit" className="bg-primary !text-sm !rounded-xl !px-0 py-2 text-white flex items-center justify-center" >Update exercise</Button>
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
            readOnly
        />
    )
}

export default EditExercise