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
import { AddressReducer } from "../../../utils";
import { useAppSelector } from 'redux/hooks';
import { changeDarkMode, selectDarkMode } from 'redux/reducers/notificationSlice';
import { useModalSideExit } from "hooks";

const TeamItem = (props: IMember & { teamName: string, selectbar: string }) => {

    const { removeMember } = useContributors()
    const [modalVisible, setModalVisible] = useState(false)
    const [modalEditVisible, setModalEditVisible] = useState(false)
    const [deleteModal, setDeleteModal] = useState(false)
    const [details, setDetails] = useState(false)
    const { cancelTask } = useGelato()
    const { GetCoins } = useWalletKit()
    const dark = useAppSelector(selectDarkMode)

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

    const [divRef, exceptRef] = useModalSideExit(details, setDetails, false)

    return <>
        {
            modalEditVisible && <Modal onDisable={setModalEditVisible} disableX={true} >
                <EditMember {...props} onCurrentModal={setModalVisible} onDisable={setModalEditVisible} />
            </Modal>
        }
        {
            deleteModal && <Modal onDisable={setDeleteModal} disableX={true} className={'!pt-4'}>
                <Delete name={props.name} onCurrentModal={setDeleteModal} onDelete={onDelete} />
            </Modal>
        }
        {props.selectbar === "Active" ? <div className="grid grid-cols-2 sm:grid-cols-[30%,30%,1fr] lg:grid-cols-[17%,15%,19%,19%,17%,23%] text-center items-center py-6 border-b-2 border-greylish border-opacity-10 pb-5 px-5 text-sm relative">
            <div className="pl-[2px] items-start">
                <div className="hover:cursor-pointer flex items-center space-x-1" onClick={() => setModalVisible(true)}>
                    <Avatar name={props.name} />
                    <div className=" text-base text-left">
                        {props.name}
                    </div>
                </div>
            </div>
            <div className="pl-[2px] flex items-start  text-base">
                {props.teamName}
            </div>
            <div className="pl-[2px] flex items-start text-base">
                Business Developer
            </div>
            <div className="flex flex-col items-start space-y-4">
                <div className=" pl-[2px] flex items-center justify-start gap-1">
                    <div className=" text-base">{props.amount}</div>
                    {props.usdBase ? <div className="flex items-center gap-1">USD as <img src={GetCoins[props.currency].coinUrl} width="20" height="20" alt="" className="rounded-full" /> {GetCoins[props.currency].name}</div> :
                        <div className="flex items-center gap-1">
                            <img src={GetCoins[props.currency].coinUrl} width="20" height="20" alt="" className="rounded-full" />
                            {GetCoins[props.currency].name}
                        </div>}
                    <div>

                    </div>
                </div>
                {props.secondaryCurrency && <div className="pl-[2px] flex items-center justify-start gap-1">
                    <div className=" text-base">{props.secondaryAmount}</div>
                    {props.secondaryUsdBase ? <div className="flex items-center gap-1">USD as <img src={GetCoins[props.currency].coinUrl} width="20" height="20" alt="" className="rounded-full" /> {GetCoins[props.secondaryCurrency].name}</div> :
                        <div className="flex items-center gap-1">
                            <img src={GetCoins[props.secondaryCurrency].coinUrl} width="20" height="20" alt="" className="rounded-full" />
                            {GetCoins[props.secondaryCurrency].name}
                        </div>}
                    <div>
                    </div>
                </div>}
            </div>
            <div className=" pt-3 sm:pt-0 flex items-start truncate text-base">
                {AddressReducer(props.address)}
            </div>
            <div className="flex items-center gap-16  pl-[2px] self-start truncate">
                <span className="w-12 text-base">{props.compensation}</span>
                <span ref={exceptRef} onClick={() => { setDetails(!details) }} className=" text-3xl flex items-center  cursor-pointer  font-bold"><span className=" text-primary pb-4">...</span>
                    {details && <div ref={divRef} className="flex flex-col items-center bg-white dark:bg-dark absolute right-10 -bottom-6 w-[8rem]  rounded-lg shadow-xl z-50 ">
                        <div className="cursor-pointer  text-sm border-b border-greylish border-opacity-20 flex w-full px-2 pr-6 py-1 gap-3" onClick={() => {
                            setModalEditVisible(true)
                            setModalVisible(false)
                        }}>
                            <img src={`/icons/${dark ? 'edit_white' : 'edit'}.png`} className="dark:invert dark:brightness-0 w-5 h-5" alt="" /> <span>Edit</span>
                        </div>
                        <div className="cursor-pointer  text-sm flex w-full px-2 pr-6 py-1 gap-3" onClick={() => {
                            setDeleteModal(true)
                            setModalVisible(false)
                        }}>
                            <img src={`/icons/${dark ? 'trashicon_white' : 'trashicon'}.png`} className="dark:invert dark:brightness-0 w-5 h-5"  alt="" /> <span>Delete</span>
                        </div>
                    </div>}
                </span>
            </div>
            {modalVisible && <Modal onDisable={setModalVisible}>
                <Profile {...props} member={props} onDeleteModal={setDeleteModal} onCurrentModal={setModalVisible} onEditModal={setModalEditVisible} />
            </Modal>}
        </div>
            : props.selectbar === props.compensation && <div className="grid grid-cols-2 sm:grid-cols-[30%,30%,1fr] lg:grid-cols-[17%,15%,19%,19%,17%,23%] text-center items-center py-6 border-b-2 border-greylish border-opacity-10 pb-5 px-5 text-sm relative">
                <div className="pl-[2px] items-start">
                    <div className="hover:cursor-pointer flex items-center space-x-1" onClick={() => setModalVisible(true)}>
                        <Avatar name={props.name} />
                        <div className="text-base">
                            {props.name}
                        </div>
                    </div>
                </div>
                <div className="pl-[2px] flex items-start  text-base">
                    {props.teamName}
                </div>
                <div className="pl-[2px] flex items-start text-base">
                    Developer
                </div>
                <div className="flex flex-col items-start space-y-4">
                    <div className=" pl-[2px] flex items-center justify-start gap-1">
                        <div className=" text-base">{props.amount}</div>
                        {props.usdBase ? <div className="flex items-center gap-1">USD as <img src={GetCoins[props.currency].coinUrl} width="20" height="20" alt="" className="rounded-full" /> {GetCoins[props.currency].name}</div> :
                            <div className="flex items-center gap-1">
                                <img src={GetCoins[props.currency].coinUrl} width="20" height="20" alt="" className="rounded-full" />
                                {GetCoins[props.currency].name}
                            </div>}
                        <div>

                        </div>
                    </div>
                    {props.secondaryCurrency && <div className="pl-[2px] flex items-center justify-start gap-1">
                        <div className=" text-base">{props.secondaryAmount}</div>
                        {props.secondaryUsdBase ? <div className="flex items-center gap-1">USD as <img src={GetCoins[props.currency].coinUrl} width="20" height="20" alt="" className="rounded-full" />  {GetCoins[props.secondaryCurrency].name}</div> :
                            <div className="flex items-center gap-1">
                                <img src={GetCoins[props.secondaryCurrency].coinUrl} width="20" height="20" alt="" className="rounded-full" />
                                {GetCoins[props.secondaryCurrency].name}
                            </div>}
                        <div>

                        </div>
                    </div>}
                </div>
                <div className=" pt-3 sm:pt-0 flex items-start truncate text-base">
                    {AddressReducer(props.address)}
                </div>
                <div className="flex items-center gap-16  pl-[2px] self-start truncate">
                    <span className="w-12 text-base">{props.compensation}</span>
                    <span onClick={() => { setDetails(!details) }} className=" text-3xl flex items-center  cursor-pointer  font-bold"><span className=" text-primary pb-4">...</span>
                        {details && <div className="flex flex-col items-center bg-white absolute right-4 -bottom-6 w-[8rem]  rounded-lg shadow-xl z-50 ">
                            <div className="cursor-pointer  text-sm border-b border-greylish border-opacity-20 flex w-full px-10 py-1 gap-3" onClick={() => {
                                setModalEditVisible(true)
                                setModalVisible(false)
                            }}>
                                <img src={`/icons/${dark ? 'edit_white' : 'edit'}.png`} className="dark:invert dark:brightness-0 w-5 h-5" alt="" /> <span>Edit</span>
                            </div>
                            <div className="cursor-pointer  text-sm flex w-full px-10 py-1 gap-3" onClick={() => {
                                setDeleteModal(true)
                                setModalVisible(false)
                            }}>
                                <img src={`/icons/${dark ? 'trashicon_white' : 'trashicon'}.png`} className="dark:invert dark:brightness-0 w-5 h-5"  alt="" /> <span>Delete</span>
                            </div>
                        </div>}
                    </span>
                </div>
                {modalVisible && <Modal onDisable={setModalVisible}>
                    <Profile {...props} member={props} onDeleteModal={setDeleteModal} onCurrentModal={setModalVisible} onEditModal={setModalEditVisible} />
                </Modal>}
            </div>
        }
    </>
}

export default TeamItem;