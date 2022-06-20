import { FormEvent, useEffect, useState } from "react";
import Button from "components/button";
import useProfile from "rpcHooks/useProfile";
import Loader from "components/Loader";
import Modal from 'components/general/modal'
import Paydropdown from "subpages/pay/paydropdown";
import Upload from "components/upload";
import { useWalletKit } from 'hooks'
import Dropdown from "components/general/dropdown";
import { DropDownItem } from "types";
import { useForm, SubmitHandler } from "react-hook-form";
import Orgphoto from "./profile/orgphoto";
import Orgname from "./profile/orgname";
import Photo from "./profile/photo";
import Name from "./profile/name";



const ProfileSetting = () => {

    const { blockchain } = useWalletKit();
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




    return <div className=" py-5 flex flex-col space-y-10">
        {orgphoto && <Modal onDisable={setOrgphoto} disableX={true} className="lg:min-w-[auto] overflow-visible !w-[30%] !pt-4">
                        <Orgphoto setOrgphoto={setOrgphoto} />
                </Modal>}
                {orgname && <Modal onDisable={setOrgname} disableX={true} className="lg:min-w-[auto] overflow-visible !w-[30%] !pt-4">
                        <Orgname setOrgname={setOrgname} />
                </Modal>}
                {photo && <Modal onDisable={setPhoto} disableX={true} className="lg:min-w-[auto] overflow-visible !w-[30%] !pt-4">
                    <Photo setPhoto={setPhoto} />
                </Modal>}
                {name && <Modal onDisable={setName} disableX={true} className="lg:min-w-[auto] overflow-visible !w-[30%] !pt-4">
                   <Name setName={setName} />
                </Modal>}

                { //profile ?
                    <>
                        <div className="w-full pt-2 pb-2 rounded-xl border-t ">
                            <div className="w-full border-b">
                                <div className=" py-5 flex  gap-[19rem]">
                                    <div className="text-lg font-semibold pt-2"> Organisation Photo</div>
                                    <div className=" ">
                                        <div className="flex items-center gap-1 pb-2">
                                            <div className=" p-5 rounded-full bg-greylish bg-opacity-20"></div>
                                            <div className="">Remox.png</div>
                                        </div>
                                        <div className="text-primary pl-1 flex items-center gap-2 cursor-pointer" onClick={() => { setOrgphoto(true) }}>
                                            Edit <img src="/icons/rightArrow.png" alt="" className="w-3 h-4 " />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full border-b">
                                <div className=" py-5 flex gap-[19.2rem]">
                                    <div className="text-lg font-semibold "> Organisation Name</div>
                                    <div className=" ">
                                        <div className="">Remox, Inc</div>
                                        <div className="text-primary  flex items-center gap-2 cursor-pointer" onClick={() => { setOrgname(true) }}>
                                            Edit <img src="/icons/rightArrow.png" alt="" className="w-3 h-4 " />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full border-b">
                                <div className=" py-5 flex gap-[23.4rem]">
                                    <div className="text-lg font-semibold pt-2"> Your Photo</div>
                                    <div className=" ">
                                        <div className="flex items-center gap-1 pb-2">
                                            <div className=" p-5 rounded-full bg-greylish bg-opacity-20"></div>
                                            <div className="">YourPhoto.png</div>
                                        </div>
                                        <div className="text-primary pl-1  flex items-center gap-2 cursor-pointer" onClick={() => { setPhoto(true) }}>
                                            Edit <img src="/icons/rightArrow.png" alt="" className="w-3 h-4 " />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full border-b">
                                <div className=" py-5 flex gap-[23.6rem]">
                                    <div className="text-lg font-semibold "> Your Name</div>
                                    <div className=" ">
                                        <div className="">Your Name</div>
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