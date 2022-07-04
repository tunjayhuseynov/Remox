import useNextSelector from 'hooks/useNextSelector';
import dynamic from 'next/dynamic';
import { IFlowDetail } from 'pages/api/calculation/spending';
import { selectDarkMode } from 'redux/slices/notificationSlice';

const ReactApexChart = dynamic(
    () => import('react-apexcharts'),
    { ssr: false }
);

export function BasicCharts({ BudgetData, type, box = true }: { BudgetData?: number[], type?: string, box?: boolean }) {
    const dark = useNextSelector(selectDarkMode)



    if (BudgetData) {
        BudgetData.push()
    }

    const series = [{
        name: 'Active',
        data: [44, 55, 57, 56, 61, 58, 63, 60, 66]
    }, {
        name: 'Budgeted',
        data: BudgetData ? [54, 97, 41, 6, 73, 6, 64, 49, 83] : []
    }]


    const options: ApexCharts.ApexOptions = {
        theme: { mode: dark ? "dark" : "light" },
        colors: ['#FF7348', '#D9D9D9'],
        chart: {
            toolbar: { show: false },
            type: 'bar',
            height: 350
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '55%',
            },
        },

        dataLabels: {
            enabled: false,
        },
        stroke: {
            show: true,
            width: 2,
            colors: ['transparent']
        },
        xaxis: {
            labels: {
                show: box ? false : true
            },
            categories: ['Jun', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        },
        yaxis: {
            show: box ? false : true
        },
        fill: {
            opacity: 1
        },
        legend: {
            show: false
        }
    }





    return <div className={` ${!box ? 'w-[90%] h-[90%]' : 'h-full w-full '}  py-2 flex flex-col`}>
        <div className="w-full pl-12 pr-4 py-3 flex justify-between">
            <div className={`flex ${BudgetData && 'gap-12'}`}>
                {BudgetData && <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-greylish bg-opacity-40"></div>
                    <div className="font-semibold">Budgeted</div>
                </div>}
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-primary"></div>
                    <div className="font-semibold">Actual</div>
                </div>
            </div>
        </div>
        <div className={`flex items-center justify-center w-full h-full`}>
            <ReactApexChart
                options={options}
                series={series}
                type="bar"
                className={'w-full h-full'}
            />
        </div>
    </div>
}