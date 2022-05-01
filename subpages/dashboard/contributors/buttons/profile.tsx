import { Dispatch } from "react";
import Avatar from 'components/avatar'
import Button from "components/button";
import { IMember } from "API/useContributors";
import { useNavigate } from "react-router-dom";
import { useWalletKit } from "hooks";

const Profile = (props: IMember & { teamName: string, onDeleteModal: Dispatch<boolean>, onCurrentModal: Dispatch<boolean>, onEditModal: Dispatch<boolean>, member: IMember }) => {
    const navigate = useNavigate()
    const { GetCoins } = useWalletKit()
    return <>
        <div>
            <div className="text-xl font-bold pb-3">
                Personal Details
            </div>
            <div className="grid grid-cols-2 gap-y-10">
                <div className="flex flex-col space-y-3">
                    <div className="font-bold">Name</div>
                    <div>
                        <div className="flex space-x-2 items-center">
                            <Avatar name={props.name} />
                            <div>
                                {props.name}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col space-y-3">
                    <div className="font-bold">Team</div>
                    <div>
                        <div className="flex space-x-2 items-center">
                            <div>
                                {props.teamName}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col space-y-3">
                    <div className="font-bold">Pay Amount</div>
                    <div className="flex flex-col space-y-3">
                        <div className="flex space-x-2 items-center">
                            <div>
                                {props.amount}
                            </div>
                            <div>
                                <img width="20" height="20" src={GetCoins[props.currency].coinUrl} alt="" className="rounded-full" />
                            </div>
                        </div>
                        {props.secondaryCurrency && <div className="flex space-x-2 items-center">
                            <div>
                                {props.secondaryAmount}
                            </div>
                            <div>
                                <img width="20" height="20" src={GetCoins[props.secondaryCurrency].coinUrl} alt="" className="rounded-full" />
                            </div>
                        </div>}
                    </div>
                </div>
                <div className="flex flex-col space-y-3">
                    <div className="font-bold">Wallet Address</div>
                    <div>
                        <div className="flex space-x-2 items-center">
                            <div className="text-xs">
                                {props.address}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-center items-center pt-10">
                <div className="grid grid-cols-2 gap-y-3 gap-x-5 justify-center">
                    <div className="col-span-2">
                        <Button className="px-6 py-3 w-full" onClick={() => navigate({ pathname: '/dashboard/masspayout' }, { state: { memberList: [props.member] } })}>
                            Pay Now
                        </Button>
                    </div>
                    <div>
                        <Button className="w-full px-6 py-3" onClick={() => {
                            props.onEditModal(true)
                            props.onCurrentModal(false)
                        }}>
                            Edit
                        </Button>
                    </div>
                    <div>
                        <Button version="second" className="w-full px-6 py-3" onClick={() => {
                            props.onDeleteModal(true)
                            props.onCurrentModal(false)
                        }}>
                            Delete
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </>
}

export default Profile;