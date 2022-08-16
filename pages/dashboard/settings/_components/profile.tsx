import { FormEvent, useEffect, useState } from "react";
import Button from "components/button";
import useProfile from "rpcHooks/useProfile";
import Loader from "components/Loader";
import Modal from 'components/general/modal'
import Paydropdown from "pages/dashboard/pay/_components/paydropdown";
import Upload from "components/upload";
import { useWalletKit } from 'hooks'
import Dropdown from "components/general/dropdown";
import { DropDownItem } from "types";
import { useForm, SubmitHandler } from "react-hook-form";
import OrgPhoto from "./profile/orgphoto";
import Orgname from "./profile/orgname";
import Photo from "./profile/photo";
import Name from "./profile/name";
import { useAppSelector } from "redux/hooks";
import { SelectAccountType, SelectIndividual, SelectOrganization, SelectRemoxAccount } from "redux/slices/account/selector";
import EditableTextInput from "components/general/EditableTextInput";
import { changeName } from "redux/slices/payinput";

export interface IOrgData {
    orgPhoto?: File,
    orgName: string,
    name: string,
    photo?: File
}


const ProfileSetting = () => {

    const [orgphoto, setOrgphoto] = useState(false)
    const [orgname, setOrgname] = useState(false)
    const [photo, setPhoto] = useState(false)
    const { UpdateOrganizationName, UpdateName } = useProfile()

    const [photoIsUpload2, setPhotoIsUpload2] = useState<boolean>(true)
    const paymentname2: DropDownItem[] = [{ name: "Upload Photo" }, { name: "NFT" }]
    const [selectedPayment2, setSelectedPayment2] = useState(paymentname2[0])


    const individual = useAppSelector(SelectIndividual)
    const organization = useAppSelector(SelectOrganization)

    const type = useAppSelector(SelectAccountType)
    const isOrganization = type === "organization" ? true : false

    const OrganisationData: IOrgData = {
        orgName: "Remox, Inc",
        name: "Orkhan",
    }



    return <div className=" py-5 flex flex-col space-y-10">
        {orgphoto && <Modal onDisable={setOrgphoto} animatedModal={false} disableX={true} className="lg:min-w-[auto] overflow-visible !w-[30%] !pt-4">
            <OrgPhoto setOrgphoto={setOrgphoto} orgPhoto={OrganisationData.orgPhoto} />
        </Modal>}
        {orgname && <Modal onDisable={setOrgname} animatedModal={false} disableX={true} className="lg:min-w-[auto] overflow-visible !w-[30%] !pt-4">
            <Orgname setOrgname={setOrgname} />
        </Modal>}
        {photo && <Modal onDisable={setPhoto} animatedModal={false} disableX={true} className="lg:min-w-[auto] overflow-visible !w-[30%] !pt-4">
            <Photo setPhoto={setPhoto} photo={OrganisationData.photo} />
        </Modal>}
        <>
            <div className="w-full pt-2 pb-2  border-t ">
                {isOrganization && <div className="w-full border-b">
                    <div className={` py-5 flex ${!OrganisationData.orgPhoto?.name && 'items-center'}  gap-[19rem]`}>
                        <div className="text-lg font-semibold pt-2">Organisation Photo</div>
                        <div>
                            {
                                OrganisationData.orgPhoto?.name &&
                                <div className="flex items-center gap-1 pb-2">
                                    <div className=" p-5 rounded-full bg-greylish bg-opacity-20"></div>
                                    <div className="">{OrganisationData.orgPhoto?.name}</div>
                                </div>
                            }
                            <div className="text-primary hover:text-[#ff5413] dark:hover:text-[#ff5413] hover:transition-all pl-1 flex items-center gap-2 cursor-pointer" onClick={() => { setOrgphoto(true) }}>
                                {OrganisationData.orgPhoto?.name ? <span>Edit <img src="/icons/rightArrow.png" alt="" className="w-3 h-4 " /> </span> : <span className="text-xl flex items-center gap-2 "> <span className="px-[0.45rem] rounded-full text-primary border border-primary text-base hover:text-[#ff5413] dark:hover:text-[#ff5413] dark:hover:border-[#ff5413] peer-hover:border-[#ff5413] hover:transition-all">+</span> Add</span>}
                            </div>
                        </div>
                    </div>
                </div>}
                {isOrganization && <div className="w-full border-b">
                    <div className=" py-5 flex gap-[19.2rem]">
                        <div className="text-lg font-semibold ">Organisation Name</div>
                        <div>
                            <EditableTextInput defaultValue={organization?.name ?? ""} onSubmit={async (val) => await UpdateOrganizationName(val)} placeholder="Name" />
                        </div>
                    </div>
                </div>
                }
                <div className="w-full border-b">
                    <div className={`py-5 flex ${!individual?.name && 'items-center'}  gap-[23.4rem]`}>
                        <div className="text-lg font-semibold pt-2">Your Photo</div>
                        <div className=" ">
                            {individual?.name && <div className="flex items-center gap-1 pb-2">
                                <div className=" p-5 rounded-full bg-greylish bg-opacity-20"></div>
                                <div className="">{individual?.name}</div>
                            </div>}
                            <div className="text-primary hover:text-[#ff5413] dark:hover:text-[#ff5413] hover:transition-all pl-1 flex items-center gap-2 cursor-pointer" onClick={() => { setPhoto(true) }}>
                                {individual?.image ? <span>Edit <img src="/icons/rightArrow.png" alt="" className="w-3 h-4" /> </span> : <span className="text-xl flex items-center gap-2 "> <span className="px-[0.45rem] rounded-full text-primary border border-primary text-base hover:text-[#ff5413] dark:hover:text-[#ff5413] dark:hover:border-[#ff5413] peer-hover:border-[#ff5413] hover:transition-all">+</span> Add</span>}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full border-b">
                    <div className=" py-5 flex gap-[23.6rem]">
                        <div className="text-lg font-semibold ">Your Name</div>
                        <div>
                            <EditableTextInput defaultValue={individual?.name ?? ""} onSubmit={async (val) => await UpdateName(val)} placeholder="Individual account name" />
                        </div>
                    </div>
                </div>

            </div>
        </>
    </div>
}

export default ProfileSetting;