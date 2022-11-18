import { useState } from 'react'
import Button from 'components/button';
import Modal from 'components/general/modal';
import Copied from "components/copied";
import AnimatedTabBar from 'components/animatedTabBar';
import { useRouter } from 'next/router';
import { BASE_URL } from 'utils/api';
import { useAppSelector } from 'redux/hooks';
import { SelectBlockchain, SelectRequests, SelectStorage } from 'redux/slices/account/remoxData';
import DynamicRequest from './_components/dynamicRequests';
import { Blockchains } from 'types/blockchains';
import Dropdown from 'components/general/dropdown';

export default function RequestLayout() {
    const [modalVisibility, setModalVisible] = useState(false)
    const [tooltip, setTooltip] = useState(false);
    const [divRef, setDivRef] = useState<HTMLDivElement | null>(null)
    const storage = useAppSelector(SelectStorage);
    const requests = useAppSelector(SelectRequests);
    const { type } = useRouter().query as { type: string[] | undefined }
    const [selectedBlockchain, setSelectedBlockchain] = useState<typeof Blockchains[0]>(Blockchains[0])


    const data = [
        {
            to: "/dashboard/requests?noAnimation=true",
            text: "Pending Requests",
            count: requests.pendingRequests.length.toString()
        },
        {
            to: "/dashboard/requests/approved?noAnimation=true",
            text: "Approved Requests",
            count: requests.approvedRequests.length.toString()
        },
        {
            to: "/dashboard/requests/rejected?noAnimation=true",
            text: "Rejected Requests",
            count: requests.rejectedRequests.length.toString()
        }
    ]

    const navigate = useRouter()
    const index = navigate.asPath.includes("approved") ? 1 : navigate.asPath.includes("rejected") ? 2 : 0
    const link = BASE_URL + "/requests/?" + `id=${storage!.signType === "individual" ? `${storage!.individual.id}` : `${storage!.organization!.id}`}&coin=${selectedBlockchain.name}&signer=${storage?.signType}`

    return (
        <div className="flex flex-col space-y-5 h-full">
            <div className="flex justify-between pb-8 ">
                <div className="text-2xl font-semibold tracking-wider">Requests</div>
                <Button className="!font-semibold !text-sm flex items-center justify-center py-2 cursor-pointer" onClick={() => setModalVisible(true)}>Share Link </Button>
            </div>
            <div className="flex  w-[70%] justify-between !mt-1">
                <AnimatedTabBar data={data} index={index} />
            </div>
            <div className=" pb-5 h-full">
                <DynamicRequest type={type?.[0] === "approved" ? "approved" : type?.[0] === "rejected" ? "rejected" : "pending"} />
            </div>
            {modalVisibility && <Modal onDisable={setModalVisible} animatedModal={false} className={'!py-4 !pt-3 !px-2 !w-[37%]'}>
                <div className="flex flex-col space-y-5 items-center">
                    <div className="text-xl font-bold  pt-8 py-1">
                        Invite Link
                    </div>
                    <div className="tracking-wide font-semibold text-sm text-greylish font-nunito">
                        Share this link with your community contributors
                    </div>
                    <div className="w-[60%]">
                        <Dropdown
                            list={Blockchains}
                            selected={selectedBlockchain}
                            setSelect={setSelectedBlockchain}
                            className='bg-light dark:bg-darkSecond'
                            label="Network"
                        />
                    </div>
                    <div className="bg-greylish bg-opacity-10 flex justify-between items-center w-[60%] rounded-xl">
                        <div className="truncate w-full font-semibold py-2 px-2 font-nunito">
                            {link}
                        </div>
                        <div ref={setDivRef} className="pr-1">
                            <Button className="!py-[0.2rem] px-2 !rounded-xl font-semibold text-xs flex items-center bg-[#FF7348]" onClick={() => {
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
