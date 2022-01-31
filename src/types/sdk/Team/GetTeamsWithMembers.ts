import { Member } from "../TeamMember/getMember";

export interface GetTeamsWithMembers {
    take?: number;
    skip?: number;
    sortBy?: string;
}

export interface GetTeamsWithMembersResponse {
    teams: TeamInfoWithMembers[];
    total: number
}

export interface TeamInfoWithMembers {
    id: string,
    title: string,
    members?: Member[],
    teamMembersCount: number,
}