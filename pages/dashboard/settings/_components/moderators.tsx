import { useState } from 'react'
import Modal from 'components/general/modal'
import { useAppSelector } from 'redux/hooks'
import { SelectModerators } from 'redux/slices/account/selector'
import ModeratorItem from './moderators/ModeratorItem'
import CreateButton from 'components/general/CreateButton'
import CreateModerate from './moderators/CreateModerate'


const ModeratorSetting = () => {

    const [addModal, setAddModal] = useState(false)

    const moderators = useAppSelector(SelectModerators)

    // if (!isMultisig) return <div className="text-center">Please, select a MultiSig account</div>

    return <>
        <div className="flex flex-col space-y-7  mt-10">
            {moderators.map((item, index) => {
                return <ModeratorItem key={item.id} item={item} />
            })}
            <div className='flex justify-center w-full'>
                <CreateButton onClick={() => setAddModal(true)} />
            </div>
        </div>
        {addModal && <Modal onDisable={setAddModal} animatedModal={false} className='!w-1/3' disableX={true}>
            <CreateModerate onDisable={setAddModal} />
        </Modal>}
    </>
}

export default ModeratorSetting