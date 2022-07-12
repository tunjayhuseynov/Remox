import { IMember, IContributor } from "rpcHooks/useContributors";
import { IRemoxData } from "../remoxData";

export default {
    addContributor: (state: IRemoxData, action: { payload: IContributor[] }) => {
        if (action.payload !== undefined) {
            state.contributors.push(...action.payload);
        }
    },
    addMemberToContributor: (state: IRemoxData, action: { payload: { id: string; member: IMember } }) => {
        if (action.payload !== undefined) {
            const contributor = state.contributors.find((contributor) => contributor.id === action.payload.id);
            if (contributor !== undefined) {
                contributor.members.push(action.payload.member);
            }
        }
    },
    removeMemberFromContributor: (state: IRemoxData, action: { payload: { id: string; member: IMember } }) => {
        if (action.payload !== undefined) {
            const contributor = state.contributors.find((contributor) => contributor.id === action.payload.id);
            if (contributor !== undefined) {
                contributor.members = contributor.members.filter((member) => member.id !== action.payload.member.id);
            }
        }
    },
    updateMemberFromContributor: (state: IRemoxData, action: { payload: { id: string; member: IMember } }) => {
        if (action.payload !== undefined) {
            const contributor = state.contributors.find((contributor) => contributor.id === action.payload.id);
            if (contributor !== undefined) {
                let selectedMemberIndex = contributor.members.findIndex((member) => member.id === action.payload.member.id);
                if (selectedMemberIndex !== -1) {
                   contributor.members[selectedMemberIndex] = action.payload.member; 
                }
            }
        }
    },
    setContributors: (state: IRemoxData, action: { payload: { data: IContributor[]; secretKey?: string } }) => {
        if (action.payload.secretKey !== undefined) {
            const teams = action.payload.data.map((contributor) => ({
                ...contributor
            }));
            state.contributors = teams;

        }
    },
    updateContributor: (state: IRemoxData, action: { payload: { name: string, id: string} }) => {
        if (action.payload !== undefined) {
            const contributorIndex = state.contributors.findIndex((contributor) => contributor.id === action.payload.id);
            if (contributorIndex !== -1) {
                state.contributors[contributorIndex].name = action.payload.name;
            }
        }
    }, 
    removeContributor: (state: IRemoxData, action: { payload: string }) => {
        if (action.payload !== undefined) {
            state.contributors = state.contributors.filter((contributor) => contributor.id !== action.payload);
        }
    }
}