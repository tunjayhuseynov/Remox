import React, { useState } from 'react'
import Button from '../../../../components/button';
import Paydropdown from "../../../pay/paydropdown";
import { useForm, SubmitHandler } from "react-hook-form";
import Dropdown from "components/general/dropdown";
import { DropDownItem } from "types";

interface IFormInput {
    name: string;
    from: Date;
    to: Date;
}

function NewExercise({ setExercise, setSign, setNewBudget }: { setNewBudget: React.Dispatch<boolean>, setSign: React.Dispatch<boolean>, setExercise: React.Dispatch<boolean> }) {

    const { register, handleSubmit } = useForm<IFormInput>();
    const paymentname: DropDownItem[] = [{ name: "Current full Year" }, { name: "Custom period" }]
    const [selectedPayment, setSelectedPayment] = useState(paymentname[0])


    let today = new Date()
    let From = today.getFullYear() + '/' + (today.getMonth() + 1) + '/' + today.getDate();
    let To = (today.getFullYear() + 1) + '/' + (today.getMonth() + 1) + '/' + today.getDate();


    const onSubmit: SubmitHandler<IFormInput> = data => {

        const fromDate = From;
        const toDate = To;
        console.log(data, fromDate, toDate);
        setSign(true);
        setNewBudget(true);
        setExercise(false)
    };

    return <form onSubmit={handleSubmit(onSubmit)}>
        <div className="text-2xl text-center font-medium py-6">Define  of your budgetary exercise</div>
        <div className="px-12 flex flex-col gap-4">
            <div className="flex flex-col">
                <span className="text-left  text-greylish pb-2 ml-1" >Name  of your budgetary exercise</span>
                <input type="text" {...register("name", { required: true })} className="border w-full py-2 px-1 rounded-lg dark:bg-darkSecond" />
            </div>
            <div className="flex flex-col pt-6">
                <span className="text-left  text-greylish pb-2 ml-1" >Dates  of the budgetary exercise</span>
                <Dropdown parentClass={'bg-white w-full rounded-lg h-[3.4rem]'} className={'!rounded-lg h-[3.4rem]'} childClass={'!rounded-lg'} list={paymentname} selected={selectedPayment} onSelect={(e) => {
                setSelectedPayment(e)
              }} />
            </div>
            <div className="flex pt-4">
                {selectedPayment.name === "Current full Year" ?
                    <div className="flex w-full gap-4 items-center justify-center">
                        <div className="flex flex-col gap-1 w-full">
                            <div className="text-sm text-greylish black:text-white">From</div>
                            <div className="border w-full py-2 px-1 rounded-lg bg-greylish dark:bg-darkSecond bg-opacity-20"  >
                                {From}
                            </div>
                        </div>
                        <div className="flex  border-b w-[10%] pt-4"></div>
                        <div className="flex flex-col gap-1 w-full">
                            <div className="text-sm text-greylish black:text-white ">To</div>
                            <div className="border w-full py-2 px-1 rounded-lg bg-greylish dark:bg-darkSecond bg-opacity-20">
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
                <Button version="second" className="!rounded-xl" onClick={() => { setExercise(false); setNewBudget(false) }}>Cancel</Button>
                <Button type="submit" className="bg-primary text-sm xl:text-base !rounded-xl !px-0 py-2 text-white flex items-center justify-center" >Create</Button>
            </div>
        </div>

    </form>
}

export default NewExercise