import { IOrganization } from "firebaseConfig";

export interface IOrganizationORM extends IOrganization{
    totalBalance: number;
}