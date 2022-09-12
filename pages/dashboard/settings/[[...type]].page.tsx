import AnimatedTabBar from "components/animatedTabBar";
import { useRouter } from "next/router";
import OwnerSetting from "./_components/owner";
import ProfileSetting from "./_components/profile";
import TagsSetting from "./_components/tags";
import WalletSetting from "./_components/wallet";



const SettingLayout = () => {

    const { type } = useRouter().query as { type: string[] | undefined }

    const path = '/dashboard/settings'
    const navigate = useRouter()

    const data = [
        {
            to: `${path}?noAnimation=true`,
            text: "General"
        },
        {
            to: `${path}/Labels?index=1&noAnimation=true`,
            text: "Labels"
        },
        {
            to: `${path}/Wallets?index=2&noAnimation=true`,
            text: "Wallets"
        },
        {
            to: `${path}/Owners?index=3&noAnimation=true`,
            text: "Owners"
        },
    ]
    const index = (navigate.query.index as string | undefined) ? +navigate.query.index! : 0


    return (
        <div>
            <div className="w-full">
                <div className=" flex justify-between items-center w-full">
                    <div className="text-2xl font-bold pb-12">
                        Settings
                    </div>
                </div> {/*relative after:absolute after:w-full after:h-[1px] after:bg-black after:bottom-[1px] after:left-0 after:z-10 */}
                <div className="flex w-[90%] justify-between">
                    <AnimatedTabBar data={data} index={index} className={'!text-xl'} />
                </div>
            </div>
            <div className="">
                {!type && <ProfileSetting />}
                {type?.[0] === "Labels" && <TagsSetting />}
                {type?.[0] === "Wallets" && <WalletSetting />}
                {(type?.[0] === "Owners") && <OwnerSetting />}
            </div>
        </div>
    )
}

export default SettingLayout;