import Button from "components/button";
import { fiatList } from "components/general/PriceInputField";
import { IRequest } from "rpcHooks/useRequest";
import { AltCoins, Coins } from "types";
import { AddressReducer } from "utils";
import dateFormat from "dateformat";
import { useForm } from "react-hook-form";

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

  const currency = GetCoins.find((coin) => coin.symbol === request.currency);
  const secondCurrency = GetCoins.find((coin) => coin.symbol === request.secondCurrency);

  const fiatFirst = fiatList.find((fiat) => fiat.name === request.fiat)
  const fiatSecond = fiatList.find((fiat) => fiat.name === request.fiatSecond)

  
  return (
    <div className="flex flex-col space-y-8 px-2">
      <div className="font-semibold text-xl my-4">Payee information</div>
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between">
            <div className="text-greylish">Full Name</div>
            <div>{request.fullname}</div>
          </div>
          <div className="flex justify-between">
            <div className="text-greylish">Wallet Adress</div>
            <div className="truncate">
              {request?.address !== undefined &&
                AddressReducer(request?.address)}
            </div>
          </div>
          <div className={`flex justify-between ${!(request.secondCurrency && request.secondAmount) ? "border-b pb-5" : ""}`}>
            <div className="text-greylish">Requesting Amount</div>
            <div className="flex flex-col space-y-3">
                <div className="flex gap-x-3 justify-between">
                  <div className="flex gap-x-2 items-center">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                      {request?.amount}
                  </div>
                  <div className="flex gap-x-2 items-center">
                    {!!request?.currency && (
                      <div className="flex items-center">
                        {request.fiat ? <div className="mr-2 flex items-center gap-2"> <img src={fiatFirst?.logo} className="w-5 h-3" alt="" />  <span>{request.fiat}</span> as</div> : ""}
                        <img
                          src={currency!.logoURI}
                          className="rounded-xl w-[1.25rem] h-[1.25rem]"
                        />
                      </div>
                    )}
                    {currency ? <span>{currency!.symbol}</span> : "Token not provided"}
                  </div>
                </div>
            </div>
          </div>
            {!!request?.secondCurrency && !!request?.secondAmount && (
              <div className="flex justify-between border-b pb-5">
                <div className="text-greylish">Requesting Amount 2</div>
                <div className="flex flex-col space-y-3">
                  <div className="flex gap-x-3 justify-between">
                    <div className="flex gap-x-2 items-center">
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                      {request?.secondAmount}
                    </div>
                    <div className="flex gap-x-2 items-center">
                      {secondCurrency ? (
                        <div className="flex items-center">
                        {request.fiatSecond ? <div className=" flex items-center gap-2"> <img src={fiatSecond?.logo} className="w-5 h-3" alt="" /> <span className="mr-2">{request.fiat} as</span> </div> : ""}
                        <img
                          src={secondCurrency!.logoURI}
                          className="rounded-xl w-[1.25rem] h-[1.25rem]"
                        />
                      </div>
                      ) : (
                        ""
                      )}
                      {secondCurrency
                        ? <span>{secondCurrency.symbol}</span> 
                        : "Token not provided"}
                    </div>
                  </div>
                </div>
              </div>
            )}
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
              Attach links <span className="">(Optional)</span>
            </div>
            <div>
              {request?.attachLink ? (
              <a href={request?.attachLink} rel="noreferrer" target="_blank">
                {request?.attachLink.slice(0,50)}...
              </a>) : "No link provided"}
            </div>
          </div>
        <div className="flex justify-between">
          <div className="text-greylish">
            Upload receipt or invoice{" "}
            <span className="">(Optional)</span>
          </div>
          <div>
            {request?.uploadedLink ? (
              <a href={request?.uploadedLink} rel="noreferrer" target="_blank">
                {filename.slice(0,60)}...
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
