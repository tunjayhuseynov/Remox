import { NavLink, Outlet } from "react-router-dom";


const SettingLayout = () => {
    const path = '/dashboard/settings'
    return (
        <div>
            <div className="w-full relative after:absolute after:w-full after:h-[1px] after:bg-black after:bottom-[1px] after:left-0 after:z-10">
                <div className="mx-5 grid grid-cols-3 w-[25%] gap-x-12 ">
                    <NavLink to={path} end className={({ isActive }) => isActive ? 'text-primary border-b-[3px] border-primary z-50 ' : ''}>
                        <div className="flex gap-x-3 pb-3 font-semibold tracking-wide">
                            {/* <img src="/icons/ownerSetting.svg" className="dark:invert dark:brightness-0"/> */}
                            <span>Owner</span>
                        </div>
                    </NavLink>
                    {/* <NavLink to={`/dashboard/settings/spending`} className="" activeClassName='text-primary border-b-[3px] border-primary z-50'>
                    <div className="flex gap-x-3 pb-3">
                        <img src="/icons/spendingSetting.svg" />
                        Spending Limits (soon)
                    </div>
                </NavLink>*/}
                    <NavLink to={path + "/tags"} className={({ isActive }) => `${isActive ? 'text-primary border-b-[3px] border-primary z-50 ' : ''}`}>
                        <div className="flex gap-x-3 pb-3 font-semibold tracking-wide">
                            {/* <img src="/icons/profileSetting.svg" className="dark:invert dark:brightness-0"/> */}
                            <span>Tags</span>
                        </div>
                    </NavLink>
                    <NavLink to={path + "/profile"} className={({ isActive }) => isActive ? 'text-primary border-b-[3px] border-primary z-50' : ''}>
                        <div className="flex gap-x-3 pb-3 font-semibold tracking-wide">
                            {/* <img src="/icons/profileSetting.svg" className="dark:invert dark:brightness-0"/> */}
                            <span>Profile</span>
                        </div>
                    </NavLink>
                </div>
            </div>

            <div className="px-10 py-5">
                <Outlet />
            </div>
        </div>
    )
}

export default SettingLayout;