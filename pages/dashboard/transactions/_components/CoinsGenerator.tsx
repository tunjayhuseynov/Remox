import { fiatList } from "components/general/PriceInputField"
import { IRemoxPayTransactions } from "firebaseConfig"
import { ITransfer } from "hooks/useTransactionProcess"
import { useAppSelector } from "redux/hooks"
import { SelectFiatPreference, SelectFiatSymbol, SelectHistoricalPrices, SelectPriceCalculationFn } from "redux/slices/account/selector"
import { DecimalConverter } from "utils/api"
import { GetFiatPrice } from "utils/const"
import { NG } from "utils/jsxstyle"
import DateTime from 'date-and-time'

interface IProps {
    transfer: Pick<ITransfer, "coin" | "amount">,
    timestamp: number,
    disableFiat?: boolean,
    imgSize?: number,
    ether?: boolean,
    payTx?: IRemoxPayTransactions,
    afterPrice?: boolean,
}
export const CoinDesignGenerator = ({ transfer, timestamp, disableFiat, imgSize = 1.25, ether, payTx, afterPrice }: IProps) => {
    const fiatPreference = useAppSelector(SelectFiatPreference)
    const hp = useAppSelector(SelectHistoricalPrices)
    // const calculatePrice = useAppSelector(SelectPriceCalculationFn)
    const symbol = useAppSelector(SelectFiatSymbol)

    let tokenAmount = "";
    if (!ether) {
        tokenAmount = DecimalConverter(transfer.amount, transfer.coin.decimals).toFixed(0).length > 18 ? "0" : DecimalConverter(transfer.amount, transfer.coin.decimals).toFixed(2)
    } else {
        tokenAmount = transfer.amount
    }
    const fiatPrice = GetFiatPrice(transfer.coin, fiatPreference) * +tokenAmount

    const date = new Date(timestamp)
    const diff = Math.abs(DateTime.subtract(date, new Date()).toDays())
    const dateString = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
    const hpCoinPrice = hp[transfer.coin.symbol]?.[fiatPreference].find(h => h.date === dateString)?.price
    const price = hpCoinPrice && diff >= 1 ? +tokenAmount * hpCoinPrice : fiatPrice

    const fiatImg = fiatList.find(f => f.name === payTx?.fiat)?.logo

    return <>
        <div className="flex flex-col">
            <div className="grid gap-x-[4px]" style={{
                gridTemplateColumns: `${imgSize}rem 1fr`
            }}>
                <div style={{
                    width: `${imgSize}rem`,
                    height: `${imgSize}rem`,
                }}>
                    {transfer?.coin?.logoURI || fiatImg ? <img
                        src={fiatImg ?? transfer.coin.logoURI}
                        width="100%"
                        height="100%"
                        className="rounded-full object-cover aspect-square"
                    /> : <div className="w-full h-full rounded-full bg-gray-500" />}
                </div>
                <span className="text-left leading-none self-center gap-x-[7px] flex">
                    <div className="text-sm font-medium"><NG number={payTx?.fiatAmount ?? +tokenAmount} fontSize={0.875} /> </div>
                    <span className="text-greylish font-medium text-sm">{afterPrice ? `(${symbol}${price.toFixed(2)})` : ""}</span>
                </span>
            </div>
            {!disableFiat && <div className="grid grid-cols-[1.25rem,1fr] gap-x-[4px]">
                <div></div>
                <div className="text-xxs font-medium text-gray-500 leading-none dark:text-gray-200 flex items-center space-x-[2px]">
                    <div>
                        {fiatImg ? <img
                            src={transfer.coin.logoURI}
                            className="rounded-full w-[0.75rem] h-[0.75rem]"
                        /> : `${symbol}`}
                    </div>
                    <div>
                        <NG fontSize={0.625} decimalSize={80} number={payTx?.amount ?? (price.toFixed(0).length > 18 ? 0 : price)} />
                    </div>
                </div>
            </div>}
        </div>
    </>
}