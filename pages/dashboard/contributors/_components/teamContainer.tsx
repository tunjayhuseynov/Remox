import { useState } from "react";
import Delete from "./buttons/delete";
// import EditTeam from './buttons/editTeam'
import TeamItem from "./contributorItem";
import { IContributor } from "types/dashboard/contributors";
import useContributors from "hooks/useContributors";
import useTasking from "rpcHooks/useTasking";
import { useAppDispatch, useAppSelector } from 'redux/hooks';
import { useModalSideExit } from "hooks";
import { removeContributor } from "redux/slices/account/remoxData";
import { useRouter } from "next/router";
import { SelectDarkMode } from 'redux/slices/account/remoxData';
import Modal from "components/general/modal";


const TeamContainer = (props: (IContributor) & { index: number }) => {
    const [deleteModal, setDeleteModal] = useState(false)
    const { removeTeam } = useContributors()
    const { cancelTask } = useTasking()
    const [num, setNum] = useState(15)
    const [details, setDetails] = useState(false)
    const dark = useAppSelector(SelectDarkMode)
    const dispatch = useAppDispatch()
    const navigate = useRouter()
    console.log(props)

    const [divRef, exceptRef] = useModalSideExit(details, setDetails, false)

    return <>
        {props.members && props.index !== 4 && props.members.slice(0, num).map(w =>
            <div key={w.id}>
                <TeamItem teamName={props.name} index={props.index === 1 ? 'Full Time' : props.index === 2 ? 'Part Time' : props.index === 3 ? 'Bounty' : props.index === 4 ? 'Team' : 'Active'} {...w} />
            </div>
        )}
        {props.members && props.index !== 4 && props.members.length > 15 && num !== 100 ? <button className="py-3 pb-5  font-bold text-primary" onClick={() => setNum(100)}>
            Show More
        </button> : null}
        {!props.members ? <div className="b-5 px-5 border-b border-black pb-5">No Team Member Yet</div> : undefined}
        {/* {editModal && <Modal onDisable={setEditModal} animatedModal={false} disableX={true} className={'!pt-2'}>
            <EditTeam {...props} onCurrentModal={setEditModal}  />
        </Modal>} */}
    </>
}

export default TeamContainer;