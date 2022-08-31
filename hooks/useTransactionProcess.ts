import { useMemo } from 'react';
import { SelectParsedTransactions,  } from '../redux/slices/account/transactions';
import { useSelector } from 'react-redux';
import { Transactions } from '../types/sdk';
import { hexToNumberString, hexToUtf8 } from 'web3-utils'
import { AltCoins, Coins, CoinsName } from 'types';
import { selectTags } from 'redux/slices/tags';
import useWalletKit from './walletSDK/useWalletKit';
import Web3 from 'web3'
import { ITag } from 'pages/api/tags/index.api';
import { Blockchains, BlockchainType } from 'types/blockchains';
import InputDataDecoder from 'ethereum-input-data-decoder'
import { ethers } from 'ethers';



export const ERC20MethodIds = {
    transferFrom: "0x23b872dd",
    transfer: "0xa9059cbb",
    transferWithComment: "0xe1d6aceb",
    approve: "0x095ea7b3",
    batchRequest: "0xc23bfbf7",
    swap: "0x38ed1739",
    automatedTransfer: "0x7f87a6f0",
    borrow: "0xa415bcad",
    deposit: "0xe8eda9df",
    withdraw: "0x69328dec",
    repay: "0x573ade81",
    sablierStream: "0xff5733",
    noInput: "0x"
}

export interface IFormattedTransaction {
    rawData: Transactions;
    timestamp: number;
    method: string;
    hash: string,
    id: string;
    tags?: ITag[]
}

export interface ITransfer extends IFormattedTransaction { // aw, Moola Borrow
    to: string;
    amount: string;
    coin: AltCoins
}

export interface IAutomationTransfer extends IFormattedTransaction {
    taskId: string;
}

export interface ITransferComment extends ITransfer {
    comment: string;
}

export interface ITransferFrom extends ITransfer {
    from: string;
}

export interface ISwap extends IFormattedTransaction {
    amountIn: string,
    amountOutMin: string,
    coinIn: AltCoins,
    coinOutMin: AltCoins,
}

export interface IBatchRequest extends IFormattedTransaction {
    payments: {
        coinAddress: AltCoins,
        from: string,
        to: string,
        amount: string
    }[]
}

const useTransactionProcess = (): [IFormattedTransaction[]] | [] => {
    const transactions = useSelector(SelectParsedTransactions);
    const tags = useSelector(selectTags);
    const { GetCoins } = useWalletKit()
    return useMemo(() => {
        if (transactions && GetCoins) {
            const FormattedTransaction = transactions;
            return [FormattedTransaction];
        };
        return []
    }, [transactions, tags])
}

export const GenerateTransaction = (transaction: Partial<Transactions>): Transactions => ({
    blockHash: transaction.blockHash ?? "",
    blockNumber: transaction.blockNumber ?? "0",
    confirmations: transaction.confirmations ?? "0",
    contractAddress: transaction.contractAddress ?? "",
    cumulativeGasUsed: transaction.cumulativeGasUsed ?? '0',
    from: transaction.from ?? "",
    gas: transaction.gas ?? "0",
    gasPrice: transaction.gasPrice ?? "0",
    gasUsed: transaction.gasUsed ?? "0",
    hash: transaction.hash ?? "",
    input: transaction.input ?? "",
    logIndex: transaction.logIndex ?? "0",
    nonce: transaction.nonce ?? "0",
    to: transaction.to ?? "",
    timeStamp: transaction.timeStamp ?? "0",
    tokenDecimal: transaction.tokenDecimal ?? "0",
    tokenName: transaction.tokenName ?? "",
    tokenSymbol: transaction.tokenSymbol ?? CoinsName.CELO,
    transactionIndex: transaction.transactionIndex ?? "0",
    value: transaction.value ?? "0",
})

