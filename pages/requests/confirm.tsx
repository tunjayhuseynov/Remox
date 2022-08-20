import Button from "components/button"
import { TotalUSDAmount } from "pages/dashboard/requests/_components/totalAmount"
import { ICoinMembers } from "redux/slices/currencies"
import { IRequest } from "rpcHooks/useRequest"
import { AltCoins } from "types"
import { AddressReducer } from "utils"
import dateFormat from "dateformat";


interface IProps {
    request: IRequest | null | undefined,
    closeModal: () => Promise<void>,
    GetCoins: { [name: string]: AltCoins },
    currency: ICoinMembers,
    loading: boolean,
    filename: string
}


export default ({ request, GetCoins, closeModal, currency, loading, filename }: IProps) => {
    if (request === null || request === undefined) return <>No Data</>;
    return <div
        className="flex flex-col space-y-8 px-2"
    >
        <div className="font-semibold">Your Information</div>
        <div className="flex flex-col space-y-5">
            {!!request?.name && (
                <div className="flex justify-between">
                    <div className="text-greylish">Full Name</div>
                    <div>{`${request?.name} ${request?.surname}`}</div>
                </div>
            )}
            <div className="flex justify-between">
                <div className="text-greylish">Wallet Adress</div>
                <div className="truncate">
                    {request?.address !== undefined &&
                        AddressReducer(request?.address)}
                </div>
            </div>
            <div className="flex justify-between">
                <div className="text-greylish">Requesting Amount</div>
                <div className="flex flex-col space-y-3">
                    <div>
                        <div className="flex gap-x-5">
                            <div className="flex gap-x-2 items-center">
                                <span className="w-2 h-2 rounded-full bg-primary"></span>
                                {request?.amount
                                    ? TotalUSDAmount(
                                        [request as IRequest],
                                        currency
                                    )
                                    : request?.amount &&
                                        GetCoins[request.currency]
                                            .name === "cUSD"
                                        ? request.amount
                                        : 10}
                            </div>
                            <div className="flex gap-x-2 items-center">
                                {!!request?.currency && (
                                    <img
                                        src={
                                            GetCoins[request.currency]
                                                .coinUrl
                                        }
                                        className="rounded-xl w-[1.25rem] h-[1.25rem]"
                                    />
                                )}
                                {!!request?.currency &&
                                    GetCoins[request.currency].name}
                            </div>
                        </div>
                    </div>
                    {!!request?.secondaryCurrency &&
                        !!request?.secondaryAmount && (
                            <div>
                                <div className="flex gap-x-5">
                                    <div className="flex gap-x-2 items-center">
                                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                                        {request?.secondaryAmount
                                            ? TotalUSDAmount(
                                                [request as IRequest],
                                                currency
                                            ).toFixed(2)
                                            : request?.secondaryAmount &&
                                                GetCoins[request.currency]
                                                    .name === "cUSD"
                                                ? request.secondaryAmount
                                                : 0}
                                    </div>
                                    <div className="flex gap-x-2 items-center">
                                        {request?.secondaryCurrency ? (
                                            <img
                                                src={
                                                    GetCoins[
                                                        request.secondaryCurrency
                                                    ].coinUrl
                                                }
                                                className="rounded-xl w-[1.25rem] h-[1.25rem]"
                                            />
                                        ) : (
                                            ""
                                        )}
                                        {request?.secondaryCurrency
                                            ? GetCoins[
                                                request.secondaryCurrency
                                            ].name
                                            : ""}
                                    </div>
                                </div>
                            </div>
                        )}
                </div>
            </div>
            <div className="flex justify-between border-b pb-8">
                <div className="text-greylish">Total</div>
                <div>
                    {request?.amount
                        ? TotalUSDAmount(
                            [request as IRequest],
                            currency
                        ).toFixed(2)
                        : 0}{" "}
                    USD
                </div>
            </div>
        </div>
        <div className="font-semibold">Details</div>
        <div className="flex flex-col space-y-4">
            <div className="flex justify-between">
                <div className="text-greylish">Request Type</div>
                <div>{request?.requestType}</div>
            </div>
            <div className="flex justify-between">
                <div className="text-greylish">Name of service</div>
                <div>{request?.nameOfService}</div>
            </div>
            <div className="flex justify-between">
                <div className="text-greylish">Date of service</div>
                <div>
                    {dateFormat(
                        new Date(request!.serviceDate * 1000),
                        `dd mmmm yyyy`
                    )}
                </div>
            </div>
            {!!request?.attachLink && (
                <div className="flex justify-between">
                    <div className="text-greylish">
                        Attach links{" "}
                        <span className="text-black">(optional)</span>
                    </div>
                    <div>
                        <a
                            href={request?.attachLink}
                            rel="noreferrer"
                            target="_blank"
                        >
                            {request?.attachLink}
                        </a>
                    </div>
                </div>
            )}
            <div className="flex justify-between">
                <div className="text-greylish">
                    Upload receipt or invoice{" "}
                    <span className="text-black">(optional)</span>
                </div>
                <div>
                    {request?.uploadedLink ? (
                        <a
                            href={request?.uploadedLink}
                            rel="noreferrer"
                            target="_blank"
                        >
                            {filename}
                        </a>
                    ) : (
                        "No file uploaded"
                    )}
                </div>
            </div>
        </div>
        <div className="flex justify-center pt-5 sm:pt-0">
            <div className="flex flex-row gap-10 sm:grid grid-cols-2 w-[25rem] sm:justify-center sm:gap-5">
                <Button
                    version="second"
                    onClick={() => closeModal()}
                    className="w-[9.375rem] sm:w-full"
                >
                    Back
                </Button>
                <Button
                    type="submit"
                    className=" w-[9.375rem] sm:w-full bg-primary px-0 !py-2 text-white flex items-center justify-center rounded-lg"
                    isLoading={loading}
                >
                    Confirm & Submit
                </Button>
            </div>
        </div>
    </div>
}