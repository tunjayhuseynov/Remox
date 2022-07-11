import React, { useState } from 'react'
import Button from '../../../../components/button';
import Paydropdown from "../../../pay/paydropdown";
import { useForm, SubmitHandler } from "react-hook-form";
import Dropdown from "components/general/dropdown";
import { DropDownItem } from "types";
import useBudgetExercise from 'hooks/budgets/useBudgetExercise';
import { useWalletKit } from 'hooks';
import { GetTime } from 'utils';
import useRemoxAccount from 'hooks/accounts/useRemoxAccount';
import { process } from 'uniqid'
import { ToastRun } from 'utils/toast';
import useLoading from 'hooks/useLoading';

interface IFormInput {
    name: string;
    from: Date;
    to: Date;
}

function NewExercise({ setExercise, setNewBudget }: { setNewBudget: React.Dispatch<boolean>, setExercise: React.Dispatch<boolean> }) {

    const { register, handleSubmit } = useForm<IFormInput>();
    const paymentname: DropDownItem[] = [{ name: "Current full Year" }, { name: "Custom period" }]
    const [selectedPayment, setSelectedPayment] = useState(paymentname[0])
    const { create_exercise } = useBudgetExercise()
    const { blockchain, Address } = useWalletKit()
    const { remoxAccount, remoxAccountType } = useRemoxAccount(Address ?? "0x", blockchain)

    let today = new Date()
    let From = today.getFullYear() + '/' + (today.getMonth() + 1) + '/' + today.getDate();
    let To = (today.getFullYear() + 1) + '/' + (today.getMonth() + 1) + '/' + today.getDate();


    const onSubmit: SubmitHandler<IFormInput> = async (data) => {
        try {
            if (!remoxAccount) throw new Error("No remox account found")
            const fromDate = new Date(From);
            const toDate = new Date(To);

            await create_exercise({
                blockchain,
                budgets: [],
                created_at: GetTime(),
                from: GetTime(fromDate),
                to: GetTime(toDate),
                id: process(),
                name: data.name,
                parentId: remoxAccount.id,
                parentType: remoxAccountType,
            })
            setNewBudget(true);
            setExercise(false)
        } catch (error) {
            console.error(error as any)
            ToastRun(<div>{(error as any).message}</div>)
        }
    };

    const [isLoading, submit] = useLoading(onSubmit)

    return <form onSubmit={handleSubmit(submit)} className="w-1/2 mx-auto">
        <div className="text-2xl text-center font-medium py-6">Define  of your budgetary exercise</div>
        <div className="px-12 flex flex-col gap-4">
            <div className="flex flex-col">
                <span className="text-left  text-greylish  pb-2 ml-1" >Name  of your budgetary exercise</span>
                <input type="text" {...register("name", { required: true })} className="border w-full py-2 px-1 rounded-lg dark:bg-darkSecond" />
            </div>
            <div className="flex flex-col pt-6">
                <span className="text-left  text-greylish pb-2 ml-1" >Dates  of the budgetary exercise</span>
                <Dropdown parentClass={'bg-white dark:bg-darkSecond w-full rounded-lg h-[3rem]'} className={'!rounded-lg h-[3rem] dark:border-white'} childClass={'!rounded-lg'} list={paymentname} selected={selectedPayment} onSelect={(e) => {
                    setSelectedPayment(e)
                }} />
            </div>
            <div className="flex pt-4">
                {selectedPayment.name === "Current full Year" ?
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
                            <input type="date" {...register("to")} className="border w-full py-2 px-1 rounded-lg  dark:bg-darkSecond bg-opacity-20" />
                        </div>
                        <div className="flex  border-b w-[10%] pt-4"></div>
                        <div className="flex flex-col gap-1 w-full">
                            <div className="text-sm text-greylish black:text-white ">To</div>
                            <input type="date" {...register("from")} className="border w-full py-2 px-1 rounded-lg  dark:bg-darkSecond bg-opacity-20" />
                        </div>
                    </div>}
            </div>

            <div className="flex flex-col-reverse sm:grid grid-cols-2 w-full justify-center gap-12 pt-6">
                <Button version="second" className="!rounded-xl" onClick={()=> setExercise(false)}>Cancel</Button>
                <Button isLoading={isLoading} type="submit" className="bg-primary text-sm xl:text-base !rounded-xl !px-0 py-2 text-white flex items-center justify-center" >Create</Button>
            </div>
        </div>

    </form>
}

export default NewExercise