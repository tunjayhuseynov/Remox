import { useState } from "react";
import Modal from "../../../components/general/modal";
import Delete from "./buttons/delete";
import EditTeam from './buttons/editTeam'
import TeamItem from "./teamItem";
import { IuseContributor } from "API/useContributors";
import useContributors from "hooks/useContributors";


const TeamContainer = (props: IuseContributor) => {
    const [deleteModal, setDeleteModal] = useState(false)
    const { removeTeam } = useContributors()

    const [editModal, setEditModal] = useState(false)

    const [num, setNum] = useState(3)

    const DeleteTeam = async () => {
        try {
            await removeTeam(props.id)
            //setDeleteModal(false)
        } catch (error) {
            console.error(error)
        }
    }
    return <>
        <div className="col-span-4 flex space-x-3 py-4 pt-4 sm:pt-14 pb-1 px-5 items-center justify-between">
            <div className="font-semibold text-[1.5rem] overflow-hidden whitespace-nowrap">
                <div>{props.name}</div>
            </div>
            <div className="flex space-x-3">
                <div className="cursor-pointer" onClick={() => setEditModal(true)}>
                    <img src="/icons/editicon.svg" className="dark:invert dark:brightness-0" alt="" />
                </div>
                <div className="cursor-pointer" onClick={() => setDeleteModal(true)}>
                    <img src="/icons/trashicon.svg" alt="" />
                </div>
            </div>
        </div>
        {props.members && props.members.slice(0, num).map(w =>
            <div key={w.id} className="grid grid-cols-2 sm:grid-cols-[30%,30%,1fr] lg:grid-cols-[20%,20%,20%,1fr] py-6 border-b border-black pb-5 px-5 text-sm">
                <TeamItem teamName={props.name} {...w} />
            </div>
        )}
        {props.members && props.members.length > 3 && num !== 100 ? <button className="py-3 pb-5 px-5 font-bold text-primary" onClick={() => setNum(100)}>
            Show More
        </button> : null}
        {!props.members ? <div className="b-5 px-5 border-b border-black pb-5">No Team Member Yet</div> : undefined}
        {deleteModal && <Modal onDisable={setDeleteModal}>
            <Delete name={props.name} onCurrentModal={setDeleteModal} onDelete={DeleteTeam} />
        </Modal>}
        {editModal && <Modal onDisable={setEditModal}>
            <EditTeam {...props} onCurrentModal={setEditModal} />
        </Modal>}
    </>
}

export default TeamContainer;