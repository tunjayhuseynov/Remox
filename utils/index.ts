import { ERC20MethodIds, IFormattedTransaction } from "hooks/useTransactionProcess";
import { TransactionDirection, TransactionType } from "types";

export const AddressReducer = (address: string) => {
	return address.split('').reduce((a, c, i, arr) => {
		return i < 6 || arr.length - i < 5 ? a + c : a.split('.').length - 1 < 4 ? a + '.' : a;
	}, '');
};

export function ProgressBarWidth(num: number) {
    return {width: num + "%"}
  }

export const WordSplitter = (word: string) => {
	return word.split('').reduce((a, c) => {
		if (c === c.toUpperCase()) return a + ` ${c}`;
		return a + c;
	}, '');
};

export const GetTime = (date?: Date) => Math.round((date ?? new Date()).getTime() / 1000);
export const GetSignedMessage = (nonce: number) => "Your nonce for signing is " + nonce

export const TransactionDirectionDeclare = (transaction: IFormattedTransaction, accounts: string[]) => {
	let directionType;
	const direction = accounts.some(a => a.toLowerCase() === transaction.rawData.from.toLowerCase())
	switch (transaction.id) {
		case ERC20MethodIds.swap:
			directionType = TransactionDirection.Swap;
			break;
		case ERC20MethodIds.automatedTransfer:
			directionType = direction ? TransactionDirection.AutomationOut : TransactionDirection.AutomationIn;
			break;
		case ERC20MethodIds.batchRequest:
		case ERC20MethodIds.transferFrom:
		case ERC20MethodIds.noInput:
		case ERC20MethodIds.transferWithComment:
		case ERC20MethodIds.transfer:
			directionType = direction ? TransactionDirection.Out : TransactionDirection.In;
			break;
		case ERC20MethodIds.moolaBorrow:
			directionType = TransactionDirection.Borrow;
			break;
		case ERC20MethodIds.moolaDeposit:
			directionType = TransactionDirection.Deposit;
			break;
		case ERC20MethodIds.moolaRepay:
			directionType = TransactionDirection.Repay;
			break;
		case ERC20MethodIds.moolaWithdraw:
			directionType = TransactionDirection.Withdraw;
			break;
		default:
			break;
	}
	return directionType
};

export const TransactionTypeDeclare = (transaction: IFormattedTransaction, account: string) => {
	let directionType;
	const direction = transaction.rawData.from.toLowerCase() === account.toLowerCase()
	switch (transaction.id) {
		case ERC20MethodIds.swap:
			directionType = TransactionType.Swap;
			break;
		case ERC20MethodIds.automatedTransfer:
			directionType = TransactionType.AutomationPayout;
			break;
		case ERC20MethodIds.batchRequest:
			directionType = TransactionType.MassPayment
			break;
		case ERC20MethodIds.transferFrom:
		case ERC20MethodIds.noInput:
		case ERC20MethodIds.transferWithComment:
		case ERC20MethodIds.transfer:
			directionType = direction ? TransactionType.QuickTransfer : TransactionType.IncomingPayment;
			break;
		case ERC20MethodIds.moolaBorrow:
			directionType = TransactionType.Borrow;
			break;
		case ERC20MethodIds.moolaDeposit:
			directionType = TransactionType.Deposit
			break;
		case ERC20MethodIds.moolaRepay:
			directionType = TransactionType.Repay;
			break;
		case ERC20MethodIds.moolaWithdraw:
			directionType = TransactionType.Withdraw;
			break;
		default:
			directionType = TransactionType.Unknown;
			break;
	}
	return directionType
};
