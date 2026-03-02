import { PropsWithoutRef } from "react";
import {Bar} from "react-chartjs-2"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );
interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  > {
  chartData: {
      skill: string,
      value: number
  }[];
}
const options = {
    indexAxis: 'y' as const,
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales:{
        y: {
            ticks:{
                mirror:true,
                z: 1
            }
        },

    },
    plugins: {
      legend: {
        display:false,
      },
     
    },
    
  };

export default function IssuesChart(props: PropsWithoutRef<Props>){
    const {chartData} = props;
    const labels = chartData.map(item => item.skill);
    const dataset = {
        label:"",
        backgroundColor: 'rgba(242, 135, 50,0.75)',
        data:[...chartData.map(item => item.value)]
    }
    return <Bar options={options} data={{labels,datasets:[dataset]}}/>
}