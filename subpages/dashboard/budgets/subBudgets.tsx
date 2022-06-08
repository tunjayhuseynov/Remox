import React from 'react'
import {progressBarWidth} from '../../../utils'
function SubBudgets({item,id}:{item:{id:number,name:string},id:number}) {





  return <div className=" border-b py-4 w-full flex justify-between items-center">
      <div className="text-greylish w-[15%]">{item.name}</div>
      <div className="text-greylish flex items-start gap-1 text-sm"><img src="/icons/currencies/celodollar.svg" className="w-5 h-5" alt="" /><span className="text-red-600">23.000.0 </span>/  <img src="/icons/currencies/celodollar.svg" className="w-5 h-5" alt="" /><span className="text-black"> 7.000,00 </span>  /  <img src="/icons/currencies/celodollar.svg" className="w-5 h-5" alt="" /><span className="text-greylish"> 10.000,00 </span> </div>
      <div className=" rounded-xl relative  h-[1rem] flex w-[20%]   bg-greylish bg-opacity-40">
          <div className=" w-[60%] h-full bg-primary rounded-l-xl"></div>
          <div className="stripe-1  object-cover h-full" style={progressBarWidth(40)}></div>
          <div className=" w-[15%] h-full bg-greylish bg-opacity-10 rounded-r-xl"></div>
      </div>
  </div>
}

export default SubBudgets