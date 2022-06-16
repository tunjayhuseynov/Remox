import useNextSelector from 'hooks/useNextSelector';
import dynamic from 'next/dynamic';
import { IFlowDetail } from 'pages/api/calculation/spending';
import { selectDarkMode } from 'redux/reducers/notificationSlice';

const ReactApexChart = dynamic(
  () => import('react-apexcharts'),
  { ssr: false }
);

export function NegativeChart({ data, type }: { data?: Omit<IFlowDetail, "total">, type?: string }) {
  const dark = useNextSelector(selectDarkMode)



  const series = [{
    name: 'Cash Flow',
    data: [1.45, 5.42, 5.9, -0.42, -12.6, -18.1, -18.2, -14.16, -11.1, -6.09, 0.34, 3.88, 13.07,
      5.8, 2, 7.37, 8.1, 13.57, 15.75, 17.1, 19.8, -27.03, -54.4, -47.2, -43.3, -18.6, -
      48.6, -41.1, -39.6, -37.6, -29.4, -21.4, -2.4
    ]
  }];

  const options: ApexCharts.ApexOptions = {
    theme: { mode: dark ? "dark" : "light" },
    colors: ['#FF7348','#D9D9D9'],
    series: [{
      name: 'Cash Flow',
      data: [1.45, 5.42, 5.9, -0.42, -12.6, -18.1, -18.2, -14.16, -11.1, -6.09, 0.34, 3.88, 13.07,
        5.8, 2, 7.37, 8.1, 13.57, 15.75, 17.1, 19.8, -27.03, -54.4, -47.2, -43.3, -18.6, -
        48.6, -41.1, -39.6, -37.6, -29.4, -21.4, -2.4
      ]
    }],
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
      type: 'bar',
      height: 350
    },
    plotOptions: {
      bar: {
        colors: {
          ranges: [{
            from: -100,
            to: -46,
            color: '#F15B46'
          }, {
            from: -45,
            to: 0,
            color: '#FEB019'
          }]
        },
        columnWidth: '80%',
      }
    },
    dataLabels: {
      enabled: false,
    },
    yaxis: {
     show:false,

    },
    xaxis:{
      labels:{
        show: false
      }
    },
  };


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