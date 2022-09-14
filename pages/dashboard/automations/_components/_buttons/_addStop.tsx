import { ExecutionType, IMember } from "types/dashboard/contributors";
import { changeError, changeSuccess } from 'redux/slices/notificationSlice';
import Button from "components/button";
import { useAppDispatch, useAppSelector } from 'redux/hooks';
import useContributors from "hooks/useContributors";
import { selectStorage } from "redux/slices/account/storage";
import { ITransactionMultisig } from "hooks/walletSDK/useMultisig";
import { IFormattedTransaction } from "hooks/useTransactionProcess";
import { Dispatch, Fragment } from "react";
import TeamItem from "../_teamItem";
import { ToastRun } from "utils/toast";

interface IProps {
    onDisable: React.Dispatch<boolean>,
    reccuringState: [(ITransactionMultisig | IFormattedTransaction)[], Dispatch<(ITransactionMultisig | IFormattedTransaction)[]>],
    memberState: [IMember[], Dispatch<IMember[]>],
}
const AddStopModal = ({ onDisable, reccuringState, memberState }: IProps) => {

    const dispatch = useAppDispatch()

    const { removeMember, isLoading, editMember } = useContributors()

    const cancel = async () => {
        try {
            for (const member of memberState[0]) {


                await editMember(member.teamId, member.id, {
                    ...member,
                    taskId: null,
                    execution: ExecutionType.auto
                })
            }

            ToastRun(<>Automations has been successfully stopped</>)
        } catch (error) {
            console.error(error)
            ToastRun(<>Failed to stop automations</>, "error")
        }

        onDisable(false)
    }

    return <>
        <div className="flex flex-col space-y-8 px-10">
            {reccuringState.length > 0 ? <>
                <div className="text-2xl font-semibold py-2 ">Cancel Payments</div>
                <div className="w-full shadow-custom px-5 pt-4 pb-6 rounded-xl bg-white dark:bg-darkSecond">
                    <table>
                        <thead>
                            <tr className={`pl-5 grid grid-cols-[12.5%,repeat(5,minmax(0,1fr))] text-gray-500 dark:text-gray-300 text-sm font-normal bg-gray-100 dark:bg-darkSecond rounded-md`}>
                                <th className="font-normal py-3 ">Name</th>
                                <th className="font-normal py-3">Start Date</th>
                                <th className="font-normal py-3">End Date</th>
                                <th className="font-normal py-3 ">Amount</th>
                                <th className="font-normal py-3">Frequency</th>
                                <th className="font-normal py-3">Labels</th>
                            </tr>
                        </thead>
                        {reccuringState && reccuringState[0].map(w => {
                            const hash = 'tx' in w ? w.tx.hash : w.hash;
                            return <Fragment key={hash}>
                                <TeamItem tx={w} reccuringState={reccuringState} memberState={memberState} selectMode={false} members={[]} />
                            </Fragment>
                        }
                        )}
                    </table>
                </div>
                <div>

                </div>
                <Button type="submit" onClick={cancel} className="w-[85%] self-center py-3 text-2xl !rounded-lg" isLoading={isLoading}>
                    Confirm and Cancel Payment
                </Button>
            </> : <div className="text-2xl font-semibold py-2 pb-8">No Team Member Yet</div>}
        </div>
    </>
}

export default AddStopModal