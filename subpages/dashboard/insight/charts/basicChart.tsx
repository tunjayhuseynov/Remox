import useNextSelector from 'hooks/useNextSelector';
import dynamic from 'next/dynamic';
import { IFlowDetail } from 'pages/api/calculation/spending';
import { selectDarkMode } from 'redux/slices/notificationSlice';

const ReactApexChart = dynamic(
    () => import('react-apexcharts'),
    { ssr: false }
);

export function BasicCharts({ BudgetData, type }: { BudgetData?:number[], type?: string }) {
    const dark = useNextSelector(selectDarkMode)



    const series = [{
        name: 'Active',
        data: [44, 55, 57, 56, 61, 58, 63, 60, 66]
    }, {
        name: 'Budgeted',
        data: BudgetData ? BudgetData : []
    }]

    const options: ApexCharts.ApexOptions = {
        theme: { mode: dark ? "dark" : "light" },
        colors: ['#FF7348','#D9D9D9'],
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
            categories: ['Jun','Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct','Nov','Dec'],
        },

        fill: {
            opacity: 1
        },
        legend: {
            show: false
          }
    }





return <div className="flex items-center justify-center h-[80%] w-[80%]  xl:h-full xl:w-full bg-white dark:bg-darkSecond">
    <ReactApexChart
        options={options}
        series={series}
        height={350}
        type="bar"
        className={'w-full h-full'}
    />
</div>
}