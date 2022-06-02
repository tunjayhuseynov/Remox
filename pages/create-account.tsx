import Button from "components/button";
import Input from "components/input";
import { useAuth, useSignInOrUp, useWalletKit } from "hooks";
import { useRouter } from "next/router";
import { SyntheticEvent, useMemo } from "react";
import { useAppSelector } from "redux/hooks";
import { selectDarkMode } from "redux/reducers/notificationSlice";
import { ToastRun } from "utils/toast";

const CreateAccount = () => {
  const { Address, Wallet, blockchain } = useWalletKit();
  const address = Address
  const { executeSign, isLoading } = useSignInOrUp()
  const { user } = useAuth(address);
  const navigate = useRouter()
  const dark = useAppSelector(selectDarkMode)

  const list = useMemo<Array<{ title: string, type?: string, name: string }>>(() => [
    { title: "First Name", name: "userName" }, { title: "Last Name", name: "surname" },
    { title: "Organization Name", name: "companyName" }, { title: "Password", name: "password", type: "password", limit: 6 },
  ], [])

  if (user || !address) return navigate.push('/')


  const create = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    const target = e.target as HTMLFormElement
    if (target["password"].value !== target["repeatPassword"].value) {
      ToastRun(<div className="dark:text-white"><strong>Passwords don't match</strong></div>)
      return
    }

    const inputData = {
      name: target["userName"].value,
      surname: target["surname"].value,
      companyName: target["companyName"].value,
      password: target["password"].value,
    }

    try {
      const user = await executeSign(address, inputData.password, {
        address: [address],
        id: "placeholder",
        multiwallets: [{ name: Wallet ?? "", address: address, blockchain }],
        companyName: inputData.companyName,
        name: inputData.name,
        surname: inputData.surname,
        seenTime: Math.floor(new Date().getTime() / 1e3),
        timestamp: Math.floor(new Date().getTime() / 1e3),
        blockchain,
      })

      navigate.push('/dashboard')
    } catch (error) {
      console.error(error)
    }
  }

  return <div className="h-screen w-full">
    <header className="flex md:px-40 h-[4.688rem] justify-center md:justify-start items-center absolute top-0 w-full">
      <div>
        <img src={!dark ? "/logo.png" : "/logo_white.png"} alt="" width="150" />
      </div>
    </header>
    <form className="py-[6.25rem] sm:py-0 sm:h-full" onSubmit={create}>
      <section className="flex flex-col items-center h-full justify-center gap-8">
        <div className="flex flex-col gap-4">
          <div className="text-xl sm:text-3xl text-primary dark:text-white text-center">Set Account Details</div>
          <div className="text-greylish dark:text-primary tracking-wide font-light text-sm sm:text-lg text-center">This password encrypts your accounts on this device.</div>
        </div>
        <div className="flex flex-col px-3 items-center justify-center min-w-[25%]">
          {list.map((w, i) => <Input key={i} {...w} />)}
        </div>
        <div className="grid grid-rows-2 sm:grid-cols-2 gap-5">
          <Button version="second" onClick={() => navigate.push('/')}>Back</Button>
          <Button type="submit" isLoading={isLoading}>Set Account</Button>
        </div>
      </section>
    </form>
  </div>
}

CreateAccount.disableLayout = true
CreateAccount.disableGuard = true
export default CreateAccount