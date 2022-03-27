import { useMemo } from 'react';
import { SelectTransactions } from '../redux/reducers/transactions';
import _ from 'lodash';
import { useSelector } from 'react-redux';
import { GetTransactions, Transactions } from '../types/sdk';
import { hexToNumberString, hexToUtf8 } from 'web3-utils'
import { AltCoins, Coins } from 'types';
import { Tag } from 'API/useTags';
import { selectTags } from 'redux/reducers/tags';
import { fromWei } from 'utils/ray';


export const ERC20MethodIds = {
    transferFrom: "0x23b872dd",
    transfer: "0xa9059cbb",
    transferWithComment: "0xe1d6aceb",
    approve: "0x095ea7b3",
    batchRequest: "0xc23bfbf7",
    swap: "0x38ed1739",
    automatedTransfer: "0x7f87a6f0",
    moolaBorrow: "0xa415bcad",
    moolaDeposit: "0xe8eda9df",
    moolaWithdraw: "0x69328dec",
    moolaRepay: "0x573ade81",
    noInput: "0x"
}

export interface IFormattedTransaction {
    rawData: Transactions;
    method: string;
    hash: string,
    id: string;
    tags?: Tag[]
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

const useTransactionProcess = (groupByDate = false): [IFormattedTransaction[], GetTransactions] | [] => {
    const transactions = useSelector(SelectTransactions);
    const tags = useSelector(selectTags);
    return useMemo(() => {
        if (transactions) {
            let result: Transactions[] = [...transactions.result]

            const FormattedTransaction: IFormattedTransaction[] = []

            const groupedHash = _(result).groupBy("hash").value();
            const uniqueHashs = Object.values(groupedHash).reduce((acc: Transactions[], value: Transactions[]) => {
                const best = _(value).maxBy((o) => parseFloat(fromWei(o.value)));
                if (best) acc.push(best)

                return acc;
            }, [])

            uniqueHashs.forEach((transaction: Transactions) => {
                const input = transaction.input;
                const formatted = InputReader(input, transaction, tags);

                if (formatted) {
                    FormattedTransaction.push({
                        rawData: transaction,
                        hash: transaction.hash,
                        ...formatted
                    })
                }
            })

            return [FormattedTransaction, transactions];
        };
        return []
    }, [transactions, tags])
}


export const InputReader = (input: string, transaction: Transactions, tags: Tag[]) => {
    const theTags = tags.filter(s => s.transactions.includes(transaction.hash.toLowerCase()))
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
    }
    else if (input.startsWith(ERC20MethodIds.automatedTransfer)) {
        const len = ERC20MethodIds.automatedTransfer.length

        return {
            method: "automatedTransfer",
            id: ERC20MethodIds.automatedTransfer,
            tags: theTags,
            taskId: "0x" + input.slice(len, len + 64)
        }
    }
    else if (input.startsWith(ERC20MethodIds.moolaBorrow)) {
        const len = ERC20MethodIds.moolaBorrow.length
        const coins: AltCoins[] = Object.values(Coins)
        return {
            method: "moolaBorrow",
            id: ERC20MethodIds.moolaBorrow,
            coin: coins.find(s => s.contractAddress.toLowerCase() === "0x" + input.slice(len, len + 64).substring(24).toLowerCase())!,
            amount: hexToNumberString("0x" + input.slice(len + 64, len + 64 + 64)).toString(),
            to: "0x" + input.slice(len + 64 + 64 + 64 + 64, len + 64 + 64 + 64 + 64 + 64).substring(24),
            tags: theTags,
        }
    }
    else if (input.startsWith(ERC20MethodIds.moolaDeposit)) {
        const len = ERC20MethodIds.moolaDeposit.length
        const coins: AltCoins[] = Object.values(Coins)
        return {
            method: "moolaDeposit",
            id: ERC20MethodIds.moolaDeposit,
            coin: coins.find(s => s.contractAddress.toLowerCase() === "0x" + input.slice(len, len + 64).substring(24).toLowerCase())!,
            amount: hexToNumberString("0x" + input.slice(len + 64, len + 64 + 64)).toString(),
            to: "0x" + input.slice(len + 64 + 64, len + 64 + 64 + 64).substring(24),
            tags: theTags,
        }
    }
    else if (input.startsWith(ERC20MethodIds.moolaWithdraw)) {
        const len = ERC20MethodIds.moolaWithdraw.length
        const coins: AltCoins[] = Object.values(Coins)
        return {
            method: "moolaWithdraw",
            id: ERC20MethodIds.moolaWithdraw,
            coin: coins.find(s => s.contractAddress.toLowerCase() === "0x" + input.slice(len, len + 64).substring(24).toLowerCase())!,
            amount: hexToNumberString("0x" + input.slice(len + 64, len + 64 + 64)).toString(),
            to: "0x" + input.slice(len + 64 + 64, len + 64 + 64 + 64).substring(24),
            tags: theTags,
        }
    }
    else if (input.startsWith(ERC20MethodIds.moolaRepay)) {
        const len = ERC20MethodIds.moolaRepay.length
        const coins: AltCoins[] = Object.values(Coins)
        return {
            method: "moolaWithdraw",
            id: ERC20MethodIds.moolaRepay,
            coin: coins.find(s => s.contractAddress.toLowerCase() === "0x" + input.slice(len, len + 64).substring(24).toLowerCase())!,
            amount: hexToNumberString("0x" + input.slice(len + 64, len + 64 + 64)).toString(),
            to: "0x" + input.slice(len + 64 + 64 + 64, len + 64 + 64 + 64 + 64).substring(24),
            tags: theTags,
        }
    }
}

export default useTransactionProcess;