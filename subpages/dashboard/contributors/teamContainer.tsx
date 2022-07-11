import { useState } from "react";
import Modal from "../../../components/general/modal";
import Delete from "./buttons/delete";
import EditTeam from './buttons/editTeam'
import TeamItem from "./teamItem";
import { IuseContributor } from "rpcHooks/useContributors";
import useContributors from "hooks/useContributors";
import useGelato from "rpcHooks/useGelato";
import { useAppSelector } from 'redux/hooks';
import { changeDarkMode, selectDarkMode } from 'redux/slices/notificationSlice';
import { useModalSideExit } from "hooks";

const TeamContainer = (props: (IuseContributor) & {selectbar:string}) => {
    const [deleteModal, setDeleteModal] = useState(false)
    const { removeTeam } = useContributors()
    const [editModal, setEditModal] = useState(false)
    const { cancelTask } = useGelato()
    const [num, setNum] = useState(15)
    const [details, setDetails] = useState(false)
    const dark = useAppSelector(selectDarkMode)

    const DeleteTeam = async () => {
        try {
            for (let index = 0; index < props.members.length; index++) {
                const element = props.members[index];
                if (element.taskId) {
                    await cancelTask(element.taskId as string)
                }
            }
            await removeTeam(props.id)
            //setDeleteModal(false)
        } catch (error) {
            console.error(error)
        }
    }

    const [divRef, exceptRef] = useModalSideExit(details, setDetails, false)

    return <>
       {props.selectbar === "Team" && <div className=" flex px-5 py-5   min-w-[23.5rem] min-h-[12rem] items-start justify-between  ">
            <div className="flex flex-col justify-between w-full h-full">
                <div className="flex items-start justify-between w-full">
                <div className="font-semibold text-[1.5rem] overflow-hidden whitespace-nowrap">
                <div>{props.name}</div>
            </div>
            <div className="flex items-end justify-end">
                <span ref={exceptRef} onClick={() =>{setDetails(!details)}} className=" text-3xl flex items-center relative cursor-pointer  font-bold"><span className="rotate-90 text-primary">...</span>
                {details && <div ref={divRef} className="flex flex-col items- justify-start bg-white dark:bg-darkSecond  absolute right-6 -top-12  translate-y-full rounded-lg shadow-xl z-50 ">
                <div className="cursor-pointer  text-sm border-b border-greylish border-opacity-20 flex items-center min-w-[7rem] px-2 pr-6 py-1 gap-2" onClick={() => setEditModal(true)}>
                    <img src={`/icons/${dark ? 'edit_white' : 'edit'}.png`} className="dark:invert dark:brightness-0 w-5 h-5" alt=""  /> <span>Edit</span>
                </div>
                <div className="cursor-pointer  text-sm flex items-center  px-2 pr-6 w-full py-1 gap-2" onClick={() => setDeleteModal(true)}>
                    <img src={`/icons/${dark ? 'trashicon_white' : 'trashicon'}.png`} className="dark:invert dark:brightness-0 w-5 h-5"  alt="" /> <span>Delete</span>
                </div>
                    </div>}
                </span>
            </div>
                </div>
                <div className="flex items-start w-full">
                    <div className="bg-primary rounded-full w-10 h-10 "></div>
                </div>
            </div>
        </div>}
        {props.members && props.selectbar  !== "Team" &&   props.members.slice(0, num).map(w =>
            <div key={w.id}>
                <TeamItem teamName={props.name}  selectbar={props.selectbar} {...w} />
            </div>
        )}
        {props.members && props.selectbar  !== "Team" &&  props.members.length > 15 && num !== 100 ? <button className="py-3 pb-5 px-5 font-bold text-primary" onClick={() => setNum(100)}>
            Show More
        </button> : null}
        {!props.members ? <div className="b-5 px-5 border-b border-black pb-5">No Team Member Yet</div> : undefined}
        {deleteModal && <Modal onDisable={setDeleteModal} animatedModal={false} disableX={true} className={'!pt-2'}>
            <Delete name={props.name} onCurrentModal={setDeleteModal} onDelete={DeleteTeam} />
        </Modal>}
        {editModal && <Modal onDisable={setEditModal} animatedModal={false} disableX={true} className={'!pt-2'}>
            <EditTeam {...props} onCurrentModal={setEditModal}  />
        </Modal>}
    </>
}

export default TeamContainer;