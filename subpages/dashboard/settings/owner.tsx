import { useState } from 'react'
import { MdEdit } from 'react-icons/md'
import { AddOwner, RemoveOwner, ReplaceOwner, ChangeTreshold } from 'subpages/dashboard/settings/owner/index'
import Avatar from 'components/avatar'
import Button from 'components/button'
import Modal from 'components/general/modal'
import useMultisigProcess from 'hooks/useMultisigProcess'
import { useSelector } from 'react-redux'
import { selectStorage } from 'redux/reducers/storage'
import { useAppSelector } from 'redux/hooks';
import { changeDarkMode, selectDarkMode } from 'redux/reducers/notificationSlice';

const OwnerSetting = () => {

    const storage = useSelector(selectStorage)
    const dark = useAppSelector(selectDarkMode)
    const { owners, isMultisig, signAndInternal } = useMultisigProcess()
    const [details, setDetails] = useState(false)
    const [addOwnerModal, setAddOwnerModal] = useState(false)
    const [replaceOwnerModal, setReplaceOwnerModal] = useState(false)
    const [changeTresholdModal, setChangeTresholdModal] = useState(false)
    const [removeModal, setRemoveModal] = useState(false)

    const [selectedOwner, setSelectedOwner] = useState("")
    const [removable, setRemovable] = useState({ name: "", address: "" })

    // if (!isMultisig) return <div className="text-center">Please, select a MultiSig account</div>

    return <div className="flex flex-col space-y-7 ">
        <div className="flex flex-col space-y-2">
            <div className="flex justify-end relative">
                <div className="flex gap-5 absolute -top-[7.7rem] right-0">
                    <div>
                        <Button className="py-1 font-semibold rounded-xl w-[125px] flex items-center justify-center gap-x-1" onClick={() => { setChangeTresholdModal(true) }}>Treshold</Button>
                    </div>
                    <div>
                        <Button className="py-1 !px-2 font-semibold rounded-xl w-[130px]" onClick={() => setAddOwnerModal(true)}>
                            + Add owner
                        </Button>
                    </div>
                </div>
            </div>
        </div>
        <div className=" grid grid-cols-[20%,20%,20%,20%,20%]  border-b  py-10  relative" >
            <div className="flex items-center justify-start gap-2" >
                <div className="p-6 bg-greylish rounded-full"></div>
                <div className="flex flex-col gap-1">
                    <div className="font-semibold">Orkhan Aslanov (you)</div>
                    <div className="text-greylish dark:text-white text-sm">Orkhan.sol</div>
                </div>
            </div>
            <div className="flex items-center justify-center">
                <div className="text-primary border bg-orange-100   border-primary h-[50%] rounded-sm py-1 px-4 flex items-center justify-center w-[40%]">
                    Owner

                </div>
            </div>
            <div className="flex gap-4 items-center justify-center">
                <div className="rounded-full bg-greylish p-6"></div>
                <div className="">Treasury Vault 0</div>
            </div>
            <div className="text-greylish dark:text-white flex items-center justify-center">Orkhan@remox.io</div>
            <div className="flex space-x-3 justify-end">
                <span onClick={() => { setDetails(!details) }} className=" text-3xl flex items-center  cursor-pointer  font-bold "><span className=" text-primary pb-4">...</span>
                    {details && <div className="flex flex-col items-center bg-white absolute right-0 bottom-0  w-[7rem] rounded-lg shadow-xl z-50 ">
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
        {/* {details && <div className="flex flex-col items-center bg-white absolute right-24 bottom-1   rounded-lg shadow-xl z-50 ">
                        <div className="cursor-pointer  text-sm border-b border-greylish border-opacity-20 flex w-full px-10 py-1 gap-3" onClick={() => {
                            setReplaceOwnerModal(true)
                        }}>
                            <img src="/icons/editicon.svg" className="dark:invert dark:brightness-0" alt="" /> <span>Edit</span>
                        </div>
                        <div className="cursor-pointer  text-sm flex w-full px-10 py-1 gap-3" onClick={() => {
                            setRemovable({ name: `Owner `, address: "0sadf145435q34" })
                            setRemoveModal(true)
                        }}>
                            <img src="/icons/trashicon.svg" alt="" /> <span>Delete</span>
                        </div>
                    </div>} */}
        {addOwnerModal && <Modal onDisable={setAddOwnerModal} disableX={true} className={'!pt-3'}>
            <AddOwner onDisable={setAddOwnerModal} />
        </Modal>}
        {replaceOwnerModal && <Modal onDisable={setReplaceOwnerModal} disableX={true} className={'!pt-3'}>
            <ReplaceOwner ownerAddress={selectedOwner} onDisable={setReplaceOwnerModal} />
        </Modal>}
        {changeTresholdModal && <Modal onDisable={setChangeTresholdModal} disableX={true}>
            <ChangeTreshold onDisable={setChangeTresholdModal} />
        </Modal>}
        {removeModal && <Modal onDisable={setRemoveModal} disableX={true} className={'!pt-6'}>
            <RemoveOwner address={removable.address} name={removable.name} onDisable={setRemoveModal} />
        </Modal>}
    </div>
}

export default OwnerSetting