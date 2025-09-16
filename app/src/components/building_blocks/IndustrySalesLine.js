import React from 'react';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import { Line } from 'react-chartjs-2';
import Card from 'react-bootstrap/Card';
import AutoSaveText from '../utils/AutoSaveText';
import { oppositeColor } from '../utils/common';
import SegmentColorsButton from '../utils/SegmentColorsButton';
import Icon from '../Icon.js';
import InfoToolbar from '../utils/InfoToolbar';

Chart.register(CategoryScale);
Chart.register(LinearScale);
Chart.register(PointElement);
Chart.register(LineElement);

const IndustrySalesLine = (props) => {
  const game = props.game;
  const caseStudy = props.caseStudy;
  const gameState = props.gameState;
  const gameData = props.gameData;
  const currentQuarter = parseInt(gameState.current_quarter || 0);
  const _labels = caseStudy.quarters.labels;
  const sales = {};
  const teams = props.mode == 'edit' ? Object.values(gameState.teams) : props.teams;

  const _segments = caseStudy.market.segments;
  const segments = {};
  _segments.forEach((segment) => {
    segments[segment.name] = segment;
    sales[segment.name] = Array(currentQuarter).fill(0);
  });

  teams.forEach((team) => {
    for (var i = 0; i < currentQuarter; i++) {
      const products = team.products[i];
      products.forEach((product) => {
        sales[product.target][i] += product.unitsSold;
      });
    }
  });

  const datasets = [];
  for (var prop in sales) {
    if (!segments[prop]) {
      delete sales[prop];
      continue;
    }

    const _lineData = [];
    for (var i = 0; i < props.currentQuarter; i++) {
      _lineData[i] = sales[prop][i];
    }
    
    const _data = {
      label: prop,
      data: _lineData,
      borderColor: segments[prop].color,
      backgroundColor: segments[prop].color,
      lineTension: 0.1
    };

    datasets.push(_data);
  }

  const labels = {};
  const nqtrs = props.mode == 'edit' ? (Object.keys(caseStudy.quarters.labels).length - 1) : parseInt(props.selectedGame.no_of_qtrs);
  const keys = Object.keys(caseStudy.quarters.labels).slice(0, nqtrs + 1);

  keys.forEach(key => {
    labels[key] = caseStudy.quarters.labels[key];
  });

  const chartLabels = Object.values(labels);

  const data = {
    labels: chartLabels,
    datasets: datasets
  };

  // most documentation give examples of chartjs v2 while the current version is 3
  // so need to check for different syntax for scales
  // https://www.chartjs.org/docs/3.9.1/getting-started/v3-migration.html#_3-x-migration-guide
  const options = {
    scales: {
      y:
      {
        beginAtZero: true
      },
    },
    responsive: true,
    plugins: {
      legend: {
        display: true
      }
    }
  };

  return <Card style={{height: '100%'}}>
    <Card.Header>
      {props.mode == 'edit' &&
        <InfoToolbar
          show={props.mode == 'edit'}
          heading="Cannot edit these values"
          toolbarStyle={{ right: '25px' }}
          message={<span>
            This is only dummy data for admin, the actual data would be displayed for the user
          </span>}
        />
      }
      <IndustrySalesToolbar {...props} />
      <AutoSaveText
        saveKey="text.industry_sales_line_heading"
        text={caseStudy.text.industry_sales_line_heading || 'Total Industry Sales'}
        {...props}
      />
    </Card.Header>
    <Card.Body>
      <Line data={data} options={options} />
    </Card.Body>
  </Card>
};

const IndustrySalesToolbar = (props) => {
  const caseStudy = props.caseStudy;

  const toolbarStyle = {
    display: 'flex',
    position: 'absolute',
    right: 0,
    top: 0,
    textAlign: 'right',
    zIndex: 1
  };

  if (props.toolbarStyle) {
    for (var prop in props.toolbarStyle) {
      toolbarStyle[prop] = props.toolbarStyle[prop];
    }
  }

  return (
    <span className='editable_wrapper demand_forecast_toolbar' style={{ position: 'relative', display: 'block' }} >
      <span className="toolbar" style={toolbarStyle}>
        <SegmentColorsButton {...props} />
      </span>
    </span>
  );
};

export default IndustrySalesLine;
