import { useModalSideExit } from 'hooks';
import React, { Dispatch, SetStateAction,useState } from 'react';
import { useAppSelector } from 'redux/hooks';
import { selectDarkMode } from 'redux/reducers/notificationSlice';
import {IWalletData} from '../wallet';


function WalletItem({item,setReplaceOwnerModal,setRemovable,setRemoveModal}:{item:IWalletData,setReplaceOwnerModal:Dispatch<SetStateAction<boolean>>,setRemovable:Dispatch<SetStateAction<{name:string,address:string}>>,setRemoveModal:Dispatch<SetStateAction<boolean>>}) {
    
    const [details, setDetails] = useState(false)
    const dark = useAppSelector(selectDarkMode)
    const [divRef, exceptRef] = useModalSideExit(details, setDetails, false)

  return <div className=" grid grid-cols-[25%,25%,25%,25%]  border-b dark:border-[#aaaaaa]  py-6 !mt-0 relative" >
  <div className="flex items-center justify-start gap-2" >
      <div className="p-6 bg-greylish rounded-full"></div>
      <div className="flex flex-col gap-1">
          <div className="">{item.name}</div>
          <div className="text-greylish dark:text-white text-sm">{item.mail}</div>
      </div>
  </div>
  <div className="flex items-center justify-center">
      <div className="flex items-center justify-center text-xl">
          {item.value}
      </div>
  </div>
  <div className="flex items-center justify-center">
      <div className="flex pl-3">
          <div className=" absolute z-[0] bg-greylish bg-opacity-80  w-8 h-8 rounded-full"></div>
          <div className="relative z-[3] right-[16px] bg-greylish bg-opacity-70 w-8 h-8 rounded-full"></div>
          <div className=" relative z-[5] -left-[5px] bg-greylish bg-opacity-60 w-8 h-8 rounded-full"></div>
      </div>
  </div>
  <div className="flex space-x-3 justify-end">
      <span ref={exceptRef} onClick={() => { setDetails(!details) }} className=" text-3xl flex items-center  cursor-pointer  font-bold "><span className=" text-primary pb-4">...</span>
          {details && <div ref={divRef} className="flex flex-col items-center bg-white dark:bg-darkSecond absolute right-0 -bottom-3 w-[7rem]  rounded-lg shadow-xl z-50 ">
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

export default WalletItem