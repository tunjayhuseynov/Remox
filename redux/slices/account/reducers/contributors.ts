import { IMember, IContributor } from "types/dashboard/contributors";
import { IRemoxData } from "../remoxData";

export default {
    addContributor: (state: IRemoxData, action: { payload: IContributor[] }) => {
        if (action.payload !== undefined) {
            state.contributors.push(...action.payload);
        }
    },
    addMemberToContributor: (state: IRemoxData, action: { payload: { id: string; member: IMember } }) => {
        if (action.payload !== undefined) {
            const contributorIndex = state.contributors.findIndex((contributor) => contributor.id === action.payload.id);
            if (contributorIndex !== -1) {
                state.contributors[contributorIndex].members = [...state.contributors[contributorIndex].members, action.payload.member];
            }
        }
    },
    removeMemberFromContributor: (state: IRemoxData, action: { payload: { id: string; member: IMember } }) => {
        if (action.payload !== undefined) {
            const contributorIndex = state.contributors.findIndex((contributor) => contributor.id === action.payload.id);
            if (contributorIndex !== -1) {
                state.contributors[contributorIndex].members = state.contributors[contributorIndex].members.filter((member) => member.id !== action.payload.member.id);
            }
        }
    },
    updateMemberFromContributor: (state: IRemoxData, action: { payload: { id: string; member: IMember } }) => {
        if (action.payload !== undefined) {
            const contributorIndex = state.contributors.findIndex((contributor) => contributor.id === action.payload.id);
            if(contributorIndex !== -1){
                const memberIndex = state.contributors[contributorIndex].members.findIndex((member) => member.id === action.payload.member.id);
                if(memberIndex !== -1){
                    if(action.payload.id === action.payload.member.teamId){
                        state.contributors[contributorIndex].members[memberIndex] = action.payload.member;
                    } else {
                        const newTeamIndex = state.contributors.findIndex((contributor) => contributor.id === action.payload.member.teamId);
                        state.contributors[contributorIndex].members = state.contributors[contributorIndex].members.filter((member) => member.id !== action.payload.member.id);
                        if(newTeamIndex !== -1){
                            state.contributors[newTeamIndex].members = [...state.contributors[newTeamIndex].members, action.payload.member];
                        }
                    }
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