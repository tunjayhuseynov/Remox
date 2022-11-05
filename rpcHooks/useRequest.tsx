import { FiatMoneyList } from 'firebaseConfig';
import { ITag } from 'pages/api/tags/index.api';

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
    label: ITag,
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

