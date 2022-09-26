import dateFormat from "dateformat";
import { DateInterval, IMember } from "types/dashboard/contributors";
import { AddressReducer } from "utils";
import { IAutomationCancel, IAutomationTransfer, IFormattedTransaction } from "hooks/useTransactionProcess";
import { ITransactionMultisig } from "hooks/walletSDK/useMultisig";
import { Avatar } from "@mui/material";
import useAsyncEffect from "hooks/useAsyncEffect";
import { Dispatch, useState } from 'react'
import { useAppSelector } from "redux/hooks";
import { SelectBlockchain } from "redux/slices/account/selector";
import Web3 from "web3";
import { hexToNumberString } from "web3-utils";
import { DecimalConverter } from "utils/api";

interface IProps {
    tx: IFormattedTransaction | ITransactionMultisig,
    members: IMember[],
    selectMode: boolean,
    reccuringState: [(IProps['tx'])[], Dispatch<(IProps['tx'])[]>],
    memberState: [IMember[], Dispatch<IMember[]>],
}

const TeamItem = ({ tx, members, selectMode, reccuringState, memberState }: IProps) => {

    const task = tx as IAutomationCancel | IAutomationTransfer
    const blockchain = useAppSelector(SelectBlockchain)

    const [streamId, setStreamId] = useState<string | null>(null)
    const [member, setMember] = useState<IMember | null>(null)

    useAsyncEffect(async () => {
        const member = members.find(s => s.taskId?.toLowerCase() === task.hash.toLowerCase())
        if (blockchain.name !== "solana" && member?.taskId) {
            const web3 = new Web3(blockchain.rpcUrl);
            setStreamId(hexToNumberString((await web3.eth.getTransactionReceipt(member.taskId)).logs[1].topics[1]))
            setMember(member)
        }
    }, [])
    const someFn = (s: IProps['tx']) => 'tx' in s ? (s.tx.address?.toLowerCase() === task.address.toLowerCase() && s.tx.hash?.toLowerCase() === task.hash.toLowerCase()) :
        (s.address?.toLowerCase() === task.address.toLowerCase() && s.hash?.toLowerCase() === task.hash.toLowerCase())

    const filterFn = (s: IProps['tx']) => 'tx' in s ? (s.tx.address?.toLowerCase() !== task.address.toLowerCase() && s.tx.hash?.toLowerCase() !== task.hash.toLowerCase()) :
        (s.address?.toLowerCase() !== task.address.toLowerCase() && s.hash?.toLowerCase() !== task.hash.toLowerCase())

    return <>
        <tr className={`pl-5 grid ${selectMode ? "grid-cols-[5%,12.5%,repeat(5,minmax(0,1fr))]" : "grid-cols-[12.5%,repeat(5,minmax(0,1fr))]"} py-10 bg-white dark:bg-darkSecond my-5 rounded-md shadow-custom`}>
            {selectMode && <td className="flex space-x-3 items-center">
                <input type="checkbox" checked={reccuringState[0].some(someFn)} className="relative cursor-pointer max-w-[1.25rem] max-h-[1.25rem] checked:before:absolute checked:before:w-full checked:before:h-full checked:before:bg-primary checked:before:block" onChange={(e) => {
                    const members = [...reccuringState[0]]
                    if (e.target.checked) {
                        if (!members.some(someFn)) {
                            members.push(tx)
                            if (member) {
                                memberState[1]([...memberState[0], member])
                            }
                            reccuringState[1](members)
                        }
                    } else {
                        reccuringState[1](members.filter(filterFn))
                        if (member) {
                            memberState[1](memberState[0].filter(s => s.id === member.id))
                        }
                    }
                }
                } />
            </td>}
            <td className="hover:cursor-pointer flex items-center gap-2">
                <Avatar src={member?.image?.imageUrl} />
                <div className="flex flex-col gap-1">
                    <div className="font-semibold text-base">
                        {member?.name ?? AddressReducer(task.to)}
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
                    {member?.usdBase ?
                        <div>USD as {member.amount}</div> :
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
        </tr>
    </>
}

export default TeamItem;