import { MdDone } from 'react-icons/md'
import { VscError } from 'react-icons/vsc'
import { Dispatch, useEffect, useState } from 'react'

const Input = ({ title, name, type = "text", validation, limit = 0, required = false, className = "" }: { title: string, name: string, type?: string, validation?: Dispatch<boolean>, limit?: number, required?: boolean, className?: string }) => {
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
            <div className="text-left text-greylish dark:text-white">{title}</div>
            <div className={`${className} flex items-center gap-3 w-full`}>
                <input type={type} name={name} autoComplete='new-password' minLength={limit} className="bg-greylish dark:bg-darkSecond bg-opacity-10 h-[35px] rounded-lg w-full px-1" onChange={(e) => {
                    setPassword(e.target.value);
                }} required={required} />
            </div>
        </div>
        {type === "password" ? <div className="flex flex-col mb-4 space-y-1 w-full">
            <div className="text-left text-greylish dark:text-white">{'Repeat Password'}</div>
            <div className={`${className} flex items-center gap-3 w-full`}>
                <input type={type} name={'repeatPassword'} autoComplete='new-password' className="bg-greylish dark:bg-darkSecond bg-opacity-10 h-[35px] rounded-lg w-full px-1" onChange={(e) => {
                    setRepeatPassword(e.target.value);
                }} required />
                {repeatPassword && password && <div>
                    {repeatPassword === password ? <MdDone className="text-green-600 " /> : <VscError className="text-red-600" />}
                </div>}
            </div>
        </div> : null}
    </>
}

export default Input;