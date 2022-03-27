import { Fragment, useState } from 'react';
import { useAppSelector } from 'redux/hooks'
import { selectContributors } from 'redux/reducers/contributors';
import { ExecutionType, IMember } from 'API/useContributors';
import AddStopModal from 'subpages/dashboard/automations/buttons/addStop';
import Modal from 'components/general/modal';
import TeamContainer from 'subpages/dashboard/automations/teamContainer'


const Automations = () => {

    const teams = useAppSelector(selectContributors).contributors.map(s => ({ ...s, members: s.members.filter(m => m.execution === ExecutionType.auto && m.taskId) }))
    const [addStopModal, setAddStopModal] = useState(false)

    const memberState = useState<IMember[]>([])


    return <div className="flex flex-col space-y-3">
        <div className="text-2xl font-bold pl-10 pb-4">
            Active Automations
        </div>
        <div className="px-10 pb-2 pt-2">
            <div className='flex flex-col space-y-3'>
                <div className="flex justify-between py-2">
                    <div className="flex items-center">
                        <span className="bg-primary rounded-full w-[0.625rem] h-[0.625rem] "></span>
                        <p className="tracking-wider text-gray-500 text-lg ml-2">Selected {memberState[0].length} out of {teams.reduce((a, c) => a + c.members.length, 0)} automations</p>

                    </div>
                    {
                        memberState[0].length > 0 && <div className="flex">
                            <img src="/icons/trashicon.svg" width="0.938rem" height="0.938rem" alt="" />
                            <button className="text-blue-500 tracking-wider hover text-lg ml-2" onClick={() => setAddStopModal(true)}>Stop Automations</button>
                        </div>
                    }
                </div>
            </div>
        </div>
        <div className="px-3 py-5 shadow-custom">
            <div id="header" className="hidden sm:grid grid-cols-[30%,30%,1fr] lg:grid-cols-[3%,17%,20%,20%,40%,1fr] border-b border-black sm:pb-5 px-5" >
                <input type="checkbox" className="self-center cursor-pointer w-[1.125rem] h-[1.125rem] checked:before:w-full checked:before:h-full checked:before:bg-primary checked:before:block" onChange={(e) => {
                    if (e.target.checked) {
                        memberState[1](teams.reduce<IMember[]>((a, c) => a.concat(c.members), []))
                    } else {
                        memberState[1]([])
                    }
                }} />
                <div className="font-normal">Name</div>
                <div className="font-normal hidden lg:block">Amount</div>
                <div className="font-normal">Frequency</div>
                <div className="font-normal">Next Payment</div>
            </div>
            <div className="w-full  pt-4 pb-6 rounded-xl">
                <div>
                    {teams.map(w => w && w.members && w.members.filter(s => s.taskId).length > 0 ? <Fragment key={w.id}><TeamContainer {...w} memberState={memberState} /></Fragment> : undefined)}
                </div>
                {teams.length === 0 && <div className="text-center text-gray-500 text-lg">No automations found</div>}
            </div>
        </div>
        {addStopModal &&
            <Modal onDisable={setAddStopModal} className='!min-w-[75vw]'>
                <AddStopModal onDisable={setAddStopModal} memberState={memberState[0]} />
            </Modal>}
    </div>
}

export default Automations;