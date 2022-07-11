import {useState} from 'react'
import AnimatedTabBar from 'components/animatedTabBar';
import DynamicPayroll from 'subpages/dashboard/payroll/dynamicPayroll';
import { useRouter } from 'next/router';
import {  IMember } from 'rpcHooks/useContributors';
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

    return <div className="w-full h-full flex flex-col space-y-3">
            <div className="flex justify-between items-center w-full">
                <div className="text-4xl font-bold">
                    Payroll
                </div>
            </div>
        {/* <div className="flex pl-5 pt-2 w-full ">
            <AnimatedTabBar data={data} index={0} />
        </div> */}
        <div className="w-full h-full py-3">
            <DynamicPayroll  />
        </div>
    </div>
}


export default Payroll;