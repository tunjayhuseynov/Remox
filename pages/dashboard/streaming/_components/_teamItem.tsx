import dateFormat from "dateformat";
import { DateInterval, ExecutionType, IMember } from "types/dashboard/contributors";
import { AddressReducer } from "utils";
import { IAutomationCancel, IAutomationTransfer, IFormattedTransaction } from "hooks/useTransactionProcess";
import { ITransactionMultisig } from "hooks/walletSDK/useMultisig";
import { Avatar } from "@mui/material";
import useAsyncEffect from "hooks/useAsyncEffect";
import { useState } from 'react'
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { DecimalConverter } from "utils/api";
import { useContributors, useWalletKit } from "hooks";
import { ToastRun } from "utils/toast";
import { SelectAccounts, SelectProviderAddress, updateMemberFromContributor } from "redux/slices/account/remoxData";
import useLoading from "hooks/useLoading";
import { BiTrash } from "react-icons/bi";
import Button from "components/button";
import Modal from "components/general/modal";

interface IProps {
    tx: IFormattedTransaction | ITransactionMultisig,
    members: IMember[],
}

const TeamItem = ({ tx, members }: IProps) => {

    const task = tx as IAutomationCancel | IAutomationTransfer
    const providerAddress = useAppSelector(SelectProviderAddress)
    const { editMember } = useContributors()
    const { SendTransaction } = useWalletKit()
    const dispatch = useAppDispatch()
    const accounts = useAppSelector(SelectAccounts)

    const [deleteModal, setDeleteModal] = useState(false)
    const [member, setMember] = useState<IMember | null>(null)

    useAsyncEffect(async () => {
        const member = members.find(s => s.taskId?.toLowerCase() === task.hash.toLowerCase())
        if (member?.taskId) {
            setMember(member)
        }
    }, [])



    const cancel = async () => {
        try {
            const account = accounts.find(s => s.address.toLowerCase() === (tx as IAutomationCancel).address.toLowerCase())
            if (!account) return ToastRun(<>Account not found</>, "error")

            if (account.signerType === "single" && account.address.toLowerCase() !== providerAddress?.toLowerCase()) return ToastRun(<>Please, choose the wallet {account.address}</>, "warning")
            if (account.signerType === "multi" && !account.members.find(s => s.address.toLowerCase() === providerAddress?.toLowerCase())) return ToastRun(<>The wallet you've chosen is not an owner of the account {account.address}</>, "warning")

            await SendTransaction(account, [], {
                cancelStreaming: true,
                streamingIdDirect: (tx as IAutomationTransfer).streamId,
            })

            if (member) {
                await editMember(member.teamId, member.id, {
                    ...member,
                    taskId: null,
                    execution: ExecutionType.manual
                })

                dispatch(
                    updateMemberFromContributor({
                        id: member.teamId,
                        member: {
                            ...member,
                            taskId: null,
                            execution: ExecutionType.manual
                        },
                    })
                );
            }

            ToastRun(<>Automations has been successfully stopped</>)
        } catch (error) {
            console.error(error)
            ToastRun(<>Failed to stop automations</>, "error")
        }

    }

    const [isLoading, Cancel] = useLoading(cancel)


    return <>
        <tr className={`pl-5 grid grid-cols-[15%,repeat(6,minmax(0,1fr))] py-10 bg-white dark:bg-darkSecond my-5 rounded-md shadow-custom`}>
            <td className="hover:cursor-pointer flex items-center gap-2">
                <Avatar src={member?.image?.imageUrl} />
                <div className="flex flex-col gap-1">
                    <div className="font-semibold text-base">
                        {member?.fullname ?? AddressReducer(task.to)}
                    </div>
                    {member && <div className="text-greylish text-sm">{AddressReducer(task.to)}</div>}
                </div>
            </td>
            <td className="flex space-x-8 items-center">
                {task.startTime && <>
                    <div className="col-span-2 sm:col-span-1 pt-3 sm:pt-0 pl-[2px] truncate text-base font-semibold">
                        {dateFormat(new Date(task.startTime * 1e3), `dd mmm yyyy`)}
                    </div>
                    {new Date().getTime() > new Date(task.startTime * 1e3).getTime()}
                </>}
            </td>
            <td className="flex space-x-8 items-center">
                {task.endTime && <>
                    <div className="col-span-2 sm:col-span-1 pt-3 sm:pt-0 pl-[2px] truncate text-base font-semibold">
                        {dateFormat(new Date(task.endTime * 1e3), `dd mmm yyyy`)}
                    </div>
                    {new Date().getTime() > new Date(task.endTime * 1e3).getTime()}
                </>}
            </td>
            <td className={`flex space-y-4 `}>
                <div className={` flex gap-1 items-center justify-start`}>
                    <div>
                        <img src={task.coin.logoURI} width="15" height="15" alt="" className="rounded-full" />
                    </div>
                    <div className="font-semibold text-base">{member?.amount ?? DecimalConverter(task.amount, task.coin.decimals).toLocaleString()}</div>
                    {member?.fiat ?
                        <div>{member.fiat} as {member.currency}</div> :
                        <div className="text-base font-semibold">
                            {task.coin.symbol}
                        </div>}
                </div>
            </td>
            <td className="pl-[2px] hidden sm:flex items-center text-base ">
                {(member?.interval === DateInterval.monthly && "Monthly")}
                {(member?.interval === DateInterval.weekly && "Weekly")}
            </td>
            <td className="pl-[2px] hidden sm:flex items-center text-base">
                {tx.tags.map(s => <div key={s.id}><div className="w-5 h-5 flex space-x-5" style={{ backgroundColor: s.color }} /> {s.name}</div>)}
            </td>
            <td className="flex justify-center">
                <BiTrash className="cursor-pointer hover:text-red-500" onClick={() => setDeleteModal(true)} />
            </td>
        </tr>
        {deleteModal &&
            <Modal onDisable={setDeleteModal} animatedModal={false} disableX={true} className={'!pt-6'}>
                <div className="flex flex-col space-y-8 items-center px-5">
                    <div className="text-2xl text-primary">Are you sure?</div>
                    <div className="flex items-center justify-center text-xl">
                        Your are about to delete this streaming payment
                    </div>
                    <div className="flex justify-center items-center space-x-4">
                        <Button version="second" className="border-2  w-[7rem] h-[2.7rem] !px-1 !py-0" onClick={() => { setDeleteModal(false) }}>No</Button>
                        <Button className="w-[7rem] h-[2.7rem] !px-1 !py-0" onClick={Cancel} isLoading={isLoading}>Yes</Button>
                    </div>
                </div>
            </Modal>}
    </>
}

export default TeamItem;