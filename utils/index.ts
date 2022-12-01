import { ERCMethodIds, GenerateTransaction, IBatchRequest, IFormattedTransaction } from "hooks/useTransactionProcess";
import { IMultisigSafeTransaction, ITransactionMultisig } from "hooks/walletSDK/useMultisig";
import { TransactionDirection, TransactionType } from "types";
import { BlockchainType, MultisigProviders } from "types/blockchains";

export const REMOX_LOGO = '/icons/companies/remox.png'

export const AddressReducer = (address: string) => {

	return address.split('').reduce((a, c, i, arr) => {
		return i < 6 || arr.length - i < 5 ? a + c : a.split('.').length - 1 < 4 ? a + '.' : a;
	}, '');

};

export const ProgressBarWidth = (num: number) => ({ width: num + "%" })

export const SetComma = (num: number) => (Number(num))

export const WordSplitter = (word: string) => {
	return word.split('').reduce((a, c) => {
		if (c === c.toUpperCase()) return a + ` ${c}`;
		return a + c;
	}, '');
};

export const GetTime = (date?: Date) => Math.round((date ?? new Date()).getTime() / 1000);
export const GetSignedMessage = (nonce: number) => "Your nonce for signing is " + nonce

export const TransactionDirectionDeclare = (transaction: IFormattedTransaction | ITransactionMultisig, accounts: string[]) => {
	let directionType;
	const address = ((transaction as IFormattedTransaction)['hash'] ?
		(transaction as IFormattedTransaction).rawData.from.toLowerCase() : (transaction as ITransactionMultisig).contractAddress?.toLowerCase());

	const direction = accounts.some(a => a.toLowerCase() === address);

	const tx = (transaction as IFormattedTransaction)['rawData'] ? (transaction as IFormattedTransaction) : ((transaction as ITransactionMultisig).tx)

	switch (tx.method) {
		case ERCMethodIds.swap:
			directionType = TransactionDirection.Swap;
			break;
		case ERCMethodIds.automatedTransfer:
		case ERCMethodIds.automatedBatchRequest:
			directionType = direction ? TransactionDirection.AutomationOut : TransactionDirection.AutomationIn;
			break;
		case ERCMethodIds.automatedCanceled:
			directionType = TransactionDirection.AutomationCancel;
			break;

		case ERCMethodIds.batchRequest:
			if ((tx as IBatchRequest).payments.length === 1) {
				const formatted: IFormattedTransaction = {
					id: (tx as IBatchRequest).payments[0].method,
					method: (tx as IBatchRequest).payments[0].method,
					hash: "hash",
					blockchain: tx.blockchain ?? "celo",
					address: address,
					isError: (transaction as IFormattedTransaction).isError,
					rawData: GenerateTransaction({ blockHash: "", from: address }),
					timestamp: transaction.timestamp,
					tags: transaction.tags,
					budget: transaction.budget ?? undefined,
				}
				directionType = TransactionDirectionDeclare(formatted, accounts) as number;
			} else {
				directionType = direction ? TransactionDirection.Out : TransactionDirection.In;
			}
			break;
		case ERCMethodIds.transferFrom:
		case ERCMethodIds.noInput:
		case ERCMethodIds.transferWithComment:
		case ERCMethodIds.transfer:
			directionType = direction ? TransactionDirection.Out : TransactionDirection.In;
			break;
		case ERCMethodIds.borrow:
			directionType = TransactionDirection.Borrow;
			break;
		case ERCMethodIds.deposit:
			directionType = TransactionDirection.Deposit;
			break;
		case ERCMethodIds.repay:
			directionType = TransactionDirection.Repay;
			break;
		case ERCMethodIds.withdraw:
			directionType = TransactionDirection.Withdraw;
			break;
		case ERCMethodIds.reward:
			directionType = TransactionDirection.Reward;
			break;
		case ERCMethodIds.addOwner:
			directionType = TransactionDirection.AddOwner;
			break;
		case ERCMethodIds.removeOwner:
			directionType = TransactionDirection.RemoveOwner;
			break;
		case ERCMethodIds.changeInternalThreshold:
			directionType = TransactionDirection.changeInternalRequirement;
			break;
		case ERCMethodIds.changeThreshold:
			directionType = TransactionDirection.ChangeRequirement;
			break;
		case ERCMethodIds.unknown:
			directionType = TransactionDirection.Unknown;
			break;
		default:
			directionType = TransactionDirection.Out;
			break;
	}
	return directionType
};

