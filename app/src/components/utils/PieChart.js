import React from 'react';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
//import { Doughnut } from 'react-chartjs-2';
import Card from 'react-bootstrap/Card';

Chart.register(ArcElement, Tooltip, Legend);

const PieChart = (props) => {

  const options = {
    plugins: {
      legend: {
        position: props.labelPosition,
        labels: {
          font: {
            size: 10,
          },
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? Math.round(value / total * 100) : 0;
            return `${label}: ${percentage}%`;
          }
        }
      },
    },
  };
  
  return <Card className="center chart_card">
    <Card.Header>{props.heading}</Card.Header>
    <Card.Body>
      <Pie data={props.data} options={options} />
    </Card.Body>
  </Card>
};

export default PieChart;
