import { useState } from "react";
import Modal from "components/general/modal";
import Delete from './buttons/delete'
import { IMember } from "types/dashboard/contributors";
import useContributors from "hooks/useContributors";
import { useWalletKit } from "hooks";
import { AddressReducer } from "../../../../utils";
import { useAppSelector } from 'redux/hooks';
import { removeMemberFromContributor, SelectContributors, SelectAccounts } from "redux/slices/account/remoxData";
import { useModalSideExit } from "hooks";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { SelectDarkMode } from 'redux/slices/account/remoxData';
import makeBlockie from "ethereum-blockies-base64";
import { fiatList } from "components/general/PriceInputField";
import { NG } from "utils/jsxstyle";


interface PageProps {
    member: IMember,
}

const ContributorItem = ({ member }: PageProps) => {

    const { removeMember } = useContributors()
    const navigate = useRouter()
    const contirbutors = useAppSelector(SelectContributors)
    const accounts = useAppSelector(SelectAccounts)
    const teamName = contirbutors.find((team) => team.id === member.teamId)?.name


    const [deleteModal, setDeleteModal] = useState(false)
    const [details, setDetails] = useState(false)

    const { GetCoins, Address, SendTransaction } = useWalletKit()
    const dark = useAppSelector(SelectDarkMode)
    const dispatch = useDispatch();

    const coin1 = Object.values(GetCoins).find(w => w.symbol === member.currency)
    const coin2 = Object.values(GetCoins).find(w => w.symbol === member.secondCurrency)

    const fiatFirst = fiatList.find((fiat) => fiat.name === member.fiat)
    const fiatSecond = fiatList.find((fiat) => fiat.name === member.fiatSecond)

    const onDelete = async () => {
        try {
            const address = await Address
            const account = accounts.find((acc) => acc.address === address);
            if(member.execution === "Auto" && member.taskId){
                await SendTransaction(account!, [], {
                    cancelStreaming: true,
                    streamingIdDirect: member.taskId ?? undefined,
                  });
            }
            await removeMember(member.teamId, member.id)
            dispatch(removeMemberFromContributor({ id: member.teamId, member: member }))
        } catch (error) {
            throw error
        }
    }


    const [divRef, exceptRef] = useModalSideExit(details, setDetails, false)

    return <>
        {
            deleteModal && <Modal onDisable={setDeleteModal} animatedModal={false} disableX={true} className={'!pt-4'}>
                <Delete name={member.fullname} onDelete={onDelete} onCurrentModal={setDeleteModal} />
            </Modal>
        }
        <tr className="grid grid-cols-2  sm:grid-cols-[30%,30%,1fr] lg:grid-cols-[20%,13%,14%,15%,15%,16%,7%]  text-center items-center py-3 h-[6.1rem] bg-white shadow-15 dark:bg-darkSecond my-4 rounded-md border-opacity-10 hover:bg-greylish dark:hover:!bg-[#191919]   hover:bg-opacity-5 hover:transition-all text-sm relative">
            <td className="pl-3 items-start">
                <div className="flex !items-center space-x-1" >
                    <img src={member.image ? member.image.imageUrl : makeBlockie(member.address)} alt="" className="rounded-full border w-10 object-cover h-10 mr-2" />
                    <div className="text-sm">
                        {member.fullname}
                    </div>
                </div>
            </td>
            <td className="pl-[2px] flex items-start  text-sm">
                {teamName}
            </td>
            <td className="pl-[2px] flex items-start text-sm">
                {member.role}
            </td>
            <td className="flex flex-col justify-center text-sm space-y-4">
                <div className="flex items-center">
                  <div className="flex items-center mr-3">
                    {
                      member.fiat ? (
                        <div className="relative">
                          <img src={fiatFirst?.logo} alt="" className="rounded-xl w-6 h-6 relative" />
                          <img src={coin1?.logoURI} alt="" className="rounded-xl w-4 h-4 absolute right-[-6.3px] bottom-[-4.5px]" />
                        </div>
                        ) : <img src={coin1?.logoURI} className="rounded-xl w-6 h-6" alt="Currency Logo" />
                    }
                  </div>
                  <div className="flex items-center">
                    <NG number={+member.amount} />
                  </div>
                </div>
                {(member.secondAmount && member.secondCurrency) && <div className="flex items-center">
                  <div className="flex items-center mr-3">
                    {
                      member.fiatSecond ? (
                        <div className="relative">
                          <img src={fiatSecond?.logo} alt="" className="rounded-xl w-6 h-6 relative" />
                          <img src={coin2?.logoURI} alt="" className="rounded-xl w-4 h-4 absolute right-[-6.3px] bottom-[-4.5px]" />
                        </div>
                        ) : <img src={coin2?.logoURI} className="rounded-xl w-6 h-6" alt="Currency Logo" />
                    }
                  </div>
                  <div className="flex items-center">
                    <NG number={+member.secondAmount} />
                  </div>
                </div>}
            </td>
            <td className=" pt-3 sm:pt-0 flex items-start truncate text-sm">
                {AddressReducer(member.address)}
            </td>
            <td className="flex items-center truncate">
                <span className="w-12 text-sm">{member.compensation}</span>
            </td>
            <td>
                <span ref={exceptRef} onClick={() => { setDetails(!details) }} className=" text-3xl flex items-center  cursor-pointer  font-bold"><span className=" text-primary pb-4">...</span>
                    {details && <div ref={divRef} className="flex flex-col items-center bg-white dark:bg-darkSecond absolute right-8 -bottom-8 w-[8rem]  rounded-lg shadow-xl z-50 ">
                        <div className="cursor-pointer hover:bg-greylish hover:bg-opacity-5 hover:transition-all  text-sm border-b border-greylish border-opacity-20 flex w-full px-2 pr-6 py-2 gap-3" onClick={() => {
                            navigate.push(`/dashboard/contributors/edit-member?id=${member.id}&teamId=${member.teamId}&secondAnimation=true`)
                        }}>
                            <img src={`/icons/${dark ? 'edit_white' : 'edit'}.png`} className="dark:invert dark:brightness-0 w-5 h-5" alt="" /> <span>Edit</span>
                        </div>
                        <div className="cursor-pointer hover:bg-greylish hover:bg-opacity-5 hover:transition-all  text-sm flex w-full px-2 pr-6 py-2 gap-3" onClick={() => {
                            setDeleteModal(true)
                        }}>
                            <img src={`/icons/${dark ? 'trashicon_white' : 'trashicon'}.png`} className="dark:invert dark:brightness-0 w-5 h-5" alt="" /> <span>Delete</span>
                        </div>
                    </div>}
                </span>
            </td>
        </tr>
    </>
}

export default ContributorItem;