export const TransactionTypeDeclare = (transaction: IFormattedTransaction, account: string[]) => {
	let directionType;
	const direction = account.includes(transaction.rawData.from.toLowerCase())
	switch (transaction.id) {
		case ERCMethodIds.swap:
			directionType = TransactionType.Swap;
			break;
		case ERCMethodIds.automatedTransfer:
		case ERCMethodIds.automatedBatchRequest:
			directionType = TransactionType.AutomationPayout;
			break;
		case ERCMethodIds.automatedCanceled:
			directionType = TransactionType.AutomationCaceled;
			break;
		case ERCMethodIds.batchRequest:
			directionType = TransactionType.MassPayment
			break;
		case ERCMethodIds.transferFrom:
		case ERCMethodIds.noInput:
		case ERCMethodIds.transferWithComment:
		case ERCMethodIds.transfer:
			directionType = direction ? TransactionType.QuickTransfer : TransactionType.IncomingPayment;
			break;
		case ERCMethodIds.borrow:
			directionType = TransactionType.Borrow;
			break;
		case ERCMethodIds.deposit:
			directionType = TransactionType.Deposit
			break;
		case ERCMethodIds.repay:
			directionType = TransactionType.Repay;
			break;
		case ERCMethodIds.withdraw:
			directionType = TransactionType.Withdraw;
			break;
		case ERCMethodIds.reward:
			directionType = TransactionType.Reward;
			break;
		case ERCMethodIds.addOwner:
			directionType = TransactionType.AddOwner;
			break;
		case ERCMethodIds.removeOwner:
			directionType = TransactionType.RemoveOwner;
			break;
		case ERCMethodIds.changeInternalThreshold:
			directionType = TransactionType.changeInternalRequirement;
			break;
		case ERCMethodIds.changeThreshold:
			directionType = TransactionType.ChangeRequirement;
			break;
		default:
			directionType = TransactionType.Unknown;
			break;
	}
	return directionType
};

export const TransactionDirectionImageNameDeclaration = (blockchain: BlockchainType, direction?: TransactionDirection, isMultisig?: boolean, providerName?: MultisigProviders) => {
	let img: string;
	let name: string;
	let action: string;
	switch (direction) {
		case TransactionDirection.Swap:
			img = blockchain.swapProtocols[0].logoURL;
			name = blockchain.swapProtocols[0].name;
			action = "Swap"
			break;
		case TransactionDirection.In:
			if (isMultisig) {
				img = blockchain.multisigProviders.find(s => s.name === providerName)?.logoURL ?? blockchain.logoUrl ?? REMOX_LOGO;
				name = blockchain.multisigProviders.find(s => s.name === providerName)?.displayName ?? "N/A";
			} else {
				img = blockchain.logoUrl ?? REMOX_LOGO
				name = 'Remox'
			}
			action = "Received"
			break;
		case TransactionDirection.Out:
			if (isMultisig) {
				img = blockchain.multisigProviders.find(s => s.name === providerName)?.logoURL ?? REMOX_LOGO;
				name = blockchain.multisigProviders.find(s => s.name === providerName)?.displayName ?? "N/A";
			} else {
				img = REMOX_LOGO
				name = 'Remox'
			}
			action = "Sent"
			break;
		case TransactionDirection.Borrow:
			img = blockchain.lendingProtocols[0].logoURL;
			name = blockchain.lendingProtocols[0].name;
			action = "Borrow"
			break;
		case TransactionDirection.Withdraw:
			img = blockchain.lendingProtocols[0].logoURL;
			name = blockchain.lendingProtocols[0].name;
			action = "Withdrawn"
			break;
		case TransactionDirection.Repay:
			img = blockchain.lendingProtocols[0].logoURL;
			name = blockchain.lendingProtocols[0].name;
			action = "Repaid"
			break;
		case TransactionDirection.Deposit:
			img = blockchain.lendingProtocols[0].logoURL;
			name = blockchain.lendingProtocols[0].name;
			action = "Deposited"
			break;
		case TransactionDirection.Reward:
			img = blockchain.lendingProtocols[0].logoURL;
			name = blockchain.lendingProtocols[0].name;
			action = "Reward"
			break;
		case TransactionDirection.AutomationOut:
			img = blockchain.recurringPaymentProtocols[0].logoURL;
			name = blockchain.recurringPaymentProtocols[0].name;
			action = "Stream Created"
			break;
		case TransactionDirection.AutomationIn:
			img = blockchain.recurringPaymentProtocols[0].logoURL;
			name = blockchain.recurringPaymentProtocols[0].name;
			action = "Received (A)"
			break;
		case TransactionDirection.AutomationCancel:
			img = blockchain.recurringPaymentProtocols[0].logoURL;
			name = blockchain.recurringPaymentProtocols[0].name;
			action = "Stream Cancelled"
			break;
		case TransactionDirection.AddOwner:
			img = blockchain.multisigProviders.find(s => s.name === providerName)?.logoURL ?? REMOX_LOGO;
			name = blockchain.multisigProviders.find(s => s.name === providerName)?.displayName ?? "N/A";
			action = "Add Owner"
			break;
		case TransactionDirection.RemoveOwner:
			img = blockchain.multisigProviders.find(s => s.name === providerName)?.logoURL ?? REMOX_LOGO;
			name = blockchain.multisigProviders.find(s => s.name === providerName)?.displayName ?? "N/A";
			action = "Remove Owner"
			break;
		case TransactionDirection.changeInternalRequirement:
			img = blockchain.multisigProviders.find(s => s.name === providerName)?.logoURL ?? REMOX_LOGO;
			name = blockchain.multisigProviders.find(s => s.name === providerName)?.displayName ?? "N/A";
			action = "Change I. Threshold"
			break;
		case TransactionDirection.ChangeRequirement:
			img = blockchain.multisigProviders.find(s => s.name === providerName)?.logoURL ?? REMOX_LOGO;
			name = blockchain.multisigProviders.find(s => s.name === providerName)?.displayName ?? "N/A";
			action = "Change Threshold"
			break;
		default:
			img = REMOX_LOGO
			name = 'Remox'
			action = "Unknown"
			break;
	}
	return [img, name, action]
}