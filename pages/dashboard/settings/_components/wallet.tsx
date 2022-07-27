import { useState } from 'react'
import { MdEdit } from 'react-icons/md'
import Avatar from 'components/avatar'
import Button from 'components/button'
import Modal from 'components/general/modal'
import { useSelector } from 'react-redux'
import { selectStorage } from 'redux/slices/account/storage'
import { useAppSelector } from 'redux/hooks';
import Paydropdown from "pages/dashboard/pay/_components/paydropdown";
import Upload from "components/upload";
import { useWalletKit } from 'hooks'
import useModalSideExit from 'hooks/useModalSideExit';
import WalletItem from './wallet/walletItem'
import { useForm, SubmitHandler } from "react-hook-form";
import { DropDownItem } from "types/dropdown";
import Dropdown from "components/general/dropdown";
import { SetComma } from 'utils'

export interface IWallets {
    id: number;
    image: string | null,
    name: string;
    mail: string;
    value: number;
    signers: {
        image: string | null;
    }[],

}[]

export interface IWalletData {
    total: number;
    wallets: IWallets[]
}

export interface IFormInput {
    nftAddress?: string;
    nftTokenId?: number;
    name: string;

}

const WalletSetting = () => {
    const { register, handleSubmit } = useForm<IFormInput>();
    const { blockchain } = useWalletKit();
    const [value, setValue] = useState('')
    const storage = useSelector(selectStorage)

    const imageType: DropDownItem[] = [{ name: "Upload Photo" }, { name: "NFT" }]
    const [selectedImageType, setImageType] = useState(imageType[0])
    const userIsUpload = selectedImageType.name === "Upload Photo"

    const [addOwnerModal, setAddOwnerModal] = useState(false)
    const [replaceOwnerModal, setReplaceOwnerModal] = useState(false)
    const [changeTresholdModal, setChangeTresholdModal] = useState(false)
    const [removeModal, setRemoveModal] = useState(false)
    const [file, setFile] = useState<File>()
    const [selectedOwner, setSelectedOwner] = useState("")
    const [removable, setRemovable] = useState({ name: "", address: "" })


    const walletData: IWalletData = {
        total: 500000,
        wallets: [
            {
                id: 0,
                image: null,
                name: 'Orkhan Aslanov',
                mail: 'Orkhan.sol',
                value: 15000,
                signers: [
                    {
                        image: null,
                    },
                    {
                        image: null,
                    },

                ],
            },
            {
                id: 1,
                image: null,
                name: 'Tuncay Huseynov',
                mail: 'Tuncay.sol',
                value: 48034,
                signers: [
                    {
                        image: null,
                    },
                    {
                        image: null,
                    },

                ],
            },
        ]
    }


    const onSubmit: SubmitHandler<IFormInput> = data => {
        const Photo = file
        console.log(data, Photo)
    }

    return <div className="flex flex-col space-y-7 ">
        <div className="w-full border-b dark:border-[#aaaaaa] py-6">
            <div className="text-greylish">Total Balance</div>
            <div className="text-3xl font-semibold">${SetComma(walletData.total)}</div>
        </div>
        {walletData.wallets.map((item, index) => {
            return <WalletItem item={item} key={index} setReplaceOwnerModal={setReplaceOwnerModal} setRemovable={setRemovable} setRemoveModal={setRemoveModal} />
        })}
        {replaceOwnerModal && <Modal onDisable={setReplaceOwnerModal} animatedModal={false} disableX={true} className={' py-6 !w-[40%]'}>
            <form onSubmit={handleSubmit(onSubmit)} className="-my-5 flex flex-col space-y-7 px-20">
                <div className="font-bold text-2xl text-center">Edit Wallet</div>
                <div className="flex flex-col space-y-3">
                    {/* <span className="text-greylish">Choose Profile Photo Type</span> */}
                    <Dropdown
                        label="Choose Profile Photo Type"
                        parentClass={'bg-white w-full rounded-lg h-[3.4rem]'}
                        className={'!rounded-lg h-[3.4rem] '}
                        list={imageType}
                        selected={selectedImageType}
                        setSelect={setImageType}
                    />
                </div>
                {<div className="flex flex-col mb-4 space-y-1 w-full">
                    <div className=" text-left text-greylish ">{!userIsUpload ? "NFT Address" : "Your Photo"} </div>
                    <div className={`  w-full border rounded-lg`}>
                        {!userIsUpload ? <input type="text" {...register("nftAddress", { required: true })} className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem]  w-full px-1" /> : <Upload className={'!h-[3.4rem] block border-none w-full'} setFile={setFile} />}
                    </div>
                </div>}
                {blockchain.name === 'celo' && !userIsUpload && <div className="flex flex-col mb-4 gap-1 w-full">
                    <div className=" text-left text-greylish">Token ID</div>
                    <div className={`w-full border rounded-lg`}>
                        <input type="number"  {...register("nftTokenId", { required: true, valueAsNumber: true })} className="bg-white dark:bg-darkSecond rounded-lg h-[3.4rem] unvisibleArrow  w-full px-1" />
                    </div>
                </div>}
                <div className="flex flex-col space-y-3">
                    <span className="text-greylish">Wallet Name</span>
                    <div>
                        <input type="text" {...register("name", { required: true })} className="w-full px-3 py-3 border rounded-lg dark:bg-darkSecond" />
                    </div>
                </div>
                <div className="flex flex-col space-y-3">
                    <span className="text-greylish">Wallet Address</span>
                    <div>
                        <input type="text" readOnly className="w-full px-3 py-3 border rounded-lg bg-greylish bg-opacity-10 dark:bg-greylish" />
                    </div>
                </div>
                <div className="flex justify-center">
                    <div className="grid grid-cols-2 gap-5 w-full ">
                        <Button version="second" onClick={() => { setReplaceOwnerModal(false) }}>Close</Button>
                        <Button type="submit" className="!px-3 !py-2" >
                            Save
                        </Button>
                    </div>
                </div>
            </form>
        </Modal>}
        {removeModal && <Modal onDisable={setRemoveModal} animatedModal={false} disableX={true} className={'!pt-6'}>
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