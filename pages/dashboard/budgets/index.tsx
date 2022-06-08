import Modal from 'components/general/modal'
import React, { useState } from 'react'
import NewBudgets from 'subpages/dashboard/budgets/Modals/newBudgets'
import TotalValues from 'subpages/dashboard/budgets/totalValues'

import { IoIosArrowDown } from 'react-icons/io';
import NewExercise from 'subpages/dashboard/budgets/Modals/newExercise';
import EditBudget from 'subpages/dashboard/budgets/Modals/editBudgets';
import DeleteBudget from 'subpages/dashboard/budgets/Modals/deleteBudgets';
import AllBudgets from 'subpages/dashboard/budgets/allBudgets';

const Budgets = () => {
    

    const [newBudget, setNewBudget] = useState(false)
    const [editBudget, setEditBudget] = useState(false)
    const [delBudget, setDelBudget] = useState(false)
    const [newBudgetModal, setNewBudgetModal] = useState(false)
    const [sign, setSign] = useState(false)
    const [exercise, setExercise] = useState(false)
    const [isOpen, setOpen] = useState(false)



    const budgetData = [
        {
            id: 0,
            name: "Marketing",
            Percent: "40%",
            subBudgets : true,
            labels:true,
            twoToken: false
        },
        {
            id: 1,
            name: "Security",
            Percent: "70%",
            subBudgets : false,
            labels:true,
            twoToken: false
        },
        {
            id: 2,
            name: "Development",
            Percent: "60%",
            subBudgets : false,
            labels:false,
            twoToken: false
        },
        {
            id: 3,
            name: "Design",
            Percent: "60%",
            subBudgets : true,
            labels:false,
            twoToken: true
        },

    ]

    const exerciseData = [
        {
            id: 0,
            name: "Remox B Q3 2022",
            total: "$50.000,00"
        },
        {
            id: 1,
            name: "Remox A Q2 2022",
            total: "$35.650,40"
        },
    ]

    return <div className="mb-6">
        <div className="w-full">
            <div className="flex justify-between items-center w-full">
                <div className="text-3xl font-bold pb-12">
                    Budgets
                </div>
            </div>
            {!newBudget && <div className="text-primary cursor-pointer" onClick={() => { setExercise(true); }} ><span className="rounded-full border border-primary px-[.3rem]">+</span> Create a new budgetary exercise</div>}
            {
                newBudgetModal &&
                <Modal onDisable={setNewBudgetModal} disableX={true} className={'!w-[40%] !pt-4'}>
                    <NewBudgets setNewBudget={setNewBudgetModal} />
                </Modal>
            }
            {exercise &&
                <Modal onDisable={setExercise} disableX={true} className={'!w-[40%] !pt-4'}>
                    <NewExercise setExercise={setExercise} setNewBudget={setNewBudget} setSign={setSign} />
                </Modal>}
            {sign && <>
                <TotalValues />
                <div className="w-full pt-2 pb-12 flex justify-between items-center">
                    <div className="w-[40%] text-xl">
                        <div className="relative w-full pt-5">
                            <div onClick={() => setOpen(!isOpen)} className={`  w-full font-normal   py-3 rounded-lg bg-light dark:bg-dark cursor-pointer bg-sec   flex   items-center gap-2`}>
                                <span className="flex items-center justify-center text-2xl">Remox Budget Q3 2022</span>
                                <div>
                                    <IoIosArrowDown className='transition w-[0.7em] h-[0.7rem]' style={isOpen ? { transform: "rotate(180deg)" } : undefined} />
                                </div>
                            </div>
                            {isOpen && <div className="absolute flex   rounded-lg  bottom-2 translate-y-full bg-light dark:bg-darkSecond z-50">
                                <ul className="w-full">
                                    <li className= "flex flex-col items-center text-center justify-center w-full bg-white dark:bg-darkSecond space-y-1 transition rounded-xl cursor-pointer  ">
                                        <div className="flex flex-col w-full">
                                            {exerciseData.map((item, index) => {
                                                return <label key={index} className=" text-start  flex  items-center justify-start cursor-pointer w-full  border-b dark:border-greylish pl-3 pr-6 py-2">
                                                <div className="flex items-center gap-3"><span className="font-semibold">{item.name}</span> <div className="border text-sm border-primary text-primary rounded-md px-1 py-1">Active</div> <span className=" font-semibold">{item.total}</span> </div>
                                            </label>
                                            })}
                                            <label className=" text-start  flex items-center justify-start cursor-pointer w-full pl-3 pr-6 py-2">
                                                <div className="text-primary cursor-pointer " onClick={() => { setExercise(true) }} ><span className="rounded-full border border-primary px-2 ">+</span> Create a new budgetary exercise</div>
                                            </label>
                                        </div>
                                    </li>
                                </ul>
                            </div>}

                        </div>
                        <div className="text-primary border border-primary bg-primary  bg-opacity-30 text-sm px-1 py-1 rounded-sm cursor-pointer text-center max-w-[20%]">May 2022</div>
                    </div>
                    <div className="flex gap-5">
                        <div className="text-primary border border-primary px-3 py-2 rounded-xl cursor-pointer">Current Month</div>
                        <div className="text-primary border border-primary bg-primary  bg-opacity-30 px-9 py-2 rounded-xl cursor-pointer">Overall</div>
                        <div className="text-white border border-primary px-5 py-2 bg-primary rounded-xl cursor-pointer" onClick={() => { setNewBudgetModal(true) }}>Add Budget</div>
                    </div>
                </div>

                <div className={` grid grid-cols-2 gap-12  `}>
                    {budgetData.map((item,id)=>{
                        return  <AllBudgets  item={item} id={id} setEditBudget={setEditBudget} setDelBudget={setDelBudget}  />
                    })}
                   
                </div>
                {exercise && <Modal onDisable={setExercise} disableX={true} className={'!w-[40%] !pt-4'}>
                    <NewExercise setExercise={setExercise} />
                </Modal>}
                {
                    editBudget && <Modal onDisable={setEditBudget} disableX={true} className={'!w-[40%] !pt-4'}>
                        <EditBudget setNewBudget={setEditBudget} />
                    </Modal>
                }
                {
                    delBudget && <Modal onDisable={setDelBudget} disableX={true} className={'!w-[30%] !pt-4'}>
                        <DeleteBudget onDisable={setDelBudget} />
                    </Modal>
                }
            </>}
        </div>
    </div>

}

export default Budgets