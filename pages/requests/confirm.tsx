import Button from "components/button";
import { TotalUSDAmount } from "pages/dashboard/requests/_components/totalAmount";
import { IRequest } from "rpcHooks/useRequest";
import { AltCoins, Coins } from "types";
import { AddressReducer } from "utils";
import dateFormat from "dateformat";
import { useForm, SubmitHandler } from "react-hook-form";

interface IProps {
  request: IRequest | null | undefined;
  closeModal: () => Promise<void>;
  GetCoins: AltCoins[];
  loading: boolean;
  filename: string;
  submit: () => Promise<void>;
}

export default ({
  request,
  GetCoins,
  closeModal,
  loading,
  filename,
  submit
}: IProps) => {
  if (request === null || request === undefined) return <>No Data</>;
  const { handleSubmit } = useForm();

  const currency = GetCoins.find((coin) => coin.name === request.currency);
  const secondCurrency = GetCoins.find((coin) => coin.name === request.secondaryCurrency);
  
  return (
    <div className="flex flex-col space-y-8 px-2">
      <div className="font-semibold">Overview</div>
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between border-b pb-8">
          <div className="text-greylish">Status</div>
          <div className="flex gap-x-2 items-center ">
            <span className="w-2 h-2 rounded-full bg-primary"></span>  
            {request?.status}
          </div>
        </div>
      </div>
      <div className="font-semibold">Payee information</div>
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
            {request?.address !== undefined && AddressReducer(request?.address)}
          </div>
        </div>
        <div className="flex justify-between">
          <div className="text-greylish">Requesting Amount</div>
          <div className="flex flex-col space-y-3">
            <div>
              <div className="flex gap-x-5 justify-between">
                <div className="flex gap-x-2 items-center">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                    {request?.amount}
                </div>
                <div className="flex gap-x-2 items-center">
                  {!!request?.currency && (
                    <div className="flex items-center">
                      {request.usdBase ? <span className="mr-2">USD as</span> : ""}
                      <img
                        src={currency!.logoURI}
                        className="rounded-xl w-[1.25rem] h-[1.25rem]"
                      />
                    </div>
                  )}
                  {currency ? <span>{currency!.name}</span> : "Token not provided"}
                </div>
              </div>
            </div>
            {!!request?.secondaryCurrency && !!request?.secondaryAmount && (
              <div>
                <div className="flex gap-x-5 justify-between">
                  <div className="flex gap-x-2 items-center">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    {request?.secondaryAmount}
                  </div>
                  <div className="flex gap-x-2 items-center">
                    {secondCurrency ? (
                      <div className="flex items-center">
                      {request.usdBase ? <span className="mr-2">USD as</span> : ""}
                      <img
                        src={secondCurrency!.logoURI}
                        className="rounded-xl w-[1.25rem] h-[1.25rem]"
                      />
                    </div>
                    ) : (
                      ""
                    )}
                    {secondCurrency
                      ? <span>{secondCurrency.name}</span> 
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
            {!request.usdBase ? request?.secondaryAmount && secondCurrency ? ((+request?.secondaryAmount * secondCurrency?.priceUSD) + (+request?.amount * currency!.priceUSD)).toFixed(4) : (+ request?.amount * currency!.priceUSD).toFixed(4) : request?.secondaryAmount ? request.amount + request.secondaryAmount : request.amount}
            {" "}
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
            {dateFormat(new Date(request!.serviceDate * 1000), `mmm dd, yyyy`)}
          </div>
        </div>
          <div className="flex justify-between">
            <div className="text-greylish">
              Attach links <span className="text-black">(Optional)</span>
            </div>
            <div>
              {request?.attachLink ? (
              <a href={request?.attachLink} rel="noreferrer" target="_blank">
                {request?.attachLink}
              </a>) : "No link provided"}
            </div>
          </div>
        <div className="flex justify-between">
          <div className="text-greylish">
            Upload receipt or invoice{" "}
            <span className="text-black block">(Optional)</span>
          </div>
          <div>
            {request?.uploadedLink ? (
              <a href={request?.uploadedLink} rel="noreferrer" target="_blank">
                {filename}
              </a>
            ) : (
              "No file uploaded"
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-center pt-5 sm:pt-0">
        <form onSubmit={handleSubmit(submit)} className="flex flex-row gap-10 sm:grid grid-cols-2 w-[30rem] sm:justify-center sm:gap-5">
          <Button
            version="second"
            onClick={() => closeModal()}
            className="w-[9.375rem] text-lg sm:w-full !py-1"
          >
            Back
          </Button>
          <Button
            type="submit"
            isLoading={loading}
            className=" w-[9.375rem] text-lg sm:w-full bg-primary px-3 py-2 text-white flex items-center justify-center rounded-lg"
          >
            Approve Request
          </Button>
        </form>
      </div>
    </div>
  );
};
