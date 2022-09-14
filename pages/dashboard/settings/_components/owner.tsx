import { useState } from 'react'
import Button from 'components/button'
import Modal from 'components/general/Modal'
import OwnerItem from './owner/ownerItem'
import RemoveOwner from './owner/removeOwner'
import ChangeTreshold from './owner/changeTreshold'
import AddOwner from './owner/addOwner'
import { useAppSelector } from 'redux/hooks'
import { SelectOwners } from 'redux/slices/account/selector'
import { Image } from 'firebaseConfig'


const OwnerSetting = () => {

    const owners = useAppSelector(SelectOwners)

    const [addOwnerModal, setAddOwnerModal] = useState(false)
    const [replaceOwnerModal, setReplaceOwnerModal] = useState(false)
    const [changeTresholdModal, setChangeTresholdModal] = useState(false)
    const [removeModal, setRemoveModal] = useState(false)

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
        {owners.map((item, index) => {
            return <OwnerItem key={index} item={item} setReplaceOwnerModal={setReplaceOwnerModal} setRemoveModal={setRemoveModal} setRemovable={setRemovable} />
        })}


        {addOwnerModal && <Modal onDisable={setAddOwnerModal} animatedModal={false} disableX={true} className={'!pt-3'}>
            <AddOwner onDisable={setAddOwnerModal} />
        </Modal>}
        {/* {replaceOwnerModal && <Modal onDisable={setReplaceOwnerModal} animatedModal={false} disableX={true} className={'!pt-3'}>
            <ReplaceOwner ownerAddress={selectedOwner} onDisable={setReplaceOwnerModal} />
        </Modal>} */}
        {changeTresholdModal && <Modal onDisable={setChangeTresholdModal} animatedModal={false} disableX={true}>
            <ChangeTreshold onDisable={setChangeTresholdModal} />
        </Modal>}
        {removeModal && <Modal onDisable={setRemoveModal} disableX={true} animatedModal={false} className={'!pt-6'}>
            <RemoveOwner address={removable.address} name={removable.name} onDisable={setRemoveModal} />
        </Modal>}
    </div>
}

export default OwnerSetting