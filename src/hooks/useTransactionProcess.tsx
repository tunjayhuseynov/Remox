import { useMemo } from 'react';
import { SelectTransactions } from '../redux/reducers/transactions';
import _ from 'lodash';
import { RootState } from '../redux/store';
import { useSelector } from 'react-redux';
import { SelectSelectedAccount } from '../redux/reducers/selectedAccount';
import { GetTransactions, Transactions } from '../types/sdk';
import { useContractKit } from '@celo-tools/use-contractkit';
import { hexToNumberString, fromWei } from 'web3-utils'
import { AltCoins, Coins } from 'types';


export const ERC20MethodIds = {
    transferFrom: "0x23b872dd",
    transfer: "0xa9059cbb",
    transferWithComment: "0xe1d6aceb",
    approve: "0x095ea7b3",
    batchRequest: "0xc23bfbf7",
    swap: "0x38ed1739"
}

export interface IFormattedTransaction {
    rawData: Transactions;
    method: string;
    hash: string,
    id: string;
}

export interface ITransfer extends IFormattedTransaction {
    to: string;
    amount: string;
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

    return useMemo(() => {
        if (transactions) {
            let result: Transactions[] = [...transactions.result]

            const FormattedTransaction: IFormattedTransaction[] = []

            const groupedHash = _(result).groupBy("hash").value();
            const uniqueHashs = Object.values(groupedHash).reduce((acc: Transactions[], value: Transactions[]) => {
                const best = _(value).maxBy((o) => parseFloat(fromWei(o.value, "ether")));
                console.log(best)
                if (best) acc.push(best)

                return acc;
            }, [])

            uniqueHashs.forEach((transaction: Transactions) => {
                const input = transaction.input;
                const formatted = InputReader(input);
                if (formatted?.id === ERC20MethodIds.swap) { console.log(formatted) }
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
    }, [transactions])
}


const InputReader = (input: string) => {
    if (input.startsWith(ERC20MethodIds.transferFrom)) {
        const len = ERC20MethodIds.transferFrom.length
        return {
            method: "transferFrom",
            id: ERC20MethodIds.transferFrom,
            from: input.slice(len, len + 64).substring(24),
            to: input.slice(len + 64 + 64, len + 64 + 64 + 64).substring(24),
            amount: hexToNumberString("0x" + input.slice(len + 64 + 64 + 64, len + 64 + 64 + 64 + 64)).toString(),
        }
    } else if (input.startsWith(ERC20MethodIds.transfer)) {
        const len = ERC20MethodIds.transfer.length
        return {
            method: "transfer",
            id: ERC20MethodIds.transfer,
            to: input.slice(len, len + 64).substring(24),
            amount: hexToNumberString("0x" + input.slice(len + 64, len + 64 + 64)).toString(),
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
            const from = splitted[index].slice(0, 64).substring(24);
            const to = splitted[index].slice(64, 128).substring(24);
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
            payments: coins
        }
    }
}

export default useTransactionProcess;