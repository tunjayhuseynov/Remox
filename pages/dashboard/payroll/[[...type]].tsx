import {useState} from 'react'
import AnimatedTabBar from 'components/animatedTabBar';
import DynamicPayroll from 'subpages/dashboard/payroll/dynamicPayroll';
import { useRouter } from 'next/router';
import {  IMember } from 'apiHooks/useContributors';
import Button from 'components/button';

const Payroll = () => {
    const memberState = useState<IMember[]>([])
    const [button, setButton] = useState(false)
    const router = useRouter()
    const { type } = router.query as { type: string | undefined }

    const data = [
        {
            to: "/dashboard/payroll",
            text: "Manual Payroll"
        },
        {
            to: "/dashboard/payroll/automation",
            text: "Automated Payroll"
        }
    ]

    return <div className="flex flex-col space-y-3">
            <div className="flex justify-between items-center w-full">
                <div className="text-3xl font-bold">
                    Payroll
                </div>
            </div>
        {/* <div className="flex pl-5 pt-2 w-full ">
            <AnimatedTabBar data={data} />
        </div> */}
        <div className="py-3">
            <DynamicPayroll  />
        </div>
    </div>
}


export default Payroll;