import useModalSideExit from 'hooks/useModalSideExit'
import React, { useState } from 'react'
import { IContributor } from 'types/dashboard/contributors'
import { SelectAccounts, SelectBlockchain, SelectDarkMode, updateContributor } from 'redux/slices/account/remoxData';
import { useAppDispatch, useAppSelector } from 'redux/hooks';
import useContributors from "hooks/useContributors";
import { useRouter } from 'next/router';
import { removeContributor } from "redux/slices/account/remoxData";
import Modal from "components/general/modal";
import Delete from "./buttons/delete";
import Web3 from 'web3'
import { hexToNumberString } from 'web3-utils';
import { useWalletKit } from 'hooks';
import makeBlockie from "ethereum-blockies-base64";
import { generate } from 'shortid';
import zIndex from '@mui/material/styles/zIndex';
import { RiDeleteBin6Line } from 'react-icons/ri';
import EditableTextInput from 'components/general/EditableTextInput';


const teamItem = ({ props }: { props: IContributor }) => {
    const { removeTeam } = useContributors()
    const { SendTransaction, blockchain, Address } = useWalletKit()
    const accounts = useAppSelector(SelectAccounts)
    const dispatch = useAppDispatch()
    const [deleteModal, setDeleteModal] = useState(false)
    const { editTeam } = useContributors();

    const DeleteTeam = async () => {
        try {
            const address = await Address
            const account = accounts.find((account) => account.address == address)
            for (let index = 0; index < props.members.length; index++) {
                const element = props.members[index];
                if (element.taskId) {
                    const web3 = new Web3(blockchain.rpcUrl);
                    const streamId = hexToNumberString((await web3.eth.getTransactionReceipt(element.taskId)).logs[1].topics[1])
                    await SendTransaction(account!, [], {
                        cancelStreaming: true,
                        streamingIdTxHash: streamId
                    })
                }
            }
            await removeTeam(props.id)
            dispatch(removeContributor(props.id));
            setDeleteModal(false)
        } catch (error) {
            console.error(error)
        }
    }

    const onWorkstreamNameChange = async (name:string) => {
        try {
           await editTeam(props.id, name.trim());
           dispatch(updateContributor({ name: name.trim(), id: props.id }));
        } catch (error) {
           console.error(error);
        }
    }
    


    return (
        <>
            <div className="rounded-md cursor-pointer bg-white transition-all dark:bg-darkSecond hover:transition-all hover:!bg-[#f0f0f0] dark:hover:!bg-[#131313]  hover:shadow-lg px-3  shadow flex  py-2 pb-4 min-h-[12rem] items-start justify-between pl-5">
                <div className="flex flex-col justify-between w-full h-full">
                    <div className="grid grid-cols-[70%,30%] items-center w-full">
                        <div className=''>
                            <EditableTextInput fontSize={1.4} defaultValue={props?.name ?? ""} onSubmit={onWorkstreamNameChange} placeholder="Individual account name" />
                        </div>
                        <div className="flex items-center justify-end curs">
                            <RiDeleteBin6Line className='h-8 hover:text-primary transition-all ' onClick={() => setDeleteModal(true)} />
                        </div>
                    </div>
                    <div className="pl-3 w-full relative">
                        {props.members.slice(0,9).map((member, index) => {
                            return <img key={index} src={member.image ? member.image?.imageUrl : makeBlockie(member.address) } className={`absolute bottom-0 border  w-8 h-8 rounded-full`} style={{
                                left: `${index === 0 ? 0.5 : index+0.5}rem`,
                                zIndex: `${index}`
                            }} alt="" /> 
                        })}
                    </div>
                </div>
            </div>
            {deleteModal && <Modal onDisable={setDeleteModal} animatedModal={false} disableX={true} className={'!pt-2'}>
                <Delete name={`"${props.name}" team`} onCurrentModal={setDeleteModal} onDelete={DeleteTeam} />
            </Modal>}
        </>
    )
}

export default teamItem