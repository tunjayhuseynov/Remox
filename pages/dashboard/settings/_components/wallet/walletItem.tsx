import { Avatar, AvatarGroup, Tooltip } from '@mui/material';
import Button from 'components/button';
import EditableAvatar from 'components/general/EditableAvatar';
import EditableTextInput from 'components/general/EditableTextInput';
import Modal from 'components/general/Modal';
import { Image } from 'firebaseConfig';
import useLoading from 'hooks/useLoading';
import useMultisig from 'hooks/walletSDK/useMultisig';
import { IAccountORM } from 'pages/api/account/index.api';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { IoPersonAddSharp, IoTrashOutline } from 'react-icons/io5';
import { TbTextResize } from 'react-icons/tb';
import { useAppDispatch, useAppSelector } from 'redux/hooks';
import { SelectAccountType, SelectBlockchain, SelectID, SelectIndividual, SelectOrganization } from 'redux/slices/account/selector';
import { Remove_Account_From_Individual, Remove_Account_From_Organization, Update_Account_Image, Update_Account_Name } from 'redux/slices/account/thunks/account';
import { Blockchains } from 'types/blockchains';
import { AddressReducer, SetComma } from 'utils';
import { ToastRun } from 'utils/toast';


function WalletItem({ item }: { item: IAccountORM }) {
    const { handleSubmit: handleAddOwnerSubmit, register: registerAddOwner } = useForm()
    const { handleSubmit: handleThresholdSubmit, register: registerThreshold } = useForm()

    const [deleteModal, setDeleteModal] = useState(false)
    const [addOwnerModal, setAddOwnerModal] = useState(false)
    const [changeThresholdModal, setChangeThresholdModal] = useState(false)

    const [addOwnerImageURL, setAddOwnerImageURL] = useState<string>()
    const [addOwnerImageType, setAddOwnerImageType] = useState<'image' | 'nft'>('image')

    const dispatch = useAppDispatch()
    const blockchain = useAppSelector(SelectBlockchain)
    const accountType = useAppSelector(SelectAccountType)
    const individual = useAppSelector(SelectIndividual)
    const organization = useAppSelector(SelectOrganization)
    const id = useAppSelector(SelectID)

    const { addOwner, changeSigns } = useMultisig()

    const updateAccountName = async (val: string) => {
        await dispatch(Update_Account_Name({
            account: {
                id: item.id,
                address: item.address,
                blockchain: item.blockchain,
                name: val,
                created_date: item.created_date,
                createdBy: item.createdBy,
                image: item.image,
                mail: item.mail,
                members: item.members,
                provider: item.provider,
                signerType: item.signerType,
            },
            name: val
        })).unwrap()
    }

    const updateImage = async (url: string, type: "image" | "nft") => {
        console.log(url)
        await dispatch(Update_Account_Image({
            account: {
                address: item.address,
                blockchain: item.blockchain,
                name: item.name,
                created_date: item.created_date,
                image: item.image,
                createdBy: item.createdBy,
                id: item.id,
                mail: item.mail,
                members: item.members,
                provider: item.provider,
                signerType: item.signerType,
            },
            image: {
                blockchain: blockchain.name,
                imageUrl: url,
                nftUrl: url,
                tokenId: null,
                type
            }
        }))
    }

    const deleteWallet = async () => {
        if (!id) return ToastRun(<>Cannot find your session</>, "error")
        if (accountType === "individual") {
            if (!individual) return ToastRun(<>Cannot find your session</>, "error")
            await dispatch(Remove_Account_From_Individual({
                account: item,
                individual: individual,
                userId: id
            }))
        } else {
            if (!organization) return ToastRun(<>Cannot find your session</>, "error")
            await dispatch(Remove_Account_From_Organization({
                account: item,
                organization: organization,
                userId: id
            }))
        }
    }


    const addNewOwner = async (data: { name: string, address: string, mail?: string }) => {
        await addOwner(item, data.address, data.name, addOwnerImageURL ? {
            blockchain: item.blockchain,
            imageUrl: addOwnerImageURL,
            nftUrl: addOwnerImageURL,
            tokenId: null,
            type: addOwnerImageType
        } : null, data.mail)
        ToastRun(<>Transaction is created</>, "success")
    }

    const changeThreshold = async (data: { threshold: number }) => {
        await changeSigns(item, data.threshold, data.threshold, true, false)
        ToastRun(<>Transaction is created</>, "success")
    }

    const [addOwnerLoading, AddOwner] = useLoading(addNewOwner)
    const [changeThresholdLoading, ChangeThreshold] = useLoading(changeThreshold)
    const [deleteLoading, DeleteWallet] = useLoading(deleteWallet)

    return <div className="bg-white dark:bg-darkSecond rounded-md shadow-custom p-5 grid grid-cols-[25%,25%,25%,7.5%,1fr]" >
        <div className="flex items-center justify-start gap-2" >
            <EditableAvatar
                avatarUrl={(typeof item.image?.imageUrl === "string" ? item.image?.imageUrl : null) ?? item.image?.nftUrl ?? null}
                name={item.name}
                blockchain={Object.values(Blockchains).find(b => b.name === item.blockchain)!}
                evm={item.blockchain !== "solana"}
                userId={item.address}
                onChange={updateImage}
                size={4.5}
            />
            <div className="flex flex-col">
                <div className="">
                    <EditableTextInput defaultValue={item.name} onSubmit={updateAccountName} placeholder="Name" />
                </div>
                <div className="text-greylish dark:text-white text-sm mx-2">{AddressReducer(item.address)}</div>
            </div>
        </div>
        <div className="flex items-center justify-center">
            <div className="flex items-center justify-center text-lg font-semibold">
                ${SetComma(item.totalValue)}
            </div>
        </div>
        <div className="flex items-center justify-center">
            <div className="flex pl-3">
                <AvatarGroup max={3}>
                    {item.members.map((member, index) => <Avatar key={member.id} alt={member.name} src={member.image?.imageUrl ?? member.image?.nftUrl ?? ""} />)}
                </AvatarGroup>
            </div>
        </div>
        <div className="flex space-x-3 justify-end items-center">
            {item.signerType === "multi" && <>
                <div className="cursor-pointer" onClick={() => setAddOwnerModal(true)}>
                    <Tooltip title={"Add a new owner"}>
                        <IoPersonAddSharp size={20} />
                    </Tooltip>
                </div>
                <div className="cursor-pointer" onClick={() => setDeleteModal(true)}>
                    <Tooltip title={"Change threshold"}>
                        <TbTextResize size={20} />
                    </Tooltip>
                </div>
            </>}
            <div className="cursor-pointer" onClick={() => setDeleteModal(true)}>
                <IoTrashOutline size={20} className="hover:text-red-500" />
            </div>
        </div>
        {deleteModal &&
            <Modal onDisable={setDeleteModal} animatedModal={false} disableX={true} className={'!pt-6'}>
                <div className="flex flex-col space-y-8 items-center">
                    <div className="text-2xl text-primary">Are You Sure?</div>
                    <div className="flex items-center justify-center text-xl">
                        Your Are About Delete This Wallet
                    </div>
                    <div className="flex justify-center items-center space-x-4">
                        <Button version="second" className="border-2  w-[7rem] h-[2.7rem] !px-1 !py-0" onClick={() => { setDeleteModal(false) }}>No</Button>
                        <Button className="w-[7rem] h-[2.7rem] !px-1 !py-0" onClick={DeleteWallet} isLoading={deleteLoading}>Yes</Button>
                    </div>
                </div>
            </Modal>}
        {addOwnerModal &&
            <Modal onDisable={setAddOwnerModal} animatedModal={false} disableX={true} className={'!pt-6'}>
                <form onSubmit={handleAddOwnerSubmit(AddOwner)} className="flex flex-col w-[62%] gap-7">
                    <div className={`flex justify-center flex-shrink-0 flex-grow-0`}>
                        <EditableAvatar
                            avatarUrl={null}
                            name={"random"}
                            blockchain={blockchain}
                            evm={blockchain.name !== "solana"}
                            userId={`${id ?? ""}/accounts/${item.id}`}
                            onChange={(url, type) => { setAddOwnerImageURL(url); setAddOwnerImageType(type) }}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="text-sm">Owner Name</div>
                        <input type="text" {...registerAddOwner("name", { required: true })} placeholder="E.g: Jessy" className="border w-full py-3 text-base rounded-md px-3 dark:bg-darkSecond" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="text-sm">Owner Address</div>
                        <input type="text" {...registerAddOwner("address", { required: true })} placeholder="Owner Adress" className="border w-full py-3 text-base rounded-md px-3 dark:bg-darkSecond" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="text-sm">Owner Email</div>
                        <input type="email" {...registerAddOwner("mail", { required: false })} placeholder="Mail" className="border w-full py-3 text-base rounded-md px-3 dark:bg-darkSecond" />
                    </div>
                    <div className="grid grid-cols-2 gap-x-10 pt-1 pb-2 justify-center">
                        <Button version="second" className="px-6 py-3 rounded-md" onClick={() => { setAddOwnerModal(false) }}>
                            Close
                        </Button>
                        <Button type='submit' className="px-6 py-3 rounded-md" isLoading={addOwnerLoading}>
                            Save
                        </Button>
                    </div>
                </form>
            </Modal>}
        {changeThresholdModal &&
            <Modal onDisable={setChangeThresholdModal} animatedModal={false} disableX={true} className={'!pt-6'}>
                <form onSubmit={handleThresholdSubmit(ChangeThreshold)} className="flex flex-col w-[62%] gap-7">
                    <div className="flex flex-col gap-1">
                        <div className="text-sm">Threshold</div>
                        <input type="text" {...registerThreshold("threshold", { required: true, valueAsNumber: true })} placeholder="E.g: 5" className="border w-full py-3 text-base rounded-md px-3 dark:bg-darkSecond" />
                    </div>
                    <div className="grid grid-cols-2 gap-x-10 pt-1 pb-2 justify-center">
                        <Button version="second" className="px-6 py-3 rounded-md" onClick={() => { setChangeThresholdModal(false) }}>
                            Close
                        </Button>
                        <Button type='submit' className="px-6 py-3 rounded-md" isLoading={changeThresholdLoading}>
                            Save
                        </Button>
                    </div>
                </form>
            </Modal>}
    </div>
}

export default WalletItem