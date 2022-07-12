import { Fragment, useState } from 'react';
import TeamContainer from 'subpages/dashboard/contributors/teamContainer'
import Modal from 'components/general/modal'
import { generate } from 'shortid';
import { useAppSelector, useAppDispatch } from 'redux/hooks'
import { selectError, selectSuccess } from 'redux/slices/notificationSlice'
import Button from 'components/button';
import { selectContributors } from 'redux/slices/account/contributors';
import { motion, AnimateSharedLayout } from "framer-motion";
import { SelectContributors, SelectStorage } from 'redux/slices/account/remoxData';
import AnimatedTabBar from 'components/animatedTabBar';
import { useRouter } from 'next/router';



const Contributors = () => {
    const contributors = useAppSelector(SelectContributors)



    const isContributorFetched = useAppSelector(selectContributors).isFetched
    const isSuccess = useAppSelector(selectSuccess)
    const isError = useAppSelector(selectError)
    const dispatch = useAppDispatch()
    const [addTeamModal, setAddTeamModal] = useState(false)
    const [addMemberModal, setAddMemberModal] = useState(false)
    const navigate = useRouter()
    const index = (navigate.query.index as string | undefined) ? +navigate.query.index! : 0


    const data = [
        {
            to: "/dashboard/contributors",
            text: "Active"
        },
        {
            to: "/dashboard/contributors?index=1&secondAnimation=true",
            text: "Full Time"
        },
        {
            to: "/dashboard/contributors?index=2&secondAnimation=true",
            text: "Part Time"
        },
        {
            to: "/dashboard/contributors?index=3&secondAnimation=true",
            text: "Bounty"
        },
        {
            to: "/dashboard/contributors?index=4&secondAnimation=true",
            text: "Team"
        },
    ]
    return <div>
        <div className="flex flex-col  pb-5 gap-10">
            <div className="flex justify-between items-center w-full">
                <div className="text-4xl font-bold">
                    Contributors
                </div>
                <div className={`pt-2 flex ${contributors.length > 0 && 'gap-5'} `}>
                    <Button className="text-xs sm:text-base !py-2 !px-6 rounded-2xl" onClick={() => navigate.push('/dashboard/add-team?secondAnimation=true')}>Add Team</Button>
                    {contributors.length > 0 && <Button className="text-xs sm:text-base  !py-2 !px-6 rounded-2xl" onClick={() => navigate.push('/dashboard/add-member?secondAnimation=true')}>Add People</Button>}
                </div>
            </div>
            {/* <button className="px-5 py-2 bg-greylish bg-opacity-5 rounded-xl">
                Export
            </button> */}
            <div className="flex justify-between items-center w-[90%] mb-5 ">
                <AnimatedTabBar data={data} index={index} className={'text-2xl'} />
            </div>
        </div>

        {index !== 4 ? <div className="w-full  pt-4 pb-6">
            <div id="header" className="hidden sm:grid grid-cols-[30%,30%,1fr] lg:grid-cols-[17%,15%,19%,19%,17%,23%] rounded-xl bg-light  dark:bg-dark  sm:mb-5 pl-10">
                <div className="font-semibold py-3">Name</div>
                <div className="font-semibold py-3 hidden lg:block">Team</div>
                <div className="font-semibold py-3">Role</div>
                <div className="font-semibold py-3">Amount</div>
                <div className="font-semibold py-3">Address</div>
                <div className="font-semibold py-3">Compensation Type</div>
            </div>
            <div>
                {contributors.map(w => w && w.members && w.members.length > 0 ? <Fragment key={w.id}><TeamContainer {...w}  index={index}/></Fragment> : undefined)}
                {contributors.map(w => w && (!w?.members || w?.members?.length === 0) ? <Fragment key={w.id}><TeamContainer {...w} index={index} /></Fragment> : undefined)}
                {contributors.length === 0 && isContributorFetched && <div className="w-full h-[70%] flex flex-col  items-center justify-center gap-6">
                    <img src="/icons/noData.png" alt="" className="w-[10rem] h-[10rem]" />
                    <div className="text-greylish font-bold dark:text-white text-2xl">No Data</div>
                </div>}
            </div>
        </div> : <div className="flex flex-wrap gap-16">
            {contributors.map(w => w && w.members && w.members.length > 0 ? <Fragment key={generate()}><TeamContainer {...w} index={index} /></Fragment> : undefined)}
            {contributors.map(w => w && (!w?.members || w?.members?.length === 0) ? <Fragment key={generate()}><TeamContainer {...w} index={index} /></Fragment> : undefined)}
        </div>

        }






    </div >
}

export default Contributors;