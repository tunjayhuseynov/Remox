import { useModalSideExit } from 'hooks';
import React, { Dispatch, SetStateAction, useState } from 'react';
import { useAppSelector } from 'redux/hooks';
import { selectDarkMode } from 'redux/slices/notificationSlice';
import { SetComma } from 'utils';
import { IWallets } from '../wallet';


function WalletItem({ item, setReplaceOwnerModal, setRemovable, setRemoveModal }: { item: IWallets, setReplaceOwnerModal: Dispatch<SetStateAction<boolean>>, setRemovable: Dispatch<SetStateAction<{ name: string, address: string }>>, setRemoveModal: Dispatch<SetStateAction<boolean>> }) {

    const [details, setDetails] = useState(false)
    const dark = useAppSelector(selectDarkMode)
    const [divRef, exceptRef] = useModalSideExit(details, setDetails, false)

    return <div className=" grid grid-cols-[25%,25%,25%,25%]  border-b dark:border-[#aaaaaa]  py-6 !mt-0 relative" >
        <div className="flex items-center justify-start gap-2" >
        {item.image ?<img src={`${item.image}`} className={` border bg-gray-600 w-12 h-12 rounded-full`} /> : <div className=" border bg-gray-600 w-12 h-12 rounded-full"></div> }
            <div className="flex flex-col gap-1">
                <div className="">{item.name}</div>
                <div className="text-greylish dark:text-white text-sm">{item.mail}</div>
            </div>
        </div>
        <div className="flex items-center justify-center">
            <div className="flex items-center justify-center text-xl">
                ${SetComma(item.value)}
            </div>
        </div>
        <div className="flex items-center justify-center">
            <div className="flex pl-3">
                {item.signers[1] && item.signers[1].image !== null ? <img src={`${item.signers[1].image}`} className={` absolute z-[1] border bg-gray-400 w-8 h-8 rounded-full`} /> : <div className="bg-gray-400  absolute z-[1] border  w-8 h-8 rounded-full"></div>}
                {item.signers[0] && item.signers[0].image !== null ? <img src={`${item.signers[0].image}`} className={`relative z-[0] right-[10px] bg-gray-300  border  w-8 h-8 rounded-full`} /> : <div className="bg-gray-300 relative z-[0] right-[10px]  border  w-8 h-8 rounded-full"></div>}
                {item.signers[2] && item.signers[2].image !== null ? <img src={`${item.signers[2].image}`} className={` relative z-[1] -left-[5px] bg-gray-500  border  w-8 h-8 rounded-full`} /> : <div className="bg-gray-500 relative z-[1] -left-[12px]  border  w-8 h-8 rounded-full"></div>}
            </div>
        </div>
        <div className="flex space-x-3 justify-end">
            <span ref={exceptRef} onClick={() => { setDetails(!details) }} className=" text-3xl flex items-center  cursor-pointer  font-bold "><span className=" text-primary pb-4">...</span>
                {details && <div ref={divRef} className="flex flex-col items-center bg-white dark:bg-darkSecond absolute right-0 -bottom-7 w-[8rem] rounded-lg shadow-xl z-50 ">
                    <div className="cursor-pointer hover:bg-greylish hover:bg-opacity-5 hover:transition-all text-sm border-b border-greylish border-opacity-20 flex w-full pl-2 py-2 gap-3" onClick={() => {
                        setReplaceOwnerModal(true)
                    }}>
                        <img src={`/icons/${dark ? 'edit_white' : 'edit'}.png`} className="dark:invert dark:brightness-0 w-4 h-4" alt="" /> <span>Edit</span>
                    </div>
                    <div className="cursor-pointer hover:bg-greylish hover:bg-opacity-5 hover:transition-all text-sm flex w-full pl-2 py-2 gap-3" onClick={() => {
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

export default WalletItem