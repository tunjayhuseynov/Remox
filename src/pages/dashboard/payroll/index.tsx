import { useState } from 'react'
import Success from 'components/general/success';
import { useAppSelector, useAppDispatch } from 'redux/hooks'
import { changeError, changeSuccess, selectError, selectSuccess } from 'redux/reducers/notificationSlice'
import Error from 'components/general/error';
import { NavLink, Outlet } from 'react-router-dom';
import { motion, AnimateSharedLayout } from "framer-motion";
import AnimatedTabBar from 'components/animatedTabBar';

const Payroll = () => {
    const isSuccess = useAppSelector(selectSuccess)
    const isError = useAppSelector(selectError)
    const dispatch = useAppDispatch()
    const [selected, setSelected] = useState(0);

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
            <Outlet />
        </div>
        {isSuccess && <Success onClose={(val: boolean) => dispatch(changeSuccess({ activate: val }))} />}
        {isError && <Error onClose={(val: boolean) => dispatch(changeError({ activate: val }))} />}
    </div>
}

export default Payroll;