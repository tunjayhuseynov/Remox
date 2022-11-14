import React,{Dispatch, SetStateAction, useState} from 'react'
import Button from "components/button";
import Dropdown from "components/general/dropdown";
import { DropDownItem } from "types";
import { useForm, SubmitHandler } from "react-hook-form";
import { useWalletKit } from 'hooks'

export interface IFormInput {
    name: string;
  }

function Name({setName}:{setName:Dispatch<SetStateAction<boolean>>}) {
    const { register, handleSubmit } = useForm<IFormInput>();

    const onSubmit: SubmitHandler<IFormInput> = data => {
        // console.log(data)
    }

    return <div className="flex flex-col space-y-6 items-center w-full">
        <div className="flex  font-semibold tracking-wider text-2xl">
            Edit Your Name
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex items-end space-x-12 w-full px-4">
            <div className="flex flex-col space-y-3 w-full">
                <label className="text-greylish bg-opacity-50">Your Name</label>
                <input type="text" {...register("name", { required: true })} className="rounded-lg border  dark:bg-darkSecond  px-5 py-3" placeholder="Your Name" />
            </div>
        </form>
        <div className="flex justify-center gap-8">
            <Button  version="second" onClick={() => setName(false)} className="px-8 !py-2">
                Close
            </Button>
            <Button type="submit" className="!py-2"  >
                Save
            </Button>
        </div>
    </div>
}

export default Name