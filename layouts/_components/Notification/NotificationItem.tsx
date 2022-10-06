import { ERC20MethodIds, GenerateTransaction, IBatchRequest, IFormattedTransaction, ISwap, ITransfer } from "hooks/useTransactionProcess"
import { ITransactionMultisig } from "hooks/walletSDK/useMultisig"
import { BlockchainType } from "types/blockchains"
import { TransactionDirectionDeclare, TransactionDirectionImageNameDeclaration } from "utils"
import dateFormat from "dateformat";
import { useRouter } from "next/dist/client/router";
import _ from "lodash";
import { forwardRef } from 'react'
import { AltCoins } from "types";
import { DecimalConverter } from "utils/api";

interface IProps {
    item: IFormattedTransaction | ITransactionMultisig,
    index: number,
    addresses: string[],
    blockchain: BlockchainType,
    lastSeenTime: number
}

const NotificationItem = forwardRef<HTMLDivElement, IProps>(({ item, index, addresses, blockchain, lastSeenTime }, ref) => {
    const navigate = useRouter()

    const hash = 'tx' in item ? `${item.contractAddress}${item.hashOrIndex}${index}` : `${item.hash}${index}`
    const method = 'tx' in item ? item.tx.method : item.method
    const rawData = 'tx' in item ? null : item.rawData
    const address = 'tx' in item ? item.contractAddress : item.address
    const isError = 'tx' in item ? item.tx.isError : item.isError

    let amount: string | undefined;
    let coin: AltCoins | undefined;

    let amountFrom: string | undefined;
    let coinFrom: AltCoins | undefined;

    let amountTo: string | undefined;
    let coinTo: AltCoins | undefined;

    if (method === ERC20MethodIds.swap) {
        const data = 'tx' in item ? item.tx as ISwap : item as ISwap;

        amountFrom = data.amountIn;
        coinFrom = data.coinIn;

        amountTo = data.amountOutMin;
        coinTo = data.coinOutMin;
    }

    if (
        method === ERC20MethodIds.transfer ||
        method === ERC20MethodIds.transferFrom ||
        method === ERC20MethodIds.transferWithComment ||
        method === ERC20MethodIds.automatedTransfer ||
        method === ERC20MethodIds.borrow ||
        method === ERC20MethodIds.repay ||
        method === ERC20MethodIds.withdraw ||
        method === ERC20MethodIds.deposit
    ) {

        amount = 'tx' in item ? item.tx.amount : (item as ITransfer).amount
        coin = 'tx' in item ? item.tx.coin : (item as ITransfer).coin
    }

    const isBatch = method === ERC20MethodIds.batchRequest
    const TXs: (IFormattedTransaction | ITransactionMultisig)[] = [];
    if (isBatch) {
        const groupBatch = _((item as IBatchRequest).payments).groupBy("to").value()
        Object.entries(groupBatch).forEach(([key, value]) => {
            let tx: IBatchRequest = {
                timestamp: item.timestamp,
                isError: isError ?? false,
                method: method,
                id: method,
                hash: hash,
                rawData: rawData ? rawData : GenerateTransaction({
                    hash,
                }),
                payments: value,
                address: address,
                tags: item.tags,
                budget: item.budget ?? undefined,
            }
            TXs.push(tx)
        })
    } else {
        TXs.push(item)
    }
    let direction = TransactionDirectionDeclare(item, addresses);
    const [image, name, action] = TransactionDirectionImageNameDeclaration(blockchain, direction, 'tx' in item);


    return <div ref={ref} key={hash} className="py-2 grid grid-cols-[5%,1fr,58%,25%] items-center hover:bg-light dark:hover:bg-dark rounded-md">
        {item.timestamp > lastSeenTime ? <div className="rounded-full w-3 h-3 bg-primary ml-2"></div> : <span></span>}
        <img src={image} alt="" className="w-10 h-10 rounded-full" />
        <div className="flex flex-col items-start">
            <div className="text-lg font-medium">
                {action} {amount && coin && method !== ERC20MethodIds.swap ? (DecimalConverter(amount, coin.decimals).toFixed(0).length <= 18 ? DecimalConverter(amount, coin.decimals) : 0.0001).toLocaleString() : ''} {amount && coin && ERC20MethodIds.swap !== method ? coin.symbol : ''}
                {method === ERC20MethodIds.swap && (<>from {DecimalConverter(amountFrom ?? 0, coinFrom?.decimals ?? 18)} {coinFrom?.symbol} to {DecimalConverter(amountTo ?? 0, coinTo?.decimals ?? 18)} {coinTo?.symbol}</>)}
            </div>
            <div className="font-medium text-[10px] text-primary cursor-pointer" onClick={() => navigate.push('/dashboard/transactions')}>View Transaction</div>
        </div>
        <div className="text-greylish font-light text-[10px] flex justify-end items-center gap-2 pr-3">{dateFormat(new Date(item.timestamp * 1e3))} <span className="text-greylish text-2xl pb-1">&#8250;</span> </div>
    </div>
})

export default NotificationItem