interface IReader { transaction: Transactions, tags: ITag[], Coins: Coins }
export const InputReader = (input: string, { transaction, tags, Coins }: IReader) => {
    const theTags = tags.filter(s => s.transactions.some(t => t.hash === transaction.hash));
    if (input === null || input === ERC20MethodIds.noInput) {
        return {
            method: "noInput",
            id: ERC20MethodIds.transferFrom,
            from: transaction.from,
            to: transaction.to,
            amount: transaction.value.toString(),
            coin: Coins[transaction.tokenSymbol as keyof Coins],
            tags: theTags
        }
    }
    else if (input.startsWith(ERC20MethodIds.transferFrom)) {
        const len = ERC20MethodIds.transferFrom.length
        return {
            method: "transferFrom",
            id: ERC20MethodIds.transferFrom,
            coin: Coins[transaction.tokenSymbol as keyof Coins],
            from: "0x" + input.slice(len, len + 64).substring(24),
            to: "0x" + input.slice(len + 64 + 64, len + 64 + 64 + 64).substring(24),
            amount: hexToNumberString("0x" + input.slice(len + 64 + 64 + 64, len + 64 + 64 + 64 + 64)).toString(),
            tags: theTags
        }
    } else if (input.startsWith(ERC20MethodIds.transfer)) {
        const len = ERC20MethodIds.transfer.length
        return {
            method: "transfer",
            id: ERC20MethodIds.transfer,
            coin: Coins[transaction.tokenSymbol as keyof Coins],
            to: "0x" + input.slice(len, len + 64).substring(24),
            amount: hexToNumberString("0x" + input.slice(len + 64, len + 64 + 64)).toString(),
            tags: theTags
        }
    } else if (input.startsWith(ERC20MethodIds.swap)) {
        const len = ERC20MethodIds.swap.length;
        const coins: AltCoins[] = Object.values(Coins)
        return {
            method: "swap",
            id: ERC20MethodIds.swap,
            amountIn: hexToNumberString("0x" + input.slice(len, len + 64)).toString(),
            amountOutMin: hexToNumberString("0x" + input.slice(len + 64, len + 64 + 64)).toString(),
            coinIn: coins.find(s => s.contractAddress.toLowerCase() === "0x" + input.slice(input.length - 64 - 64, input.length - 64).substring(24).toLowerCase())!,
            coinOutMin: coins.find(s => s.contractAddress.toLowerCase() === "0x" + input.slice(input.length - 64, input.length).substring(24).toLowerCase())!,
            tags: theTags
        }
    } else if (input.startsWith(ERC20MethodIds.batchRequest)) {
        const len = ERC20MethodIds.batchRequest.length;
        const splitted = input.split("23b872dd")
        const coins = [];

        let indexable = 0;
        for (let index = 0; index < splitted.length - 1; index++) {
            coins.push({ coinAddress: Object.values(Coins).find(s => s.contractAddress.toLowerCase() === "0x" + input.slice(330 + indexable, 330 + indexable + 64).substring(24).toLowerCase())! })
            indexable += 64;
        }
        for (let index = 1; index < splitted.length; index++) {
            const from = "0x" + splitted[index].slice(0, 64).substring(24);
            const to = "0x" + splitted[index].slice(64, 128).substring(24);
            const amount = hexToNumberString("0x" + splitted[index].slice(128, 192)).toString();
            coins[index - 1] = {
                ...coins[index - 1],
                from,
                to,
                amount
            };
        }
        return {
            method: "batchRequest",
            id: ERC20MethodIds.batchRequest,
            payments: coins,
            tags: theTags
        }
    } else if (input.startsWith(ERC20MethodIds.transferWithComment)) {
        const len = ERC20MethodIds.transferWithComment.length
        return {
            method: "transferWithComment",
            id: ERC20MethodIds.transferWithComment,
            to: "0x" + input.slice(len, len + 64).substring(24),
            coin: Coins[transaction.tokenSymbol as keyof Coins],
            amount: hexToNumberString("0x" + input.slice(len + 64, len + 64 + 64)).toString(),
            comment: hexToUtf8("0x" + input.slice(len + 64 + 64 + 64 + 64, len + 64 + 64 + 64 + 64 + 64)),
            tags: theTags
        }
    } else if (input.startsWith(ERC20MethodIds.automatedTransfer)) {
        const len = ERC20MethodIds.automatedTransfer.length
        return {
            method: "automatedTransfer",
            id: ERC20MethodIds.automatedTransfer,
            tags: theTags,
            taskId: "0x" + input.slice(len, len + 64)
        }
    } else if (input.startsWith(ERC20MethodIds.borrow)) {
        const len = ERC20MethodIds.borrow.length
        const coins: AltCoins[] = Object.values(Coins)
        return {
            method: "moolaBorrow",
            id: ERC20MethodIds.borrow,
            coin: coins.find(s => s.contractAddress.toLowerCase() === "0x" + input.slice(len, len + 64).substring(24).toLowerCase())!,
            amount: hexToNumberString("0x" + input.slice(len + 64, len + 64 + 64)).toString(),
            to: "0x" + input.slice(len + 64 + 64 + 64 + 64, len + 64 + 64 + 64 + 64 + 64).substring(24),
            tags: theTags,
        }
    } else if (input.startsWith(ERC20MethodIds.deposit)) {
        const len = ERC20MethodIds.deposit.length
        const coins: AltCoins[] = Object.values(Coins)
        return {
            method: "moolaDeposit",
            id: ERC20MethodIds.deposit,
            coin: coins.find(s => s.contractAddress.toLowerCase() === "0x" + input.slice(len, len + 64).substring(24).toLowerCase())!,
            amount: hexToNumberString("0x" + input.slice(len + 64, len + 64 + 64)).toString(),
            to: "0x" + input.slice(len + 64 + 64, len + 64 + 64 + 64).substring(24),
            tags: theTags,
        }
    } else if (input.startsWith(ERC20MethodIds.withdraw)) {
        const len = ERC20MethodIds.withdraw.length
        const coins: AltCoins[] = Object.values(Coins)
        return {
            method: "moolaWithdraw",
            id: ERC20MethodIds.withdraw,
            coin: coins.find(s => s.contractAddress.toLowerCase() === "0x" + input.slice(len, len + 64).substring(24).toLowerCase())!,
            amount: hexToNumberString("0x" + input.slice(len + 64, len + 64 + 64)).toString(),
            to: "0x" + input.slice(len + 64 + 64, len + 64 + 64 + 64).substring(24),
            tags: theTags,
        }
    } else if (input.startsWith(ERC20MethodIds.repay)) {
        const len = ERC20MethodIds.repay.length
        const coins: AltCoins[] = Object.values(Coins)
        return {
            method: "moolaWithdraw",
            id: ERC20MethodIds.repay,
            coin: coins.find(s => s.contractAddress.toLowerCase() === "0x" + input.slice(len, len + 64).substring(24).toLowerCase())!,
            amount: hexToNumberString("0x" + input.slice(len + 64, len + 64 + 64)).toString(),
            to: "0x" + input.slice(len + 64 + 64 + 64, len + 64 + 64 + 64 + 64).substring(24),
            tags: theTags,
        }
    }
}

