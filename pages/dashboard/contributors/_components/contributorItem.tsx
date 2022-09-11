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

interface PageProps {
    member: IMember,
    teamName: string,
}

const ContributorItem = ({member, teamName} : PageProps) => {

    const { removeMember } = useContributors()
    const navigate = useRouter()

    
    const [modalVisible, setModalVisible] = useState(false)
    const [modalEditVisible, setModalEditVisible] = useState(false)
    const [deleteModal, setDeleteModal] = useState(false)
    const [details, setDetails] = useState(false)
    const { cancelTask } = useTasking()
    const { GetCoins } = useWalletKit()
    const dark = useAppSelector(SelectDarkMode)
    const dispatch = useDispatch();

    const coin1 = Object.values(GetCoins).find(w => w.name === member.currency)
    const coin2 = Object.values(GetCoins).find(w => w.name === member.secondaryCurrency)

    // const onDelete = async () => {
    //     try {
    //         if (props.taskId) {
    //             await cancelTask(props.taskId as string)
    //         }
    //         await removeMember(props.teamId, props.id)
    //         dispatch(removeMemberFromContributor({ id: props.teamId, member: member }))
    //     } catch (error) {
    //         throw error
    //     }
    // }



    const [divRef, exceptRef] = useModalSideExit(details, setDetails, false)

    return <>
        {
            deleteModal && <Modal onDisable={setDeleteModal} animatedModal={false} disableX={true} className={'!pt-4'}>
                <Delete name={member.name} onCurrentModal={setDeleteModal} />
            </Modal>
        }
        <div className="hover:bg-greylish hover:bg-opacity-5 hover:transition-all  grid grid-cols-2 sm:grid-cols-[30%,30%,1fr] lg:grid-cols-[17%,15%,19%,19%,17%,23%] text-center items-center py-6 border-b  border-greylish border-opacity-10 pb-5   text-sm relative">
            <div className="pl-[2px] items-start">
                <div className=" flex items-center space-x-1" >
                    {member.image !== null ? <img src={`/icons/profilePhoto/${member.image}`} alt="" className="rounded-full border w-10 object-cover h-10" /> : <Avatar name={member.first} surname={member.last} />}
                    <div className=" text-base text-left">
                        {member.name}
                    </div>
                </div>
            </div>
            <div className="pl-[2px] flex items-start  text-base">
                {teamName}
            </div>
            <div className="pl-[2px] flex items-start text-base">
                {member.role}
            </div>
            <div className="flex flex-col items-start space-y-4">
                <div className=" pl-[2px] flex items-center justify-start gap-1">
                    <div className=" text-base">{member.amount}</div>
                    {member.usdBase ? <div className="flex items-center gap-1">USD as <img src={coin1?.logoURI} width="20" height="20" alt="" className="rounded-full" /> {coin1?.name}</div> :
                        <div className="flex items-center gap-1">
                            <img src={coin1?.logoURI} width="20" height="20" alt="" className="rounded-full" />
                            {coin1?.name}
                        </div>}
                    <div>

                    </div>
                </div>
                {(member.secondaryCurrency && member.secondaryAmount) && <div className="pl-[2px] flex items-center justify-start gap-1">
                    <div className=" text-base">{member.secondaryAmount}</div>
                    {member.secondaryUsdBase ? <div className="flex items-center gap-1">USD as <img src={coin2?.logoURI} width="20" height="20" alt="" className="rounded-full" /> {coin2?.name}</div> :
                        <div className="flex items-center gap-1">
                            <img src={coin2?.logoURI} width="20" height="20" alt="" className="rounded-full" />
                            {coin2?.name}
                        </div>}
                    <div>
                    </div>
                </div>}
            </div>
            <div className=" pt-3 sm:pt-0 flex items-start truncate text-base">
                {AddressReducer(member.address)}
            </div>
            <div className="flex items-center gap-16  pl-[2px] self-start truncate">
                <span className="w-12 text-base">{member.compensation}</span>
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
            {/* {modalVisible && <Modal onDisable={setModalVisible} animatedModal={false}>
                <Profile {...props} member={member} onDeleteModal={setDeleteModal} onCurrentModal={setModalVisible} onEditModal={setModalEditVisible} />
            </Modal>} */}
        </div>
    </>
}

export default ContributorItem;