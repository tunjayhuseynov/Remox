export interface GnosisDataDecoded {
    method: string;
    parameters: {
        name: string;
        type: string;
        value: string;
        valueDecoded: {
            operation: number;
            to: string;
            value: string;
            data: string;
        }[]
    }[]
}

export interface GnosisConfirmation {
    owner: string;
    submissionDate: number;
    transactionHash: string | null;
    signature: string;
    signatureType: string
}


export interface GnosisTransaction {
    safe: string,
    to: string,
    value: string,
    data: string | null,
    operation: number | null,
    gasToken: string,
    safeTxGas: number,
    baseGas: number,
    gasPrice: string,
    refundReceiver: string,
    nonce: number,
    executionDate: string | null,
    submissionDate: string ,
    modified: string | null,
    blockNumber: number | null,
    transactionHash: string | null,
    safeTxHash: string,
    executor: string | null,
    isExecuted: boolean,
    isSuccessful: boolean | null,
    ethGasPrice: string | null,
    maxFeePerGas: string | null,
    maxPriorityFeePerGas: string | null,
    gasUsed: number | null,
    fee: string | null,
    origin: string | null,
    dataDecoded: GnosisDataDecoded | null,
    confirmationsRequired: number | null,
    confirmations: GnosisConfirmation[],
    trusted: boolean,
    signatures: string,
    txType: string
}
