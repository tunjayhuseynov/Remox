import React,{useState} from 'react'
import { selectDarkMode } from "redux/slices/notificationSlice";
import { useSelector } from "react-redux";
import Paydropdown from "subpages/pay/paydropdown";

function Filter() {
    const darkMode = useSelector(selectDarkMode)
    const [selectAll,setSelectAll] = useState(false)
    const [filter,setFilter] = useState(0)
    const [value, setValue] = useState('All Time')


    const paymentname = ["All Time", "Spesific Time"]

  return <div className="grid grid-cols-[32%,68%] w-full h-full">
  <div className="flex flex-col gap-5 p-2  border-r dark:border-black pt-5  h-full">
      <div onClick={()=>{setFilter(0)}} className={`${filter===0 && "bg-light dark:bg-dark"} border rounded-xl text-sm flex items-center  gap-2 cursor-pointer px-3`}><img src={`/icons/${darkMode ? "calendar_white" : "calendar"}.png`} alt="" className="w-3 h-3" /> Date</div>
      <div onClick={()=>{setFilter(1)}}  className={`${filter===1 && "bg-light dark:bg-dark"} border rounded-xl text-sm flex items-center  gap-2 cursor-pointer px-3`}><img src={`/icons/${darkMode ? "tag_white" : "tag"}.png`} alt="" className="w-3 h-3" /> Labels</div>
      <div onClick={()=>{setFilter(2)}}  className={`${filter===2 && "bg-light dark:bg-dark"} border rounded-xl text-sm flex items-center  gap-2 cursor-pointer px-3`}><img src={`/icons/${darkMode ? "amount_white" : "amount"}.png`} alt="" className="w-3 h-3" /> Amount</div>
      <div onClick={()=>{setFilter(3)}}  className={`${filter===3 && "bg-light dark:bg-dark"} border rounded-xl text-sm flex items-center  gap-2 cursor-pointer px-3`}><img src={`/icons/${darkMode ? "tag_white" : "tag"}.png`} alt="" className="w-3 h-3" /> Budgets</div>
  </div>
  <div className="flex flex-col w-full h-full">
     {filter === 0 &&<><div className="flex flex-col w-full h-full py-4 px-5 gap-4">
          <div className="flex flex-col gap-1 "> <span className="text-left text-sm text-greylish dark:text-white">Show transactions for</span>  <Paydropdown paymentname={paymentname} value={value} setValue={setValue} className={'bg-greylish bg-opacity-10 dark:bg-darkSecond !py-1 rounded-xl'} /></div>
          <div className="flex items-center w-full  gap-1">
              <div className="flex flex-col w-[45%] gap-1 "> <span className="text-left text-sm text-greylish dark:text-white">From</span> <input type="date" className="w-full border rounded-lg p-1 outline-none bg-greylish bg-opacity-10 dark:bg-dark"  /></div>
              <div className="border-b l w-5 mt-5  dark:bg-dark"></div>
              <div className="flex flex-col w-[45%] gap-1 "> <span className="text-left text-sm text-greylish dark:text-white">To</span> <input type="date" className="w-full border rounded-lg p-1  outline-none bg-greylish bg-opacity-10 dark:bg-dark"   /></div>
          </div>
      </div></> }
      {filter === 1 &&<><div className="flex justify-between items-center border-b dark:border-black py-3  px-4">
          <div className="text-sm text-greylish dark:text-white">Choose Labels</div>
          <div onClick={()=>{setSelectAll(true)}} className="text-primary cursor-pointer text-sm">Select All</div>
      </div>
      <div className="flex flex-col gap-3 w-full h-full p-6">
          <div className="flex items-center text-greylish dark:text-white text-sm gap-2"><input type="checkbox" /> Compensation</div>
          <div className="flex items-center text-greylish dark:text-white text-sm gap-2"><input type="checkbox" /> Marketing</div>
          <div className="flex items-center text-greylish dark:text-white text-sm gap-2"><input type="checkbox" /> Payroll</div>
      </div></> }
      {filter === 2 &&<><div className="flex flex-col justify-around  gap-3 pt-4 px-6 pb-4">
          <div className=" text-sm text-greylish dark:text-white text-left">Direction</div>
          <div className="flex w-full justify-between ">
              <div className="flex items-center gap-2 text-sm text-greylish dark:text-white "><input type="radio" id="any" name="amount" className="w-4 h-4" /><label htmlFor="any">Any</label></div>
              <div className="flex items-center gap-2 text-sm text-greylish dark:text-white "><input type="radio" id="in" name="amount" className="w-4 h-4" /><label htmlFor="in">In</label></div>
              <div className="flex items-center gap-2 text-sm text-greylish dark:text-white "><input type="radio" id="out"  name="amount" className="w-4 h-4" /><label htmlFor="out">Out</label></div>
          </div>
      </div>
      <div className="flex flex-col w-full h-full pb-2 px-5 gap-2">
          <div className="flex flex-col gap-1 "> <span className="text-left text-sm text-greylish dark:text-white">Spesific Amount</span> <input type="number" className="w-full border rounded-lg p-1 outline-none unvisibleArrow dark:bg-dark" placeholder="$0.0" /></div>
          <div className="flex items-center w-full  gap-2">
              <div className="flex flex-col w-[40%] gap-1"> <span className="text-left text-sm text-greylish dark:text-white">Min.</span> <input type="number" className="w-full border rounded-lg p-1 outline-none unvisibleArrow dark:bg-dark" placeholder="$0.0" /></div>
              <div className="border-b w-[20%] mt-5  dark:bg-dark"></div>
              <div className="flex flex-col w-[40%]  gap-1"> <span className="text-left text-sm text-greylish dark:text-white">Max.</span> <input type="number" className="w-full border rounded-lg p-1  outline-none unvisibleArrow dark:bg-dark" placeholder="$0.0"  /></div>
          </div>
      </div></> }
      {filter === 3 &&<><div className="flex justify-between items-center border-b dark:border-black py-3  px-4">
          <div className=" text-sm text-greylish dark:text-white">Choose Budget</div>
          <div onClick={()=>{setSelectAll(true)}} className="text-primary text-sm cursor-pointer">Select All</div>
      </div>
      <div className="flex flex-col gap-3 w-full h-full p-6">
          <div className="flex items-center text-greylish dark:text-white text-sm gap-2"><input type="checkbox" /> Security</div>
          <div className="flex items-center text-greylish dark:text-white text-sm gap-2"><input type="checkbox" /> Reimbursement</div>
          <div className="flex items-center text-greylish dark:text-white text-sm gap-2"><input type="checkbox" /> Development</div>
      </div></> }
  </div>
</div>
}

export default Filter