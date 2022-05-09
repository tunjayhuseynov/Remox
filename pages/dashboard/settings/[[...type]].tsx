import AnimatedTabBar from "components/animatedTabBar";
import { useRouter } from "next/router";
import OwnerSetting from "subpages/dashboard/settings/owner";
import ProfileSetting from "subpages/dashboard/settings/profile";
import TagsSetting from "subpages/dashboard/settings/tags";


const SettingLayout = () => {

    const { type } = useRouter().query as { type: string[] | undefined }

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
                {type?.[0] === "profile" && <ProfileSetting />}
                {type?.[0] === "tags" && <TagsSetting />}
                {(!type || type[0] === "owner") && <OwnerSetting />}
            </div>
        </div>
    )
}

export default SettingLayout;