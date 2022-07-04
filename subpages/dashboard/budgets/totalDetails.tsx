import React,{useEffect, useState} from 'react'
import { motion, AnimatePresence } from "framer-motion"
import Button from "components/button";
import { useModalSideExit } from "hooks";
import useProfile from 'rpcHooks/useProfile';
import { ITotals } from './budgetCard';

function TotalDetails({totals}: {totals: ITotals[]}) {
    const { profile, UpdateSeenTime } = useProfile()
    const [openNotify, setNotify] = useState(false)

    useEffect(() => {
        if (openNotify) {
            UpdateSeenTime(new Date().getTime())
        }
    }, [openNotify])

    useEffect(() => {
        if (openNotify) {
            UpdateSeenTime(new Date().getTime())
            document.querySelector('body')!.style.overflowY = "hidden"
        }else{
            document.querySelector('body')!.style.overflowY = ""
        }

        
    }, [openNotify])



  return <>

  <div  onClick={() => { setNotify(!openNotify) }}>
  <img src="/icons/next_budgets.png" alt="" className="w-10 h-10 cursor-pointer" />
  </div>
  <AnimatePresence>
      {openNotify &&
          <motion.div initial={{ x: "100%", opacity: 0.5 }} animate={{ x: 15, opacity: 1 }} exit={{ x: "100%", opacity: 0.5 }} transition={{ type: "spring", stiffness: 400, damping: 40 }}  className=" overflow-hidden z-[9999] fixed shadow-custom grid grid-cols-[60%,40%] h-[100vh] pr-1 w-[105%] overflow-y-auto  overflow-x-hidden top-0 right-0  cursor-default ">
                <div className="w-full h-full backdrop-blur-[2px]"></div> 
              <div className="bg-white dark:bg-darkSecond flex flex-col min-h-[325px] sm:min-h-[auto] px-12 py-12 justify-center sm:justify-between sm:items-stretch items-center">
              <button onClick={() => setNotify(false)} className=" absolute left-full w-[2rem] top-0 translate-x-[-170%] translate-y-[25%] opacity-45">
                  <img src="/icons/cross_greylish.png" alt="" />
              </button>
                  <div className="flex flex-col sm:flex-row justify-center sm:items-center text-2xl font-semibold pt-2">Spending Details</div>
                  {totals.map((item, index) => {
                      return <div key={index} className="flex flex-col gap-8 py-8 border-b">
                          <div className="flex justify-between px-2"><span className="text-greylish dark:text-white text-xl">{item.name}</span><span className="font-bold text-xl">{item.value}</span></div>
                          <div className="flex justify-between px-2">
                              <span className="text-greylish dark:text-white text-xl">Token Breakdown</span>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-1"><span className="text-xl font-bold">{item.token.value}</span> <img src={`/icons/currencies/${item.token.coinUrl}.svg`} className="w-5 h-5 rounded-full" alt="" /> <span className="text-xl font-bold">{item.token.name}</span> </div>
                                {item.token2 &&  <div className="flex items-center gap-1"><span className="text-xl font-bold">{item.token2.value}</span> <img src={`/icons/currencies/${item.token2.coinUrl}.svg`} className="w-5 h-5 rounded-full" alt="" /> <span className="text-xl font-bold">{item.token2.name}</span> </div>}
                            </div>
                          </div>
                      </div>
                  })}
              </div>

          </motion.div>}
  </AnimatePresence>
</>
}

export default TotalDetails