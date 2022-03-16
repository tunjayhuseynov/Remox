import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom';
import Button from 'components/button';
import Modal from 'components/general/modal';
import { RiFileCopyLine } from 'react-icons/ri'
import { BsShare } from 'react-icons/bs'
import Copied from "components/copied";
import { useSelector } from 'react-redux';
import { SelectSelectedAccount } from 'redux/reducers/selectedAccount';
import { BaseUrl } from 'utils/const';
import { motion, AnimateSharedLayout } from "framer-motion";

export default function RequestLayout() {
    const [modalVisibility, setModalVisible] = useState(false)
    const [tooltip, setTooltip] = useState(false);
    const [divRef, setDivRef] = useState<HTMLDivElement | null>(null)
    const selectedAccount = useSelector(SelectSelectedAccount)
    const [selected, setSelected] = useState(0);

    const data = [
        {
            to: "/dashboard/requests",
            text: "Pending"
        },
        {
            to: "/dashboard/requests/approved",
            text: "Approved"
        },
        {
            to: "/dashboard/requests/rejected",
            text: "Rejected"
        }
    ]

    return (
        <div className="flex flex-col space-y-5">
            <div className="flex justify-between">
                <div className="text-2xl font-bold tracking-wider">Requests</div>
                <div>
                    <Button className="py-1 px-4 font-semibold tracking-wider flex items-center" onClick={() => setModalVisible(true)}>
                        <>
                            <div className="pr-3">
                                <BsShare />
                            </div>
                            Share Request Link
                        </>
                    </Button>
                </div>
            </div>
            <div className="flex pl-10 w-full">
                <AnimateSharedLayout>
                    {data.map((item, i) => {
                        return <NavLink key={i} to={`${item.to}`} end className={'mx-5'}>
                            <motion.div className={`tiflex gap-x-3 pb-3 font-semibold tracking-widertle ${i === selected ? "selected" : ""}`} onClick={() => setSelected(i)} animate >
                                <span>{item.text} </span>
                                <span className="relative">
                                    {i === selected && (<motion.span className="absolute w-full h-[3px] bg-primary rounded-[2px] bottom-[-10px]" layoutId="underline" />)}
                                    Requests</span>
                            </motion.div>
                        </NavLink>
                    })}
                </AnimateSharedLayout>
            </div>
            <div className="px-10 py-5">
                <Outlet />
            </div>
            {modalVisibility && <Modal onDisable={setModalVisible}>
                <div className="flex flex-col space-y-5">
                    <div className="text-xl font-semibold tracking-wider">
                        Invite Link
                    </div>
                    <div className="tracking-wide">
                        Share this link with your community contributors
                    </div>
                    <div className="bg-greylish bg-opacity-10 flex justify-between items-center px-3 py-4 rounded-xl">
                        <div className="truncate w-2/3">
                            {BaseUrl}/requests/{selectedAccount}
                        </div>
                        <div ref={setDivRef} className="cursor-pointer" onClick={() => {
                            navigator.clipboard.writeText(BaseUrl + "/requests/" + selectedAccount)
                            setTooltip(true)
                            setTimeout(() => {
                                setTooltip(false)
                            }, 300)
                        }}>
                            <RiFileCopyLine />
                        </div>
                    </div>
                </div>
                <Copied tooltip={tooltip} triggerRef={divRef} />
            </Modal>}
        </div>
    )
}
