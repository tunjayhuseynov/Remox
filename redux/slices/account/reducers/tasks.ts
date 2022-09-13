import { IAutomationTransfer, IFormattedTransaction } from "hooks/useTransactionProcess"
import { ITransactionMultisig } from "hooks/walletSDK/useMultisig"
import { IRemoxData, ITasking } from "../remoxData"


// Add Task to RemoxData
export default {
    addRecurringTask: (state: IRemoxData, action: { payload: IFormattedTransaction | ITransactionMultisig }) => {
        state.recurringTasks.push(action.payload)
    },

    removeRecurringTask: (state: IRemoxData, action: { payload: { streamId: string } }) => {
        state.recurringTasks = state.recurringTasks.filter(task => (task as IAutomationTransfer).streamId !== action.payload.streamId)
    }
}