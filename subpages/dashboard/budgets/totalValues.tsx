import React from 'react'

function TotalValues() {
  return <div className="rounded-xl shadow-custom px-6 py-4 bg-white dark:bg-darkSecond ">
  <div className='flex justify-between  gap-8'>
      <div className='flex flex-col gap-12 lg:gap-4'>
          <div className='text-xl font-bold'>Total Budget</div>
          <div className='text-3xl font-bold flex flex-col gap-1'>
              $300.000,00 USD
              <div className="flex gap-3">
              <div className="text-greylish flex items-center gap-1 text-sm">1.000 <img src="/icons/currencies/celoiconsquare.svg" className="rounded-full" alt="" /> Celo</div>
              <div className="text-greylish flex items-center gap-1 text-sm">1.000 <img src="/icons/currencies/celodollar.svg" alt="" /> Celo</div>
              </div>
          </div>
      </div>
      <div className='flex flex-col  gap-12 lg:gap-4 !mt-0'>
          <div className='text-xl font-bold'>Total Used</div>
          <div className='text-2xl font-semibold flex flex-col gap-2'>
              $100.000,00
              <div className="flex gap-3">
              <div className="text-greylish flex items-center gap-1 text-sm">1.000 <img src="/icons/currencies/celoiconsquare.svg" className="rounded-full" alt="" /> Celo</div>
              <div className="text-greylish flex items-center gap-1 text-sm">1.000 <img src="/icons/currencies/celodollar.svg" alt="" /> Celo</div>
              </div>
          </div>
      </div>
      <div className='flex flex-col  gap-12 lg:gap-4 !mt-0'>
          <div className='text-xl font-bold'>Total Pending</div>
          <div className='text-2xl font-semibold flex flex-col gap-2'>
              $240.000,00
              <div className="flex gap-3">
              <div className="text-greylish flex items-center gap-1 text-sm">1.000 <img src="/icons/currencies/celoiconsquare.svg" className="rounded-full" alt="" /> Celo</div>
              <div className="text-greylish flex items-center gap-1 text-sm">1.000 <img src="/icons/currencies/celodollar.svg" alt="" /> Celo</div>
              </div>
          </div>
      </div>
      <div className='flex flex-col  gap-12 lg:gap-4 !mt-0'>
          <div className='text-xl font-bold'>Total Available</div>
          <div className='text-2xl font-semibold flex flex-col gap-2'>
              $98.000,00
              <div className="flex gap-3">
              <div className="text-greylish flex items-center gap-1 text-sm">1.000 <img src="/icons/currencies/celoiconsquare.svg" className="rounded-full" alt="" /> Celo</div>
              <div className="text-greylish flex items-center gap-1 text-sm">1.000 <img src="/icons/currencies/celodollar.svg" alt="" /> Celo</div>
              </div>
          </div>
      </div>
  </div>
</div>
}

export default TotalValues