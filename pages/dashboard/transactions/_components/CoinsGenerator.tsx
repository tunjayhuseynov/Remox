import { ITransfer } from "hooks/useTransactionProcess"
import { DecimalConverter } from "utils/api"

interface IProps { transfer: Pick<ITransfer, "coin" | "amount"> }
export const CoinDesignGenerator = ({ transfer }: IProps) => {

    return <div className="flex space-x-3">
        <div className="w-[1.5rem] h-[1.5rem]">
            {transfer?.coin?.logoURI ? <img
                src={transfer.coin.logoURI}
                width="100%"
                height="100%"
                className="rounded-full"
            /> : <div className="w-full h-full rounded-full bg-gray-500" />}
        </div>
        <div className="flex flex-col text-left">
            <span className="font-semibold text-left">
                {DecimalConverter(transfer.amount, transfer.coin.decimals).toFixed(0).length > 18 ? 0 : DecimalConverter(transfer.amount, transfer.coin.decimals).toLocaleString()}
            </span>
            <span className="text-xs text-gray-200">
                {`$${(DecimalConverter(transfer.amount, transfer.coin.decimals) * transfer.coin.priceUSD).toFixed(0).length > 18 ? 0 : (DecimalConverter(transfer.amount, transfer.coin.decimals) * transfer.coin.priceUSD).toLocaleString()}`}
            </span>
        </div>
    </div>
}