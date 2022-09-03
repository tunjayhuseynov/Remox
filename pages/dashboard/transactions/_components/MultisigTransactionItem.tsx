import Accordion from 'components/accordion'
import { IMultisigSafeTransaction, ITransactionMultisig } from 'hooks/walletSDK/useMultisig'
import { forwardRef } from 'react'
import { AltCoins, Coins, TransactionStatus } from 'types'
import Link from "next/link";
import SingleTxDetails from './SingleTxDetails';
import Button from 'components/button';
import MultisigTxDetails from './MultisigTxDetails';


const MultisigTx = forwardRef<HTMLDivElement, { Address: string | undefined, GetCoins: Coins, tx: ITransactionMultisig | IMultisigSafeTransaction }>(({ Address, GetCoins, tx }, ref) => {

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

    return <Accordion
        ref={ref}
        grid={"grid-cols-[22%,48%,30%] sm:grid-cols-[26%,28.5%,45.5%]"}
        dataCount={1}
        method={method}
        status={tx.isExecuted ? TransactionStatus.Completed : tx.confirmations.length > 0 ? TransactionStatus.Pending : TransactionStatus.Rejected}
        color={"bg-white dark:bg-darkSecond"}
    >
        <div className="grid sm:grid-cols-[20%,30%,25%,25%,] lg:grid-cols-[26.5%,28%,25%,20.5%] min-h-[75px] py-6 items-center">
            <div>
                {tx.isExecuted ? <div className="text-white bg-green-500 border-2 border-green-500 rounded-xl px-3 py-1 text-center text-xs w-[125px]">Submitted</div> : null}
                {tx.isExecuted ? null : owners.includes(Address ?? "") ? <div className="text-white bg-primary border-2 border-primary rounded-xl px-3 py-1 text-center text-xs max-w-[175px]">You&apos;ve Confirmed</div> : <div className="border-2 text-center border-primary  px-3 py-1 rounded-xl text-xs max-w-[175px]">You&apos;ve not confirmed yet</div>}
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