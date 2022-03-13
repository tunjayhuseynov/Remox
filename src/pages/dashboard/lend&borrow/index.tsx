import { NavLink, Outlet } from 'react-router-dom';


const Lendborrow = () => {

    const path = '/dashboard/lend-and-borrow'
    return <div className="flex flex-col space-y-3">
        <div className="text-2xl font-bold pl-10">
            Lend - Borrow
        </div>
        <div className="flex pl-5 pt-2 w-full">
            <NavLink to={path} end className={({ isActive }) => isActive ? 'text-primary border-b-[3px] border-primary z-50 mx-5' : 'mx-5'}>
                <div className="flex gap-x-3 pb-3 font-semibold tracking-wider">
                    <span>Lending</span>
                </div>
            </NavLink>
            <NavLink to={path + '/borrow'} className={({ isActive }) => `mx-5 ${isActive && "text-primary border-b-[3px] border-primary z-50"}`}>
                <div className="flex gap-x-3 pb-3 font-semibold tracking-wider">
                    Borrowing
                </div>
            </NavLink>
        </div>
        <div className="pt-3 pb-10">
            <Outlet />
        </div>

    </div>
}

export default Lendborrow;