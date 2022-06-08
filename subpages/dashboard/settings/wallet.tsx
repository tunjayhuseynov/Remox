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
import Paydropdown from "subpages/pay/paydropdown";
import Upload from "components/upload";
import { useWalletKit } from 'hooks'

const WalletSetting = () => {
    const {blockchain } = useWalletKit();
    const [value, setValue] = useState('')
    const storage = useSelector(selectStorage)
    const dark = useAppSelector(selectDarkMode)
    const { owners, isMultisig, signAndInternal } = useMultisigProcess()
    const [details, setDetails] = useState(false)
    const [addOwnerModal, setAddOwnerModal] = useState(false)
    const [replaceOwnerModal, setReplaceOwnerModal] = useState(false)
    const [changeTresholdModal, setChangeTresholdModal] = useState(false)
    const [removeModal, setRemoveModal] = useState(false)
    const [file, setFile] = useState<File>()
    const [selectedOwner, setSelectedOwner] = useState("")
    const [removable, setRemovable] = useState({ name: "", address: "" })

    // if (!isMultisig) return <div className="text-center">Please, select a MultiSig account</div>
    const paymentname = ["Upload Photo", "NFT"]

    const walletData = [
        {
            id: 0,
            name: 'Orkhan Aslanov',
            value: '$150.00'
        },
        {
            id: 1,
            name: 'Tuncay Huseynov',
            value: '$480.00'
        },
    ]

    return <div className="flex flex-col space-y-7 ">
        <div className="flex flex-col space-y-2">
        </div>
        <div className="w-full border-b dark:border-[#aaaaaa] py-6">
            <div className="text-greylish">Total Balance</div>
            <div className="text-3xl font-semibold">$500.00</div>
        </div>
        {walletData.map((item,index)=>{
            return <div key={index} className=" grid grid-cols-[25%,25%,25%,25%]  border-b dark:border-[#aaaaaa]  py-6 !mt-0 relative" >
            <div className="flex items-center justify-start gap-2" >
                <div className="p-6 bg-greylish rounded-full"></div>
                <div className="flex flex-col gap-1">
                    <div className="">{item.name}</div>
                    <div className="text-greylish dark:text-white text-sm">Orkhan.sol</div>
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
                <span onClick={() => { setDetails(!details) }} className=" text-3xl flex items-center  cursor-pointer  font-bold "><span className=" text-primary pb-4">...</span>
                    {details && <div className="flex flex-col items-center bg-white dark:bg-darkSecond absolute right-0 -bottom-3 w-[7rem]  rounded-lg shadow-xl z-50 ">
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
        })}
        {replaceOwnerModal && <Modal onDisable={setReplaceOwnerModal} disableX={true} className={' py-6 !w-[40%]'}>
            <div className="-my-5 flex flex-col space-y-7 px-20">
                <div className="font-bold text-2xl text-center">Edit Wallet</div>
                <div className="flex flex-col space-y-3">
                    <span className="text-greylish">Choose Profile Photo Type</span>
                    <div>
                        <Paydropdown paymentname={paymentname} value={value} setValue={setValue} />
                    </div>
                </div>
                {value && <div className="flex flex-col mb-4 space-y-1 w-full">
                    <div className="text-xs text-left  dark:text-white">{value === "NFT" ? "NFT Address" : "Your Photo"} </div>
                    <div className={`  w-full border rounded-lg`}>
                        {value === "NFT" ? <input type="text" className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem]  w-full px-1" /> : <Upload className={'!h-[3.4rem] block border-none w-full'} setFile={setFile} />}
                    </div>
                </div>}
                {blockchain === 'celo' && value === "NFT" && <div className="flex flex-col mb-4 gap-1 w-full">
                    <div className="text-xs text-left  dark:text-white">Token ID</div>
                    <div className={`w-full border rounded-lg`}>
                        <input type="number" className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem] unvisibleArrow  w-full px-1" />
                    </div>
                </div>}
                <div className="flex flex-col space-y-3">
                    <span className="text-greylish">Wallet Name</span>
                    <div>
                        <input type="text" className="w-full px-3 py-3 border rounded-lg dark:bg-darkSecond" />
                    </div>
                </div>
                <div className="flex flex-col space-y-3">
                    <span className="text-greylish">Wallet Address</span>
                    <div>
                        <input type="text" className="w-full px-3 py-3 border rounded-lg bg-greylish bg-opacity-10 dark:bg-darkSecond" />
                    </div>
                </div>
                <div className="flex justify-center">
                    <div className="grid grid-cols-2 gap-5 w-full ">
                        <Button version="second" onClick={() => { setReplaceOwnerModal(false) }}>Close</Button>
                        <Button className="!px-3 !py-2" >
                            Save
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>}
        {removeModal && <Modal onDisable={setRemoveModal} disableX={true} className={'!pt-6'}>
            <div className="flex flex-col space-y-8 items-center">
                <div className="text-2xl text-primary">Are You Sure?</div>
                <div className="flex items-center justify-center text-xl">
                    Your Are About Delete This Wallet
                </div>
                <div className="flex justify-center items-center space-x-4">
                    <Button version="second" className="border-2  w-[7rem] h-[2.7rem] !px-1 !py-0" onClick={() => { setRemoveModal(false) }}>No</Button>
                    <Button className="  w-[7rem] h-[2.7rem] !px-1 !py-0">Yes</Button>
                </div>
            </div>
        </Modal>}
    </div>
}

export default WalletSetting