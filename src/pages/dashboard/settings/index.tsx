import AnimatedTabBar from "components/animatedTabBar";
import { NavLink, Outlet } from "react-router-dom";


const SettingLayout = () => {
    const path = '/dashboard/settings'

    const data = [
        {
            to: `${path}`,
            text: "Owner"
        },
        {
            to: `${path}/tags`,
            text: "Tags"
        },
        {
            to: `${path}/profile`,
            text: "Profile"
        },
    ]
    return (
        <div>
            <div className="w-full"> {/*relative after:absolute after:w-full after:h-[1px] after:bg-black after:bottom-[1px] after:left-0 after:z-10 */}
                <div className="mx-5 grid grid-cols-3 w-[25%] gap-x-12 ">
                    <AnimatedTabBar data={data} />
                </div>
            </div>

            <div className="px-10 py-5">
                <Outlet />
            </div>
        </div>
    )
}

export default SettingLayout;