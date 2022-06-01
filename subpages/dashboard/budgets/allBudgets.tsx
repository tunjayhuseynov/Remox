import React, { useState } from 'react'
import { useAppSelector } from 'redux/hooks';
import { changeDarkMode, selectDarkMode } from 'redux/reducers/notificationSlice';

function AllBudgets({ setEditBudget, setDelBudget, setSubBudgets, subBudgets }: { setSubBudgets: React.Dispatch<number>, subBudgets: number | undefined, setEditBudget: React.Dispatch<boolean>, setDelBudget: React.Dispatch<boolean> }) {

    const [details, setDetails] = useState(false)
    const [details2, setDetails2] = useState(false)
    const [details3, setDetails3] = useState(false)
    const dark = useAppSelector(selectDarkMode)

    return <>
        <div className={` ${subBudgets ? subBudgets === 1 ? "w-full" : "hidden" : ""} `}>
            <div className="rounded-xl shadow-custom px-4 py-4 bg-white dark:bg-darkSecond " >
                <div className="flex items-center justify-between w-full">
                    <div className="text-xl font-bold">Marketing</div>
                    <div className="flex items-center gap-5">
                        <div className="text-xl font-bold">40%</div>
                        <div className="flex space-x-3 justify-end" >
                            <span onClick={() => { setDetails(!details) }} className=" text-3xl flex items-center  cursor-pointer  font-bold relative"><span className=" text-primary pb-4 rotate-90">...</span>
                                {details && <div className="flex flex-col items-center bg-white dark:bg-darkSecond  absolute right-5 -bottom-5 w-[7rem]  rounded-lg shadow-xl z-50 ">
                                    <div className="cursor-pointer  text-sm border-b border-greylish border-opacity-20 flex w-full pl-2 py-1 gap-3" onClick={() => {
                                        setEditBudget(true)
                                    }}>
                                        <img src={`/icons/${dark ? 'edit_white' : 'edit'}.png`} className="dark:invert dark:brightness-0 w-4 h-4" alt="" /> <span>Edit</span>
                                    </div>
                                    <div className="cursor-pointer  text-sm flex w-full pl-2 py-1 gap-3" onClick={() => {
                                        setDelBudget(true)
                                    }}>
                                        <img src={`/icons/${dark ? 'trashicon_white' : 'trashicon'}.png`} className="dark:invert dark:brightness-0 w-4 h-4" alt="" /> <span>Delete</span>
                                    </div>
                                </div>}
                            </span>

                        </div>
                    </div>
                </div>
                <div onClick={() => { { setSubBudgets(1) } }}>
                <div className="flex items-center gap-2 text-greylish py-2"><span className="text-2xl font-bold flex items-center gap-1"><img src="/icons/currencies/celoiconsquare.svg" alt="" className="rounded-full" />50.000,00</span>impacted on<span className="text-lg flex items-center gap-1"><img src="/icons/currencies/celoiconsquare.svg" className="rounded-full" alt="" />100.000,00</span></div>
                <div className=" rounded-xl relative w-full h-[1.2rem] flex    bg-greylish bg-opacity-40">
                    <div className=" w-[60%] h-full bg-primary rounded-l-xl"></div>
                    <div className=" w-[25%] h-full bg-greylish"></div>
                    <div className=" w-[15%] h-full bg-greylish bg-opacity-10 rounded-r-xl"></div>
                </div>
                <div className="flex w-[75%] px-3 justify-between items-center py-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1 font-bold"><span className={`rounded-full bg-primary p-2 font-bold`}></span>Used</div>
                        <div className="flex items-center gap-1 font-bold"><img src="/icons/currencies/celoiconsquare.svg" className="w-4 h-4 rounded-full" alt="" />30.000,00</div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1 font-bold"><span className="rounded-full bg-greylish p-2 font-bold"></span>Pending</div>
                        <div className="flex items-center gap-1 font-bold"><img src="/icons/currencies/celoiconsquare.svg" className="w-4 h-4 rounded-full" alt="" />30.000,00</div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1 font-bold"><span className="rounded-full bg-greylish bg-opacity-10 p-2 font-bold"></span>Available</div>
                        <div className="flex items-center gap-1 font-bold"><img src="/icons/currencies/celoiconsquare.svg" className="w-4 h-4 rounded-full" alt="" />30.000,00</div>
                    </div>
                </div>
                <>
                    <div className="w-full border-b"></div>
                    <div className="flex items-center gap-2 text-greylish py-4"><span className="text-2xl font-bold flex items-center gap-1"><img src="/icons/currencies/celodollar.svg" alt="" className="rounded-full" />50.000,00</span>impacted on<span className="text-lg flex items-center gap-1"><img src="/icons/currencies/celodollar.svg" className="rounded-full" alt="" />100.000,00</span></div>
                    <div className=" rounded-xl relative w-full h-[1.2rem] flex    bg-greylish bg-opacity-40">
                        <div className=" w-[27.5%] h-full bg-primary rounded-l-xl"></div>
                        <div className=" w-[27.5%] h-full bg-greylish"></div>
                        <div className=" w-[45%] h-full bg-greylish bg-opacity-10 rounded-r-xl"></div>
                    </div>
                    <div className="flex w-[75%] px-3 justify-between items-center py-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1 font-bold"><span className="rounded-full bg-primary p-2 font-bold"></span>Used</div>
                            <div className="flex items-center gap-1 font-bold"><img src="/icons/currencies/celodollar.svg" className="w-4 h-4 rounded-full" alt="" />18.000,00</div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1 font-bold"><span className="rounded-full bg-greylish p-2 font-bold"></span>Pending</div>
                            <div className="flex items-center gap-1 font-bold"><img src="/icons/currencies/celodollar.svg" className="w-4 h-4 rounded-full" alt="" />47.000,00</div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1 font-bold"><span className="rounded-full bg-greylish bg-opacity-10 p-2 font-bold"></span>Available</div>
                            <div className="flex items-center gap-1 font-bold"><img src="/icons/currencies/celodollar.svg" className="w-4 h-4 rounded-full" alt="" />68.000,00</div>
                        </div>
                    </div>
                </>
            </div>
        </div>
        </div>
        <div className=" flex flex-col gap-5">
            <div className={` ${subBudgets ? subBudgets === 2 ? "w-full" : "hidden" : ""} `}>
                <div className="rounded-xl shadow-custom px-4 py-4 bg-white dark:bg-darkSecond " >
                    <div className="flex items-center justify-between w-full">
                        <div className="text-xl font-bold">Security</div>
                        <div className="flex items-center gap-5">
                            <div className="text-xl font-bold text-red-600">70%</div>
                            <div className="flex space-x-3 justify-end" >
                                <span onClick={() => { setDetails2(!details2) }} className=" text-3xl flex items-center  cursor-pointer  font-bold relative"><span className=" text-primary pb-4 rotate-90">...</span>
                                    {details2 && <div className="flex flex-col items-center bg-white dark:bg-darkSecond absolute right-5 -bottom-5  w-[7rem] rounded-lg shadow-xl z-50 ">
                                        <div className="cursor-pointer  text-sm border-b border-greylish border-opacity-20 flex w-full pl-2 py-1 gap-3" onClick={() => {
                                            setEditBudget(true)
                                        }}>
                                            <img src={`/icons/${dark ? 'edit_white' : 'edit'}.png`} className="dark:invert dark:brightness-0 w-4 h-4" alt="" /> <span>Edit</span>
                                        </div>
                                        <div className="cursor-pointer  text-sm flex w-full pl-2 py-1 gap-3" onClick={() => {
                                            setDelBudget(true)
                                        }}>
                                            <img src={`/icons/${dark ? 'trashicon_white' : 'trashicon'}.png`} className="dark:invert dark:brightness-0 w-4 h-4" alt="" /> <span>Delete</span>
                                        </div>
                                    </div>}
                                </span>

                            </div>
                        </div>
                    </div>
                    <div onClick={() => { { setSubBudgets(2) } }}>
                    <div className="flex items-center gap-2 text-greylish py-2"><span className="text-2xl font-bold flex items-center gap-1 text-red-600"><img src="/icons/currencies/celoiconsquare.svg" alt="" className="rounded-full" />50.000,00</span>impacted on<span className="text-lg flex items-center gap-1"><img src="/icons/currencies/celoiconsquare.svg" className="rounded-full" alt="" />100.000,00</span></div>
                    <div className=" rounded-xl relative w-full h-[1.2rem] flex    bg-greylish bg-opacity-40">
                        <div className=" w-[60%] h-full bg-red-600 rounded-l-xl"></div>
                        <div className=" w-[25%] h-full bg-greylish"></div>
                        <div className=" w-[15%] h-full bg-greylish bg-opacity-10 rounded-r-xl"></div>
                    </div>
                    <div className="flex w-[75%]  px-3 justify-between items-center py-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1 font-bold"><span className={`rounded-full bg-red-600 p-2 font-bold`}></span>Used</div>
                            <div className="flex items-center gap-1 font-bold"><img src="/icons/currencies/celoiconsquare.svg" className="w-4 h-4 rounded-full" alt="" />30.000,00 <span className="text-red-600">(exceeded)</span></div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1 font-bold"><span className="rounded-full bg-greylish bg-opacity-10 p-2 font-bold"></span>Available</div>
                            <div className="flex items-center gap-1 font-bold"><img src="/icons/currencies/celoiconsquare.svg" className="w-4 h-4 rounded-full" alt="" />30.000,00 <span className="text-red-600">(exceeded)</span></div>
                        </div>
                    </div>
                </div>
                </div>
            </div>
            <div className={` ${subBudgets ? subBudgets === 3 ? "w-full" : "hidden" : ""} `}>
                <div className="rounded-xl shadow-custom px-4 py-4 bg-white dark:bg-darkSecond ">
                    <div className="flex items-center justify-between w-full">
                        <div className="text-xl font-bold">Development</div>
                        <div className="flex items-center gap-5">
                            <div className="text-xl font-bold">20%</div>
                            <div className="flex space-x-3 justify-end"  >
                                <span onClick={() => { setDetails3(!details3) }} className=" text-3xl flex items-center  cursor-pointer  font-bold relative"><span className=" text-primary pb-4 rotate-90">...</span>
                                    {details3 && <div className="flex flex-col items-center bg-white dark:bg-darkSecond absolute right-5 -bottom-5 w-[7rem]  rounded-lg shadow-xl z-50 ">
                                        <div className="cursor-pointer  text-sm border-b border-greylish border-opacity-20 flex w-full pl-2 py-1 gap-3" onClick={() => {
                                            setEditBudget(true)
                                        }}>
                                            <img src={`/icons/${dark ? 'edit_white' : 'edit'}.png`} className="dark:invert dark:brightness-0 w-4 h-4" alt="" /> <span>Edit</span>
                                        </div>
                                        <div className="cursor-pointer  text-sm flex w-full pl-2 py-1 gap-3" onClick={() => {
                                            setDelBudget(true)
                                        }}>
                                            <img src={`/icons/${dark ? 'trashicon_white' : 'trashicon'}.png`} className="dark:invert dark:brightness-0 w-4 h-4" alt="" /> <span>Delete</span>
                                        </div>
                                    </div>}
                                </span>

                            </div>
                        </div>
                    </div>
                    <div onClick={() => { { setSubBudgets(3) } }}>
                    <div className="flex items-center gap-2 text-greylish py-2"><span className="text-2xl font-bold flex items-center gap-1"><img src="/icons/currencies/celoiconsquare.svg" alt="" className="rounded-full" />50.000,00</span>impacted on<span className="text-lg flex items-center gap-1"><img src="/icons/currencies/celoiconsquare.svg" className="rounded-full" alt="" />100.000,00</span></div>
                    <div className=" rounded-xl relative w-full h-[1.2rem] flex    bg-greylish bg-opacity-40">
                        <div className=" w-[60%] h-full bg-primary rounded-l-xl"></div>
                        <div className=" w-[25%] h-full bg-greylish"></div>
                        <div className=" w-[15%] h-full bg-greylish bg-opacity-10 rounded-r-xl"></div>
                    </div>
                    <div className="flex w-[75%] px-3 justify-between items-center py-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1 font-bold"><span className={`rounded-full bg-primary p-2 font-bold`}></span>Used</div>
                            <div className="flex items-center gap-1 font-bold"><img src="/icons/currencies/celoiconsquare.svg" className="w-4 h-4 rounded-full" alt="" />30.000,00</div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1 font-bold"><span className="rounded-full bg-greylish p-2 font-bold"></span>Pending</div>
                            <div className="flex items-center gap-1 font-bold"><img src="/icons/currencies/celoiconsquare.svg" className="w-4 h-4 rounded-full" alt="" />30.000,00</div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1 font-bold"><span className="rounded-full bg-greylish bg-opacity-10 p-2 font-bold"></span>Available</div>
                            <div className="flex items-center gap-1 font-bold"><img src="/icons/currencies/celoiconsquare.svg" className="w-4 h-4 rounded-full" alt="" />30.000,00</div>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </div>
        {subBudgets && <><div className="rounded-xl shadow-custom px-4 py-4 bg-white dark:bg-darkSecond w-full mt-8">
                    <div className="text-2xl font-bold text-start pb-4">Subbudgets</div>
                    <div className=" border-b py-4 w-full flex justify-between items-center">
                        <div className="text-greylish w-[15%]">Paid Marketing</div> 
                        <div className="text-greylish flex items-start gap-1 text-sm"><img src="/icons/currencies/celodollar.svg" className="w-5 h-5"  alt="" /><span className="text-red-600">23.000.0 </span>/  <img src="/icons/currencies/celodollar.svg" className="w-5 h-5" alt="" /><span className="text-black"> 7.000,00 </span>  /  <img src="/icons/currencies/celodollar.svg" className="w-5 h-5" alt="" /><span className="text-greylish"> 10.000,00 </span> </div>   
                        <div className=" rounded-xl relative  h-[1rem] flex w-[20%]   bg-greylish bg-opacity-40">
                        <div className=" w-[60%] h-full bg-primary rounded-l-xl"></div>
                        <div className=" w-[25%] h-full bg-greylish"></div>
                        <div className=" w-[15%] h-full bg-greylish bg-opacity-10 rounded-r-xl"></div>
                    </div>
                    </div>
                    <div className=" border-b py-4 w-full flex justify-between items-center">
                        <div className="text-greylish w-[15%]">Event</div> 
                        <div className="text-greylish flex items-start gap-1 text-sm"><img src="/icons/currencies/celodollar.svg" className="w-5 h-5"  alt="" /><span className="text-red-600">47.000.0 </span>/  <img src="/icons/currencies/celodollar.svg" className="w-5 h-5" alt="" /><span className="text-black"> 5.000,00 </span>  /  <img src="/icons/currencies/celodollar.svg" className="w-5 h-5" alt="" /><span className="text-greylish"> 30.000,00 </span> </div>
                        <div className=" rounded-xl relative  h-[1rem] flex w-[20%]   bg-greylish bg-opacity-40">
                        <div className=" w-[60%] h-full bg-primary rounded-l-xl"></div>
                        <div className=" w-[25%] h-full bg-greylish"></div>
                        <div className=" w-[15%] h-full bg-greylish bg-opacity-10 rounded-r-xl"></div>
                    </div>
                    </div>
            </div>
            <div className="rounded-xl shadow-custom px-4 py-4 bg-white dark:bg-darkSecond w-full mt-8">
                    <div className="text-2xl font-bold text-start pb-4">Expense Labels</div>
                    <div className=" border-b py-4 w-full flex justify-between items-center">
                        <div className="text-greylish flex items-center gap-1 w-[15%]"><span className="p-2 bg-primary rounded-full"></span> Paid Marketing</div> 
                        <div className="text-greylish flex items-center gap-1 text-sm"><img src="/icons/currencies/celodollar.svg" className="w-5 h-5"  alt="" /><span className="text-red-600">23.000.0 </span>/  <img src="/icons/currencies/celodollar.svg" className="w-5 h-5" alt="" /><span className="text-black"> 7.000,00 </span></div>   
                        <div className=" rounded-xl relative  h-[1rem] flex w-[20%]   bg-greylish bg-opacity-40">
                        <div className=" w-[60%] h-full bg-primary rounded-l-xl"></div>

                    </div>
                    </div>
                    <div className=" border-b py-4 w-full flex justify-between items-center">
                    <div className="text-greylish flex items-center gap-1 w-[15%]"><span className="p-2 bg-red-600 rounded-full"></span> Event</div> 
                        <div className="flex flex-col items-center gap-2">
                        <div className="text-greylish flex items-center gap-1 text-sm"><img src="/icons/currencies/celodollar.svg" className="w-5 h-5"  alt="" /><span className="text-red-600">47.000.0 </span>/  <img src="/icons/currencies/celodollar.svg" className="w-5 h-5" alt="" /><span className="text-black"> 5.000,00 </span>   </div>
                        <div className="text-greylish flex items-center gap-1 text-sm"><img src="/icons/currencies/celodollar.svg" className="w-5 h-5"  alt="" /><span className="text-red-600">47.000.0 </span>/  <img src="/icons/currencies/celodollar.svg" className="w-5 h-5" alt="" /><span className="text-black"> 5.000,00 </span> </div>
                        </div>

                        <div className="flex flex-col items-start w-[20%] gap-2">
                        <div className=" rounded-xl relative  h-[1rem] flex w-full  bg-greylish bg-opacity-40">
                        <div className=" w-[60%] h-full bg-primary rounded-l-xl"></div>
                    </div>
                     <div className=" rounded-xl relative  h-[1rem] flex w-full  bg-greylish bg-opacity-40">
                     <div className=" w-[60%] h-full bg-primary rounded-l-xl"></div>
                    </div>
                    </div>
                    </div>
            </div>
            </> }

    </>
}

export default AllBudgets