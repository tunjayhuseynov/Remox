import { IRequest, RequestStatus } from "rpcHooks/useRequest"
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
    },
    setRequest: (state: IRemoxData, action: { payload: IRequest[] }) => {
        state.requests = {
            pendingRequests: action.payload.filter(request => request.status === RequestStatus.pending),
            approvedRequests: action.payload.filter(request => request.status === RequestStatus.approved),
            rejectedRequests: action.payload.filter(request => request.status === RequestStatus.rejected),
        };
    }
}