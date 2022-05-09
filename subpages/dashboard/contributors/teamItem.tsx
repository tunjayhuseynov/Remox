import { useState } from "react";
import Modal from "components/general/modal";
import Profile from "subpages/dashboard/contributors/buttons/profile"
import EditMember from "subpages/dashboard/contributors/buttons/editMember"
import Avatar from "../../../components/avatar";
import Delete from './buttons/delete'
import { IMember } from "apiHooks/useContributors";
import useContributors from "hooks/useContributors";
import useGelato from "apiHooks/useGelato";
import { useWalletKit } from "hooks";

const TeamItem = (props: IMember & { teamName: string }) => {
    const { removeMember } = useContributors()
    const [modalVisible, setModalVisible] = useState(false)
    const [modalEditVisible, setModalEditVisible] = useState(false)
    const [deleteModal, setDeleteModal] = useState(false)
    const { cancelTask } = useGelato()
    const { GetCoins } = useWalletKit()

    const onDelete = async () => {
        try {
            if (props.taskId) {
                await cancelTask(props.taskId as string)
            }
            await removeMember(props.teamId, props.id)
        } catch (error) {
            throw error
        }
    }

    return <>
        <div className="pl-[2px] items-start">
            <div className="hover:cursor-pointer flex items-center space-x-1" onClick={() => setModalVisible(true)}>
                <Avatar name={props.name} />
                <div>
                    {props.name}
                </div>
            </div>
        </div>
        <div className="pl-[2px] hidden sm:flex items-start">
            {props.teamName}
        </div>
        <div className="flex flex-col space-y-4">
            <div className=" pl-[2px] flex items-center justify-start gap-1">
                <div>{props.amount}</div>
                {props.usdBase ? <div>USD as {GetCoins[props.currency].name}</div> :
                    <div>
                        {GetCoins[props.currency].name}
                    </div>}
                <div>
                    <img src={GetCoins[props.currency].coinUrl} width="20" height="20" alt="" className="rounded-full" />
                </div>
            </div>
            {props.secondaryCurrency && <div className="pl-[2px] flex items-center justify-start gap-1">
                <div>{props.secondaryAmount}</div>
                {props.secondaryUsdBase ? <div>USD as {GetCoins[props.secondaryCurrency].name}</div> :
                    <div>
                        {GetCoins[props.secondaryCurrency].name}
                    </div>}
                <div>
                    <img src={GetCoins[props.secondaryCurrency].coinUrl} width="20" height="20" alt="" className="rounded-full" />
                </div>
            </div>}
        </div>
        <div className="col-span-2 sm:col-span-1 pt-3 sm:pt-0 pl-[2px] self-start truncate">
            {props.address}
        </div>
        {modalVisible && <Modal onDisable={setModalVisible}>
            <Profile {...props} member={props} onDeleteModal={setDeleteModal} onCurrentModal={setModalVisible} onEditModal={setModalEditVisible} />
        </Modal>}
        {modalEditVisible && <Modal onDisable={setModalEditVisible}>
            <EditMember {...props} onCurrentModal={setModalVisible} />
        </Modal>}
        {deleteModal && <Modal onDisable={setDeleteModal}>
            <Delete name={props.name} onCurrentModal={setDeleteModal} onDelete={onDelete} />
        </Modal>}

    </>
}

export default TeamItem;