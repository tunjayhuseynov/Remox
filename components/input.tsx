import { MdDone } from 'react-icons/md'
import { VscError } from 'react-icons/vsc'
import { Dispatch, useEffect, useState } from 'react'
import { AddressReducer } from "utils";
import { UseFormRegister } from 'react-hook-form';
import { IFormInput } from '../pages/create-organization.page'

const Input = ({ title, name, register, type = "text", value, validation, limit = 0, required = false, className = "" }: { register?: UseFormRegister<IFormInput>, title: string, name: string, value?: string | null, type?: string, validation?: Dispatch<boolean>, limit?: number, required?: boolean, className?: string }) => {
    const [password, setPassword] = useState<string>();
    const [repeatPassword, setRepeatPassword] = useState<string>();

    useEffect(() => {
        if (validation) {
            if (repeatPassword && password && repeatPassword === password) {
                validation(true);
            } else {
                validation(false);
            }
        }
    }, [repeatPassword, password])
    return <>
        <div className="flex flex-col mb-4 space-y-1 w-full">
            <div className="text-xs text-left   dark:text-white">{title}</div>
            <div className={`${className} flex items-center gap-3 w-full border rounded-lg`}>
                {value ? <div className="bg-greylish bg-opacity-10 w-full h-[3.4rem] flex items-center rounded-lg px-2 py-2">{AddressReducer(value)}</div> : register ? <input type={type}  {...register("name", { required: true })} autoComplete='new-password' minLength={limit} className="bg-white dark:bg-darkSecond  h-[3.4rem] rounded-lg w-full px-1" onChange={(e) => {
                    setPassword(e.target.value);
                }} required={required} /> : <input type={type} autoComplete='new-password' minLength={limit} className="bg-white dark:bg-darkSecond  h-[3.4rem] rounded-lg w-full px-1" onChange={(e) => {
                    setPassword(e.target.value);
                }} required={required} />}
            </div>
        </div>

        {type === "password" ? <div className="flex flex-col mb-4 space-y-1 w-full">
            <div className="text-xs text-left  dark:text-white">{'Repeat Password'}</div>
            <div className={`${className} flex items-center gap-3 w-full border rounded-lg relative`}>
                <input type={type} name={'repeatPassword'} autoComplete='new-password' className="bg-white dark:bg-darkSecond h-[3.4rem] rounded-lg w-full px-1" onChange={(e) => {
                    setRepeatPassword(e.target.value);
                }} required />
                {repeatPassword && password && <div className="absolute right-[1%]">
                    {repeatPassword === password ? <MdDone className="text-green-600 " /> : <VscError className="text-red-600" />}
                </div>}
            </div>
        </div> : null}

    </>
}

export default Input;