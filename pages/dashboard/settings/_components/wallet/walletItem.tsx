import { Avatar, AvatarGroup } from '@mui/material';
import Button from 'components/button';
import EditableAvatar from 'components/general/EditableAvatar';
import EditableTextInput from 'components/general/EditableTextInput';
import Modal from 'components/general/modal';
import useLoading from 'hooks/useLoading';
import { IAccountORM } from 'pages/api/account/index.api';
import React, { useState } from 'react';
import { IoTrashOutline } from 'react-icons/io5';
import { useAppDispatch, useAppSelector } from 'redux/hooks';
import { SelectAccountType, SelectBlockchain, SelectID, SelectIndividual, SelectOrganization } from 'redux/slices/account/selector';
import { Remove_Account_From_Individual, Remove_Account_From_Organization, Update_Account_Image, Update_Account_Name } from 'redux/slices/account/thunks/account';
import { Blockchains } from 'types/blockchains';
import { AddressReducer, SetComma } from 'utils';
import { ToastRun } from 'utils/toast';


function WalletItem({ item }: { item: IAccountORM }) {

    const dispatch = useAppDispatch()
    const [deleteModal, setDeleteModal] = useState(false)
    const blockchain = useAppSelector(SelectBlockchain)
    const accountType = useAppSelector(SelectAccountType)
    const individual = useAppSelector(SelectIndividual)
    const organization = useAppSelector(SelectOrganization)
    const id = useAppSelector(SelectID)

    const updateAccountName = async (val: string) => {
        await dispatch(Update_Account_Name({
            account: item,
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
    </div>
}

export default WalletItem