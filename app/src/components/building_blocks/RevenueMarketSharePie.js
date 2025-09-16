import React from 'react';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import Card from 'react-bootstrap/Card';
import { oppositeColor } from '../utils/common';
import InfoToolbar from '../utils/InfoToolbar';
import AutoSaveText from '../utils/AutoSaveText';

Chart.register(ArcElement, Tooltip, Legend);

const RevenueMarketSharePie = (props) => {
  const game = props.game;
  const caseStudy = props.caseStudy;
  const gameState = props.gameState;
  const gameData = props.gameData;
  const teams = props.mode == 'edit' ? Object.values(gameState.teams) : props.teams;

  const _labels = [];
  const _values = [];
  const _colors = [];
  const _borders = [];

  teams.forEach((team) => {
    _labels.push(team.name);
    _values.push(parseInt(team.revenue));
    const _color = team.color;
    _colors.push(_color);
    _borders.push(oppositeColor(_color));
  });

  const options = {
    plugins: {
      legend: {
        position: 'bottom',
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

  const data = {
    labels: _labels,
    datasets: [
      {
        label: 'Volume Market Share',
        data: _values,
        backgroundColor: _colors,
        borderColor: _borders,
        borderWidth: 1,
      },
    ],
  };

  return <Card className="center">
    <Card.Header>
      <InfoToolbar 
        show={props.mode == 'edit'}
        heading="Cannot edit these values" 
        message={<span>
          The team related information is different for each game so it needs to be changed in Game Management section.
        </span>}
      />
      <AutoSaveText 
        saveKey="text.revenue_market_share_heading"
        text={caseStudy.text.revenue_market_share_heading || 'Revenue Market Share'}
        {...props}
      />
    </Card.Header>
    <Card.Body>
      <Pie data={data} options={options} />
    </Card.Body>
  </Card>;
};

export default RevenueMarketSharePie;
