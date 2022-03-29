import { Fragment, useEffect, useState, useRef } from 'react';
import TeamContainer from 'subpages/dashboard/contributors/teamContainer'
import Modal from 'components/general/modal'
import AddTeams from 'subpages/dashboard/contributors/buttons/addTeam'
import AddMemberModal from 'subpages/dashboard/contributors/buttons/addMember'
import { ClipLoader } from 'react-spinners';
import { generate } from 'shortid';
import Success from 'components/general/success';
import { useAppSelector, useAppDispatch } from 'redux/hooks'
import { changeError, changeSuccess, selectError, selectSuccess } from 'redux/reducers/notificationSlice'
import Error from 'components/general/error';
import Button from 'components/button';
import { selectContributors } from 'redux/reducers/contributors';


const Contributors = () => {

    const contributors = useAppSelector(selectContributors).contributors
    const isContributorFetched = useAppSelector(selectContributors).isFetched
    const isSuccess = useAppSelector(selectSuccess)
    const isError = useAppSelector(selectError)
    const dispatch = useAppDispatch()

    const [addTeamModal, setAddTeamModal] = useState(false)
    const [addMemberModal, setAddMemberModal] = useState(false)

    return <div>
        <div className="flex sm:justify-between pb-5 space-x-3 md:space-x-0 ">
            <div className="grid grid-cols-2 md:grid-cols-3 sm:gap-10 gap-1 col-span-4">
                <Button className="text-xs sm:text-base !py-2 !px-6" onClick={() => setAddTeamModal(true)}>Add Team</Button>
                <Button className="text-xs sm:text-base !py-2 !px-6" onClick={() => setAddMemberModal(true)}>Add Person</Button>
            </div>
            {/* <button className="px-5 py-2 bg-greylish bg-opacity-5 rounded-xl">
                Export
            </button> */}
        </div>
        <div className="w-full shadow-custom px-5 pt-4 pb-6 rounded-xl bg-white dark:bg-darkSecond">
            <div id="header" className="hidden sm:grid grid-cols-[30%,30%,1fr] lg:grid-cols-[20%,20%,20%,1fr] rounded-xl bg-light  dark:bg-dark  sm:mb-5 px-5" >
                <div className="font-normal py-3">Name</div>
                <div className="font-normal py-3 hidden lg:block">Team</div>
                <div className="font-normal py-3">Amount</div>
                <div className="font-normal py-3">Wallet Address</div>
            </div>
            <div>
                {contributors.map(w => w && w.members && w.members.length > 0 ? <Fragment key={generate()}><TeamContainer {...w} /></Fragment> : undefined)}
                {contributors.map(w => w && (!w?.members || w?.members?.length === 0) ? <Fragment key={generate()}><TeamContainer {...w} /></Fragment> : undefined)}

                {contributors.length === 0 && isContributorFetched && <div className="flex justify-center py-10">No Contributors Yet</div>}
                {!isContributorFetched && <div className="flex justify-center py-10"><ClipLoader /></div>}
            </div>
        </div>
        {addTeamModal &&
            <Modal onDisable={setAddTeamModal}>
                <AddTeams onDisable={setAddTeamModal} />
            </Modal>}
        {addMemberModal &&
            <Modal onDisable={setAddMemberModal}>
                <AddMemberModal onDisable={setAddMemberModal} />
            </Modal>}
    </div>
}

export default Contributors;