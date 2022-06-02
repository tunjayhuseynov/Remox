import AnimatedTabBar from 'components/animatedTabBar';
import { useRouter } from 'next/router';
import DynamicLendBorrow from 'subpages/dashboard/lend&borrow/dynamicLendBorrow';

const Lendborrow = () => {
    const router = useRouter()
    const { type } = router.query as { type: string[] | undefined }

    const data = [
        {
            to: "/dashboard/lend-and-borrow",
            text: "Lending"
        },
        {
            to: "/dashboard/lend-and-borrow/borrow",
            text: "Borrowing"
        }
    ]
   
    return <div className="flex flex-col space-y-3">
        <div className="text-2xl font-bold">
            Lend - Borrow
        </div>
        <div className="flex pl-5 pt-2 w-full">
            <AnimatedTabBar data={data} />
        </div>
        <div className="pt-3 pb-10">
            <DynamicLendBorrow type={!type || type[0].toLowerCase() === "lend" ? "lend" : "borrow"} />
        </div>
    </div>
}

export default Lendborrow;