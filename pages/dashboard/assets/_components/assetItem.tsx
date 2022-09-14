import React from 'react'
import { SetComma } from 'utils'
import { motion } from 'framer-motion'

const AssetItem = () => {
  return (
    <div className='py-3 h-[6.1rem] bg-white shadow-15 dark:bg-darkSecond  rounded-md border-opacity-10 hover:bg-greylish hover:bg-opacity-5 hover:transition-all w-full px-3'>
        <tr className="grid grid-cols-[35%,25%,20%,20%] md:grid-cols-[25%,20%,20%,23%,12%]  xl:grid-cols-[25%,20%,20%,29%,6%] ">
            <th className="flex space-x-3 items-center">
                <div><img src={`/icons/currencies/celo.png`} width={20} height={20} alt="" className="rounded-full" /></div>
                <div className="font-medium text-lg">{'CELO'}</div>
            </th>
            <th className={`font-medium text-lg`} >
                {SetComma(600000)}
            </th>
            <th className="hidden sm:block font-medium text-lg" >
                ${1}
            </th>
            <th className="hidden sm:block font-medium text-lg" >
                {-3}%
            </th>
            <th className="font-medium text-lg  text-right" >
                ${SetComma(600000)}
            </th>
        </tr>
        <div className="grid grid-cols-[95.5%,4.5%] items-center pt-2 pb-8 ">
            <div className="bg-greylish bg-opacity-10 dark:bg-dark rounded-2xl relative my-3 h-3">
                <motion.div className='h-full bg-primary rounded-2xl' animate={{ width: ((37.7) + '%') }} transition={{ ease: "easeOut", duration: 2 }}></motion.div>
            </div>
            <div className="text-right font-semibold"> {37.7}%</div>
        </div>
    </div>
  )
}

export default AssetItem