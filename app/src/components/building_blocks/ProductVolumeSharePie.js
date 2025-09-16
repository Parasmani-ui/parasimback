import React from 'react';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { oppositeColor } from '../utils/common';
import StandardToolbar from '../utils/StandardToolbar';
import AutoSaveText from '../utils/AutoSaveText';
import AutoSaveInput from '../utils/AutoSaveInput';
import ShowToast from '../utils/ShowToast';
import ShowModal from '../utils/ShowModal';
import db from '../utils/db'

Chart.register(ArcElement, Tooltip, Legend);

const ProductVolumeSharePie = (props) => {
  const caseStudy = props.caseStudy;
  const gameData = props.gameData;
  const products = (props.mode == 'edit' ? caseStudy.products : gameData.products).sort((a, b) => {return a.idx - b.idx});

  const style = props.style || {};

  const _labels = [];
  const _values = [];
  const _colors = [];
  const _borders = [];

  products.forEach((product) => {
    _labels.push(product.name);
    _values.push(parseInt(product.unitsSold));
    const _color = product.color;
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
        label: 'Product Volume Share',
        data: _values,
        backgroundColor: _colors,
        borderColor: _borders,
        borderWidth: 1,
      },
    ],
  };

  const saveColor = async (idx, color) => {
    props.mode == 'edit' ?
      await db.saveCaseStudyData(props, "products.$[i].color", color, [{ "i.idx": idx }]) :
      await db.saveGameData(props, "products.$[i].color", color, [{ "i.idx": idx }]);
  };

  return <Card className="center" style={style}>
    <Card.Header>
    {!props.hideColors && <Toolbar saveColor={saveColor} products={products} {...props} />}
      <AutoSaveText
        saveKey="text.product_volume_share_heading"
        text={caseStudy.text.product_volume_share_heading || 'Product Volume Share'}
        {...props}
      />
    </Card.Header>
    <Card.Body style={{ textAlign: 'center' }}>
      <Pie data={data} options={options} />
    </Card.Body>
  </Card>;
};

const Toolbar = (props) => {
  const buttons = [
    {
      name: 'edit_colors',
      icon: 'colors',
      click: () => {
        ShowModal({
          title: 'Edit Product Colors',
          closeButtonText: 'Close',
          body: <Container style={{minWidth: '300px'}}>
            <Row style={{ fontWeight: 'bold', marginBottom: '20px' }}>
              <Col>Product</Col>
              <Col>Chart Color</Col>
            </Row>
            {props.products.map((product, idx) => (
              <Row key={product.idx}>
                <Col>{product.name}</Col>
                <Col>
                  <AutoSaveInput
                    type="color"
                    value={product.color}
                    onSave={async (color) => await props.saveColor(idx, color)}
                    {...props}
                  />
                </Col>
              </Row>
            ))}
          </Container>
        });
      }

    }
  ];

  return (
    <StandardToolbar toolbarStyle={props.toolbarStyle} show={true} buttons={buttons} />
  );
};

export default ProductVolumeSharePie;
