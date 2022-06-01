import { Line } from 'react-chartjs-2';
import {Chart as ChartJS, Title, Tooltip, LineElement, Legend, CategoryScale, LinearScale, PointElement, Filler} from 'chart.js';
ChartJS.register(
  Title, Tooltip, LineElement, Legend,
  CategoryScale, LinearScale, PointElement, Filler
)

function LineChart({ data }: {data: any }) {

  const options= {
    plugins: {
      legend: {
        display: false
      }
      
    }
  }
  
  return  <div className="flex items-center justify-center h-[80%] w-[80%]  xl:h-full xl:w-full"><Line data={data} options={options}/></div>;
}

export default LineChart;