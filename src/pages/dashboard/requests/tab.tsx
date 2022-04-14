import { FirestoreWrite } from "API/useFirebase"
import useMultisig from "API/useMultisig"
import useCeloPay, { PaymentInput } from "API/useCeloPay"
import { IRequest, RequestStatus } from "API/useRequest"
import Button from "components/button"
import Modal from "components/general/modal"
import { arrayRemove, FieldValue } from "firebase/firestore"
import { useWalletKit } from "hooks"
import useRequest from "hooks/useRequest"
import { useContext, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useLocation } from "react-router-dom"
import { ClipLoader } from "react-spinners"
import { useAppSelector } from "redux/hooks"
import { SelectBalances } from "redux/reducers/currencies"
import { changeError, selectError } from "redux/reducers/notificationSlice"
import { SelectRequests } from "redux/reducers/requests"
import { SelectSelectedAccount } from "redux/reducers/selectedAccount"
import { selectStorage } from "redux/reducers/storage"
import RequestedUserItem from "subpages/dashboard/requests/requestedUserItem"
import TokenBalance from "subpages/dashboard/requests/tokenBalance"
import TotalAmount from "subpages/dashboard/requests/totalAmount"
import { Coins } from "types"
import { MultipleTransactionData } from "types/sdk"
import { DashboardContext } from "../layout"

