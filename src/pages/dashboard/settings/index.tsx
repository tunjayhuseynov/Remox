import { NavLink, Outlet } from "react-router-dom";


const SettingLayout = () => {
    const path = '/dashboard/settings'
    return (
        <div>
            <div className="flex w-full relative after:absolute after:w-full after:h-[1px] after:bg-black after:bottom-[1px] after:left-0 after:z-10">
                <NavLink to={path} end className={({ isActive }) => isActive ? 'text-primary border-b-[3px] border-primary z-50 mx-5' : 'mx-5'}>
                    <div className="flex gap-x-3 pb-3 ">
                        <img src="/icons/ownerSetting.svg" className="dark:invert dark:brightness-0"/>
                        <span>Owner</span>
                    </div>
                </NavLink>
                {/* <NavLink to={`/dashboard/settings/spending`} className="mx-5" activeClassName='text-primary border-b-[3px] border-primary z-50'>
                    <div className="flex gap-x-3 pb-3">
                        <img src="/icons/spendingSetting.svg" />
                        Spending Limits (soon)
                    </div>
                </NavLink>*/}
                <NavLink to={path + "/profile"} className={({ isActive }) => isActive ? 'text-primary border-b-[3px] border-primary z-50 mx-5' : 'mx-5'}>
                    <div className="flex gap-x-3 pb-3 ">
                        <img src="/icons/profileSetting.svg" className="dark:invert dark:brightness-0"/>
                        <span>Profile</span>
                    </div>
                </NavLink>
            </div>
            <div className="px-10 py-5">
                <Outlet />
            </div>
        </div>
    )
}

export default SettingLayout;