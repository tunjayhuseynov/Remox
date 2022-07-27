import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(
  () => import('react-apexcharts'),
  { ssr: false }
);


export function StackedChart({labels,box=true}:{labels:{name: string; color: string}[],box?:boolean}) {

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
    colors: ['#E8FF04', '#2D5EFF', '#EF2727',],
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
      labels: {
        show: box ? false : true
      },
      categories: ['Jun', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    },
    yaxis: {
      show: box ? false : true
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




  return <div className={` ${!box ? 'w-[90%] h-[90%]' : 'h-full w-full '} py-2 flex flex-col`}>
  <div className="w-full px-12 pt-3 flex ">
  <div className={`flex gap-12`}>
    {labels.map((item, i) => {
      return <div key={i} className="flex items-center gap-2">
        <div className={`w-5 h-5 `} style={{
          background: `${item.color}`,
        }}></div>
        <div className="font-semibold">{item.name}</div>
      </div>
    })}

  </div>
</div>
  <div className={`flex items-center justify-center w-full h-full `}>
    <ReactApexChart
      options={options}
      series={series}
      type="bar"
      className={'w-full h-full'}
    />
  </div>
  </div>
}

