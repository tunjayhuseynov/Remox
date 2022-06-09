import { useState } from 'react'
import Button from 'components/button';
import Modal from 'components/general/modal';
import { RiFileCopyLine } from 'react-icons/ri'
import { BsShare } from 'react-icons/bs'
import Copied from "components/copied";
import { useSelector } from 'react-redux';
import { SelectSelectedAccount } from 'redux/reducers/selectedAccount';
import { BaseUrl } from 'utils/const';
import AnimatedTabBar from 'components/animatedTabBar';
import DynamicRequest from 'subpages/dashboard/requests/dynamicRequests';
import { useRouter } from 'next/router';

export default function RequestLayout() {
    const [modalVisibility, setModalVisible] = useState(false)
    const [tooltip, setTooltip] = useState(false);
    const [divRef, setDivRef] = useState<HTMLDivElement | null>(null)
    const selectedAccount = useSelector(SelectSelectedAccount)
    const { type } = useRouter().query as { type: string[] | undefined }

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

    return (
        <div className="flex flex-col space-y-5">
            <div className="flex justify-between pb-6 ">
                <div className="text-4xl font-bold tracking-wider">Requests</div>
                <div>
                    <Button className="!py-1 px-4 rounded-xl  font-semibold tracking-wider flex items-center" onClick={() => setModalVisible(true)}> Share Request Link    </Button>
                </div>
            </div>
            <div className="flex  w-[83%] justify-between">
                <AnimatedTabBar data={data} className={'!text-2xl'} />
            </div>
            <div className=" py-5">
                <DynamicRequest type={type?.[0] === "approved" ? "approved" : type?.[0] === "rejected" ? "rejected" : "pending"} />
            </div>
            {modalVisibility && <Modal onDisable={setModalVisible} className={'!py-8 !pt-1'}>
                <div className="flex flex-col space-y-5 items-center">
                    <div className="text-xl font-semibold tracking-wider pt-12 py-1">
                        Invite Link
                    </div>
                    <div className="tracking-wide">
                        Share this link with your community contributors
                    </div>
                    <div className="bg-greylish bg-opacity-10 flex justify-between items-center   w-1/2 rounded-xl">
                        <div className="truncate w-3/4 py-2 pl-1">
                            {BaseUrl}/requests/{selectedAccount}
                        </div>
                        <div ref={setDivRef}>
                        <Button  className="!py-1 px-2   tracking-wider flex items-center"onClick={() => {
                            navigator.clipboard.writeText(BaseUrl + "/requests/" + selectedAccount)
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
