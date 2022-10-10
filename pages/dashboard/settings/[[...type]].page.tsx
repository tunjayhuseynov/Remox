import AnimatedTabBar from "components/animatedTabBar";
import { useRouter } from "next/router";
import { useAppSelector } from "redux/hooks";
import { SelectAccountType } from "redux/slices/account/selector";
import ModeratorSetting from "./_components/moderators";
import ProfileSetting from "./_components/profile";
import TagsSetting from "./_components/tags";
import WalletSetting from "./_components/wallet";



const SettingLayout = () => {

    const { type } = useRouter().query as { type: string[] | undefined }
    const accountType = useAppSelector(SelectAccountType)

    const path = '/dashboard/settings'
    const navigate = useRouter()

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

    ]
    if (accountType === "organization") {
        data.push({
            to: `${path}/Moderators`,
            text: "Moderators"
        })
    }
    const index = type?.[0] === "Labels" ? 1 : type?.[0] === "Wallets" ? 2 : type?.[0] ? 3 : 0


    return (
        <div>
            <div className="w-full">
                <div className=" flex justify-between items-center w-full">
                    <div className="text-2xl font-bold pb-12">
                        Settings
                    </div>
                </div> {/*relative after:absolute after:w-full after:h-[1px] after:bg-black after:bottom-[1px] after:left-0 after:z-10 */}
                <div className="flex w-[65%] justify-between">
                    <AnimatedTabBar data={data} index={index} fontSize={'!text-xl'} />
                </div>
            </div>
            <div className="">
                {!type && <ProfileSetting />}
                {type?.[0] === "Labels" && <TagsSetting />}
                {type?.[0] === "Wallets" && <WalletSetting />}
                {(type?.[0] === "Moderators") && <ModeratorSetting />}
            </div>
        </div>
    )
}

export default SettingLayout;