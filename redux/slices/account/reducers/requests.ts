import { IRequest } from "rpcHooks/useRequest"
import { IRemoxData } from "../remoxData"

export default {
    addPendingRequest: (state: IRemoxData, action: { payload: IRequest }) => {
        state.requests.pendingRequests.push(action.payload)
    },
    removePendingRequest: (state: IRemoxData, action: { payload: string }) => {
        state.requests.pendingRequests = state.requests.pendingRequests.filter(request => request.id !== action.payload)
    },
    addApprovedRequest: (state: IRemoxData, action: { payload: IRequest }) => {
        state.requests.approvedRequests.push(action.payload)
    },
    removeApprovedRequest: (state: IRemoxData, action: { payload: string }) => {
        state.requests.approvedRequests = state.requests.approvedRequests.filter(request => request.id !== action.payload)
    },
    addRejectedRequest: (state: IRemoxData, action: { payload: IRequest }) => {
        state.requests.rejectedRequests.push(action.payload)
    },
    removeRejectedRequest: (state: IRemoxData, action: { payload: string }) => {
        state.requests.rejectedRequests = state.requests.rejectedRequests.filter(request => request.id !== action.payload)
    }
}