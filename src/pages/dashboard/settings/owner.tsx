import { useState } from 'react'
import { MdEdit } from 'react-icons/md'
import shortid, { generate } from 'shortid'
import { AddOwner, RemoveOwner, ReplaceOwner, ChangeTreshold } from 'subpages/dashboard/settings/owner'
import Avatar from 'components/avatar'
import Button from 'components/button'
import Modal from 'components/general/modal'
import useMultisig from 'hooks/useMultisig'
import { useSelector } from 'react-redux'
import { selectStorage } from 'redux/reducers/storage'

const OwnerSetting = () => {

    const storage = useSelector(selectStorage)

    const { owners, isMultisig, signAndInternal } = useMultisig()

    const [addOwnerModal, setAddOwnerModal] = useState(false)
    const [replaceOwnerModal, setReplaceOwnerModal] = useState(false)
    const [changeTresholdModal, setChangeTresholdModal] = useState(false)
    const [removeModal, setRemoveModal] = useState(false)

    const [selectedOwner, setSelectedOwner] = useState("")
    const [removable, setRemovable] = useState({ name: "", address: "" })

    if (!isMultisig) return <div className="text-center">Please, select a MultiSig account</div>

    return <div className="flex flex-col space-y-7">
        <div className="flex flex-col space-y-2">
            <div className="text-xl">
                Manage Owners
            </div>
            <div className="grid grid-cols-[55%,45%]">
                <div>
                    Add, remove, replace, invite or rename owners
                </div>
                <div className="grid grid-cols-[45%,45%,10%]">
                    <div>
                        <Button className="py-2 font-extralight w-[150px] flex items-center justify-center gap-x-1" onClick={() => { setChangeTresholdModal(true) }}>
                            <>
                                <MdEdit />
                                Treshold
                            </>
                        </Button>
                    </div>
                    <div>
                        <Button className="py-2 px-5 font-extralight w-[150px]" onClick={() => setAddOwnerModal(true)}>
                            + Add owner
                        </Button>
                    </div>
                </div>
            </div>
            <div>
                Every transaction requires the confirmation of <span className="font-semibold">{signAndInternal?.sign} out of {owners?.length}</span> owners
            </div>
        </div>
        <div className="shadow-custom px-12 py-4 -mx-10 rounded-xl">
            <div className="flex flex-col space-y-5">
                {owners?.map((e, i) => <div key={shortid()} className="grid grid-cols-[55%,10%,5%,30%] items-center">
                    <div key={generate()} className="flex items-center space-x-2">
                        <div>
                            <Avatar className="bg-opacity-10 font-bold text-xs" name="Ow" />
                        </div>
                        <div className="flex flex-col">
                            <div>Owner {i + 1}</div>
                            <div className="font-thin text-sm">Address: {e.toLowerCase()}</div>
                        </div>
                    </div>
                    <div>
                        {storage!.accountAddress.toLowerCase() === e.toLowerCase() ? <div className="font-thin text-sm bg-primary text-white inline rounded-xl px-4 py-1">You</div> : ""}
                    </div>
                    <div className="cursor-pointer" onClick={() => {
                        setSelectedOwner(e)
                        setReplaceOwnerModal(true)
                    }}>
                        <img src="/icons/editSetting.svg" alt="" />
                    </div>
                    <div className="cursor-pointer" onClick={() => {
                        setRemovable({ name: `Owner ${i + 1}`, address: e })
                        setRemoveModal(true)
                    }}>
                        <img src="/icons/trashSetting.svg" alt="" />
                    </div>
                </div>)}
            </div>
        </div>
        {addOwnerModal && <Modal onDisable={setAddOwnerModal} disableX={true}>
            <AddOwner onDisable={setAddOwnerModal} />
        </Modal>}
        {replaceOwnerModal && <Modal onDisable={setReplaceOwnerModal} disableX={true}>
            <ReplaceOwner ownerAddress={selectedOwner} onDisable={setReplaceOwnerModal} />
        </Modal>}
        {changeTresholdModal && <Modal onDisable={setChangeTresholdModal} disableX={true}>
            <ChangeTreshold onDisable={setChangeTresholdModal} />
        </Modal>}
        {removeModal && <Modal onDisable={setRemoveModal} disableX={true}>
            <RemoveOwner address={removable.address} name={removable.name} onDisable={setRemoveModal} />
        </Modal>}
    </div>
}

export default OwnerSetting