import { useState } from "react";
import Modal from "components/general/modal";
import Profile from "pages/dashboard/contributors/_components/buttons/profile"
import Avatar from "../../../../components/avatar";
import Delete from './buttons/delete'
import { IMember } from "types/dashboard/contributors";
import useContributors from "hooks/useContributors";
import useTasking from "rpcHooks/useTasking";
import { useWalletKit } from "hooks";
import { AddressReducer } from "../../../../utils";
import { useAppSelector } from 'redux/hooks';
import { removeMemberFromContributor } from "redux/slices/account/remoxData";
import { useModalSideExit } from "hooks";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { SelectDarkMode } from 'redux/slices/account/remoxData';

const TeamItem = (props: IMember & { teamName: string, index: 'Active' | 'Full Time' | 'Part Time' | 'Bounty' | 'Team' }) => {

    const { removeMember } = useContributors()
    const navigate = useRouter()
    const member : IMember = {
        id: props.id,
        name: props.name,
        first: props.first,
        last: props.last,
        role: props.role,
        image: props.image,
        address: props.address,
        compensation: props.compensation,
        currency: props.currency,
        amount: props.amount,
        teamId: props.teamId,
        execution: props.execution,
        paymantDate: props.paymantDate,
        paymantEndDate: props.paymantEndDate,
        interval: props.interval,
        usdBase: props.usdBase,
        secondaryCurrency: props.secondaryCurrency,
        secondaryAmount: props.secondaryAmount,
        secondaryUsdBase: props.secondaryUsdBase,
        taskId: props.taskId,
    }
    
    const [modalVisible, setModalVisible] = useState(false)
    const [modalEditVisible, setModalEditVisible] = useState(false)
    const [deleteModal, setDeleteModal] = useState(false)
    const [details, setDetails] = useState(false)
    const { cancelTask } = useTasking()
    const { GetCoins } = useWalletKit()
    const dark = useAppSelector(SelectDarkMode)
    const dispatch = useDispatch();

    const coin1 = Object.values(GetCoins).find(w => w.name === props.currency)
    const coin2 = Object.values(GetCoins).find(w => w.name === props.secondaryCurrency)

    const onDelete = async () => {
        try {
            if (props.taskId) {
                await cancelTask(props.taskId as string)
            }
            await removeMember(props.teamId, props.id)
            dispatch(removeMemberFromContributor({ id: props.teamId, member: member }))
        } catch (error) {
            throw error
        }
    }



    const [divRef, exceptRef] = useModalSideExit(details, setDetails, false)

    return <>
        {
            deleteModal && <Modal onDisable={setDeleteModal} animatedModal={false} disableX={true} className={'!pt-4'}>
                <Delete name={props.name} onCurrentModal={setDeleteModal} />
            </Modal>
        }
        {props.index === 'Team' ? <div className="hover:bg-greylish hover:bg-opacity-5 hover:transition-all  grid grid-cols-2 sm:grid-cols-[30%,30%,1fr] lg:grid-cols-[17%,15%,19%,19%,17%,23%] text-center items-center py-6 border-b  border-greylish border-opacity-10 pb-5   text-sm relative">
            <div className="pl-[2px] items-start">
                <div className=" flex items-center space-x-1" >
                    {props.image !== null ? <img src={`/icons/profilePhoto/${props.image}`} alt="" className="rounded-full border w-10 object-cover h-10" /> : <Avatar name={props.first} surname={props.last} />}
                    <div className=" text-base text-left">
                        {props.name}
                    </div>
                </div>
            </div>
            <div className="pl-[2px] flex items-start  text-base">
                {props.teamName}
            </div>
            <div className="pl-[2px] flex items-start text-base">
                {props.role}
            </div>
            <div className="flex flex-col items-start space-y-4">
                <div className=" pl-[2px] flex items-center justify-start gap-1">
                    <div className=" text-base">{props.amount}</div>
                    {props.usdBase ? <div className="flex items-center gap-1">USD as <img src={coin1?.logoURI} width="20" height="20" alt="" className="rounded-full" /> {coin1?.name}</div> :
                        <div className="flex items-center gap-1">
                            <img src={coin1?.logoURI} width="20" height="20" alt="" className="rounded-full" />
                            {coin1?.name}
                        </div>}
                    <div>

                    </div>
                </div>
                {(props.secondaryCurrency && props.secondaryAmount) && <div className="pl-[2px] flex items-center justify-start gap-1">
                    <div className=" text-base">{props.secondaryAmount}</div>
                    {props.secondaryUsdBase ? <div className="flex items-center gap-1">USD as <img src={coin2?.logoURI} width="20" height="20" alt="" className="rounded-full" /> {coin2?.name}</div> :
                        <div className="flex items-center gap-1">
                            <img src={coin2?.logoURI} width="20" height="20" alt="" className="rounded-full" />
                            {coin2?.name}
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
                    {details && <div ref={divRef} className="flex flex-col items-center bg-white dark:bg-darkSecond absolute right-8 -bottom-8 w-[8rem]  rounded-lg shadow-xl z-50 ">
                        <div className="cursor-pointer hover:bg-greylish hover:bg-opacity-5 hover:transition-all  text-sm border-b border-greylish border-opacity-20 flex w-full px-2 pr-6 py-2 gap-3" onClick={() => {
                            navigate.push('/dashboard/contributors/edit-member?secondAnimation=true')
                            setModalVisible(false)
                        }}>
                            <img src={`/icons/${dark ? 'edit_white' : 'edit'}.png`} className="dark:invert dark:brightness-0 w-5 h-5" alt="" /> <span>Edit</span>
                        </div>
                        <div className="cursor-pointer hover:bg-greylish hover:bg-opacity-5 hover:transition-all  text-sm flex w-full px-2 pr-6 py-2 gap-3" onClick={() => {
                            setDeleteModal(true)
                            setModalVisible(false)
                        }}>
                            <img src={`/icons/${dark ? 'trashicon_white' : 'trashicon'}.png`} className="dark:invert dark:brightness-0 w-5 h-5" alt="" /> <span>Delete</span>
                        </div>
                    </div>}
                </span>
            </div>
            {modalVisible && <Modal onDisable={setModalVisible} animatedModal={false}>
                <Profile {...props} member={props} onDeleteModal={setDeleteModal} onCurrentModal={setModalVisible} onEditModal={setModalEditVisible} />
            </Modal>}
        </div>
            : props.index === props.compensation ? <div className="grid grid-cols-2  sm:grid-cols-[30%,30%,1fr] lg:grid-cols-[19%,13%,16%,18%,15%,29%] text-center items-center py-3 h-[6.1rem] bg-white shadow-15 dark:bg-darkSecond my-4 rounded-md border-opacity-10 hover:bg-greylish dark:hover:!bg-[#191919]   hover:bg-opacity-5 hover:transition-all    text-sm relative">
                <div className="pl-[2px] items-start">
                    <div className="hover:cursor-pointer flex items-center space-x-2 pl-3" onClick={() => setModalVisible(true)}>
                        {props.image !== null ? <img src={`/icons/profilePhoto/${props.image}`} alt="" className="rounded-full border w-12 object-cover h-12" /> : <Avatar name={props.first} surname={props.last} />}
                        <div className="text-lg font-medium">
                            {props.name}
                        </div>
                    </div>
                </div>
                <div className=" flex justify-start  text-lg font-medium">
                    {props.teamName}
                </div>
                <div className="pl-[2px] flex items-center justify-start text-lg font-medium  ">
                    {props.role}
                </div>
                <div className="flex flex-col items-start space-y-4">
                    <div className=" pl-[2px] flex items-center justify-center gap-2">
                        {props.usdBase ? <div className="flex items-center gap-1">USD as <img src={GetCoins[props.currency].coinUrl} width="20" height="20" alt="" className="rounded-full" /></div> :
                            <div className="flex items-center gap-2 text-lg font-medium">
                                <img src={GetCoins[props.currency].coinUrl} width="20" height="20" alt="" className="rounded-full" />

                            </div>}
                        <div className="text-lg font-medium flex justify-start">{props.amount}</div>

                        <div>

                        </div>
                    </div>
                    {props.secondaryCurrency && <div className="pl-[2px] flex items-center justify-center gap-2">
                        {props.secondaryUsdBase ? <div className="flex items-center gap-1">USD as <img src={GetCoins[props.currency].coinUrl} width="20" height="20" alt="" className="rounded-full" /></div> :
                            <div className="flex items-center justify-end gap-2 text-lg font-medium">
                                <img src={GetCoins[props.secondaryCurrency].coinUrl} width="20" height="20" alt="" className="rounded-full" />

                            </div>}
                        <div className="text-lg font-medium flex justify-start">{props.secondaryAmount}</div>
                        <div>
                        </div>
                    </div>}
                </div>
                <div className=" flex items-start justify-start  text-lg font-medium ">
                    {AddressReducer(props.address)}
                </div>
                <div className="flex items-center w-[60%] justify-between  truncate">
                    <span className=" text-lg font-medium">{props.compensation}</span>
                    <span ref={exceptRef} onClick={() => { setDetails(!details) }} className=" text-3xl flex items-center  cursor-pointer  font-bold"><span className=" text-primary pb-4">...</span>
                        {details && <div ref={divRef} className="flex flex-col items-center bg-white dark:bg-darkSecond absolute right-12 -bottom-5 w-[8rem]  rounded-lg shadow-xl z-50 ">
                            <div className="cursor-pointer hover:bg-greylish hover:bg-opacity-5 hover:transition-all  text-sm border-b border-greylish border-opacity-20 flex w-full px-2 pr-6 py-2 gap-3" onClick={() => {
                                navigate.push(`/dashboard/contributors/edit-member?id=${props.id}&teamId=${props.teamId}`)
                                setModalVisible(false)
                            }}>
                                <img src={`/icons/${dark ? 'edit_white' : 'edit'}.png`} className="dark:invert dark:brightness-0 w-5 h-5" alt="" /> <span>Edit</span>
                            </div>
                            <div className="cursor-pointer hover:bg-greylish hover:bg-opacity-5 hover:transition-all  text-sm border-b border-greylish border-opacity-20 flex w-full px-2 pr-6 py-2 gap-3" onClick={() => {
                                setDeleteModal(true)
                                setModalVisible(false)
                            }}>
                                <img src={`/icons/${dark ? 'trashicon_white' : 'trashicon'}.png`} className="dark:invert dark:brightness-0 w-5 h-5" alt="" /> <span>Delete</span>
                            </div>
                        </div>}
                    </span>
                </div>
                {modalVisible && <Modal onDisable={setModalVisible}>
                    <Profile {...props} member={props} onDeleteModal={setDeleteModal} onCurrentModal={setModalVisible} onEditModal={setModalEditVisible} />
                </Modal>}
            </div> : props.index === 'Active' && <div className="grid grid-cols-2  sm:grid-cols-[30%,30%,1fr] lg:grid-cols-[19%,13%,16%,18%,15%,29%] text-center items-center py-3 h-[6.1rem] bg-white shadow-15 dark:bg-darkSecond my-4 rounded-md border-opacity-10 hover:bg-greylish dark:hover:!bg-[#191919]   hover:bg-opacity-5 hover:transition-all text-sm relative">
                <div className="pl-[2px] items-start">
                    <div className="hover:cursor-pointer flex items-center space-x-2 pl-3" onClick={() => setModalVisible(true)}>
                        {props.image !== null ? <img src={`/icons/profilePhoto/${props.image}`} alt="" className="rounded-full border w-12 object-cover h-12" /> : <Avatar name={props.first} surname={props.last} />}
                        <div className="text-lg font-medium">
                            {props.name}
                        </div>
                    </div>
                </div>
                <div className="flex justify-start text-lg font-medium">
                    {props.teamName}
                </div>
                <div className="flex items-start justify-start text-lg font-medium ">
                    {props.role}
                </div>
                <div className="flex flex-col items-start space-y-3">
                    <div className=" flex items-center justify-start gap-2">
                        {props.usdBase ? <div className="flex items-center gap-1">USD as <img src={GetCoins[props.currency].coinUrl} width="20" height="20" alt="" className="rounded-full" /></div> :
                            <div className="flex items-center gap-2 text-lg font-medium">
                                <img src={GetCoins[props.currency].coinUrl} width="20" height="20" alt="" className="rounded-full" />

                            </div>}
                        <div className="text-lg font-medium flex justify-start">{props.amount}</div>

                        <div>

                        </div>
                    </div>
                    {props.secondaryCurrency && <div className=" flex items-center justify-start gap-2">
                        {props.secondaryUsdBase ? <div className="flex items-center gap-1">USD as <img src={GetCoins[props.currency].coinUrl} width="20" height="20" alt="" className="rounded-full" /></div> :
                            <div className="flex items-center justify-start gap-2 text-lg font-medium">
                                <img src={GetCoins[props.secondaryCurrency].coinUrl} width="20" height="20" alt="" className="rounded-full" />
                            </div>}
                        <div className="text-lg font-medium flex justify-start">{props.secondaryAmount}</div>

                        <div>

                        </div>
                    </div>}
                </div>
                <div className=" flex items-start justify-start  text-lg font-medium ">
                    {AddressReducer(props.address)}
                </div>
                <div className="flex items-center w-[60%] justify-between   truncate">
                    <span className=" text-lg font-medium">{props.compensation}</span>
                    <span ref={exceptRef} onClick={() => { setDetails(!details) }} className=" text-3xl flex items-center  cursor-pointer  font-bold"><span className=" text-primary pb-4">...</span>
                        {details && <div ref={divRef} className="flex flex-col items-center bg-white dark:bg-darkSecond absolute right-12 -bottom-5 w-[8rem]  rounded-lg shadow-xl z-50 ">
                            <div className="cursor-pointer hover:bg-greylish hover:bg-opacity-5 hover:transition-all  text-sm border-b border-greylish border-opacity-20 flex w-full px-2 pr-6 py-2 gap-3" onClick={() => {
                                navigate.push(`/dashboard/contributors/edit-member?id=${props.id}&teamId=${props.teamId}`)
                                setModalVisible(false)
                            }}>
                                <img src={`/icons/${dark ? 'edit_white' : 'edit'}.png`} className="dark:invert dark:brightness-0 w-5 h-5" alt="" /> <span>Edit</span>
                            </div>
                            <div className="cursor-pointer hover:bg-greylish hover:bg-opacity-5 hover:transition-all  text-sm border-b border-greylish border-opacity-20 flex w-full px-2 pr-6 py-2 gap-3" onClick={() => {
                                setDeleteModal(true)
                                setModalVisible(false)
                            }}>
                                <img src={`/icons/${dark ? 'trashicon_white' : 'trashicon'}.png`} className="dark:invert dark:brightness-0 w-5 h-5" alt="" /> <span>Delete</span>
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