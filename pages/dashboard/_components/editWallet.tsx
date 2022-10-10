import React, { useState, Dispatch } from 'react'
import { AddressReducer } from "../../../utils";
import { useAppDispatch, useAppSelector } from 'redux/hooks';
import Button from "components/button";
import { useForm, SubmitHandler } from "react-hook-form";
import { IAccountORM } from 'pages/api/account/index.api';
import EditableAvatar from 'components/general/EditableAvatar';
import { SelectBlockchain, SelectID } from 'redux/slices/account/selector';
import { Update_Account_Image, Update_Account_Name } from 'redux/slices/account/thunks/account';
import useLoading from 'hooks/useLoading';
import { TextField } from '@mui/material';

export interface IFormInput {
    name: string;
    address: string;
}

function EditWallet({ account, onDisable }: { account: IAccountORM, onDisable: Dispatch<boolean> }) {
    const { register, handleSubmit } = useForm<IFormInput>();

    const [url, setUrl] = useState<string | undefined>()
    const [imageType, setImageType] = useState<"image" | "nft">("image")
    const blockchain = useAppSelector(SelectBlockchain)
    const id = useAppSelector(SelectID)
    const dispatch = useAppDispatch()

    const onSubmit: SubmitHandler<IFormInput> = async data => {
        await dispatch(Update_Account_Name({
            account: account,
            name: data.name,
        }))

        if (url && imageType) {
            await dispatch(Update_Account_Image({
                account: account,
                image: {
                    blockchain: blockchain.name,
                    imageUrl: url,
                    nftUrl: url,
                    type: imageType,
                    tokenId: null
                },
            }))
        }
        onDisable(false)
    }

    const [isLoading, OnSubmit] = useLoading(onSubmit)

    const imageHandler = (url: string, type: "image" | "nft") => {
        setUrl(url)
        setImageType(type)
    }

    return (<div className="w-full relative">
        <div className='w-[40%] mx-auto'>
            <form onSubmit={handleSubmit(OnSubmit)} className="flex flex-col gap-8 ">
                <div className="text-xl font-bold pb-2 pt-5 text-center">Edit Wallet</div>
                <div className='flex justify-center'>
                    <EditableAvatar
                        avatarUrl={account.image?.imageUrl ?? null}
                        name={account.name}
                        blockchain={blockchain}
                        evm={blockchain.name !== "solana"}
                        onChange={imageHandler}
                        userId={`${id ? "id/" : ""}${account.id}`}
                        size={6.5}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <TextField
                        InputLabelProps={{
                            style: {
                                fontSize: "0.75rem",
                            }
                        }}
                        InputProps={{
                            style: {
                                fontSize: "0.75rem",
                            }
                        }}
                        label="Wallet Name" {...register("name", { required: true, value: account.name })} placeholder="E.g. Remox DAO" className="bg-white dark:bg-darkSecond" />
                    {/* <input type="text" placeholder="Remox DAO" className="border w-full py-3 text-base rounded-md px-3 dark:bg-darkSecond" /> */}
                </div>
                <div className="flex flex-col gap-1">
                    <TextField
                        InputLabelProps={{
                            style: {
                                fontSize: "0.75rem",
                            }
                        }}
                        InputProps={{
                            style: {
                                fontSize: "0.75rem",
                            }
                        }}
                        label="Wallet Address" disabled value={AddressReducer(account.address)} />
                </div>
                <div className="grid grid-cols-2 gap-x-10 pt-5 justify-center">
                    <Button version="second" className="rounded-md !text-xs" onClick={() => onDisable(false)} >
                        Close
                    </Button>
                    <Button type='submit' className="rounded-md !text-xs" isLoading={isLoading} >
                        Save
                    </Button>
                </div>
            </form>
        </div>
    </div>
    )
}

export default EditWallet