import AnimatedTabBar from "components/animatedTabBar";
import { useRouter } from "next/router";
import OwnerSetting from "subpages/dashboard/settings/owner";
import ProfileSetting from "subpages/dashboard/settings/profile";
import TagsSetting from "subpages/dashboard/settings/tags";
import WalletSetting from "subpages/dashboard/settings/wallet";


const SettingLayout = () => {

    const { type } = useRouter().query as { type: string[] | undefined }

    const path = '/dashboard/settings'

    const data = [
        {
            to: `${path}`,
            text: "General"
        },
        {
            to: `${path}/Labels`,
            text: "Labels"
        },
        {
            to: `${path}/Wallets`,
            text: "Wallets"
        },
        {
            to: `${path}/Owners`,
            text: "Owners"
        },
    ]
    return (
        <div>
            <div className="w-full">
            <div className=" flex justify-between items-center w-full">
                <div className="text-4xl font-bold pb-12">
                    Settings
                </div>
            </div> {/*relative after:absolute after:w-full after:h-[1px] after:bg-black after:bottom-[1px] after:left-0 after:z-10 */}
                <div className="flex  w-[90%] justify-between">
                    <AnimatedTabBar data={data} index={0} className={'!text-2xl'} />
                </div>
            </div>
            <div className="">
                {!type && <ProfileSetting />}
                {type?.[0] === "Labels" && <TagsSetting />}
                {type?.[0] === "Wallets" && <WalletSetting />}
                {( type?.[0] === "Owners") && <OwnerSetting />}
            </div>
        </div>
    )
}

export default SettingLayout;