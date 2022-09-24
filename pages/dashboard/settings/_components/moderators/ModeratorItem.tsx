import EditableAvatar from "components/general/EditableAvatar";
import EditableTextInput from "components/general/EditableTextInput";
import { IModerator } from "firebaseConfig";
import { IoTrashOutline } from "react-icons/io5";
import { AddressReducer, SetComma } from "utils";
import { useState } from 'react'
import Modal from "components/general/modal";
import Button from "components/button";
import useLoading from "hooks/useLoading";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { Remove_Moderator_Thunk, Update_Moderator_Image_Thunk, Update_Moderator_Name_Thunk } from "redux/slices/account/thunks/moderator";
import { SelectBlockchain, SelectProviderAddress } from "redux/slices/account/selector";

interface IProps { item: IModerator }
const ModeratorItem = ({ item }: IProps) => {
    const [deleteModal, setDeleteModal] = useState(false)
    const dispatch = useAppDispatch()
    const blockchain = useAppSelector(SelectBlockchain)
    const providerAddress = useAppSelector(SelectProviderAddress)

    const updateName = async (name: string) => {
        await dispatch(Update_Moderator_Name_Thunk({ moderatorId: item.id, name }))
    }

    const updateImage = async (url: string, type: "image" | "nft") => {
        await dispatch(Update_Moderator_Image_Thunk({
            moderatorId: item.id, image: {
                blockchain: blockchain.name,
                imageUrl: url,
                nftUrl: url,
                type,
                tokenId: null
            }
        }))
    }

    const deleteModerator = async () => {
        await dispatch(Remove_Moderator_Thunk({ moderatorId: item.id }))
    }


    const [deleteLoading, DeleteModerator] = useLoading(deleteModerator)


    return <div className="grid grid-cols-[25%,15%,20%,1fr] px-5 shadow-custom py-4 dark:bg-darkSecond bg-white">
        <div className="flex items-center justify-start gap-2" >
            <EditableAvatar
                avatarUrl={(typeof item.image?.imageUrl === "string" ? item.image?.imageUrl : null) ?? item.image?.nftUrl ?? null}
                name={item.name}
                noNFT={true}
                userId={item.address}
                onChange={updateImage}
                size={4.5}
            />
            <div className="flex flex-col">
                <div className="">
                    <EditableTextInput defaultValue={item.name} onSubmit={updateName} placeholder="Name" />
                </div>
                <div className="text-greylish dark:text-white text-sm mx-2">{AddressReducer(item.address)}</div>
            </div>
        </div>
        <div className="flex items-center justify-center">
            {item.address === providerAddress && <div className="flex items-center justify-center px-8 py-2 bg-primary bg-opacity-40 text-primary font-semibold border border-primary">You</div>}
        </div>
        <div className="flex items-center justify-center">
            {item.mail}
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
                        Your are about to delete this moderator
                    </div>
                    <div className="flex justify-center items-center space-x-4">
                        <Button version="second" className="border-2  w-[7rem] h-[2.7rem] !px-1 !py-0" onClick={() => { setDeleteModal(false) }}>No</Button>
                        <Button className="w-[7rem] h-[2.7rem] !px-1 !py-0" onClick={DeleteModerator} isLoading={deleteLoading}>Yes</Button>
                    </div>
                </div>
            </Modal>}
    </div>
}


export default ModeratorItem;