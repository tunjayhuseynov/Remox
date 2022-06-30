import useNextSelector from 'hooks/useNextSelector';
import dynamic from 'next/dynamic';
import { IFlowDetail } from 'pages/api/calculation/spending';
import { selectDarkMode } from 'redux/slices/notificationSlice';

const ReactApexChart = dynamic(
  () => import('react-apexcharts'),
  { ssr: false }
);


export function StackedChart() {

  const series = [{
    name: 'Full',
    data: [44, 55, 41, 67, 22, 43]
  }, {
    name: 'Nam',
    data: [13, 23, 20, 8, 13, 27]
  }, {
    name: 'Tags',
    data: [11, 17, 15, 15, 21, 14]
  }]

  const options: ApexCharts.ApexOptions = {
    colors: ['#E8FF04','#2D5EFF','#EF2727',],
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
      type: 'bar',
      height: 350,
      stacked: true,
    },
    responsive: [{
      breakpoint: 480,

    }],
    plotOptions: {
      bar: {
        columnWidth: '25%',
        horizontal: false,
      },
    },
    xaxis: {
      categories: ['Jun', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    },
    dataLabels: {
      enabled: false,
    },
    fill: {
      opacity: 1
    },
    legend: {
      show: false
    },
  }


  return <div className="flex items-center justify-center h-[80%] w-[80%]  xl:h-full xl:w-full bg-white dark:bg-darkSecond">
    <ReactApexChart
      options={options}
      series={series}
      type="bar"
      height={350}
      className={'w-full h-full'}
    />
  </div>
}

