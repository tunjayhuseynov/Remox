import {useEffect, useState } from 'react';
import { useAppSelector } from 'redux/hooks'
import { SelectContributorMembers, SelectContributors, SelectDarkMode, SelectStorage } from 'redux/slices/account/remoxData';
import AnimatedTabBar from 'components/animatedTabBar';
import { useRouter } from 'next/router';
import TeamItem from 'pages/dashboard/contributors/_components/teamItem';
import ContributorItem from 'pages/dashboard/contributors/_components/contributorItem'
import { TablePagination } from '@mui/material';
import IconTextField from 'components/IconTextField';
import AddTeam from './_components/addTeam';
import CreateButton from 'components/general/CreateButton';


const Contributors = () => {
    const STABLE_INDEX = 5
    const [pagination, setPagination] = useState(STABLE_INDEX)
    const contributors = useAppSelector(SelectContributors)
    const isDark = useAppSelector(SelectDarkMode)
    const navigate = useRouter()
    const members = useAppSelector(SelectContributorMembers)
    const [creating, setCreating] = useState<boolean>(false)

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

    const index = (navigate.query.index as string | undefined) ? +navigate.query.index! : 0
    const ActivePage =  index === 0 ? "Active" : data.find((item) => item.to === navigate.asPath)?.text
    const membersLength = index === 0 ? members.length : members.filter((item) => item.compensation === ActivePage).length

    console.log(membersLength)
    

    useEffect(() => {
        setPagination(STABLE_INDEX)
        
    }, [members, contributors])


    
    return <div>
        <div className="flex flex-col  pb-5 gap-10">
            <div className="flex justify-between items-center w-full">
                <div className="text-2xl font-bold">
                    Contributors
                </div>
            </div>
            <div className="flex justify-between items-center w-[90%] mb-5 ">
                <AnimatedTabBar data={data} index={index} className={'!text-lg'} />
            </div>
        </div>

        {index !== 4  ? 
        <>
            <table className="w-full  pt-4 pb-6">
                <thead>
                    <tr id="header" className="grid grid-cols-[20%,13%,14%,15%,15%,16%,7%] bg-[#F2F2F2] shadow-15 py-2   dark:bg-darkSecond rounded-md ">
                        <th className="font-semibold text-left text-sm text-greylish dark:text-[#aaaaaa] pl-3">Contributor</th>
                        <th className="font-semibold text-left text-sm text-greylish dark:text-[#aaaaaa] hidden lg:block ">Workstream</th>
                        <th className="font-semibold text-left text-sm text-greylish dark:text-[#aaaaaa] ">Role</th>
                        <th className="font-semibold text-left text-sm text-greylish dark:text-[#aaaaaa] ">Amount</th>
                        <th className="font-semibold text-left text-sm text-greylish dark:text-[#aaaaaa] ">Address</th>
                        <th className="font-semibold text-left text-sm text-greylish dark:text-[#aaaaaa]">Compensation Type</th>
                    </tr>
                    <>
                        {index === 0 ? <>
                            {members.slice(pagination - STABLE_INDEX, pagination).map((member) => <ContributorItem key={member.id} member={member} />)}
                        </>  
                         : 
                            <>
                                {members.filter((member) => member.compensation === ActivePage).map((member) => <ContributorItem key={member.id} member={member}/>) }
                            </>
                        }
                    </>
                </thead>
            </table> 
            {contributors.length > 0 &&
            <>
                <div>
                    <TablePagination
                        component="div"
                        rowsPerPageOptions={[]}
                        count={membersLength}
                        page={(pagination / STABLE_INDEX) - 1}
                        onPageChange={(e, newPage) => setPagination((newPage + 1) * STABLE_INDEX)}
                        rowsPerPage={STABLE_INDEX}            
                    />
                </div>
                <div className="flex justify-center !mt-0 py-10">
                    <CreateButton onClick={() => navigate.push('/dashboard/contributors/add-member')} />
                </div>
            </>
            }
        </> : 
        <div className="grid grid-cols-3 gap-14 pr-9" >
            {contributors.length > 0 && contributors.map(team => <TeamItem key={team.id} props={team}/>)}
            {creating && <AddTeam setCreating={setCreating}/>}
            <div onClick={() => {
                setCreating(!creating)
            } } className=" rounded-md cursor-pointer bg-white transition-all dark:bg-darkSecond hover:transition-all hover:!bg-[#f0f0f0] dark:hover:!bg-[#131313]  hover:shadow-lg px-3  shadow flex  py-2 pb-4  min-h-[12rem] items-start justify-between pl-5">
                <div className="flex items-center justify-center w-full h-full">
                    <span className={`text-8xl font-light ${isDark ? "" : "text-[#CCCCCC]"}`}>+</span>
                </div>
            </div>
        </div>
        }

    </div >
}

export default Contributors;