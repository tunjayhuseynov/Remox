import dynamic from 'next/dynamic';
import { useAppSelector } from 'redux/hooks';
import { SelectDarkMode, SelectFiatSymbol } from 'redux/slices/account/remoxData';
import dateFormat from 'dateformat';

const ReactApexChart = dynamic(
  () => import('react-apexcharts'),
  { ssr: false }
);

function LineChart({ data, type, selectedDate }: { data: { [key: string]: number }, type: string, selectedDate: "week" | "month" | "quart" | "year" }) {
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
      show: false,
      position: 'back',
      // borderColor: "#707070",
      padding: {
        left: 20,
        right: 20, // Also you may want to increase this (based on the length of your labels)

        // left: chartDate === "month" ? 17 : chartDate === "quart" ? 20 : chartDate === "year" ? 20 : 15,
        // right: chartDate === "month" ? 20 : chartDate === "quart" ? 20 : chartDate === "year" ? 20 : 20,
      },
    },
    tooltip: {
      x: {
        format: "dd MMM yyyy",
        formatter: (value, { series, seriesIndex, dataPointIndex, w }) => {

          if (selectedDate === "week") {
            return dateFormat(value, "ddd")
          }
          if (selectedDate === "month" || selectedDate === "quart") {
            return dateFormat(value, "dd mmm")
          }
          return dateFormat(value, "mmm");
        }

      },
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        const date = keys[dataPointIndex];
        let number = series[seriesIndex][dataPointIndex];
        return (
          `<div class="flex flex-col gap-3 bg-white dark:bg-dark px-4 py-3 border-none rounded-lg min-w-[13rem] min-h-[5rem]">
            <div class="flex justify-between">
              <span class='text-greylish dark:text-white text-sm'>
                ${date ? new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <div class='text-base flex items-center gap-2 font-semibold'>
                <div class="rounded-full bg-primary w-3 h-3"></div>
                Balance
              </div>
            <div class='${Math.floor(number).toString().length == 6 ? "text-sm" : "text-base"} font-bold'>
            ${symbol}${Math.floor(number).toString().length > 6 ? Intl.NumberFormat('en-US', { notation: "compact" }).format(Math.floor(number)) : Math.floor(number).toLocaleString() + "." + (((+(number.toFixed(2)) - Math.floor(number)).toString().split(".")?.[1]?.substring(0, 2)) ?? "00")}
              </div>
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
    yaxis: { show: false, min: 0 },
    chart: {
      width: "100%",
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
      // offsetX: 20,
      tickPlacement: "on",
      labels: {
        formatter: (val) => {
          if (selectedDate === "week") {
            return dateFormat(val, "ddd")
          }
          if (selectedDate === "month" || selectedDate === "quart") {
            return dateFormat(val, "dd mmm")
          }
          return dateFormat(val, "mmm");
        }
      },
      categories: [
        ...Object.entries(data).map(([key, value]) => ({ x: new Date(key).getTime(), y: value }))
      ]
    },
  };


  return <>
    <ReactApexChart
      options={options}
      series={series}
      height={315}
      // width={'750'}
      type={'area'}
      className={'w-full h-full rounded-full flex'}
    />

  </>

}

export default LineChart;