import { CoinsName } from "types/coins"

export interface GetTransactions{
    message: string,
    result: Transactions[]
}

export interface Transactions{
    value: string,
    blockHash: string,
    blockNumber: string,
    confirmations: string,
    contractAddress: string,
    cumulativeGasUsed: string,
    from: string,
    gas: string,
    gasPrice: string,
    gasUsed: string,
    hash: string,
    input: string,
    logIndex: string,
    isError: string,
    nonce: string,
    timeStamp: string,
    to: string,
    tokenDecimal: string,
    tokenName: string,
    tokenSymbol: CoinsName,
    transactionIndex: string
}