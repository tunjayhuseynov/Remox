import { useEffect, useMemo, useState } from "react";
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { motion, AnimatePresence } from "framer-motion"
import { useModalSideExit } from "hooks";
import { SelectAccounts, SelectBlockchain, SelectCumlativeTxs, SelectIndividual } from "redux/slices/account/selector";
import { useRouter } from "next/router";
import _ from "lodash";
import { UpdateSeemTimeThunk } from "redux/slices/account/thunks/profile";
import { AiFillRightCircle } from "react-icons/ai";
import NotificationItem from "./NotificationItem";
import { useInView } from "react-intersection-observer";


const NotificationCointainer = () => {
    const SCROLL_LIMIT = 10;
    const [limit, setLimit] = useState<number>(SCROLL_LIMIT);

    const list = useAppSelector(SelectCumlativeTxs)

    const [openNotify, setNotify] = useState(false)
    const navigate = useRouter()

    const accounts = useAppSelector(SelectAccounts);
    const addresses = useMemo(() => accounts.map(a => a.address.toLowerCase()), [accounts]);
    const dispatch = useAppDispatch()
    const individual = useAppSelector(SelectIndividual)
    const seenTime = individual?.seenTime ?? 0
    const [lastSeenTime] = useState(seenTime)
    const blockchain = useAppSelector(SelectBlockchain)

    useEffect(() => {
        if (openNotify) {
            dispatch(UpdateSeemTimeThunk({
                time: new Date().getTime(),
                userId: individual?.id ?? ""
            }))
        }
    }, [openNotify])

    const { ref, inView, entry } = useInView();

    useEffect(() => {
        if (inView) setLimit(limit + SCROLL_LIMIT)
    }, [inView])


    const [divRef, exceptRef] = useModalSideExit(openNotify, setNotify, false)


    return <>
        <div ref={exceptRef} onClick={() => { setNotify(!openNotify) }} className="relative">
            <NotificationsNoneOutlinedIcon sx={{ fontSize: 22 }} className={openNotify ? "text-primary cursor-pointer" : "cursor-pointer transition hover:text-primary hover:transition text-greylish"} />
            {list && new Date(individual?.seenTime ?? 0) < new Date((list && list.length > 0 ? list[0]?.timestamp : 0) * 1e3) && <div className="absolute w-[0.625rem] h-[0.625rem] bg-primary rounded-full -top-1 -right-1">

            </div>}
        </div>
        <AnimatePresence>
            {openNotify && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} ref={divRef} className='absolute bg-white dark:bg-darkSecond w-[32rem]  rounded-md sm:-right-0 -bottom-7 translate-y-full shadow-15 z-50'>
                <div className="flex flex-col  w-full h-full">
                    <div className="border-b dark:border-greylish py-5 text-lg font-semibold px-5">Notifications</div>
                    <div className="flex flex-col p-2 overflow-hidden overflow-y-auto max-h-[25rem]">
                        {list?.slice(0, limit).map((item, index) => {
                            const params: { ref?: any } = {}
                            if (index === limit - 1) {
                                params.ref = ref
                            }
                            return <NotificationItem key={index} setNotify={setNotify} item={item} index={index} addresses={addresses} blockchain={blockchain} lastSeenTime={lastSeenTime} {...params} />
                        })}
                        {list.length === 0 && <div className="text-center py-1">No notification yet</div>}
                    </div>
                    <div
                        className="border-t dark:border-greylish flex space-x-2 items-center justify-center py-5 text-sm font-semibold cursor-pointer text-primary hover:bg-light dark:hover:bg-dark"
                        onClick={() => navigate.push('/dashboard/transactions')}>
                        <span>View All</span>
                        <AiFillRightCircle color="#FF7348" />
                    </div>
                </div>
            </motion.div>
            }
        </AnimatePresence>
    </>
}

export default NotificationCointainer;
