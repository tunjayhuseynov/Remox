import { useState } from "react";
import { selectDarkMode } from "redux/reducers/notificationSlice";
import Button from "components/button";
import { useRouter } from 'next/router';
import { auth, IBudgetExercise, IUser } from 'firebaseConfig';
import { useWalletKit } from 'hooks'
import { changeAccount, changeExisting, SelectExisting } from 'redux/reducers/selectedAccount';
import { useDispatch } from 'react-redux';
import { setStorage } from 'redux/reducers/storage';
import useNextSelector from 'hooks/useNextSelector';
import useAsyncEffect from 'hooks/useAsyncEffect';
import { isIndividualExisting } from 'hooks/singingProcess/utils';
import useIndividual from 'hooks/individual/useIndividual';
import { setBudgetExercises } from "redux/reducers/budgets";


function ChooseType() {
  const navigate = useRouter()
  const { Address, blockchain } = useWalletKit();
  const [address, setAddress] = useState<string | null>(null)

  const dark = useNextSelector(selectDarkMode)
  const { individual } = useIndividual(address ?? "0", blockchain)


  const isUserExist = useNextSelector(SelectExisting)
  const dispatch = useDispatch()


  // useAsyncEffect(async () => {
  //   if (Address && auth.currentUser) {
  //     setAddress(Address)
  //     if (!isUserExist) {
  //       dispatch(changeAccount(Address!))
  //       dispatch(changeExisting(await isIndividualExisting(auth.currentUser!.uid)))
  //     }
  //   } else navigate.push("/create-account")
  // }, [Address])


  const individualLogin = async () => {
    if (isUserExist) {

      if (individual) {
        dispatch(setStorage({
          uid: auth.currentUser?.uid!,
          lastSignedProviderAddress: Address!,
          signType: "individual",
          organization: null,
          individual: individual
        }))
        dispatch(setBudgetExercises(individual.budget_execrises as IBudgetExercise[]))
        navigate.push("/dashboard")
      } else {
        navigate.push("/create-account")
      }
    }
  }




  const data: { name: string, value: string }[] = [
    // {
    //   name: "UbeSwap",
    //   value: "$50.000",
    // },
    // {
    //   name: "AriSwap",
    //   value: "$50.000",
    // },
    // {
    //   name: "AriSwap",
    //   value: "$50.000",
    // },
    // {
    //   name: "AriSwap",
    //   value: "$50.000",
    // },
    // {
    //   name: "AriSwap",
    //   value: "$50.000",
    // },

  ]



  return <div className="h-screen w-full">
    <header className="flex md:px-40 h-[4.688rem] justify-center md:justify-start items-center absolute top-0 w-full">
      <div>
        <img src={dark ? "/logo.png" : "/logo_white.png"} alt="" width="135" />
      </div>
    </header>
    <div className="h-full w-full  gap-10 flex flex-col justify-center items-center">
      <div className="text-3xl font-bold">Choose Account Type</div>
      <div className="w-[40%] ">
        <div className="flex gap-8">
          <div className="h-full cursor-pointer border border-b-0 dark:border-greylish transition-all hover:transition-all hover:!border-primary rounded-lg w-full">
            <div className="bg-white rounded-lg overflow-auto h-[13.1rem] w-full relative">
              {data.map((i, id) => {
                return <div key={id} className={` ${id === 0 ? 'rounded-lg !border-b !border-t-0' : id === data.length - 1 && '!border-t !border-b-0'} flex items-center gap-3 border-y  transition-all hover:transition-all bg-white dark:bg-darkSecond dark:border-greylish hover:bg-light hover:!border-primary py-3 px-3`}>
                  <div className="w-9 h-9 bg-greylish bg-opacity-30 rounded-full"></div>
                  <div className="flex  flex-col">
                    <p className="text-base">{i.name}</p>
                    <p className="text-sm text-greylish">{i.value}</p>
                  </div>
                </div>
              })}
              {data.length === 0 && <div className="!bg-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">No Data Exists</div>}
            </div>
            <Button className="top-0 w-full rounded-t-none !border-0" onClick={() => navigate.push("/create-organization")}>Add Organisation</Button>
          </div>
          <div onClick={individualLogin} className={`cursor-pointer bg-white group border hover:!border-primary dark:border-greylish  hover:text-primary transition-all dark:bg-darkSecond hover:transition-all h-full rounded-lg w-full`}>
            <div className={`bg-white dark:bg-darkSecond rounded-lg !rounded-b-none min-h-[8rem] group-hover:min-h-[10rem] relative`}>
              <div className={`group-hover:text-primary text-xl font-bold dark:border-greylish absolute text-center top-[4rem] w-full`}>{individual ? "Continue" : "Register"} as an Individual</div>
            </div>
            <Button className="group-hover:visible invisible transition-all bg-primary text-white text-xl text-center w-full rounded-lg !py-2 rounded-t-none ">Next  &gt;</Button>
          </div>
        </div>
      </div>
    </div>
  </div>
}

ChooseType.disableLayout = true
ChooseType.disableGuard = true

export default ChooseType