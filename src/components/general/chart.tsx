import { Chart as ChartJs, Tooltip, Title, ArcElement, Legend } from 'chart.js';
import { Chart, getDatasetAtEvent, getElementAtEvent } from 'react-chartjs-2';
import { Dispatch, forwardRef, useCallback, useRef } from 'react';

ChartJs.register(
    Tooltip, Title, ArcElement, Legend
);
interface IDatatype {
    datasets: {
        data: number[];
        backgroundColor: string[];
        borderWidth: number;
        hoverOffset: number;
        offset?: number;
        spacing?: number;
    }[];
    labels: string[],
}

interface IProps {
    data: IDatatype;
    onClickEvent: (event: any)=> void
}


const Chartjs = forwardRef<ChartJs | undefined, IProps>((props, ref) => {
    const options = {
        responsive: true,
        layout: {
            padding: 15,
        },
        plugins: {
            tooltip: {
                enabled: false
            },
            legend: {
                display: false,
            },
        },
        events: [],
    };


    
    return <Chart type="doughnut" data={props.data} options={options} ref={ref} onMouseMove={props.onClickEvent} />
})

export default Chartjs;