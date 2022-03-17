import { useState } from 'react'
import Success from 'components/general/success';
import { useAppSelector, useAppDispatch } from 'redux/hooks'
import { changeError, changeSuccess, selectError, selectSuccess } from 'redux/reducers/notificationSlice'
import Error from 'components/general/error';
import { NavLink, Outlet } from 'react-router-dom';
import { motion, AnimateSharedLayout } from "framer-motion";

const Payroll = () => {
    const isSuccess = useAppSelector(selectSuccess)
    const isError = useAppSelector(selectError)
    const dispatch = useAppDispatch()
    const [selected, setSelected] = useState(0);

    const data = [
        {
            to: "/dashboard/payroll",
            text: "Manual"
        },
        {
            to: "/dashboard/payroll/automation",
            text: "Automated"
        }
    ]

    return <div className="flex flex-col space-y-3">
        <div className="text-2xl font-bold pl-10">
            Payroll
        </div>
        <div className="flex pl-5 pt-2 w-full ">
            <AnimateSharedLayout>
                {data.map((item, i) => {
                    return <NavLink key={i} to={`${item.to}`} end className={'mx-5'}>
                        <motion.div className={`tiflex gap-x-3 pb-3 font-semibold tracking-widertle ${i === selected ? "selected" : ""}`} onClick={() => setSelected(i)} animate >
                            <span>{item.text} </span>
                            <span className="relative">
                                {i === selected && (<motion.span className="absolute w-full h-[3px] bg-primary rounded-[2px] bottom-[-10px]" layoutId="underline" />)}
                                Payroll</span>
                        </motion.div>
                    </NavLink>
                })}
            </AnimateSharedLayout>
        </div>
        <div className="py-3">
            <Outlet />
        </div>
        {isSuccess && <Success onClose={(val: boolean) => dispatch(changeSuccess({ activate: val }))} />}
        {isError && <Error onClose={(val: boolean) => dispatch(changeError({ activate: val }))} />}
    </div>
}

export default Payroll;