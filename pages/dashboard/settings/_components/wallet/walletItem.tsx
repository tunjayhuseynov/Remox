import { Avatar, AvatarGroup } from '@mui/material';
import EditableTextInput from 'components/general/EditableTextInput';
import { useModalSideExit } from 'hooks';
import { IAccountORM } from 'pages/api/account/index.api';
import React, { Dispatch, SetStateAction, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'redux/hooks';
import { SelectDarkMode } from 'redux/slices/account/selector';
import { Update_Account_Name } from 'redux/slices/account/thunks/account';
import { SetComma } from 'utils';


function WalletItem({ item, setReplaceOwnerModal, setRemovable, setRemoveModal }: { item: IAccountORM, setReplaceOwnerModal: Dispatch<SetStateAction<boolean>>, setRemovable: Dispatch<SetStateAction<{ name: string, address: string }>>, setRemoveModal: Dispatch<SetStateAction<boolean>> }) {

    const dispatch = useAppDispatch()
    const [details, setDetails] = useState(false)
    const dark = useAppSelector(SelectDarkMode)
    const [divRef, exceptRef] = useModalSideExit(details, setDetails, false)

    const updateAccountName = async (val: string) => {
        const { address, blockchain, created_date, name, createdBy, id, image, mail, members, provider, signerType } = item;
        await dispatch(Update_Account_Name({
            account: {
                address,
                blockchain,
                created_date,
                name,
                createdBy,
                id,
                image,
                mail,
                members,
                provider,
                signerType,
            },
            name: val
        }))
    }

    return <div className=" grid grid-cols-[25%,25%,25%,25%]  border-b dark:border-[#aaaaaa]  py-6 !mt-0 relative" >
        <div className="flex items-center justify-start gap-2" >
            {item.image ? <img src={`${item.image.imageUrl}`} className={` border bg-gray-600 w-12 h-12 rounded-full`} /> : <div className=" border bg-gray-600 w-12 h-12 rounded-full"></div>}
            <div className="flex flex-col gap-1">
                <div className="">
                    <EditableTextInput defaultValue={item.name} onSubmit={updateAccountName} placeholder="Name"/>
                </div>
                <div className="text-greylish dark:text-white text-sm">{item.mail}</div>
            </div>
        </div>
        <div className="flex items-center justify-center">
            <div className="flex items-center justify-center text-xl">
                ${SetComma(item.totalValue)}
            </div>
        </div>
        <div className="flex items-center justify-center">
            <div className="flex pl-3">
                <AvatarGroup max={3}>
                    {item.members.map((member, index) => <Avatar key={member.id} alt={member.name} src={member.image?.nftUrl ?? ""} />)}
                </AvatarGroup>
            </div>
        </div>
        <div className="flex space-x-3 justify-end">
            <span ref={exceptRef} onClick={() => { setDetails(!details) }} className=" text-3xl flex items-center  cursor-pointer  font-bold "><span className=" text-primary pb-4">...</span>
                {details && <div ref={divRef} className="flex flex-col items-center bg-white dark:bg-darkSecond absolute right-0 -bottom-7 w-[8rem] rounded-lg shadow-xl z-50 ">
                    {/* <div className="cursor-pointer hover:bg-greylish hover:bg-opacity-5 hover:transition-all text-sm border-b border-greylish border-opacity-20 flex w-full pl-2 py-2 gap-3" onClick={() => {
                        setReplaceOwnerModal(true)
                    }}>
                        <img src={`/icons/${dark ? 'edit_white' : 'edit'}.png`} className="dark:invert dark:brightness-0 w-4 h-4" alt="" /> <span>Edit</span>
                    </div> */}
                    <div className="cursor-pointer hover:bg-greylish hover:bg-opacity-5 hover:transition-all text-sm flex w-full pl-2 py-2 gap-3" onClick={() => {
                        setRemovable({ name: item.name, address: item.address })
                        setRemoveModal(true)
                    }}>
                        <img src={`/icons/${dark ? 'trashicon_white' : 'trashicon'}.png`} className="dark:invert dark:brightness-0 w-4 h-4" alt="" /> <span>Delete</span>
                    </div>
                </div>}
            </span>

        </div>

    </div>
}

export default WalletItem