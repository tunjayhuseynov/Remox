import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom';
import { motion, AnimateSharedLayout } from "framer-motion";

const Lendborrow = () => {
    const [selected, setSelected] = useState(0);

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
        <div className="text-2xl font-bold pl-10">
            Lend - Borrow
        </div>
        <div className="flex pl-5 pt-2 w-full">
        <AnimateSharedLayout>
                    {data.map((item, i) => {
                        return <NavLink key={i}  to={`${item.to}`} end className={'mx-5'}>
                            <motion.div className={`tiflex gap-x-3 pb-3 font-semibold tracking-widertle relative ${i === selected ? "selected" : ""}`} onClick={() => setSelected(i)} animate >
                            {i === selected && (<motion.span className="absolute w-full h-[3px] bg-primary rounded-[2px] bottom-0" layoutId="underline" />)}
                                <span>{item.text}</span>
                            </motion.div>
                        </NavLink>
                    })}
                </AnimateSharedLayout>
        </div>
        <div className="pt-3 pb-10">
            <Outlet />
        </div>
    </div>
}

export default Lendborrow;