import { Fragment, useEffect, useState } from 'react';
import { useAppSelector } from 'redux/hooks'
import Button from 'components/button';
import { SelectContributors, SelectStorage } from 'redux/slices/account/remoxData';
import AnimatedTabBar from 'components/animatedTabBar';
import { useRouter } from 'next/router';
import TeamItem from 'pages/dashboard/contributors/_components/teamItem';
import ContributorItem from 'pages/dashboard/contributors/_components/contributorItem'

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
        text: "Workstream"
    },
]

const Contributors = () => {
    const contributors = useAppSelector(SelectContributors)
    const navigate = useRouter()
    const index = (navigate.query.index as string | undefined) ? +navigate.query.index! : 0
    const [activePage, setActivePage] = useState<string>("Active");

    console.log(contributors);
    
    

    useEffect(() => {
        const datValue = data.find((item) => item.to === navigate.asPath)?.text
        setActivePage(datValue!)
    }, [])
    


    


    return <div>
        <div className="flex flex-col  pb-5 gap-10">
            <div className="flex justify-between items-center w-full">
                <div className="text-4xl font-bold">
                    Contributors
                </div>
                <div className={`pt-2 flex ${contributors.length > 0 && 'gap-5'} `}>
                    <Button className="text-xs sm:text-base !py-2 !px-6 rounded-2xl" onClick={() => navigate.push('/dashboard/contributors/add-team')}>Add Workstream</Button>
                    {contributors.length > 0 && <Button className="text-xs sm:text-base  !py-2 !px-6 rounded-2xl" onClick={() => navigate.push('/dashboard/contributors/add-member')}>Add Contributor
                    </Button>}
                </div>
            </div>
            <div className="flex justify-between items-center w-[90%] mb-5 ">
                <AnimatedTabBar data={data} index={index} className={'text-2xl'} />
            </div>
        </div>

        {index !== 4  ? 
        <table className="w-full  pt-4 pb-6">
            <thead>
                <tr id="header" className="hidden sm:grid grid-cols-[30%,30%,1fr] lg:grid-cols-[15%,13%,14%,16%,15%,20%,7%] bg-[#F2F2F2] shadow-15 py-2   dark:bg-[#2F2F2F] rounded-md ">
                    <th className="font-semibold text-left text-lg text-greylish dark:text-[#aaaaaa] pl-3">Contributor</th>
                    <th className="font-semibold text-left text-lg text-greylish dark:text-[#aaaaaa] hidden lg:block ">Workstream</th>
                    <th className="font-semibold text-left text-lg text-greylish dark:text-[#aaaaaa] ">Role</th>
                    <th className="font-semibold text-left text-lg text-greylish dark:text-[#aaaaaa] ">Amount</th>
                    <th className="font-semibold text-left text-lg text-greylish dark:text-[#aaaaaa] ">Address</th>
                    <th className="font-semibold text-left text-lg text-greylish dark:text-[#aaaaaa]">Compensation Type</th>
                </tr>
                <>
                    {index === 0 ? <>
                        {contributors.map((team) => team.members.map((member) => {

                            return <ContributorItem key={member.id} member={member} teamName={team.name} />
                        }))}
                    </>  
                     : 
                        <>
                            {contributors.map((team) => team.members.filter((member) => member.compensation === activePage).map((member) => {
                                return <ContributorItem key={member.id} member={member} teamName={team.name} />
                            }))}
                        </>
                    }
                </>
            </thead>
        </table> : 
        <div className="flex flex-wrap gap-16">
            {contributors.length > 0 ? contributors.map(team => <TeamItem props={team}/>) : <div></div> }
        </div>
        }

    </div >
}

export default Contributors;