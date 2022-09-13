import {useState} from 'react'
import { useRouter } from 'next/router';
import {  IMember } from 'types/dashboard/contributors';
import DynamicPayroll from './_components/dynamicPayroll';

const Payroll = () => {
    return <div className="w-full h-full flex flex-col space-y-3">
            <div className="flex justify-between items-center w-full">
                <div className="text-4xl font-bold">
                    Payroll
                </div>
            </div>
        <div className="w-full h-full py-3">
            <DynamicPayroll  />
        </div>
    </div>
}


export default Payroll;