import { FormEvent, useEffect, useState } from "react";
import Button from "components/button";
import useProfile from "rpcHooks/useProfile";
import Loader from "components/Loader";
import Modal from 'components/general/modal'
import Paydropdown from "subpages/pay/paydropdown";
import Upload from "components/upload";

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

    const paymentname = ["Upload Photo", "NFT"]

    return <div className=" py-5 flex flex-col space-y-10">
        {orgphoto && <Modal onDisable={setOrgphoto} disableX={true} className="lg:min-w-[auto] overflow-visible !w-[30%] !pt-4">
            <div className="flex flex-col space-y-6 items-center w-full">
                <div className="flex  font-semibold tracking-wider text-2xl">
                    Edit Organisation Photo
                </div>
                <div className="flex items-end space-x-12 w-full px-4">
                    <div className="flex flex-col space-y-3 w-full">
                        <label className="text-greylish bg-opacity-50">Choose Photo</label>
                        <Paydropdown paymentname={paymentname} value={value} setValue={setValue} className={'!rounded-lg'} />
                    </div>
                    {value && <div className="flex flex-col mb-4 space-y-1 w-full">
                        <div className="text-xs text-left  dark:text-white">{value === "NFT" ? "NFT Address" : "Your Photo"} </div>
                        <div className={`  w-full border rounded-lg`}>
                            {value === "NFT" ? <input type="text" className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem]  w-full px-1" /> : <Upload className={'!h-[3.4rem] block border-none w-full'} setFile={setFile} />}
                        </div>
                    </div>}
                </div>
                <div className="flex justify-center gap-8">
                    <Button type="submit" version="second" onClick={() => setOrgphoto(false)} className="px-8 !py-2">
                        Close
                    </Button>
                    <Button type="submit" className="!py-2" isLoading={isLoading} >
                        Save
                    </Button>
                </div>
            </div>
        </Modal>}
        {orgname && <Modal onDisable={setOrgname} disableX={true} className="lg:min-w-[auto] overflow-visible !w-[30%] !pt-4">
            <div className="flex flex-col space-y-6 items-center w-full">
                <div className="flex  font-semibold tracking-wider text-2xl">
                    Edit Organisation Name
                </div>
                <div className="flex items-end space-x-12 w-full px-4">
                    <div className="flex flex-col space-y-3 w-full">
                        <label className="text-greylish bg-opacity-50">Organisation Name</label>
                        <input type="text" className="rounded-xl border border-greylish dark:bg-darkSecond  px-5 py-2" placeholder="Organisation Name" />
                    </div>
                </div>
                <div className="flex justify-center gap-8">
                    <Button type="submit" version="second" onClick={() => setOrgname(false)} className="px-8 !py-2">
                        Close
                    </Button>
                    <Button type="submit" className="!py-2" isLoading={isLoading} >
                        Save
                    </Button>
                </div>
            </div>
        </Modal>}
        {photo && <Modal onDisable={setPhoto} disableX={true} className="lg:min-w-[auto] overflow-visible !w-[30%] !pt-4">
            <div className="flex flex-col space-y-6 items-center w-full">
                <div className="flex  font-semibold tracking-wider text-2xl">
                    Edit Your Photo
                </div>
                <div className="flex items-end space-x-12 w-full px-4">
                    <div className="flex flex-col space-y-3 w-full">
                        <label className="text-greylish bg-opacity-50">Choose Photo</label>
                        <Paydropdown paymentname={paymentname} value={value} setValue={setValue} className={'!rounded-lg'} />
                    </div>
                </div>
                <div className="flex justify-center gap-8">
                    <Button type="submit" version="second" onClick={() => setPhoto(false)} className="px-8 !py-2">
                        Close
                    </Button>
                    <Button type="submit" className="!py-2" isLoading={isLoading} >
                        Save
                    </Button>
                </div>
            </div>
        </Modal>}
        {name && <Modal onDisable={setName} disableX={true} className="lg:min-w-[auto] overflow-visible !w-[30%] !pt-4">
            <div className="flex flex-col space-y-6 items-center w-full">
                <div className="flex  font-semibold tracking-wider text-2xl">
                    Edit Your Name
                </div>
                <div className="flex items-end space-x-12 w-full px-4">
                    <div className="flex flex-col space-y-3 w-full">
                        <label className="text-greylish bg-opacity-50">Your Name</label>
                        <input type="text" className="rounded-xl border border-greylish dark:bg-darkSecond  px-5 py-2" placeholder="Your Name" />
                    </div>
                </div>
                <div className="flex justify-center gap-8">
                    <Button type="submit" version="second" onClick={() => setName(false)} className="px-8 !py-2">
                        Close
                    </Button>
                    <Button type="submit" className="!py-2" isLoading={isLoading} >
                        Save
                    </Button>
                </div>
            </div>
        </Modal>}

        {profile ?
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
                {/* <div className="flex flex-col space-y-3">
                    <form onSubmit={update}>
                        <div>Personal Name</div>
                        <div className="flex space-x-4 items-center max-w-[600px]">
                            <div className="grid grid-cols-2 gap-x-4">
                                <div>
                                    <input type="text" defaultValue={profile?.name} name="name" className="border px-2 py-2 outline-none border-gray-700 rounded-lg dark:bg-darkSecond" />
                                </div>
                                <div>
                                    <input type="text" name="surname" defaultValue={profile?.surname} className="border px-2 py-2 outline-none border-gray-700 rounded-lg dark:bg-darkSecond" />
                                </div>
                            </div>
                            <div className="flex-grow">
                                <Button type="submit" className="px-12 py-2 w-full" isLoading={isUser}>Update</Button>
                            </div>
                        </div>
                    </form>
                </div>
                <div className="flex flex-col space-y-3">
                    <form onSubmit={update}>
                        <div>Organization Name</div>
                        <div className="flex space-x-4 items-center max-w-[600px]">
                            <div className="flex-grow">
                                <input type="text" name="company" defaultValue={profile?.companyName} className="border px-2 py-2 outline-none border-gray-700 rounded-lg w-full dark:bg-darkSecond" />
                            </div>
                            <div>
                                <Button type="submit" className="px-12 py-2" isLoading={isCompany}>Update</Button>
                            </div>
                        </div>
                    </form>
                </div> */}
            </> : <div className="flex justify-center"> <Loader /> </div>}
    </div>
}

export default ProfileSetting;