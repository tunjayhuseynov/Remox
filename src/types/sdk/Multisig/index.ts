export interface AddOwner {
    ownerAddress: string;
    phrase: string;
    multisigAddress: string;
}

export interface AddOwnerResponse {
    message: string;
}

export interface ReplaceOwner extends AddOwner {
    newOwnerAddress: string;
}

export interface GetRequiredSignatures {
    address: string;
}

export interface GetRequiredSignaturesResponse {
    executinTransactions: number;
    changingMultiSigProperties: number;
}

export interface ChangeRequiremnt {
    requirement: string;
    multisigAddress: string;
    phrase: string;
}

export interface ChangeRequiremntResponse {
    message: string;
}

export interface SubmitTrasaction {
    multisigAddress: string;
    phrase: string;
    toAddress: string;
    value: string;
    tokenType: string;
}

export interface SubmitTrasactionResponse {
    message: string;
}


export interface RecTransaction {
    multisigAddress: string;
    phrase: string;
    transactionId: number;
}

export interface RecTransactionResponse {
    message: string;
}

export interface NonExecTransaction {
    address: string;
}

export interface NonExecTransactionResponse {
    transactionArray: NonExecTransactionItem[]
}

export interface NonExecTransactionItem {
    destination: string,
    data: string,
    executed: boolean,
    confirmations: string[],
    value: string,
    id?: number,
    requiredCount?: string,
    owner?: string,
    newOwner?: string,
    valueOfTransfer?: string,
    method?: string
}

export interface MultisigBalance{
    address: string;
}

export interface MultisigBalanceResponse{
    celo: string,
    cEUR: string,
    cUSD: string,
    UBE: string,
    MOO: string,
    MOBI: string,
    POOF: string,
    cREAL: string
}