export const EvmInputReader = async (input: string, blockchainName: string, { transaction, tags, Coins }: IReader) => {
    const blockchain = Blockchains.find(s => s.name === blockchainName)!;
    const theTags = tags.filter(s => s.transactions.some(t => t.hash === transaction.hash));
    
    if(blockchain.swapProtocols.find((swap) => swap.contractAddress === transaction.to)){
        const abi = blockchain.swapProtocols.find((swap) => swap.contractAddress === transaction.to)?.abi;
        const decoder = new InputDataDecoder(abi);
        const result = decoder.decodeData(input);
        const amountIn = hexToNumberString(result.inputs[1][4]._hex).toString();
        const amountOutMin = hexToNumberString(result.inputs[1][5]._hex).toString();
        
        return {
            method: "swap",
            id: ERC20MethodIds.swap,
            amountIn: amountIn,
            amountOutMin: amountOutMin,
            from: transaction.from,
            coinIn: result.inputs[1][0],
            coinOutMin: result.inputs[1][1],
            tags: theTags,
        }
    } else if(blockchain.lendingProtocols.find((lend) => lend.contractAddress.toLowerCase() === transaction.to.toLowerCase())){
        const abi = blockchain.lendingProtocols.find((lend) => lend.contractAddress.toLowerCase() === transaction.to.toLowerCase())?.abi;
        const decoder = new InputDataDecoder(abi);
        const result = decoder.decodeData(input);
        const amount = hexToNumberString(result.inputs[1]._hex).toString();

        
        if(result.method === "supply") {
            return {
                method: "supply",
                id: ERC20MethodIds.deposit,
                coin: "0x" + result.inputs[0],
                amount: amount,
                to: "0x" + result.inputs[2],
                tags: theTags,
            }
        } else if(result.method === "borrow"){
            return {
                method: "borrow",
                id: ERC20MethodIds.borrow,
                coin: "0x" + result.inputs[0],
                amount: amount,
                interestRateMode: hexToNumberString(result.inputs[2]._hex).toString(),
                referalCode: result.inputs[3],
                to: "0x" + result.inputs[4],
                tags: theTags,
            }
        } else if(result.method === "withdraw"){
            return {
                method: "withdraw",
                id: ERC20MethodIds.withdraw,
                coin: "0x" + result.inputs[0],
                amount: amount,
                to: "0x" + result.inputs[1],
            }
        } else if(result.method === "repay"){
            return {
                method: "repay",
                id: ERC20MethodIds.repay,
                coin: "0x" + result.inputs[0],
                amount: amount,
                to: "0x" + result.inputs[1],
                tags: theTags,
            }
        } 
    } 
    else if (blockchain.recurringPaymentProtocols.find((stream) => stream.contractAddress.toLowerCase() === transaction.to.toLowerCase())){
        const abi = blockchain.recurringPaymentProtocols.find((stream) => stream.contractAddress.toLowerCase() === transaction.to.toLowerCase())!.abi
        const decoder = new InputDataDecoder(abi);
        const result = decoder.decodeData(input);
        const provider = new ethers.providers.JsonRpcProvider(blockchain.rpcUrl);
        // const tx = await provider.getTransactionReceipt(transaction.hash);
        // const logs = (await tx).logs;
        // const log = logs.find((log) => log.address.toLowerCase() === transaction.to.toLowerCase());
        // const hexId = log!.topics[1];
        // const streamId = hexToNumberString(hexId);
        
        
        if(result.method === "createStream"){
            return {
                method: "createStream",
                id: ERC20MethodIds.sablierStream,
                recipient: "0x" + result.inputs[0],
                deposit: hexToNumberString(result.inputs[1]._hex).toString(),
                coin: result.inputs[2],
                startTime: hexToNumberString(result.inputs[3]._hex).toString(),
                stopTime: hexToNumberString(result.inputs[4]._hex).toString(),
                // streamId: streamId,
                tags: theTags,
            }
        } else if(result.method === "cancelStream"){
            return {
                method: "cancelStream",
                id: ERC20MethodIds.sablierStream,
                streamId: hexToNumberString(result.inputs[0]._hex).toString() ,
                tags: theTags,
            }
        }
    } 
    else {
        return {
            method: "unknown",
            address: transaction.to,
            id: "0x",
            tags: theTags,
        }
    }



    
    
}

export default useTransactionProcess;