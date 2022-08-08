import { ITasking } from "rpcHooks/useTasking"
import { IRemoxData } from "../remoxData"

// Add Task to RemoxData
export default {
    addRecurringTask: (state: IRemoxData, action: { payload: ITasking }) => {
        state.recurringTasks.push(action.payload)
    },

    removeRecurringTask: (state: IRemoxData, action: { payload: ITasking }) => {
        state.recurringTasks = state.recurringTasks.filter(task => task.taskId !== action.payload.taskId)
    }
}