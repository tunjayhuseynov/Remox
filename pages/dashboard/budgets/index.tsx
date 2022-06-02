import Modal from 'components/general/modal'
import React, { useState } from 'react'
import NewBudgets from 'subpages/dashboard/budgets/newBudgets'
import TotalValues from 'subpages/dashboard/budgets/totalValues'

import { IoIosArrowDown } from 'react-icons/io';
import NewExercise from 'subpages/dashboard/budgets/newExercise';
import EditBudget from 'subpages/dashboard/budgets/editBudgets';
import DeleteBudget from 'subpages/dashboard/budgets/deleteBudgets';
import AllBudgets from 'subpages/dashboard/budgets/allBudgets';

const Budgets = () => {

    const [newBudget, setNewBudget] = useState(false)
    const [editBudget, setEditBudget] = useState(false)
    const [delBudget, setDelBudget] = useState(false)
    const [newModal, setNewModal] = useState(false)
    const [newModal2, setNewModal2] = useState(false)
    const [sign, setSign] = useState(false)
    const [exercise, setExercise] = useState(false)
    const [subBudgets, setSubBudgets] = useState<number>()
    const [isOpen, setOpen] = useState(false)




    return <div className="mb-6">
        <div className="w-full">
            <div className="flex justify-between items-center w-full">
                <div className="text-3xl font-bold pb-12">
                    Budgets
                </div>
            </div>
            {!newBudget && <div className="text-primary cursor-pointer" onClick={() => { setExercise(true); }} ><span className="rounded-full border border-primary px-[.3rem]">+</span> Create a new budgetary exercise</div>}
            {
                newModal2 && <Modal onDisable={setNewModal2} disableX={true} className={'!w-[40%] !pt-4'}>
                    <NewBudgets setNewBudget={setNewModal2} />
                </Modal>
            }
            {exercise && <Modal onDisable={setExercise} disableX={true} className={'!w-[40%] !pt-4'}>
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
                            {isOpen && <div className="absolute flex   rounded-lg  bottom-2 translate-y-full bg-light z-50">
                                <ul className="w-full">
                                    <li className=" sm:h-10  flex flex-col items-center text-center justify-center w-full bg-white space-y-1 transition rounded-lg cursor-pointer px-6 py-6 ">
                                        <div className="flex text-start items-center justify-start w-full">
                                            <label className=" text-start  flex items-center justify-start cursor-pointer w-full ">
                                                <div className="text-primary cursor-pointer " onClick={() => { setExercise(true) }} ><span className="rounded-full border border-primary px-1">+</span> Create a new budgetary exercise</div>
                                            </label>
                                        </div>
                                    </li>
                                </ul>
                            </div>}

                        </div>
                        <div className="text-primary border border-primary bg-red-100 text-sm px-1 py-1 rounded-sm cursor-pointer text-center max-w-[20%]">May 2022</div>
                    </div>
                    <div className="flex gap-5">
                        {subBudgets ? <div className="text-white border flex  items-center gap-2 border-primary px-5 py-2 bg-primary rounded-xl cursor-pointer" onClick={() => { setSubBudgets(0) }}> <img src="/icons/left_arrow.png" className="w-3 h-3" alt="" />  Back </div> : ""}
                        <div className="text-primary border border-primary px-3 py-2 rounded-xl cursor-pointer">Current Month</div>
                        <div className="text-primary border border-primary bg-red-100 px-9 py-2 rounded-xl cursor-pointer">Overall</div>
                        {!subBudgets && <div className="text-white border border-primary px-5 py-2 bg-primary rounded-xl cursor-pointer" onClick={() => { setNewModal2(true) }}>Add Budget</div>}
                    </div>
                </div>
                <div className={` ${subBudgets ? "w-full" : "grid grid-cols-2 gap-12"}  `}>
                    <AllBudgets setEditBudget={setEditBudget} setDelBudget={setDelBudget} setSubBudgets={setSubBudgets} subBudgets={subBudgets} />
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