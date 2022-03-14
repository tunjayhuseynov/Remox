import Success from 'components/general/success';
import { useAppSelector, useAppDispatch } from 'redux/hooks'
import { changeError, changeSuccess, selectError, selectSuccess } from 'redux/reducers/notificationSlice'
import Error from 'components/general/error';
import { NavLink, Outlet } from 'react-router-dom';


const Payroll = () => {
    const isSuccess = useAppSelector(selectSuccess)
    const isError = useAppSelector(selectError)
    const dispatch = useAppDispatch()

    const path = '/dashboard/payroll'
    return <div className="flex flex-col space-y-3">
        <div className="text-2xl font-bold pl-10">
            Payroll
        </div>
        <div className="flex pl-5 w-full">
            <NavLink to={path} end className={({ isActive }) => isActive ? 'text-primary border-b-[3px] border-primary z-50 mx-5' : 'mx-5'}>
                <div className="flex gap-x-3 pb-3 font-semibold tracking-wider">
                    <span>Manual Payroll</span>
                </div>
            </NavLink>
            <NavLink to={path + '/automation'} className={({ isActive }) => `mx-5 ${isActive && "text-primary border-b-[3px] border-primary z-50"}`}>
                <div className="flex gap-x-3 pb-3 font-semibold tracking-wider">
                    Automated Payroll
                </div>
            </NavLink>
        </div>
        <div className="py-3">
            <Outlet />
        </div>
        {isSuccess && <Success onClose={(val: boolean) => dispatch(changeSuccess({ activate: val }))} />}
        {isError && <Error onClose={(val: boolean) => dispatch(changeError({ activate: val }))} />}
    </div>
}

export default Payroll;