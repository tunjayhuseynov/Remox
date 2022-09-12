import useProfile from "rpcHooks/useProfile";
import { useAppSelector } from "redux/hooks";
import { SelectAccountType, SelectBlockchain, SelectID, SelectIndividual, SelectOrganization, SelectRemoxAccount } from "redux/slices/account/selector";
import EditableTextInput from "components/general/EditableTextInput";
import EditableAvatar from "components/general/EditableAvatar";

export interface IOrgData {
    orgPhoto?: File,
    orgName: string,
    name: string,
    photo?: File
}


const ProfileSetting = () => {

    const blockchain = useAppSelector(SelectBlockchain)
    const { UpdateOrganizationName, UpdateName, UpdateImage } = useProfile()

    const individual = useAppSelector(SelectIndividual)
    const organization = useAppSelector(SelectOrganization)

    const type = useAppSelector(SelectAccountType)
    const id = useAppSelector(SelectID)
    const isOrganization = type === "organization" ? true : false

    const onImageChange = async (url: string, type: "image" | "nft") => {
        await UpdateImage(url, type)
    }


    return <div className=" py-5 flex flex-col space-y-10">
        <div className="w-full pt-2 pb-2 grid grid-rows-2 ">
            {isOrganization &&
                <div className="w-full bg-white dark:bg-darkSecond my-5 rounded-md shadow-custom px-10 flex items-center gap-[23.6rem] py-6">
                    <div className="text-lg font-semibold pt-2 self-center">Organisation Photo</div>
                    <EditableAvatar
                        avatarUrl={(typeof organization?.image?.imageUrl === "string" ? organization?.image?.imageUrl : null) ?? organization?.image?.nftUrl ?? null}
                        name={id ?? "random"}
                        blockchain={blockchain}
                        evm={blockchain.name !== "solana"}
                        userId={id ?? undefined}
                        onChange={onImageChange}
                    />
                </div>}
            {isOrganization &&
                <div className="w-full bg-white dark:bg-darkSecond my-5 rounded-md shadow-custom px-10 flex items-center gap-[23.6rem] py-6">
                    <div className="text-lg font-semibold self-center">Organisation Name</div>
                    <EditableTextInput defaultValue={organization?.name ?? ""} onSubmit={async (val) => await UpdateOrganizationName(val)} placeholder="Name" />
                </div>
            }
            <div className="w-full bg-white dark:bg-darkSecond my-5 rounded-md shadow-custom px-10 flex items-center gap-[23.6rem] py-6">
                <span className="text-lg font-semibold pt-2 self-center">Your Photo</span>
                <EditableAvatar
                    avatarUrl={(typeof individual?.image?.imageUrl === "string" ? individual?.image?.imageUrl : null) ?? individual?.image?.nftUrl ?? null}
                    name={id ?? "random"}
                    blockchain={blockchain}
                    evm={blockchain.name !== "solana"}
                    userId={id ?? undefined}
                    onChange={onImageChange}
                />
            </div>
            <div className="w-full bg-white dark:bg-darkSecond my-5 rounded-md shadow-custom px-10 flex items-center gap-[23.6rem] py-6">
                <div className="text-lg font-semibold self-center">Your Name</div>
                <EditableTextInput defaultValue={individual?.name ?? ""} onSubmit={async (val) => await UpdateName(val)} placeholder="Individual account name" />
            </div>
        </div>
    </div>
}

export default ProfileSetting;