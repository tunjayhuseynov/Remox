import Button from "components/button";
import EditableAvatar from "components/general/EditableAvatar";
import EditableTextInput from "components/general/EditableTextInput";
import Modal from "components/general/modal";
import { IAccount, IMember } from "firebaseConfig";
import useLoading from "hooks/useLoading";
import useMultisig from "hooks/walletSDK/useMultisig";
import { useState } from "react";
import { IoTrashOutline } from "react-icons/io5";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { SelectBlockchain, SelectProviderAddress } from "redux/slices/account/selector";
import { Update_Account_Member_Email_Thunk, Update_Account_Member_Image_Thunk, Update_Account_Member_Name_Thunk } from "redux/slices/account/thunks/accountMembers";
import { MultisigProviders } from "types/blockchains";
import { AddressReducer } from "utils";
import { ToastRun } from "utils/toast";



const OwnerItem = ({ item, account }: { item: IMember, account: IAccount }) => {
    const [deleteModal, setDeleteModal] = useState(false)
    const dispatch = useAppDispatch()
    const blockchain = useAppSelector(SelectBlockchain)
    const providerAddress = useAppSelector(SelectProviderAddress)
    const { removeOwner } = useMultisig()

    const updateName = async (name: string) => {
        try {
            await dispatch(Update_Account_Member_Name_Thunk({
                accountId: account.id,
                memberId: item.id,
                name: name
            }))
            ToastRun(<>Name is updated successfully</>)
        } catch (error) {
            ToastRun(<>Error while updating name</>, "error")
        }
    }

    const updateMail = async (mail: string) => {
        try {
            await dispatch(Update_Account_Member_Email_Thunk({
                accountId: account.id,
                memberId: item.id,
                email: mail
            }))
            ToastRun(<>Email is updated successfully</>)
        } catch (error) {
            ToastRun(<>Error while updating email</>, "error")
        }
    }

    const updateImage = async (url: string, type: "image" | "nft") => {
        try {
            const image = {
                blockchain: blockchain.name,
                imageUrl: url,
                nftUrl: url,
                type,
                tokenId: null
            }
            await dispatch(Update_Account_Member_Image_Thunk({
                accountId: account.id,
                image: image,
                memberId: item.id
            }))
            ToastRun(<>Image is updated successfully</>)
        } catch (error) {
            ToastRun(<>Error while updating image</>, "error")
        }
    }

    const deleteOwner = async () => {
        try {
            if (!account.provider) return ToastRun(<>Provider is not selected</>, "error")
            removeOwner(account, item.address, account.provider)
        } catch (error) {
            ToastRun(<>Error while deleting owner</>, "error")
        }
    }

    const [deleteLoading, DeleteOwner] = useLoading(deleteOwner)


    return <div className="grid grid-cols-[25%,23%,15%,1fr] px-5 py-4 dark:bg-darkSecond bg-white">
        <div className="flex items-center justify-start gap-2" >
            <EditableAvatar
                avatarUrl={(typeof item.image?.imageUrl === "string" ? item.image?.imageUrl : null) ?? item.image?.nftUrl ?? null}
                name={item.name ?? "random"}
                noNFT={true}
                userId={item.address}
                onChange={updateImage}
                size={2}
            />
            <div className="flex flex-col">
                <div className="">
                    <EditableTextInput defaultValue={item.name} onSubmit={updateName} placeholder="Name" />
                </div>
                <div className="text-greylish dark:text-white text-xs mx-2">{AddressReducer(item.address)}</div>
            </div>
        </div>
        <div className="flex items-center justify-start">
            {item.address === providerAddress && <div className="flex items-center justify-center px-4 py-1 text-xs bg-primary bg-opacity-40 text-primary font-semibold border border-primary">You</div>}
        </div>
        <div className="flex items-center justify-center">
            {<EditableTextInput defaultValue={item.mail ?? ""} onSubmit={updateMail} placeholder="Email" />}
        </div>
        <div className="flex space-x-3 justify-end items-center">
            <div className="cursor-pointer" onClick={() => setDeleteModal(true)}>
                <IoTrashOutline size={20} className="hover:text-red-500" />
            </div>
        </div>
        {deleteModal &&
            <Modal onDisable={setDeleteModal} animatedModal={false} disableX={true} className={'!pt-6'}>
                <div className="flex flex-col space-y-8 items-center px-5">
                    <div className="text-2xl text-primary">Are you sure?</div>
                    <div className="flex items-center justify-center text-xl">
                        You are about to delete this moderator
                    </div>
                    <div className="flex justify-center items-center space-x-4">
                        <Button version="second" className="border-2  w-[7rem] h-[2.7rem] !px-1 !py-0" onClick={() => { setDeleteModal(false) }}>No</Button>
                        <Button className="w-[7rem] h-[2.7rem] !px-1 !py-0" onClick={DeleteOwner} isLoading={deleteLoading}>Yes</Button>
                    </div>
                </div>
            </Modal>}
    </div>
}

export default OwnerItem;