import { Fragment } from 'react';
import TeamContainer from 'pages/dashboard/contributors/_components/teamContainer'
import { generate } from 'shortid';
import { useAppSelector } from 'redux/hooks'
import Button from 'components/button';
import { SelectContributors, SelectStorage } from 'redux/slices/account/remoxData';
import AnimatedTabBar from 'components/animatedTabBar';
import { useRouter } from 'next/router';
import useCurrency from "rpcHooks/useCurrency";
import { Blockchains } from 'types/blockchains';




const Contributors = () => {
    const contributors = useAppSelector(SelectContributors)
    const navigate = useRouter()
    const index = (navigate.query.index as string | undefined) ? +navigate.query.index! : 0


    const data = [
        {
            to: "/dashboard/contributors",
            text: "Active"
        },
        {
            to: "/dashboard/contributors?index=1",
            text: "Full Time"
        },
        {
            to: "/dashboard/contributors?index=2",
            text: "Part Time"
        },
        {
            to: "/dashboard/contributors?index=3",
            text: "Bounty"
        },
        {
            to: "/dashboard/contributors?index=4",
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
                    <Button className="text-xs sm:text-base !py-2 !px-6 rounded-2xl" onClick={() => navigate.push('/dashboard/contributors/add-team')}>Add Team</Button>
                    {contributors.length > 0 && <Button className="text-xs sm:text-base  !py-2 !px-6 rounded-2xl" onClick={() => navigate.push('/dashboard/contributors/add-member')}>Add People</Button>}
                </div>
            </div>
            <div className="flex justify-between items-center w-[90%] mb-5 ">
                <AnimatedTabBar data={data} index={index} className={'text-2xl'} />
            </div>
        </div>

        {index !== 4 && contributors.filter(w => w.members && w.members.length > 0) ? 
        <table className="w-full  pt-4 pb-6">
            <thead>
                <tr id="header" className="hidden sm:grid grid-cols-[30%,30%,1fr] lg:grid-cols-[19%,13%,16%,18%,15%,29%] bg-[#F2F2F2] shadow-15 py-2   dark:bg-[#2F2F2F] rounded-md ">
                    <th className="font-semibold text-left text-lg text-greylish dark:text-[#aaaaaa] pl-3">Contributor</th>
                    <th className="font-semibold text-left text-lg text-greylish dark:text-[#aaaaaa] hidden lg:block ">Team</th>
                    <th className="font-semibold text-left text-lg text-greylish dark:text-[#aaaaaa] ">Role</th>
                    <th className="font-semibold text-left text-lg text-greylish dark:text-[#aaaaaa] ">Amount</th>
                    <th className="font-semibold text-left text-lg text-greylish dark:text-[#aaaaaa] ">Address</th>
                    <th className="font-semibold text-left text-lg text-greylish dark:text-[#aaaaaa]">Compensation Type</th>
                </tr>
                <div>
                    {contributors.filter((w) =>  w.members && w.members.length > 0).map((w) => <TeamContainer {...w} index={index} key={w.id} />)}
                    {/* {contributors.map(w => w && w.members && w.members.length > 0 ? <Fragment key={w.id}><TeamContainer {...w} index={index} /></Fragment> : undefined)} */}
                    {/* {contributors.map(w => w && (!w?.members || w?.members?.length === 0) ? <Fragment key={w.id}><TeamContainer {...w} index={index} /></Fragment> : undefined)} */}
                    {/* {contributors.filter(w => w.members && w.members.length === 0) && <div className="w-full h-[70%] flex flex-col  items-center justify-center gap-6">
                        <img src="/icons/noData.png" alt="" className="w-[10rem] h-[10rem]" />
                        <div className="text-greylish font-bold dark:text-white text-2xl">No Data</div>
                    </div>} */}
                </div>
            </thead>
        </table> : 
        <div className="flex flex-wrap gap-16">
            {contributors.map(w => w && w.members && w.members.length > 0 ? <Fragment key={generate()}><TeamContainer {...w} index={index} /></Fragment> : undefined)}
            {contributors.map(w => w && (!w?.members || w?.members?.length === 0) ? <Fragment key={generate()}><TeamContainer {...w} index={index} /></Fragment> : undefined)}
        </div>
        }

    </div >
}

export default Contributors;