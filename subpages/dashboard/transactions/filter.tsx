import React,{useState} from 'react'
import { selectDarkMode } from "redux/reducers/notificationSlice";
import { useSelector } from "react-redux";

function Filter() {
    const darkMode = useSelector(selectDarkMode)
    const [selectAll,setSelectAll] = useState(false)
    const [filter,setFilter] = useState(0)

  return <div className="grid grid-cols-[25%,75%] w-full h-full">
  <div className="flex flex-col gap-3 p-2 border-r dark:border-black pt-5  h-[200%]">
      <div onClick={()=>{setFilter(0)}} className={`${filter===0 && "bg-light dark:bg-dark"} border rounded-xl text-sm flex items-center  gap-2 cursor-pointer pl-1`}><img src={`/icons/${darkMode ? "calendar_white" : "calendar"}.png`} alt="" className="w-3 h-3" /> Date</div>
      <div onClick={()=>{setFilter(1)}}  className={`${filter===1 && "bg-light dark:bg-dark"} border rounded-xl text-sm flex items-center  gap-2 cursor-pointer pl-1`}><img src={`/icons/${darkMode ? "tag_white" : "tag"}.png`} alt="" className="w-3 h-3" /> Labels</div>
      <div onClick={()=>{setFilter(2)}}  className={`${filter===2 && "bg-light dark:bg-dark"} border rounded-xl text-sm flex items-center  gap-2 cursor-pointer pl-1`}><img src={`/icons/${darkMode ? "amount_white" : "amount"}.png`} alt="" className="w-3 h-3" /> Amount</div>
      <div onClick={()=>{setFilter(3)}}  className={`${filter===3 && "bg-light dark:bg-dark"} border rounded-xl text-sm flex items-center  gap-2 cursor-pointer pl-1`}><img src={`/icons/${darkMode ? "tag_white" : "tag"}.png`} alt="" className="w-3 h-3" /> Budgets</div>
  </div>
  <div className="flex flex-col">
     {filter === 0 &&<><div className="flex justify-between items-center border-b  p-1">
          <div className="pl-2">Calendar</div>
          <div onClick={()=>{setSelectAll(true)}} className="text-primary cursor-pointer">select All</div>
      </div>
      <div className="flex flex-col gap-3 w-full h-full p-6">
          Calendar
      </div></> }
      {filter === 1 &&<><div className="flex justify-between items-center border-b dark:border-black py-2  p-1">
          <div className="pl-2">Choose Labels</div>
          <div onClick={()=>{setSelectAll(true)}} className="text-primary cursor-pointer pr-1">Select All</div>
      </div>
      <div className="flex flex-col gap-3 w-full h-full p-6">
          <div className="flex items-center gap-2"><input type="checkbox" /> Compensation</div>
          <div className="flex items-center gap-2"><input type="checkbox" /> Marketing</div>
          <div className="flex items-center gap-2"><input type="checkbox" /> Payroll</div>
      </div></> }
      {filter === 2 &&<><div className="flex flex-col justify-around  gap-3 pt-1  p-1">
          <div className="pl-2 text-left">Direction</div>
          <div className="flex w-full justify-between px-2">
              <div className="flex items-center gap-2 "><input type="radio" id="any" name="amount" /><label htmlFor="any">Any</label></div>
              <div className="flex items-center gap-2 "><input type="radio" id="in" name="amount" /><label htmlFor="in">In</label></div>
              <div className="flex items-center gap-2 "><input type="radio" id="out"  name="amount" /><label htmlFor="out">Out</label></div>
          </div>
      </div>
      <div className="flex flex-col w-full h-full p-3 gap-4">
          <div className="flex flex-col gap-1 "> <span className="text-left">Spesific Amount</span> <input type="number" className="w-full border rounded-lg p-1 outline-none unvisibleArrow dark:bg-dark" placeholder="$0.0" /></div>
          <div className="flex items-center  gap-2">
              <div className="flex flex-col gap-1"> <span className="text-left">Min.</span> <input type="number" className="w-full border rounded-lg p-1 outline-none unvisibleArrow dark:bg-dark" placeholder="$0.0" /></div>
              <div className="border w-[10%] mt-3 h-[1px] dark:bg-dark"></div>
              <div className="flex flex-col  gap-1"> <span className="text-left">Max.</span> <input type="number" className="w-full border rounded-lg p-1  outline-none unvisibleArrow dark:bg-dark" placeholder="$0.0"  /></div>
          </div>
      </div></> }
      {filter === 3 &&<><div className="flex justify-between items-center border-b dark:border-black py-2  p-1">
          <div className="pl-2">Choose Budget</div>
          <div onClick={()=>{setSelectAll(true)}} className="text-primary cursor-pointer pr-1">Select All</div>
      </div>
      <div className="flex flex-col gap-3 w-full h-full p-6">
          <div className="flex items-center gap-2"><input type="checkbox" /> Security</div>
          <div className="flex items-center gap-2"><input type="checkbox" /> Marketing</div>
          <div className="flex items-center gap-2"><input type="checkbox" /> Payroll</div>
      </div></> }
  </div>
</div>
}

export default Filter