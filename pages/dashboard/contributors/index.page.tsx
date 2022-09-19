import { Fragment, useEffect, useState } from 'react';
import { useAppSelector } from 'redux/hooks'
import Button from 'components/button';
import { SelectContributorMembers, SelectContributors, SelectDarkMode, SelectStorage } from 'redux/slices/account/remoxData';
import AnimatedTabBar from 'components/animatedTabBar';
import { useRouter } from 'next/router';
import TeamItem from 'pages/dashboard/contributors/_components/teamItem';
import ContributorItem from 'pages/dashboard/contributors/_components/contributorItem'


const Contributors = () => {
    const contributors = useAppSelector(SelectContributors)
    const isDark = useAppSelector(SelectDarkMode)
    const navigate = useRouter()
    const index = (navigate.query.index as string | undefined) ? +navigate.query.index! : 0
    const [activePage, setActivePage] = useState<string>("Active");
    const members = useAppSelector(SelectContributorMembers)

    const data = [
        {
            to: "/dashboard/contributors",
            text: "Active",
            count: members.length.toString()
        },
        {
            to: "/dashboard/contributors?index=1",
            text: "Full Time",
            count: members.filter((member) => member.compensation == "Full Time").length.toString()
        },
        {
            to: "/dashboard/contributors?index=2",
            text: "Part Time",
            count: members.filter((member) => member.compensation == "Part Time").length.toString()
        },
        {
            to: "/dashboard/contributors?index=3",
            text: "Bounty",
            count: members.filter((member) => member.compensation == "Bounty").length.toString()
        },
        {
            to: "/dashboard/contributors?index=4",
            text: "Workstream",
            count: contributors.length.toString()
        },
    ]

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
                    {/* <Button className="text-xs sm:text-base !py-2 !px-6 rounded-2xl" onClick={() => navigate.push('/dashboard/contributors/add-team')}>Add Workstream</Button>
                    {contributors.length > 0 && <Button className="text-xs sm:text-base  !py-2 !px-6 rounded-2xl" onClick={() => navigate.push('/dashboard/contributors/add-member')}>Add Contributor
                    </Button>} */}
                </div>
            </div>
            <div className="flex justify-between items-center w-[90%] mb-5 ">
                <AnimatedTabBar data={data} index={index} className={'text-2xl'} />
            </div>
        </div>

        {index !== 4  ? 
        <>
            <table className="w-full  pt-4 pb-6">
                <thead>
                    <tr id="header" className="hidden sm:grid grid-cols-[30%,30%,1fr] lg:grid-cols-[20%,13%,14%,15%,15%,16%,7%] bg-[#F2F2F2] shadow-15 py-2   dark:bg-[#2F2F2F] rounded-md ">
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
            </table> 
            {contributors.length > 0 &&
            <div className='w-full flex justify-center mt-5'>
                <span onClick={() => navigate.push('/dashboard/contributors/add-member')} className={`text-4xl round border-2 ${isDark ? "" : "border-[#CCCCCC] text-[#CCCCCC] " } px-14 py-2 cursor-pointer rounded-full`}>+</span>
            </div>}
        </> : 
        <div className="flex flex-wrap gap-16 cursor-pointer" >
            {contributors.length > 0 ? contributors.map(team => <TeamItem props={team}/>) : <div></div> }
            <div onClick={() => navigate.push('/dashboard/contributors/add-team')} className=" rounded-xl bg-white transition-all dark:bg-darkSecond hover:transition-all hover:!bg-[#f0f0f0] dark:hover:!bg-[#131313]  hover:shadow-lg px-3  shadow flex  py-2 pb-4  min-w-[23.5rem] min-h-[12rem] items-start justify-between pl-5">
                <div className="flex items-center justify-center w-full h-full">
                    <span className={`text-8xl font-light ${isDark ? "" : "text-[#CCCCCC]"}`}>+</span>
                </div>
            </div>
        </div>
        }

    </div >
}

export default Contributors;