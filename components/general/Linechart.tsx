// import { Line } from 'react-chartjs-2';
// import {Chart as ChartJS, Title, Tooltip, LineElement, Legend, CategoryScale, LinearScale, PointElement, Filler} from 'chart.js';
// ChartJS.register(
//   Title, Tooltip, LineElement, Legend,
//   CategoryScale, LinearScale, PointElement, Filler
// )

import dynamic from 'next/dynamic';
import React, { useState } from 'react'

const ReactApexChart = dynamic(
  () => import('react-apexcharts'),
  { ssr: false }
);

function LineChart({ data,type }: { data: any,type:string }) {


  const series = [
    {
      name: "Cases",
      data: [
        3845718,
        5557415,
        1203228,
        6907340,
        3343777,
        8836549,
        1674466,
        9324638,
        2055423,
       
        
      ],

    },

  ];
  const options: ApexCharts.ApexOptions = {
    colors: ['#ff501a'],
    grid: {
      show: false,
    },
    legend: {
      show: false,
      showForSingleSeries: false,
      showForNullSeries: false,
      showForZeroSeries: false,
    },
    yaxis: {
      show: false,
    },
    chart: {
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false
      }
    },

    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
    },

    xaxis: {
      type: "datetime",
      categories: [
        "1/22/20",
        "2/1/20",
        "2/15/20",
        "3/1/20",
        "3/15/20",
        "4/1/20",
        "4/15/20",
        "5/1/20",
        "5/7/20",
      ],
    },
  };

  return <div className="flex items-center justify-center h-[80%] w-[80%]  xl:h-full xl:w-full">
    <ReactApexChart
      options={options}
      series={series}
      type={type === 'area' ? 'area' : 'bar'}
      height={350}
      className={'w-full h-full'}
    />
  </div>
}

export default LineChart;