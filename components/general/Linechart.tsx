import dynamic from 'next/dynamic';
import { useAppSelector } from 'redux/hooks';
import { SelectDarkMode, SelectFiatSymbol } from 'redux/slices/account/remoxData';

const ReactApexChart = dynamic(
  () => import('react-apexcharts'),
  { ssr: false }
);

function LineChart({ data, type }: { data: { [key: string]: number }, type: string }) {
  const dark = useAppSelector(SelectDarkMode)
  const keys = Object.keys(data).map(s => new Date(s).getTime())
  const symbol = useAppSelector(SelectFiatSymbol)
  const series = [
    {
      name: "Value",
      data: [
        ...Object.entries(data).map(([key, value]) => ({ x: new Date(key).getTime(), y: value }))
      ],

    },

  ];

  const options: ApexCharts.ApexOptions = {
    noData: {
      text: "You do not have any transactions yet",
    },
    
    theme: { mode: dark ? "dark" : "light" },
    colors: ['#ff501a'],
    grid: {
      show: true,
      position: 'back',
      borderColor: "#707070",
      padding: {
        left: 20,
        right: 20, // Also you may want to increase this (based on the length of your labels)

        // left: chartDate === "month" ? 17 : chartDate === "quart" ? 20 : chartDate === "year" ? 20 : 15,
        // right: chartDate === "month" ? 20 : chartDate === "quart" ? 20 : chartDate === "year" ? 20 : 20,
      },
    },
    tooltip: {
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        const date = keys[dataPointIndex];

        return (
          `<div class="flex flex-col gap-3 bg-white dark:bg-dark px-4 py-3 border-none rounded-lg min-w-[13rem] min-h-[5rem]">
          <div class="flex justify-between">
          <span class='text-greylish dark:text-white text-sm'>
          ${date ? new Date(date).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "N/A"}
          </span>
          <span class='text-greylish dark:text-white text-sm'>
          </span>
          </div>
          <div class="flex justify-between">
          <span class='text-base flex items-center gap-2 font-semibold'>
          <div class="rounded-full bg-primary w-3 h-3"></div>
          Balance
          </span>
          <span class='text-base font-bold'>
          ${symbol}${series[seriesIndex][dataPointIndex].toFixed(2)}
          </span>
          </div>
          </div>`
        );
      },
      // x: {
      //   show: true,
      //   format: "dd MMM yyyy - hh:mm"
      // },
      //   y: {
      //     formatter: function( value, { series, seriesIndex, dataPointIndex, w }) {
      //       return '$'+ value.toFixed(2) 
      //     },
      //     title:{formatter: () =>  'Balance'}
      // },

    },
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
    stroke: {
      curve: 'smooth',
    },
    xaxis: {
      // tickAmount: "dataPoints",
      type: "datetime",
      categories: [
        ...Object.entries(data).map(([key, value]) => ({ x: new Date(key).getTime(), y: value }))
      ]
    },
  };

  console.log(data)

  return <>
    <ReactApexChart
      options={options}
      series={series}
      height={315}
      type={'area'}
      className={'w-full h-full rounded-full  flex'}
    />

  </>
    
}

export default LineChart;