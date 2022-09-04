import { ERC20MethodIds, IFormattedTransaction } from "hooks/useTransactionProcess";
import { IMultisigSafeTransaction, ITransactionMultisig } from "hooks/walletSDK/useMultisig";
import { TransactionDirection, TransactionType } from "types";

export const AddressReducer = (address: string) => {
	return address.split('').reduce((a, c, i, arr) => {
		return i < 6 || arr.length - i < 5 ? a + c : a.split('.').length - 1 < 4 ? a + '.' : a;
	}, '');
};

export const ProgressBarWidth = (num: number) => ({ width: num + "%" })

export const SetComma = (num: number | undefined) => (Number(num).toLocaleString())

export const WordSplitter = (word: string) => {
	return word.split('').reduce((a, c) => {
		if (c === c.toUpperCase()) return a + ` ${c}`;
		return a + c;
	}, '');
};

export const GetTime = (date?: Date) => Math.round((date ?? new Date()).getTime() / 1000);
export const GetSignedMessage = (nonce: number) => "Your nonce for signing is " + nonce

export const TransactionDirectionDeclare = (transaction: IFormattedTransaction | ITransactionMultisig | IMultisigSafeTransaction, accounts: string[]) => {
	let directionType;
	const direction = accounts.some(a => a.toLowerCase() === (transaction as IFormattedTransaction)['hash'] ?
		(transaction as IFormattedTransaction).rawData.from.toLowerCase() : (transaction as ITransactionMultisig).owner?.toLowerCase());

	switch ((transaction as IFormattedTransaction)['rawData'] ? (transaction as IFormattedTransaction).id : (transaction as ITransactionMultisig | IMultisigSafeTransaction).type) {
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
		case ERC20MethodIds.borrow:
			directionType = TransactionDirection.Borrow;
			break;
		case ERC20MethodIds.deposit:
			directionType = TransactionDirection.Deposit;
			break;
		case ERC20MethodIds.repay:
			directionType = TransactionDirection.Repay;
			break;
		case ERC20MethodIds.withdraw:
			directionType = TransactionDirection.Withdraw;
			break;
		default:
			break;
	}
	return directionType
};

export const TransactionTypeDeclare = (transaction: IFormattedTransaction, account: string[]) => {
	let directionType;
	const direction = account.includes(transaction.rawData.from.toLowerCase())
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
		case ERC20MethodIds.borrow:
			directionType = TransactionType.Borrow;
			break;
		case ERC20MethodIds.deposit:
			directionType = TransactionType.Deposit
			break;
		case ERC20MethodIds.repay:
			directionType = TransactionType.Repay;
			break;
		case ERC20MethodIds.withdraw:
			directionType = TransactionType.Withdraw;
			break;
		default:
			directionType = TransactionType.Unknown;
			break;
	}
	return directionType
};
