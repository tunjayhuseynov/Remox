import { useState } from 'react'
import { MdEdit } from 'react-icons/md'
import { AddOwner, RemoveOwner, ReplaceOwner, ChangeTreshold } from 'subpages/dashboard/settings/owner/index'
import Avatar from 'components/avatar'
import Button from 'components/button'
import Modal from 'components/general/modal'
import { useSelector } from 'react-redux'
import { selectStorage } from 'redux/slices/account/storage'
import { useAppSelector } from 'redux/hooks';
import { changeDarkMode, selectDarkMode } from 'redux/slices/notificationSlice';
import useModalSideExit from 'hooks/useModalSideExit';
import OwnerItem from './owner/ownerItem'


export interface IOwnerData {
    id: number;
    image:string |null,
    orgImage:string |null,
    name: string;
    text:string;
    wallet:string;
    mail: string;
}[]

const OwnerSetting = () => {

    const storage = useSelector(selectStorage)
    const dark = useAppSelector(selectDarkMode)
    const [details, setDetails] = useState(false)
    const [addOwnerModal, setAddOwnerModal] = useState(false)
    const [replaceOwnerModal, setReplaceOwnerModal] = useState(false)
    const [changeTresholdModal, setChangeTresholdModal] = useState(false)
    const [removeModal, setRemoveModal] = useState(false)

    const [selectedOwner, setSelectedOwner] = useState("")
    const [removable, setRemovable] = useState({ name: "", address: "" })

    // if (!isMultisig) return <div className="text-center">Please, select a MultiSig account</div>


    const walletData: IOwnerData[] = [
        {
            id: 0,
            image:null,
            orgImage:null,
            name: 'Orkhan Aslanov (you)',
            text: 'Orkhan.sol',
            wallet: 'Treasury Vault 0',
            mail: 'Orkhan.remox.io',

        },
        {
            id: 1,
            image:null,
            orgImage:null,
            name: 'Tuncay Huseynov',
            text: 'Tuncay.sol',
            wallet: 'Treasury Vault 1',
            mail: 'Tuncay.remox.io',
        },
    ]

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
        {walletData.map((item,index)=>{
            return <OwnerItem key={index} item={item} setReplaceOwnerModal={setReplaceOwnerModal} setRemoveModal={setRemoveModal} setRemovable={setRemovable} />
        })}


        {addOwnerModal && <Modal onDisable={setAddOwnerModal} animatedModal={false} disableX={true} className={'!pt-3'}>
            <AddOwner onDisable={setAddOwnerModal} />
        </Modal>}
        {replaceOwnerModal && <Modal onDisable={setReplaceOwnerModal} animatedModal={false} disableX={true} className={'!pt-3'}>
            <ReplaceOwner ownerAddress={selectedOwner} onDisable={setReplaceOwnerModal} />
        </Modal>}
        {changeTresholdModal && <Modal onDisable={setChangeTresholdModal} animatedModal={false} disableX={true}>
            <ChangeTreshold onDisable={setChangeTresholdModal} />
        </Modal>}
        {removeModal && <Modal onDisable={setRemoveModal} disableX={true} animatedModal={false} className={'!pt-6'}>
            <RemoveOwner address={removable.address} name={removable.name} onDisable={setRemoveModal} />
        </Modal>}
    </div>
}

export default OwnerSetting