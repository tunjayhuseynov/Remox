import { IMember, IuseContributor } from "rpcHooks/useContributors";
import { IRemoxData } from "../remoxData";

export default {
    addContributor: (state: IRemoxData, action: { payload: IuseContributor[] }) => {
        if (action.payload !== undefined) {
            state.contributors.contributors.push(...action.payload);
        }
    },
    addMemberToContributor: (state: IRemoxData, action: { payload: { id: string; member: IMember } }) => {
        if (action.payload !== undefined) {
            const contributor = state.contributors.contributors.find((contributor) => contributor.id === action.payload.id);
            if (contributor !== undefined) {
                contributor.members.push(action.payload.member);
            }
        }
    },
    removeMemberFromContributor: (state: IRemoxData, action: { payload: { id: string; member: IMember } }) => {
        if (action.payload !== undefined) {
            const contributor = state.contributors.contributors.find((contributor) => contributor.id === action.payload.id);
            if (contributor !== undefined) {
                contributor.members = contributor.members.filter((member) => member.id !== action.payload.member.id);
            }
        }
    },
    setContributors: (state: IRemoxData, action: { payload: { data: IuseContributor[]; secretKey?: string } }) => {
        if (action.payload.secretKey !== undefined) {
            const teams = action.payload.data.map((contributor) => ({
                ...contributor
            }));
            state.contributors.contributors = teams;
            if (!state.contributors.isFetched) {
                state.contributors.isFetched = true;
            }
        }
    },
    removeContributor: (state: IRemoxData, action: { payload: string }) => {
        if (action.payload !== undefined) {
            state.contributors.contributors = state.contributors.contributors.filter((contributor) => contributor.id !== action.payload);
        }
    }
}