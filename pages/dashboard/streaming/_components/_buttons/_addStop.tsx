import { ExecutionType, IMember } from "types/dashboard/contributors";
import { changeError, changeSuccess } from 'redux/slices/notificationSlice';
import Button from "components/button";
import { useAppDispatch, useAppSelector } from 'redux/hooks';
import useContributors from "hooks/useContributors";
import { selectStorage } from "redux/slices/account/storage";
import { ITransactionMultisig } from "hooks/walletSDK/useMultisig";
import { IAutomationTransfer, IFormattedTransaction } from "hooks/useTransactionProcess";
import { Dispatch, Fragment } from "react";
import TeamItem from "../_teamItem";
import { ToastRun } from "utils/toast";
import { SelectSelectedAccountAndBudget, updateMemberFromContributor } from "redux/slices/account/remoxData";
import useLoading from "hooks/useLoading";
import { useWalletKit } from "hooks";

interface IProps {
    onDisable: React.Dispatch<boolean>,
    reccuringState: [(ITransactionMultisig | IFormattedTransaction)[], Dispatch<(ITransactionMultisig | IFormattedTransaction)[]>],
    memberState: [IMember[], Dispatch<IMember[]>],
}
const AddStopModal = ({ onDisable, reccuringState, memberState }: IProps) => {

    const dispatch = useAppDispatch()

    const { editMember } = useContributors()
    const { SendTransaction } = useWalletKit()
    const accountAndBudget = useAppSelector(SelectSelectedAccountAndBudget)

    const cancel = async () => {
        try {
            if (!accountAndBudget.account) return ToastRun(<>Account is not selected</>, "error")
            for (const reccuring of reccuringState[0]) {
                console.log(reccuring)
                await SendTransaction(accountAndBudget.account, [], {
                    cancelStreaming: true,
                    streamingIdDirect: (reccuring as IAutomationTransfer).streamId,
                })
            }

            for (const member of memberState[0]) {
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

        onDisable(false)
    }

    const [isLoading, Cancel] = useLoading(cancel)

    return <>
        <div className="flex flex-col space-y-8 px-10">
            {reccuringState.length > 0 ? <>
                <div className="text-2xl font-semibold py-2 ">Cancel Payments</div>
                <div className="w-full shadow-custom px-5 pt-4 pb-6 rounded-xl bg-white dark:bg-darkSecond">
                    <table className="w-full">
                        <thead>
                            <tr className={`pl-5 grid grid-cols-[12.5%,repeat(5,minmax(0,1fr))] text-gray-500 dark:text-gray-300 text-sm font-normal bg-gray-100 dark:bg-darkSecond rounded-md`}>
                                <th className="font-normal py-3 text-left">Name</th>
                                <th className="font-normal py-3 text-left">Start Date</th>
                                <th className="font-normal py-3 text-left">End Date</th>
                                <th className="font-normal py-3 text-left">Amount</th>
                                <th className="font-normal py-3 text-left">Frequency</th>
                                <th className="font-normal py-3 text-left">Labels</th>
                            </tr>
                            {reccuringState && reccuringState[0].map(w => {
                                const hash = 'tx' in w ? w.tx.hash : w.hash;
                                return <Fragment key={hash}>
                                    <TeamItem tx={w} reccuringState={reccuringState} memberState={memberState} selectMode={false} members={[]} />
                                </Fragment>
                            }
                            )}
                        </thead>
                    </table>
                </div>
                <div>

                </div>
                <Button type="submit" onClick={Cancel} className="w-[25%] self-center py-3 text-lg !rounded-lg" isLoading={isLoading}>
                    Confirm and Cancel Payments
                </Button>
            </> : <div className="text-2xl font-semibold py-2 pb-8">No Team Member Yet</div>}
        </div>
    </>
}

export default AddStopModal