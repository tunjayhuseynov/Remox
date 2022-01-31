import { useContractKit } from "@celo-tools/use-contractkit";
import { SyntheticEvent, useEffect, useMemo } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Button from "../components/button";
import Input from "../components/input";
import useAuth from "../hooks/useAuth";
import { useSignInOrUp } from "../hooks";

export default function CreateAccount() {

    const { address } = useContractKit();
    const { executeSign, isLoading } = useSignInOrUp()
    const { user } = useAuth(address);
    const navigate = useNavigate()

    const list = useMemo<Array<{ title: string, type?: string, name: string }>>(() => [
        { title: "First Name", name: "userName" }, { title: "Last Name", name: "surname" },
        { title: "Organization Name", name: "companyName" }, { title: "Password", name: "password", type: "password", limit: 6 },
    ], [])

    if (user || !address) return <Navigate to={'/'} />


    const create = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        const target = e.target as HTMLFormElement

        if (target["password"].value !== target["repeatPassword"].value) return

        const inputData = {
            name: target["userName"].value,
            surname: target["surname"].value,
            companyName: target["companyName"].value,
            password: target["password"].value,
        }

        try {
            const user = await executeSign(address, inputData.password, {
                address: address,
                id: "placeholder",
                companyName: inputData.companyName,
                name: inputData.name,
                surname: inputData.surname,
                timestamp: new Date().getTime()
            })

            navigate('/dashboard')
        } catch (error) {
            console.error(error)
        }
    }

    return <div className="h-screen w-full">
        <header className="flex md:px-40 h-[75px] justify-center md:justify-start items-center absolute top-0 w-full">
            <div>
                <img src="/logo.png" alt="" className="w-[150px]" />
            </div>
        </header>
        <form onSubmit={create} className="py-[100px] sm:py-0 sm:h-full">
            <section className="flex flex-col items-center  h-full justify-center gap-10">
                <div className="flex flex-col gap-4">
                    <div className="text-xl sm:text-3xl text-primary text-center">Set Account Details</div>
                    <div className="text-greylish tracking-wide font-light text-lg text-center">This password encrypts your accounts on this device.</div>
                </div>
                <div className="grid sm:grid-cols-3 gap-x-24 gap-y-8 px-3">
                    {list.map((w, i) => <Input key={i} {...w} />)}
                </div>
                <div className="flex sm:flex-row flex-col-reverse justify-center items-center gap-10 pt-8">
                    <Button version="second" className="w-[150px] h-[50px]" onClick={() => navigate('/')}>Back</Button>
                    <Button type="submit" className="w-[150px] h-[50px] px-0" isLoading={isLoading}>Set Account</Button>
                </div>
            </section>
        </form>
    </div>
}
