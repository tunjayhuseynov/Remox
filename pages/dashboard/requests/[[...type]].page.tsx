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
    const router = useRouter();
    const index = router.asPath;
    const { type } = router.query as { type: string[] | undefined, index: string | undefined }

    const data = [
        {
            to: "/dashboard/requests",
            text: "Pending Requests",
        },
        {
            to: "/dashboard/requests/approved",
            text: "Approved Requests"
        },
        {
            to: "/dashboard/requests/rejected",
            text: "Rejected Requests"
        }
    ]

    const link = BASE_URL + "/requests/?" + `id=${storage!.signType === "individual" ? `${storage!.individual.id}` : `${storage!.organization!.id}`}&coin=${selectedBlockchain.name}&signer=${storage?.signType}`

    let Index = index?.includes("rejected") ? 2 : index?.includes("approved") ? 1 : 0

    return (
        <div className="flex flex-col space-y-5 h-full">
            <div className="flex justify-between pb-6 ">
                <div className="text-4xl font-bold tracking-wider">Requests</div>
                <div>
                    <Button className="mt-1 !py-2 px-4 rounded-xl  font-semibold tracking-wider flex items-center" onClick={() => setModalVisible(true)}> Share Request Link    </Button>
                </div>
            </div>
            <div className="flex  w-[83%] justify-between">
                <AnimatedTabBar data={data} index={Index} className={'!text-2xl'} />
            </div>
            <div className=" py-5 h-full">
                <DynamicRequest type={Index === 1 ? "approved" : Index === 2 ? "rejected" : "pending"} />
            </div>
            {modalVisibility && <Modal onDisable={setModalVisible} animatedModal={false} className={'!py-8 !pt-1'}>
                <div className="flex flex-col space-y-5 items-center">
                    <div className="text-xl font-semibold tracking-wider pt-12 py-1">
                        Invite Link
                    </div>
                    <div className="tracking-wide">
                        Share this link with your community contributors
                    </div>
                    <div className="bg-greylish bg-opacity-10 flex justify-between items-center   w-1/2 rounded-xl">
                        <div className="truncate w-3/4 py-2 pl-1">
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