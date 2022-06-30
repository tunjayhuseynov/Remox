import useNextSelector from 'hooks/useNextSelector';
import dynamic from 'next/dynamic';
import { IFlowDetail } from 'pages/api/calculation/spending';
import { selectDarkMode } from 'redux/slices/notificationSlice';

const ReactApexChart = dynamic(
  () => import('react-apexcharts'),
  { ssr: false }
);

function LineChart({ data, type }: { data: Omit<IFlowDetail, "total">, type: string }) {
  const dark = useNextSelector(selectDarkMode)

  const series = [
    {
      name: "Value",
      data: [
        ...Object.values(data),
      ],

    },

  ];

  const options: ApexCharts.ApexOptions = {
    theme: { mode: dark ? "dark" : "light" },
    colors: ['#ff501a'],
    grid: { show: false },
    legend: {
      show: false,
      showForSingleSeries: false,
      showForNullSeries: false,
      showForZeroSeries: false,
    },
    yaxis: { show: false },
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
      background: dark ? "#1C1C1C" : "#FFFFFF"
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth" },
    xaxis: {
      type: "datetime",
      categories: [
        ...Object.keys(data),
      ],
    },
  };

  return <div className="flex items-center justify-center h-[80%] w-[80%]  xl:h-full xl:w-full bg-white dark:bg-darkSecond">
    <ReactApexChart
      options={options}
      series={series}
      type={'area'}
      height={350}
      className={'w-full h-full'}
    />
  </div>
}

export default LineChart;