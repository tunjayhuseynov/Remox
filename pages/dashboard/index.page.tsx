import Button from "components/button"
import { useRouter } from "next/router"
import { useAppSelector } from "redux/hooks"
import { SelectAccounts } from "redux/slices/account/selector"
import { Payments, Statistics, WalletList } from "./_components"


export default function Dashboard() {
    const accounts = useAppSelector(SelectAccounts)
    const route = useRouter()

    return <main className="flex flex-col space-y-8">
        <div>
            <Statistics />
        </div>
        <div className="grid grid-cols-[66.6%,33.3%]">
            <div className="flex flex-col space-y-5">
                <div className="flex justify-between items-center w-full">
                    <div className="text-xl font-semibold">Connected Wallets</div>
                    <Button className="text-sm !py-[.5rem]"
                        onClick={() => { route.push("/dashboard/new-wallet") }}
                    >
                        + Add Wallet
                    </Button>
                </div>
                <div className="grid grid-cols-2 gap-x-14 gap-y-12 pb-4">
                    {accounts.map((item) => {
                        return <WalletList item={item} key={item.id} />
                    })}
                </div>
            </div>
            <div></div>
        </div>
    </main>
}
