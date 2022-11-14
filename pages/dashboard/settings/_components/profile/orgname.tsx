import React,{Dispatch, SetStateAction, useState} from 'react'
import Button from "components/button";
import Dropdown from "components/general/dropdown";
import { DropDownItem } from "types";
import { useForm, SubmitHandler } from "react-hook-form";
import { useWalletKit } from 'hooks'

export interface IFormInput {
    name: string;
  }


function Orgname({setOrgname}:{setOrgname:Dispatch<SetStateAction<boolean>>}) {
    const { register, handleSubmit } = useForm<IFormInput>();

    const onSubmit: SubmitHandler<IFormInput> = data => {
        // console.log(data)
    }
    return <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-6 items-center w-full">
        <div className="flex  font-semibold tracking-wider text-2xl">
            Edit Organisation Name
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex items-end space-x-12 w-full px-4">
            <div className="flex flex-col space-y-3 w-full">
                <label className="text-greylish bg-opacity-50">Organisation Name</label>
                <input type="text" {...register("name", { required: true })} className="rounded-lg border  dark:bg-darkSecond  px-5 py-3" placeholder="Organisation Name" />
            </div>
        </form >
        <div className="flex justify-center gap-8">
            <Button type="submit" version="second" onClick={() => setOrgname(false)} className="px-8 !py-2">
                Close
            </Button>
            <Button type="submit" className="!py-2" >
                Save
            </Button>
        </div>
    </form>
}

export default Orgname