import { FiatMoneyList } from 'firebaseConfig';

export interface IRequest {
    id: string;
    fullname: string;
    address: string;
    amount: string;
    currency: string;
    fiat: FiatMoneyList | null;
    secondAmount: string | null;
    secondCurrency: string | null;
    fiatSecond: FiatMoneyList | null;
    requestType: string;
    nameOfService: string;
    serviceDate: number;
    attachLink: string | null;
    uploadedLink: string | null;
    timestamp: number;
    status: RequestStatus;
}

export enum RequestStatus {
    pending = "Pending",
    approved = "Approved",
    rejected = "Rejected",
    finished = "Finished"
}

