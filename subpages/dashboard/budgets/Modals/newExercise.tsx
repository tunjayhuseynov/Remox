import React, { useState } from 'react'
import Button from '../../../../components/button';
import Paydropdown from "../../../pay/paydropdown";

function NewExercise({setExercise,setSign,setNewBudget}:{setNewBudget?:React.Dispatch<boolean>, setSign?: React.Dispatch<boolean>, setExercise: React.Dispatch<boolean>}) {

    const [value, setValue] = useState('Current full Year')

    const paymentname = ["Current full Year","Custom period"]

   return <div>
        <div className="text-2xl text-center font-medium py-6">Define  of your budgetary exercise</div>
        <div className="px-12 flex flex-col gap-4">
            <div className="flex flex-col">
                <span className="text-left  text-greylish pb-2 ml-1" >Name  of your budgetary exercise</span>
                <input type="text" className="border w-full py-2 px-1 rounded-lg dark:bg-darkSecond" />
            </div>
            <div className="flex flex-col pt-6">
                <span className="text-left  text-greylish pb-2 ml-1" >Dates  of the budgetary exercise</span>
                <Paydropdown  paymentname={paymentname}  value={value} setValue={setValue} />
            </div>
            <div className="flex pt-4">
                {value==="Current full Year" ?
                <div className="flex w-full gap-4 items-center justify-center">
                     <div className="flex flex-col gap-1 w-full">
                         <div className="text-sm text-greylish black:text-white">From</div>
                         <input type="date" className="border w-full py-2 px-1 rounded-lg bg-greylish dark:bg-darkSecond bg-opacity-20" readOnly /> 
                     </div>
                     <div className="flex  border-b w-[10%] pt-4"></div>
                     <div className="flex flex-col gap-1 w-full">
                         <div className="text-sm text-greylish black:text-white ">To</div>
                         <input type="date" className="border w-full py-2 px-1 rounded-lg bg-greylish dark:bg-darkSecond bg-opacity-20" readOnly /> 
                     </div>
                </div>
                 :
                 <div className="flex w-full gap-4 items-center justify-center">
                 <div className="flex flex-col gap-1 w-full">
                     <div className="text-sm text-greylish black:text-white">From</div>
                     <input type="date" className="border w-full py-2 px-1 rounded-lg  dark:bg-darkSecond bg-opacity-20"  /> 
                 </div>
                 <div className="flex  border-b w-[10%] pt-4"></div>
                 <div className="flex flex-col gap-1 w-full">
                     <div className="text-sm text-greylish black:text-white ">To</div>
                     <input type="date" className="border w-full py-2 px-1 rounded-lg  dark:bg-darkSecond bg-opacity-20"  /> 
                 </div>
            </div>}
            </div>
            
            <div className="flex flex-col-reverse sm:grid grid-cols-2 w-full justify-center gap-12 pt-6">
                <Button version="second" className="!rounded-xl" onClick={() => {setExercise(false) ;setNewBudget && setNewBudget(false)}}>Cancel</Button>
                <Button type="submit" className="bg-primary text-sm xl:text-base !rounded-xl !px-0 py-2 text-white flex items-center justify-center" onClick={() => {setSign && setSign(true);setNewBudget && setNewBudget(true);  setExercise(false) }}>Create</Button>
            </div>
        </div>

    </div>
}

export default NewExercise