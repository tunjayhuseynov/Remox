import AnimatedTabBar from 'components/animatedTabBar';
import { Outlet } from 'react-router-dom';

const Lendborrow = () => {

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
            <Outlet />
        </div>
    </div>
}

export default Lendborrow;