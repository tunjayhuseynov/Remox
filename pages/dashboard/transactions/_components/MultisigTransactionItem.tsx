import Accordion from 'components/accordion'
import { IMultisigSafeTransaction, ITransactionMultisig } from 'hooks/walletSDK/useMultisig'
import { forwardRef } from 'react'
import { AltCoins, Coins, TransactionStatus } from 'types'
import Link from "next/link";
import SingleTxDetails from './SingleTxDetails';
import Button from 'components/button';
import MultisigTxDetails from './MultisigTxDetails';
import { TransactionDirectionDeclare } from "utils";
import { IAccount } from 'firebaseConfig';

interface IProps { Address: string | undefined, GetCoins: Coins, tx: ITransactionMultisig | IMultisigSafeTransaction, accounts: string[], multisigAccount: IAccount | undefined, }
const MultisigTx = forwardRef<HTMLDivElement, IProps>(({ Address, GetCoins, tx, accounts, multisigAccount }, ref) => {

    const method = tx.type?.split('').reduce((acc, w, i) => {
        if (i === 0) return acc + w.toUpperCase()
        if (w !== w.toLowerCase() && i > 0) return acc + " " + w
        return acc + w;
    }, '')

    const isSafe = 'safeTxHash' in tx;
    const type = method;
    const threshold = tx.contractThresholdAmount;
    const internalThreshold = isSafe ? tx.contractThresholdAmount : tx.contractInternalThresholdAmount;
    const owners = isSafe ? tx.confirmations.map(c => c.owner.toLowerCase()) : tx.confirmations.map(c => c.toLowerCase());
    const transfer = isSafe ? tx.transfer : {
        to: tx.owner,
        coin: tx.destination,
        value: tx.valueOfTransfer,
    };
    const changeThreshold = isSafe ? {
        threshold: tx.settings?.dataDecoded.parameters[0].value,
    } : {
        threshold: tx.requiredCount,
    }

    const addOwner = isSafe ? {
        newOwner: tx.settings?.dataDecoded.parameters[0].value,
    } : {
        newOwner: tx.newOwner,
    }

    const hash = isSafe ? tx.safeTxHash : tx.hashOrIndex;
    const contractAddress = isSafe ? tx.contractAddress : tx.contractAddress;
    let directionType = TransactionDirectionDeclare(tx, accounts);
    const created = isSafe ? tx.isExecuted ? tx.executionDate! : tx.submissionDate : (tx.timestamp).toString()

    return <Accordion
        ref={ref}
        grid={"grid-cols-[25%,45%,30%] sm:grid-cols-[18%,30%,30%,22%]"}
        dataCount={1}
        date={created}
        direction={directionType}
        threshold={threshold}
        signCount={tx.confirmations.length}
        status={tx.isExecuted ? TransactionStatus.Completed : tx.confirmations.length > 0 ? TransactionStatus.Pending : TransactionStatus.Rejected}
        color={"bg-white dark:bg-darkSecond"}
    >
        <div className="grid sm:grid-cols-[20%,30%,25%,25%,] lg:grid-cols-[26.5%,28%,25%,20.5%] min-h-[75px] py-6 items-center">
            <div className="flex space-x-3 items-center overflow-hidden">
                <div className={`hidden sm:flex items-center  justify-center`}>
                    <div className={`bg-greylish bg-opacity-10 w-[2.813rem] h-[2.813rem] text-lg flex items-center justify-center rounded-full font-bold `}>
                        {!!multisigAccount?.name && multisigAccount.name[0]}
                    </div>
                </div>
                <div className={`sm:flex flex-col justify-center items-start `}>
                    <div className="text-greylish text-base font-semibold dark:text-white">
                        {!!multisigAccount?.name && multisigAccount.name}
                    </div>
                </div>
            </div>
            <div className="flex flex-col space-y-1">
                {/* <div>
            <div className="border-b border-black inline">
                {method}
            </div>
        </div> */}
                {transfer?.value && <div className="truncate pr-10  text-base">{type.toLowerCase().includes('transfer') ? 'To' : 'Owner'}: {transfer.to}</div>}
                {transfer?.value && <div className="truncate pr-10  text-base">{transfer?.value} {(Object.values(GetCoins).find((s: AltCoins) => s.address.toLowerCase() === (typeof transfer?.coin === "string" ? transfer?.coin.toLowerCase() : transfer?.coin.address.toLowerCase())) as AltCoins)?.name}</div>}
                {addOwner.newOwner ? <div className="truncate pr-10  text-base">New Owner: {addOwner.newOwner}</div> : null}
                {changeThreshold.threshold ? <div className="truncate pr-10  text-base">New Threshold: {+changeThreshold.threshold}</div> : null}
            </div>
            <div className="font-semibold ">
                {tx.confirmations.length} <span className="font-medium">out of</span> {transfer?.value ? threshold : internalThreshold}
            </div>
            <div className=" flex justify-end cursor-pointer items-start md:pr-0 gap-5">
                <Button className="shadow-none px-8 py-1 !rounded-md">Sign</Button>

                <MultisigTxDetails
                    Transaction={tx}
                    Type={type}
                    status={tx.confirmations.length === threshold || tx.confirmations.length === internalThreshold ? TransactionStatus.Completed : TransactionStatus.Pending}
                />
            </div>
        </div>
    </Accordion>
})

export default MultisigTx