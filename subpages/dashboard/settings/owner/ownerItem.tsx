import { useModalSideExit } from 'hooks'
import React, { Dispatch, SetStateAction, useState } from 'react'
import { useAppSelector } from 'redux/hooks'
import { selectDarkMode } from 'redux/reducers/notificationSlice'
import { IOwnerData } from '../owner'


function OwnerItem({ item, setReplaceOwnerModal, setRemoveModal, setRemovable }: {
    item: IOwnerData, setReplaceOwnerModal: Dispatch<SetStateAction<boolean>>, setRemoveModal: Dispatch<SetStateAction<boolean>>, setRemovable: Dispatch<SetStateAction<{
        name: string;
        address: string;
    }>>
}) {
    const [details, setDetails] = useState(false)
    const dark = useAppSelector(selectDarkMode)

    const [divRef, exceptRef] = useModalSideExit(details, setDetails, false)


    return <div className=" grid grid-cols-[20%,20%,20%,20%,20%]  border-b  py-10  relative" >
        <div className="flex items-center justify-start gap-2" >
            <div className="p-6 bg-greylish rounded-full"></div>
            <div className="flex flex-col gap-1">
                <div className="font-semibold">{item.name}</div>
                <div className="text-greylish dark:text-white text-sm">{item.text}</div>
            </div>
        </div>
        <div className="flex items-center justify-center">
            <div className="text-primary border bg-orange-100   border-primary h-[50%] rounded-sm py-1 px-4 flex items-center justify-center w-[40%]">
                Owner
            </div>
        </div>
        <div className="flex gap-4 items-center justify-center">
            <div className="rounded-full bg-greylish p-6"></div>
            <div className="">{item.wallet}</div>
        </div>
        <div className="text-greylish dark:text-white flex items-center justify-center">{item.mail}</div>
        <div className="flex space-x-3 justify-end">
            <span ref={exceptRef} onClick={() => { setDetails(!details) }} className=" text-3xl flex items-center  cursor-pointer  font-bold "><span className=" text-primary pb-4">...</span>
                {details && <div ref={divRef} className="flex flex-col items-center bg-white absolute right-0 bottom-0  w-[7rem] rounded-lg shadow-xl z-50 ">
                    <div className="cursor-pointer  text-sm border-b border-greylish border-opacity-20 flex w-full pl-2 py-1 gap-3" onClick={() => {
                        setReplaceOwnerModal(true)
                    }}>
                        <img src={`/icons/${dark ? 'edit_white' : 'edit'}.png`} className="dark:invert dark:brightness-0 w-4 h-4" alt="" /> <span>Edit</span>
                    </div>
                    <div className="cursor-pointer  text-sm flex w-full pl-2 py-1 gap-3" onClick={() => {
                        setRemovable({ name: `Owner `, address: "0sadf145435q34" })
                        setRemoveModal(true)
                    }}>
                        <img src={`/icons/${dark ? 'trashicon_white' : 'trashicon'}.png`} className="dark:invert dark:brightness-0 w-4 h-4" alt="" /> <span>Delete</span>
                    </div>
                </div>}
            </span>

        </div>

    </div>
}

export default OwnerItem