export default function TabPage() {

  const { pathname } = useLocation()

  const [modal, setModal] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const { submitTransaction } = useMultisig()
  const { genLoading } = useRequest()
  // const { BatchPay, Pay } = usePay()
  const { SendBatchTransaction, SendTransaction } = useWalletKit()
  const dispatch = useDispatch()
  const isError = useAppSelector(selectError)
  const [isSuccess, setSuccess] = useState(false)
  const { refetch } = useContext<{ refetch: () => void }>(DashboardContext)

  let page;
  if (pathname.split("/").length === 3) {
    page = RequestStatus.pending
  } else if (pathname.split("/")[3] === "approved") {
    page = RequestStatus.approved
  } else {
    page = RequestStatus.rejected
  }

  let selector = useSelector(SelectRequests)
  const penders = page === RequestStatus.pending ? selector.pending : page === RequestStatus.approved ? selector.approved : selector.rejected

  const [selected, setSelected] = useState<IRequest[]>([]);
  const balance = useAppSelector(SelectBalances)
  const storage = useAppSelector(selectStorage)
  const selectedAccount = useAppSelector(SelectSelectedAccount)
  const { GetCoins } = useWalletKit()


  const Submit = async () => {
    const result: Array<MultipleTransactionData & { member?: IRequest }> = []

    const mems = selected;

    if (mems.length) {
      for (let index = 0; index < mems.length; index++) {
        let amount;
        if (mems[index].usdBase) {
          amount = (parseFloat(mems[index].amount) * (balance[GetCoins[mems[index].currency as keyof Coins].name as keyof typeof balance]?.tokenPrice ?? 1)).toString()
        } else {
          amount = mems[index].amount
        }
        result.push({
          toAddress: mems[index].address,
          amount,
          tokenName: mems[index].currency,
          member: mems[index]
        })

        let secAmount = mems[index].secondaryAmount, secCurrency = mems[index].secondaryCurrency;

        if (secAmount && secCurrency) {
          if (mems[index].secondaryAmount) {
            secAmount = (parseFloat(secAmount) * (balance[GetCoins[mems[index].secondaryCurrency as keyof Coins].name as keyof typeof balance]?.tokenPrice ?? 1)).toFixed(4)
          }

          result.push({
            toAddress: mems[index].address,
            amount: secAmount,
            tokenName: secCurrency,
          })
        }
      }
    }
    setIsPaying(true)

    try {
      if (storage!.accountAddress.toLowerCase() === selectedAccount.toLowerCase()) {
        if (result.length === 1) {
          // await Pay({ coin: GetCoins[result[0].tokenName as keyof Coins], recipient: result[0].toAddress, amount: result[0].amount })
          await SendTransaction({ coin: GetCoins[result[0].tokenName as keyof Coins], recipient: result[0].toAddress, amount: result[0].amount })
        }
        else if (result.length > 1) {
          const arr: Array<PaymentInput> = result.map(w => ({
            coin: GetCoins[w.tokenName as keyof Coins],
            recipient: w.toAddress,
            amount: w.amount,
            from: true
          }))

          // await BatchPay(arr)
          await SendBatchTransaction(arr)
        }
      } else {
        if (result.length === 1) {
          await submitTransaction(selectedAccount, [{ recipient: result[0].toAddress, coin: GetCoins[result[0].tokenName as keyof Coins], amount: result[0].amount }])
        }
        else if (result.length > 1) {
          const arr: Array<PaymentInput> = result.map(w => ({
            coin: GetCoins[w.tokenName as keyof Coins],
            recipient: w.toAddress,
            amount: w.amount,
            from: true
          }))

          await submitTransaction(selectedAccount, arr)
        }
      }

      await FirestoreWrite<{ requests: FieldValue }>().updateDoc("requests", selectedAccount.toLowerCase(), {
        requests: arrayRemove(...selected)
      })

      setSuccess(true);
      setSelected([])
      refetch()
      setModal(false)

    } catch (error: any) {
      console.error(error)
      dispatch(changeError({ activate: true, text: error.message }));
    }

    setIsPaying(false);
  }

  return <>
    {
      genLoading ? <div className="flex items-center justify-center"><ClipLoader /></div> :
        penders.length === 0 ? <div className="text-2xl font-bold text-center tracking-wider">No {page} requests found</div> : <>
          <div className="flex flex-col space-y-8">
            {page === RequestStatus.approved &&
              <div className="grid grid-cols-2 gap-x-10">
                <div className="flex flex-col space-y-3">
                  <span className="text-greylish font-semibold tracking-wide">Your Balance</span>
                  <div>
                    <TotalAmount coinList={selected} />
                  </div>
                </div>
                <div className="flex flex-col space-y-3">
                  <span className="text-greylish font-semibold tracking-wide">Your Balance's Token Amounts</span>
                  <TokenBalance coinList={selected} />
                </div>
              </div>
            }
            <div className="grid grid-cols-[30%,25%,25%,20%] border-b border-greylish pb-4 font-semibold tracking-wide items-center">
              <div className="flex items-center space-x-2 min-h-[3.125rem]">
                {page === RequestStatus.approved &&
                  <input type="checkbox" className="relative cursor-pointer w-[0.938rem] h-[0.938rem] checked:before:absolute checked:before:w-full checked:before:h-full checked:before:bg-primary checked:before:block" onChange={(e) => {
                    const requests = [...selected]
                    if (e.target.checked) {
                      penders?.forEach(m => {
                        if (!requests.some(x => x.id === m.id)) {
                          requests.push(m)
                        }
                      })
                      setSelected(requests)
                    } else {
                      setSelected(requests.filter(m => !requests?.some(x => x.id === m.id)))
                    }
                  }} />}
                <span>Recipient</span>
              </div>
              <div>Requested Amount</div>
              <div>Request date</div>
              <div className="flex justify-end items-center">
                {page === RequestStatus.approved && selected.length > 0 &&
                  <Button className="!py-2 px-0 font-semibold tracking-wide min-w-[10rem]" onClick={() => {
                    setModal(true)
                  }}>
                    Pay selected
                  </Button>}
              </div>
            </div>
            {penders.map(pender => <RequestedUserItem key={pender.id} request={pender} selected={selected} setSelected={setSelected} />)}
          </div>
          {page === RequestStatus.approved && modal &&
            <Modal onDisable={setModal}>
              <div className="w-[70vw] px-10 flex flex-col space-y-10">
                <div className="flex flex-col">
                  <div className="text-2xl font-semibold tracking-wide">Confirm Payments</div>
                  {selected.map(w => <RequestedUserItem key={w.id} request={w} selected={selected} setSelected={setSelected} payment={true} />)}
                </div>
                <div className="flex flex-col space-y-3">
                  <div className="text-2xl font-semibold tracking-wide">Review Treasury Impacts</div>
                  <div className="grid grid-cols-2 gap-x-10">
                    <div className="flex flex-col space-y-3">
                      <span className="text-greylish font-semibold tracking-wide">In Estimated USD</span>
                      <div>
                        <TotalAmount coinList={selected} />
                      </div>
                    </div>
                    <div className="flex flex-col space-y-3">
                      <span className="text-greylish font-semibold tracking-wide">In Token Amounts</span>
                      <TokenBalance coinList={selected} />
                    </div>
                  </div>
                </div>
                <div className="w-full">
                  <Button className="w-full text-xl font-semibold" isLoading={isPaying} onClick={Submit}>
                    Confirm and Create Transactions
                  </Button>
                </div>
              </div>
            </Modal>
          }
        </>
    }
  </>
}
