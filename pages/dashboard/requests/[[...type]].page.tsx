import { useState } from 'react'
import Button from 'components/button';
import Modal from 'components/general/modal';
import Copied from "components/copied";
import AnimatedTabBar from 'components/animatedTabBar';
import { useRouter } from 'next/router';
import { BASE_URL } from 'utils/api';
import { useAppSelector } from 'redux/hooks';
import { SelectBlockchain, SelectStorage } from 'redux/slices/account/remoxData';
import DynamicRequest from './_components/dynamicRequests';

export default function RequestLayout() {
    const [modalVisibility, setModalVisible] = useState(false)
    const [tooltip, setTooltip] = useState(false);
    const [divRef, setDivRef] = useState<HTMLDivElement | null>(null)
    const selectedBlockchain = useAppSelector(SelectBlockchain)
    const storage = useAppSelector(SelectStorage);
    const { type } = useRouter().query as { type: string[] | undefined }

    const data = [
        {
            to: "/dashboard/requests?noAnimation=true",
            text: "Pending Requests",
        },
        {
            to: "/dashboard/requests/approved?noAnimation=true",
            text: "Approved Requests"
        },
        {
            to: "/dashboard/requests/rejected?noAnimation=true",
            text: "Rejected Requests"
        }
    ]

    const navigate = useRouter()
    const index = navigate.asPath.includes("approved") ? 1 : navigate.asPath.includes("rejected") ? 2 : 0
    const link = BASE_URL + "/requests/?" + `id=${storage!.signType === "individual" ? `${storage!.individual.id}` : `${storage!.organization!.id}`}&coin=${selectedBlockchain.name}&signer=${storage?.signType}`

    return (
        <div className="flex flex-col space-y-5 h-full">
        <div className="flex justify-between pb-8 pt-8 ">
            <div className="text-3xl font-semibold tracking-wider">Requests</div>
            <div>
                <Button className="mt-1 !py-[.5rem] !font-medium !text-lg !px-3 min-w-[9.1rem]  flex items-center" onClick={() => setModalVisible(true)}> Share Request Link    </Button>
            </div>
        </div>
        <div className="flex  w-[70%] justify-between !mt-1">
            <AnimatedTabBar data={data} index={index} className={'!text-lg'} />
        </div>
        <div className=" pb-5 h-full">
            <DynamicRequest type={type?.[0] === "approved" ? "approved" : type?.[0] === "rejected" ? "rejected" : "pending"} />
        </div>
        {modalVisibility && <Modal onDisable={setModalVisible} animatedModal={false} className={'!py-4 !pt-3 !px-2 !w-[35%]'}>
            <div className="flex flex-col space-y-5 items-center">
                <div className="text-xl font-bold  pt-8 py-1">
                    Invite Link
                </div>
                <div className="tracking-wide text-greylish">
                    Share this link with your community contributors
                </div>
                <div className="bg-greylish bg-opacity-10 flex justify-between items-center   w-[60%] rounded-xl">
                    <div className="truncate w-full font-semibold py-2 px-2">
                        {link}
                    </div>
                    <div ref={setDivRef}>
                        <Button className="!py-1 px-2   tracking-wider flex items-center" onClick={() => {
                            navigator.clipboard.writeText(link)
                            setTooltip(true)
                            setTimeout(() => {
                                setTooltip(false)
                            }, 300)
                        }}>

                            Copy
                        </Button>
                    </div>
                </div>
            </div>
            <Copied tooltip={tooltip} triggerRef={divRef} />
        </Modal>}
    </div>
    )
}
