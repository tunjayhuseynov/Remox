import { Fragment, useState } from 'react';
import TeamContainer from 'subpages/dashboard/contributors/teamContainer'
import Modal from 'components/general/modal'
import AddTeams from 'subpages/dashboard/contributors/buttons/addTeam'
import AddMemberModal from 'subpages/dashboard/contributors/buttons/addMember'
import { generate } from 'shortid';
import { useAppSelector, useAppDispatch } from 'redux/hooks'
import { selectError, selectSuccess } from 'redux/reducers/notificationSlice'
import Button from 'components/button';
import { selectContributors } from 'redux/reducers/contributors';
import Loader from 'components/Loader';
import { motion, AnimateSharedLayout } from "framer-motion";


const Contributors = () => {

    const contributors = useAppSelector(selectContributors).contributors
    const isContributorFetched = useAppSelector(selectContributors).isFetched
    const isSuccess = useAppSelector(selectSuccess)
    const isError = useAppSelector(selectError)
    const dispatch = useAppDispatch()

    const [addTeamModal, setAddTeamModal] = useState(false)
    const [addMemberModal, setAddMemberModal] = useState(false)
    const [editModal, setEditModal] = useState(false)
    const [deleteModal, setDeleteModal] = useState(false)
    const [selected, setSelected] = useState(0);
    const [selectbar, setSelectbar] = useState("Active");

    const data = [
        {
            text: "Active"
        },
        {
            text: "Full Time"
        },
        {
            text: "Part Time"
        },
        {
            text: "Bounty"
        },
        {
            text: "Team"
        },
    ]
    return <div>
        <div className="flex flex-col  pb-5 gap-10">
            <div className="flex justify-between items-center w-full">
                <div className="text-3xl font-bold">
                    Contributors
                </div>
                {selectbar === "Team" ? <Button className="text-xs sm:text-base !py-1 !px-6 rounded-2xl" onClick={() => setAddTeamModal(true)}>Add Team</Button> : <Button className="text-xs sm:text-base !py-1 !px-6 rounded-2xl" onClick={() => setAddMemberModal(true)}>Add People</Button>}
            </div>
            {/* <button className="px-5 py-2 bg-greylish bg-opacity-5 rounded-xl">
                Export
            </button> */}
            <div className="flex justify-between items-center w-[90%] mb-5 ">
                {data.map((item, i) => {
                    return <div key={i} onClick={() => { setSelectbar(item.text) }}> <motion.div className={`tiflex gap-x-3   cursor-pointer pb-3 font-semibold tracking-widertle relative ${i === selected ? "selected text-primary" : "dark:text-white"}`} onClick={() => setSelected(i)} >

                        <span className={`relative text-2xl text-greylish transition-all hover:!text-primary hover:transition-all ${i === selected ? "text-primary" : "text-greylish dark:text-white"}`}>
                            {i === selected && (<motion.span className="absolute w-full h-[3px] bg-primary rounded-[2px] bottom-[-0.625rem]" layoutId="underline" />)}
                            {item.text} </span>
                    </motion.div></div>
                })}
            </div>
        </div>

        {selectbar !== "Team" ? <div className="w-full shadow-custom px-5 pt-4 pb-6 rounded-xl bg-white dark:bg-darkSecond">
            <div id="header" className="hidden sm:grid grid-cols-[30%,30%,1fr] lg:grid-cols-[17%,15%,19%,19%,17%,23%] rounded-xl bg-light  dark:bg-dark  sm:mb-5 px-5" >
                <div className="font-semibold py-3">Name</div>
                <div className="font-semibold py-3 hidden lg:block">Team</div>
                <div className="font-semibold py-3">Role</div>
                <div className="font-semibold py-3">Amount</div>
                <div className="font-semibold py-3">Address</div>
                <div className="font-semibold py-3">Compensation Type</div>
            </div>
            <div>
                {contributors.map(w => w && w.members && w.members.length > 0 ? <Fragment key={generate()}><TeamContainer {...w} selectbar={selectbar} /></Fragment> : undefined)}
                {contributors.map(w => w && (!w?.members || w?.members?.length === 0) ? <Fragment key={generate()}><TeamContainer {...w} selectbar={selectbar} /></Fragment> : undefined)}
                {contributors.length === 0 && isContributorFetched && <div className="flex justify-center py-10">No Contributors Yet</div>}
                {!isContributorFetched && <div className="flex justify-center py-10"><Loader /></div>}
            </div>
        </div> : <div className="flex gap-16">
            {contributors.map(w => w && w.members && w.members.length > 0 ? <Fragment key={generate()}><TeamContainer {...w} selectbar={selectbar} /></Fragment> : undefined)}
            {contributors.map(w => w && (!w?.members || w?.members?.length === 0) ? <Fragment key={generate()}><TeamContainer {...w} selectbar={selectbar} /></Fragment> : undefined)}
        </div>}
        {addTeamModal &&
            <Modal onDisable={setAddTeamModal} disableX={true} className={'!pt-1'}  >
                <AddTeams onDisable={setAddTeamModal} />
            </Modal>}
        {addMemberModal &&
            <Modal onDisable={setAddMemberModal} disableX={true} className={'!pt-1'}>
                <AddMemberModal onDisable={setAddMemberModal} />
            </Modal>}

    </div>
}

export default Contributors;