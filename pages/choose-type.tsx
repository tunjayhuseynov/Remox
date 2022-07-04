import { selectDarkMode } from "redux/slices/notificationSlice";
import Button from "components/button";
import { useRouter } from 'next/router';
import { SelectExisting } from 'redux/slices/account/selectedAccount';
import { selectStorage, setStorage } from 'redux/slices/account/storage';
import useNextSelector from 'hooks/useNextSelector';
import useAsyncEffect from 'hooks/useAsyncEffect';
import { useSelector } from "react-redux";
import { auth } from "firebaseConfig";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { SelectBlockchain, SelectProviderAddress, setAccountType } from "redux/slices/account/remoxData";
import { launchApp } from "redux/slices/account/thunks/launch";
import useIndividual from "hooks/accounts/useIndividual";


function ChooseType() {
  const navigate = useRouter()
  const dark = useNextSelector(selectDarkMode)

  const dispatch = useAppDispatch()
  const address = useAppSelector(SelectProviderAddress)
  const blockchain = useAppSelector(SelectBlockchain)

  const { individual, isIndividualFetching } = useIndividual(address ?? "0", blockchain ?? "celo")

  useAsyncEffect(async () => {
    if (!auth?.currentUser || !address || !blockchain) {
      navigate.push("/")
    }
  }, [])

  const individualLogin = async () => {
    if (address && auth.currentUser && blockchain && !isIndividualFetching && individual) {
      dispatch(setAccountType("individual"))
      navigate.push("/dashboard")
    }
  }

  const data: { name: string, value: string }[] = []

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
            <div className="bg-white dark:bg-darkSecond rounded-lg overflow-auto h-[13.1rem] w-full relative">
              {data.map((i, id) => {
                return <div key={id} className={` ${id === 0 ? 'rounded-lg !border-b !border-t-0' : id === data.length - 1 && '!border-t !border-b-0'} flex items-center gap-3 border-y  transition-all hover:transition-all bg-white dark:bg-darkSecond dark:border-greylish hover:bg-light hover:!border-primary py-3 px-3`}>
                  <div className="w-9 h-9 bg-greylish bg-opacity-30 rounded-full"></div>
                  <div className="flex  flex-col">
                    <p className="text-base">{i.name}</p>
                    <p className="text-sm text-greylish">{i.value}</p>
                  </div>
                </div>
              })}
              {data.length === 0 && <div className="bg-white dark:bg-darkSecond absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">No Data Exists</div>}
            </div>
            <Button className="top-0 w-full rounded-t-none !border-0" onClick={() => navigate.push("/create-organization")}>Add Organisation</Button>
          </div>
          <div onClick={individualLogin} className={`cursor-pointer bg-white group border hover:!border-primary dark:border-greylish  hover:text-primary transition-all dark:bg-darkSecond hover:transition-all h-full rounded-lg w-full`}>
            <div className={`bg-white dark:bg-darkSecond rounded-lg !rounded-b-none min-h-[8rem] group-hover:min-h-[10rem] relative`}>
              <div className={`group-hover:text-primary text-xl font-bold dark:border-greylish absolute text-center top-[4rem] w-full`}>Continue as an Individual</div>
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