import { Chart as ChartJs, Tooltip, Title, ArcElement, Legend, DoughnutController } from 'chart.js';
import { Chart, getElementAtEvent } from 'react-chartjs-2';
import { Dispatch, forwardRef } from 'react';

ChartJs.register(
    Tooltip, Title, ArcElement, Legend, DoughnutController
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
    items: { name: string }[],
    dispatch: Dispatch<string>
}


const Chartjs = forwardRef<ChartJs | undefined, IProps>(function(props, ref) {
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

    const onHover = (ref: any, item: any, dispatch: any) => {
        return (event: any) => {
            const el = getElementAtEvent((ref as any).current as any, event)
            if (el.length > 0 && el[0].index >= 0) {
                const index = el[0].index ?? 1;
                dispatch(item[index]?.name ?? "");
                (ref as any).current.setActiveElements([{ datasetIndex: 0, index: index }])
            } else {
                (ref as any).current.setActiveElements([])
                dispatch("");
            }
            (ref as any).current.update()
        }
    }



    return <Chart type="doughnut" data={props.data} options={options} ref={ref} onMouseMove={onHover(ref, props.items, props.dispatch)} />
})

export default Chartjs;