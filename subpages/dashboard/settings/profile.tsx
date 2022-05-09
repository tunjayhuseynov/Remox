import { FormEvent, useEffect, useState } from "react";
import Button from "components/button";
import useProfile from "apiHooks/useProfile";
import Loader from "components/Loader";

const ProfileSetting = () => {
    const [isUser, setUser] = useState(false)
    const [isCompany, setCompany] = useState(false)

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

    return <div className="px-3 py-5 flex flex-col space-y-10">
        <div>
            <div className="text-lg">Profile</div>
            <div className="text-sm">Edit your account</div>
        </div>
        {profile ?
            <>
                <div className="flex flex-col space-y-3">
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
                </div>
            </> : <div className="flex justify-center"> <Loader /> </div>}
    </div>
}

export default ProfileSetting;