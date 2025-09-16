import React from 'react';
import Card from 'react-bootstrap/Card';
import { Bar } from 'react-chartjs-2';
import { oppositeColor } from '../utils/common';
import AutoSaveText from '../utils/AutoSaveText';

const ProductRevenueBar = (props) => {
  const game = props.game;
  const caseStudy = props.caseStudy;
  const gameState = props.gameState;
  const gameData = props.gameData;
  const currentQuarter = parseInt(gameState.current_quarter || 0);
  const teams = props.mode == 'edit' ? Object.values(gameState.teams) : props.teams;

  var maxProds = 0;
  teams.forEach((team) => {
    const _products = team.products[currentQuarter - 1];
    const nprods = _products.length;
    if (nprods > maxProds) {
      maxProds = nprods;
    }
  });

  const sales = [];

  for (var i = 0; i < maxProds; i++) {
    if (!sales[i]) {
      sales[i] = [];
    }
  }

  teams.forEach((team) => {
    const _products = team.products[currentQuarter - 1];
    const products = _products.sort((a, b) => {return a.idx - b.idx});
    products.forEach((product, idx) => {
      sales[idx].push(product.revenue);
    });
    
    if (products.length < maxProds) {
      for (var i = products.length; i < maxProds; i++) {
        sales[i].push(0);
      }
    }
  });

  const chartData = {
    labels: [],
    datasets: []
  };

  const _dataset = {};

  teams.forEach((team) => {
    chartData.labels.push(team.name);
    
    const _products = team.products[currentQuarter - 1];
    const products = _products.sort((a, b) => {return a.idx - b.idx});
    products.forEach((product, idx) => {
      if (!_dataset[idx]) {
        _dataset[idx] = {};
      }
      const _data = _dataset[idx];
      _data.label = product.name,
      _data.backgroundColor = product.color;
      _data.borderColor = oppositeColor(product.color);
      _data.borderWidth = 1;
      _data.data = sales[idx];
    });

    if (products.length < maxProds) {
      for (var i = products.length; i < maxProds; i++) {
        if (!_dataset[i]) {
          _dataset[i] = {};
        }
        const _data = _dataset[i];
        _data.label = 'Product ' + (i + 1),
        _data.borderWidth = 1;
        _data.data = sales[i];
      }
    }
  });

  chartData.datasets = Object.values(_dataset);

  return <Card className="center">
  <Card.Header>
    <AutoSaveText
      saveKey="text.product_revenue_bar_heading"
      text={caseStudy.text.product_revenue_bar_heading || 'Product Revenue'}
      {...props}
    />
  </Card.Header>
  <Card.Body>
    <Bar data={chartData} />
  </Card.Body>
</Card>;

};

export default ProductRevenueBar;
