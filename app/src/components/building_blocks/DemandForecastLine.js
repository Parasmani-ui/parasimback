import React from 'react';
import {useState} from 'react';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import { Line } from 'react-chartjs-2';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import AutoSaveText from '../utils/AutoSaveText';
import AutoSaveInput from '../utils/AutoSaveInput';
import SegmentColorsButton from '../utils/SegmentColorsButton';
import Icon from '../Icon.js';
import ShowModal from '../utils/ShowModal';
import ShowToast from '../utils/ShowToast';
import { uuid } from '../utils/common';
import { post } from '../utils/ServerCall';
import db from '../utils/db';
import InfoToolbar from '../utils/InfoToolbar';

Chart.register(CategoryScale);
Chart.register(LinearScale);
Chart.register(PointElement);
Chart.register(LineElement);

const DemandForecastLine = (props) => {
  const game = props.game;
  const caseStudy = props.caseStudy;
  const gameState = props.gameState;
  const gameData = props.gameData;
  const _segments = props.mode != 'edit' && gameData.segments ? gameData.segments : caseStudy.market.segments;

  const labels = {};
  const nqtrs = props.mode == 'edit' ? (Object.keys(caseStudy.quarters.labels).length - 1) : parseInt(props.selectedGame.no_of_qtrs);
  const keys = Object.keys(caseStudy.quarters.labels).slice(0, nqtrs + 1);

  keys.forEach(key => {
    labels[key] = caseStudy.quarters.labels[key];
  });
  
  var demand = null;
  if (props.mode == 'edit') {
    demand = {};
    _segments.forEach((segment) => {
      const _demand = [];
      const initial = Array.isArray(caseStudy.initial_segment_demand) ? caseStudy.initial_segment_demand : Object.values(caseStudy.initial_segment_demand)[0];
      initial.forEach((_baseline) => {
        const mult = 1 + (Math.random() * (20) - 10) * segment.idx / 100;
        _demand.push(Math.round(_baseline * mult));
      });

      demand[segment.name] = _demand;
    });
  }
  else
  {
    if (game.useMarkets) {
      const team = game.game_data.team;
      const teams = gameState.teams;
      const market = teams[team].market;
      console.log(market);
      demand = gameState.demand[market];
    }
    else
    {
      demand = gameState.demand;
    }
  }

  const segments = {};
  _segments.forEach((segment) => {
    segments[segment.name] = segment;
  });

  const datasets = [];
  for (var prop in demand) {
    const _data = {
      label: prop,
      data: demand[prop],
      borderColor: segments[prop].color,
      backgroundColor: segments[prop].color,
      lineTension: 0.1
    };
    datasets.push(_data);
  }

  const data = {
    labels: Object.values(labels),
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
    <DemandForecastToolbar {...props} />
      <AutoSaveText
        saveKey="text.demand_forecast_line_heading"
        text={caseStudy.text.demand_forecast_line_heading || 'Quarterly Demand Forecast'}
        {...props}
      />
    </Card.Header>
    <Card.Body>
      <Line data={data} options={options} />
    </Card.Body>
  </Card>
};

const DemandForecastToolbar = (props) => {
  const caseStudy = props.caseStudy;
  const demand = { ...caseStudy.initial_segment_demand };
  const segments = caseStudy.market.segments;

  const [show, setShow] = useState(false);
  const [labels, setLabels] = useState({...caseStudy.quarters.labels});

  const timePeriodType = 'Quarters';

  segments.sort((a, b) => { return a.idx - b.idx; });

  const random = () => {
    return Math.round(Math.random() * 10000);
  };

  segments.forEach((segment) => {
    if (!demand[segment.name]) {
      demand[segment.name] = [random(), random(), random(), random(), random()];
    }
  });

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

  const quartersChanged = (e) => {
    const length = parseInt(e.target.value);
    const _updated = {};
    for (var i = 0; i <= length; i++) {
        _updated[i.toString()] = labels[i.toString()] || caseStudy.quarters.labels[i.toString()] || ('QQ' + i);
    }
    setLabels(_updated);
  };

  const handleClose = () => {
    setLabels({...caseStudy.quarters.labels});
    setShow(false);
  }

  const saveQuarters = async () => {
    await db.saveCaseStudyData(props, "quarters.labels", labels);
    setShow(false);
  };

  const demandClicked = () => {
    ShowModal({
      title: 'Edit Quarters',
      closeButtonText: 'Close',
      body: <Container style={{ minWidth: '400px' }}>
        <Row style={{ fontWeight: 'bold', marginBottom: '20px' }}>
          <Col>Quarter</Col>
          {segments.map((segment, idx) => (
            <Col key={uuid()}>{segment.name}</Col>
          ))}
        </Row>
        {Object.keys(labels).map((key, idx) => (
          <Row key={uuid()}>
            <Col>{labels[key]}</Col>
            {segments.map((segment, _idx) => (
              <Col key={uuid()}>
                <Form.Control
                  type="number"
                  defaultValue={demand[segment.name][idx] || 0}
                  onChange={(e) => { demand[segment.name][idx] = e.target.value }}
                />
              </Col>
            ))}
          </Row>
        ))}
      </Container>,
      buttons: [
        {
          text: 'Save',
          onClick: async () => {
            await saveCaseStudyData(props, "initial_segment_demand", demand);
            return true;
          }
        }
      ]
    });
  };

  return (
    <>
      {props.mode == 'edit' &&
        <InfoToolbar
          show={props.mode == 'edit'}
          heading="Cannot edit these values"
          toolbarStyle={{ right: '50px' }}
          message={<span>
            This is only dummy data. The actual demand forecast data would be auto generated by the system based on case study values and number of teams and it would be shown to the user.
          </span>}
        />
      }
    <span className='editable_wrapper demand_forecast_toolbar' style={{ position: 'relative', display: 'block' }} >
      <span className="toolbar" style={toolbarStyle}>
        {props.mode == 'edit' && <span className="toolbar_button edit_quarters" onClick={() => {setShow(true)}} ><Icon name="calendar" /></span>}
        {/*props.mode == 'edit' && <span className="toolbar_button edit_demand" onClick={demandClicked} ><Icon name="demand_forecast" /></span>*/}
        <SegmentColorsButton {...props} />
      </span>
    </span>
    <Modal show={show} onHide={handleClose}>
    <Modal.Header closeButton>
      <Modal.Title>Edit Quarter Labels</Modal.Title>
    </Modal.Header>
    <Modal.Body>
    <Container style={{ minWidth: '400px' }}>
        <Row style={{ fontWeight: 'bold', marginBottom: '20px' }}>
          <Col>
            <Form.Control
                type="number"
                defaultValue={Object.keys(labels).length - 1 || 0}
                onChange={quartersChanged}
              />
          </Col>
          <Col>
            <AutoSaveText
              text={caseStudy.text.time_period_type || timePeriodType}
              saveKey="text.time_period_type"
              {...props}
            />
          </Col>
        </Row>
        {Object.keys(labels).map((key, idx) => (
          <Row key={idx}>
            <Col>{idx}</Col>
            <Col key={uuid()}>
              <Form.Control
                type="text"
                defaultValue={labels[key] || ('QQ' + idx)}
                onChange={(e) => {labels[key] = e.target.value}}
              />
            </Col>
          </Row>
        ))}
      </Container>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="primary" onClick={saveQuarters}>Save</Button>
      <Button variant="secondary" onClick={handleClose}>Cancel</Button>
    </Modal.Footer>
  </Modal>
  </>
  );
};

export default DemandForecastLine;
