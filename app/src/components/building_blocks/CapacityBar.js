import React from "react";
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import db from '../utils/db'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import AutoSaveText from '../utils/AutoSaveText';
import Icon from '../Icon.js';
import ShowModal from '../utils/ShowModal';
import AutoSaveInput from '../utils/AutoSaveInput';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


const CapacityBar = (props) => {
  const gameState = props.gameState;
  const caseStudy = props.caseStudy;
  const gameData = props.gameData;
  const currentQuarter = parseInt(gameState.current_quarter || 0);
  const teams = props.mode == 'edit' ? Object.values(gameState.teams) : props.teams;

  const capacityColor = props.mode != 'edit' && gameData.capacity_chart_color ? 
    gameData.capacity_chart_color : 
    (caseStudy.defaults && caseStudy.defaults.capacity_chart_color ? caseStudy.defaults.capacity_chart_color : "pink");

  const productionColor = props.mode != 'edit' && gameData.production_chart_color ? 
    gameData.production_chart_color : 
    (caseStudy.defaults && caseStudy.defaults.production_chart_color ? caseStudy.defaults.production_chart_color : "blue");

  const toolbarStyle = {
    display: 'flex',
    position: 'absolute',
    right: 0,
    top: 0,
    textAlign: 'right',
    zIndex: 1
  };

  const labels = [];
  const values = [];

  const capacity = {};
  const production = {};

  teams.forEach((team) => {
      capacity[team.name] = props.mode == 'edit' ? parseInt(caseStudy.financials.capacity || 0) : parseInt(team.capacity || 0);
      var _prod = 0;
      const products = props.mode == 'edit' ? caseStudy.products : team.products[currentQuarter - 1];
      products.forEach((product) => {
          _prod += product.actualProduction;
      });
      production[team.name] = _prod;
  });

  const chartData = {
    labels: [],
    datasets: []
  };

  const _dataset = [{data:[]}, {data:[]}];

  teams.forEach((team) => {
    chartData.labels.push(team.name);

    const _data1 = _dataset[0];
    _data1.label = 'Capacity';
    _data1.backgroundColor = capacityColor;
    _data1.borderColor = 'darkgrey';
    _data1.borderWidth = 1;
    _data1.data.push(capacity[team.name]);

    const _data2 = _dataset[1];
    _data2.label = 'Production';
    _data2.backgroundColor = productionColor;
    _data2.borderColor = 'darkgrey';
    _data2.borderWidth = 1;
    _data2.data.push(production[team.name]);
  })

  chartData.datasets = Object.values(_dataset);

  const saveColor = async (name, color) => {
    if (props.mode == 'edit') {
      await db.saveCaseStudyData(props, "defaults." + name, color);
      return;
    }

    gameData[name] = color;
    await props.updateGameData(gameData);
  };

  const editColorsClicked = () => {
    ShowModal({
      title: 'Edit Chart Colors',
      closeButtonText: 'Close',
      body: <Container style={{ minWidth: '300px' }}>
          <Row>
            <Col>Capaciy Color</Col>
            <Col>
              <AutoSaveInput
                type="color"
                value={capacityColor}
                onSave={async (color) => await saveColor('capacity_chart_color', color)}
                {...props}
              />
            </Col>
          </Row>
          <Row>
            <Col>Production Color</Col>
            <Col>
              <AutoSaveInput
                type="color"
                value={productionColor}
                onSave={async (color) => await saveColor('production_chart_color', color)}
                {...props}
              />
            </Col>
          </Row>
      </Container>
    });
  };

  return (
    <Card style={{height: '100%'}}>
      <Card.Header>
      <span className='editable_wrapper demand_forecast_toolbar' style={{ position: 'relative', display: 'block' }} >
          <span className="toolbar" style={toolbarStyle}>
            <span className="toolbar_button edit_colors" onClick={editColorsClicked} ><Icon name="colors" /></span>
          </span>
        </span>
        <AutoSaveText
          saveKey="text.capacity_bar_heading"
          text={caseStudy.text.capacity_bar_heading || 'Capacity Report Chart'}
          {...props}
        />
      </Card.Header>
      <Card.Body>
        <Bar data={chartData} />
      </Card.Body>
    </Card>
  );
};

export default CapacityBar;
