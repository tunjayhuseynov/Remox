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
    tooltip: {
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
          return (
            '<div class="flex flex-col gap-3 bg-white dark:bg-dark px-4 py-3 border-none rounded-lg min-w-[13rem] min-h-[5rem]">' +
            '<div class="flex justify-between">' +
            "<span class='text-greylish dark:text-white text-sm'>" +
            w.globals.timescaleLabels[dataPointIndex].value + ' ' + w.globals.timescaleLabels[dataPointIndex].year +
            "</span>" +
            "<span class='text-greylish dark:text-white text-sm'>" +
             "" +
            "</span>" +
            "</div>"+
            '<div class="flex justify-between">' +
            "<span class='text-base flex items-center gap-2 font-semibold'>" +
            '<div class="rounded-full bg-primary w-3 h-3"></div>' +
            'Balance '+ 
            "</span>" +
            "<span class='text-base font-bold'>" +
          "$"+ series[seriesIndex][dataPointIndex].toFixed(2)+
            "</span>" +
            "</div>"+
            "</div>"
          );
        }
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
    stroke: { curve: "straight" },
    xaxis: {
      type: "datetime",
      categories: [
        ...Object.keys(data),
      ],
    },
  };

  return <div className="flex items-center justify-center h-[80%] w-[80%] box-border xl:h-full xl:w-full bg-white dark:bg-darkSecond rounded-full">
    <ReactApexChart
      options={options}
      series={series}
      type={'area'}
      height={350}
      className={'w-full h-full rounded-full'}
    />
  </div>
}

export default LineChart;