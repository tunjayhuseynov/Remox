import useModalSideExit from 'hooks/useModalSideExit'
import React, { useState } from 'react'
import { IContributor } from 'types/dashboard/contributors'
import { SelectAccounts, SelectBlockchain, SelectDarkMode } from 'redux/slices/account/remoxData';
import { useAppDispatch, useAppSelector } from 'redux/hooks';
import useContributors from "hooks/useContributors";
import { useRouter } from 'next/router';
import { removeContributor } from "redux/slices/account/remoxData";
import Modal from "components/general/Modal";
import Delete from "./buttons/delete";
import Web3 from 'web3'
import { hexToNumberString } from 'web3-utils';
import { useWalletKit } from 'hooks';
import makeBlockie from "ethereum-blockies-base64";
import { generate } from 'shortid';


const teamItem = ({ props }: { props: IContributor }) => {
    const navigate = useRouter()
    const { removeTeam } = useContributors()
    const { SendTransaction, blockchain } = useWalletKit()
    const accounts = useAppSelector(SelectAccounts)
    const dispatch = useAppDispatch()
    const [details, setDetails] = useState(false)
    const [deleteModal, setDeleteModal] = useState(false)
    const dark = useAppSelector(SelectDarkMode)
    const [divRef, exceptRef] = useModalSideExit(details, setDetails, false)
    const [loading, setLoading] = useState(false)

    const DeleteTeam = async () => {
        try {
            setLoading(true)
            for (let index = 0; index < props.members.length; index++) {
                const element = props.members[index];
                if (element.taskId) {
                    const web3 = new Web3(blockchain.rpcUrl);
                    const streamId = hexToNumberString((await web3.eth.getTransactionReceipt(element.taskId)).logs[1].topics[1])
                    await SendTransaction(accounts[0], [], {
                        cancelStreaming: true,
                        streamingIdTxHash: streamId
                    })
                }
            }
            await removeTeam(props.id)
            dispatch(removeContributor(props.id));
            setLoading(false)
            setDeleteModal(false)
        } catch (error) {
            console.error(error)
        }
    }


    return (
        <>
            <div className=" rounded-xl bg-white transition-all dark:bg-darkSecond hover:transition-all hover:!bg-[#f0f0f0] dark:hover:!bg-[#131313]  hover:shadow-lg px-3  shadow flex  py-2 pb-4  min-w-[23.5rem] min-h-[12rem] items-start justify-between pl-5">
                <div className="flex flex-col justify-between w-full h-full">
                    <div className="flex items-start justify-between w-full">
                        <div className="font-semibold text-[1.5rem] overflow-hidden whitespace-nowrap">
                            <div className="font-bold">{props.name}</div>
                        </div>
                        <div className="flex items-end justify-end">
                            <span ref={exceptRef} onClick={() => { setDetails(!details) }} className=" text-3xl flex items-center relative cursor-pointer  font-bold"><span className="rotate-90 text-primary">...</span>
                                {details && <div ref={divRef} className="flex flex-col items- justify-start bg-white dark:bg-dark  absolute right-6 -top-16  translate-y-full rounded-lg shadow-xl z-50 ">
                                    <div className="cursor-pointer hover:bg-greylish hover:bg-opacity-5 hover:transition-all text-sm border-b border-greylish border-opacity-20 flex items-center min-w-[8rem] px-2 pr-6 py-2 gap-2" onClick={() => navigate.push(`/dashboard/contributors/edit-team?id=${props.id}&name=${props.name}`)}>
                                        <img src={`/icons/${dark ? 'edit_white' : 'edit'}.png`} className="dark:invert dark:brightness-0 w-5 h-5" alt="" /> <span>Edit</span>
                                    </div>
                                    <div className="cursor-pointer hover:bg-greylish hover:bg-opacity-5 hover:transition-all text-sm flex items-center  px-2 pr-6 w-full py-2 gap-2" onClick={() => setDeleteModal(true)}>
                                        <img src={`/icons/${dark ? 'trashicon_white' : 'trashicon'}.png`} className="dark:invert dark:brightness-0 w-5 h-5" alt="" /> <span>Delete</span>
                                    </div>
                                </div>}
                            </span>
                        </div>
                    </div>
                    <div className="pl-3 w-full relative">
                        { props.members.slice(0,9).map((member, index) => {
                            return <img src={member.image ? member.image?.imageUrl : makeBlockie(member.address) } className={`z-[${index+1}] absolute bottom-0 border left-[${index == 0 ? "0.3" : index+0.5}rem] w-8 h-8 rounded-full`} alt="" /> 
                        }) }
                        {/* <img src={makeBlockie(generate())} alt="" className={`z-[2] absolute bottom-0 border left-[1.5rem] w-8 h-8 rounded-full`} />
                        <img src={makeBlockie(generate())} alt="" className={`z-[3] absolute bottom-0 border left-[2.5rem] w-8 h-8 rounded-full`} />
                        <img src={makeBlockie(generate())} alt="" className={`z-[4] absolute bottom-0 border left-[3.5rem] w-8 h-8 rounded-full`} />
                        <img src={makeBlockie(generate())} alt="" className={`z-[5] absolute bottom-0 border left-[4.5rem] w-8 h-8 rounded-full`} />
                        <img src={makeBlockie(generate())} alt="" className={`z-[6] absolute bottom-0 border left-[5.5rem] w-8 h-8 rounded-full`} />
                        <img src={makeBlockie(generate())} alt="" className={`z-[7] absolute bottom-0 border left-[6.5rem] w-8 h-8 rounded-full`} />
                        <img src={makeBlockie(generate())} alt="" className={`z-[8] absolute bottom-0 border left-[7.5rem] w-8 h-8 rounded-full`} />
                        <img src={makeBlockie(generate())} alt="" className={`z-[9] absolute bottom-0 border left-[8.5rem] w-8 h-8 rounded-full`} />
                        <img src={makeBlockie(generate())} alt="" className={`z-[10] absolute bottom-0 border left-[9.5rem] w-8 h-8 rounded-full`} />
                        <img src={makeBlockie(generate())} alt="" className={`z-[10] absolute bottom-0 border left-[9.5rem] w-8 h-8 rounded-full`} /> */}
                    </div>
                </div>
            </div>
            {deleteModal && <Modal onDisable={setDeleteModal} animatedModal={false} disableX={true} className={'!pt-2'}>
                <Delete name={props.name} onCurrentModal={setDeleteModal} onDelete={DeleteTeam} />
            </Modal>}
        </>
    )
}

export default teamItem