import React from 'react'

function TotalValues() {

    const total = [
        {
            id: 0,
            name: "Total Budget",
            value: "$300.000,00 USD"
        },
        {
            id: 1,
            name: "Total Used",
            value: "$100.000,00"
        },
        {
            id: 2,
            name: "Total Pending",
            value: "$140.000,00"
        },
        {
            id: 3,
            name: "Total Available",
            value: "$100.000,00"
        },
    ]

    return <div className="py-4  border-b dark:border-[#aaaaaa]">
        <div className='flex   '>
            {total.map((item, index) => {
                return <div key={index} className={`flex ${item.id===0 ? 'pr-8' : 'pl-28'}  flex-col  gap-12 lg:gap-4 !mt-0`}>
                    <div className='text-xl font-bold'>{item.name}</div>
                    <div className={` ${item.id === 0 ? 'text-4xl' : 'text-2xl'} font-semibold flex flex-col gap-2`}>
                        {item.value}
                    </div>
                </div>
            })}
        </div>
    </div>
}

export default TotalValues