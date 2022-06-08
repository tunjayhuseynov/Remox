import React from 'react'

function Labels({item,id}:{item:{id:number,name:string},id:number}) {
    return <>
        <div className=" border-b py-4 w-full flex justify-between items-center">
            <div className="text-greylish flex items-center gap-1 w-[15%]"><span className="p-2 bg-primary rounded-full"></span>{item.name}</div>
            <div className="text-greylish flex items-center gap-1 text-sm"><img src="/icons/currencies/celodollar.svg" className="w-5 h-5" alt="" /><span className="text-red-600">23.000.0 </span>/  <img src="/icons/currencies/celodollar.svg" className="w-5 h-5" alt="" /><span className="text-black"> 7.000,00 </span></div>
            <div className=" rounded-xl relative  h-[1rem] flex w-[20%]   bg-greylish bg-opacity-40">
                <div className=" w-[60%] h-full bg-primary rounded-l-xl"></div>
            </div>
        </div>
    </>
}

export default Labels