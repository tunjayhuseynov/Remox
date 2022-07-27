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

export interface IOrgData {
    orgPhoto?: File,
    orgName:string,
    name: string,
    photo?: File
}


const ProfileSetting = () => {

    const [isUser, setUser] = useState(false)
    const [isCompany, setCompany] = useState(false)
    const [orgphoto, setOrgphoto] = useState(false)
    const [orgname, setOrgname] = useState(false)
    const [name, setName] = useState(false)
    const [photo, setPhoto] = useState(false)
    const [value, setValue] = useState('')
    const [file, setFile] = useState<File>()
    const { isLoading, UpdateCompany, UpdateNameSurname, profile } = useProfile()

    const [photoIsUpload2, setPhotoIsUpload2] = useState<boolean>(true)
    const paymentname2: DropDownItem[] = [{ name: "Upload Photo" }, { name: "NFT" }]
    const [selectedPayment2, setSelectedPayment2] = useState(paymentname2[0])

    const update = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const { name, surname, company }: { [name: string]: HTMLInputElement } = e.target as HTMLFormElement;
        try {
            if (name && surname && !company) {
                setUser(true)
                await UpdateNameSurname(name.value, surname.value)
                setUser(false)
            } else if (company && !name && !surname) {
                setCompany(true)
                await UpdateCompany(company.value)
                setCompany(false)
            }
        } catch (error) {
            console.error(error)
            setCompany(false)
            setUser(false)
        }
    }

  const  OrganisationData: IOrgData = {
        orgName:"Remox, Inc",
        name:"Orkhan",
    }



    return <div className=" py-5 flex flex-col space-y-10">
        {orgphoto && <Modal onDisable={setOrgphoto} animatedModal={false}  disableX={true} className="lg:min-w-[auto] overflow-visible !w-[30%] !pt-4">
                        <OrgPhoto setOrgphoto={setOrgphoto} orgPhoto={OrganisationData.orgPhoto} />
                </Modal>}
                {orgname && <Modal onDisable={setOrgname} animatedModal={false} disableX={true} className="lg:min-w-[auto] overflow-visible !w-[30%] !pt-4">
                        <Orgname setOrgname={setOrgname}  />
                </Modal>}
                {photo && <Modal onDisable={setPhoto} animatedModal={false} disableX={true} className="lg:min-w-[auto] overflow-visible !w-[30%] !pt-4">
                    <Photo setPhoto={setPhoto} photo={OrganisationData.photo} />
                </Modal>}
                {name && <Modal onDisable={setName} animatedModal={false} disableX={true} className="lg:min-w-[auto] overflow-visible !w-[30%] !pt-4">
                   <Name setName={setName} />
                </Modal>}

                { //profile ?
                    <>
                        <div className="w-full pt-2 pb-2  border-t ">
                            <div className="w-full border-b">
                                <div className={` py-5 flex ${!OrganisationData.orgPhoto?.name && 'items-center'}  gap-[19rem]`}>
                                    <div className="text-lg font-semibold pt-2"> Organisation Photo</div>
                                    <div className="">
                                        {OrganisationData.orgPhoto?.name && <div className="flex items-center gap-1 pb-2">
                                            <div className=" p-5 rounded-full bg-greylish bg-opacity-20"></div>
                                            <div className="">{OrganisationData.orgPhoto?.name}</div>
                                        </div>}
                                        <div className="text-primary hover:text-[#ff5413] dark:hover:text-[#ff5413] hover:transition-all pl-1 flex items-center gap-2 cursor-pointer" onClick={() => { setOrgphoto(true) }}>
                                        {OrganisationData.orgPhoto?.name ? <span>Edit <img src="/icons/rightArrow.png" alt="" className="w-3 h-4 " /> </span> : <span className="text-xl flex items-center gap-2 "> <span className="px-[0.45rem] rounded-full text-primary border border-primary text-base hover:text-[#ff5413] dark:hover:text-[#ff5413] dark:hover:border-[#ff5413] peer-hover:border-[#ff5413] hover:transition-all">+</span> Add</span> }
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full border-b">
                                <div className=" py-5 flex gap-[19.2rem]">
                                    <div className="text-lg font-semibold "> Organisation Name</div>
                                    <div className=" ">
                                        <div className="">{OrganisationData.orgName}</div>
                                        <div className="text-primary  flex items-center gap-2 cursor-pointer" onClick={() => { setOrgname(true) }}>
                                            Edit <img src="/icons/rightArrow.png" alt="" className="w-3 h-4 " />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full border-b">
                                <div className={` py-5 flex ${!OrganisationData.photo?.name && 'items-center'}  gap-[23.4rem]`}>
                                    <div className="text-lg font-semibold pt-2"> Your Photo</div>
                                    <div className=" ">
                                    {OrganisationData.photo?.name && <div className="flex items-center gap-1 pb-2">
                                            <div className=" p-5 rounded-full bg-greylish bg-opacity-20"></div>
                                            <div className="">{OrganisationData.photo?.name}</div>
                                        </div>}
                                        <div className="text-primary hover:text-[#ff5413] dark:hover:text-[#ff5413] hover:transition-all pl-1 flex items-center gap-2 cursor-pointer" onClick={() => { setPhoto(true) }}>
                                        {OrganisationData.photo?.name ? <span>Edit <img src="/icons/rightArrow.png" alt="" className="w-3 h-4 " /> </span> : <span className="text-xl flex items-center gap-2 "> <span className="px-[0.45rem] rounded-full text-primary border border-primary text-base hover:text-[#ff5413] dark:hover:text-[#ff5413] dark:hover:border-[#ff5413] peer-hover:border-[#ff5413] hover:transition-all">+</span> Add</span> }
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full border-b">
                                <div className=" py-5 flex gap-[23.6rem]">
                                    <div className="text-lg font-semibold "> Your Name</div>
                                    <div className=" ">
                                        <div className="">{OrganisationData.name}</div>
                                        <div className="text-primary  flex items-center gap-2 cursor-pointer" onClick={() => { setName(true) }}>
                                            Edit <img src="/icons/rightArrow.png" alt="" className="w-3 h-4 " />
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                    </>
                    // : <div className="flex justify-center"> <Loader /> </div>
                }
            </div>
}

            export default ProfileSetting;