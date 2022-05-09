import AnimatedTabBar from 'components/animatedTabBar';
import DynamicPayroll from 'subpages/dashboard/payroll/dynamicPayroll';
import { useRouter } from 'next/router';

const Payroll = () => {

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
        <div className="text-2xl font-bold">
            Payroll
        </div>
        <div className="flex pl-5 pt-2 w-full ">
            <AnimatedTabBar data={data} />
        </div>
        <div className="py-3">
            <DynamicPayroll type={!type || type === "manual" ? "manual" : "auto"} />
        </div>
    </div>
}

export default Payroll;