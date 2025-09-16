import React from "react";
import { useState, useEffect } from "react";
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import AutoSaveText from '../utils/AutoSaveText';
import AutoSaveInput from '../utils/AutoSaveInput';
import EditableListRowToolbar from '../utils/EditableListRowToolbar';
import EditableListColToolbar from '../utils/EditableListColToolbar';
import {randomColor} from '../utils/common';

const MarketSegmentsSummary = (props) => {
  const caseStudy = props.caseStudy;
  const segments = caseStudy.market.segments.sort((a, b) => { return a.idx - b.idx; });

  const template = {
    "idx": 0,
    "name": "Segment Name",
    "description": "Please edit this segment description.",
    "ideal_price": 0,
    "market_size": 0,
    "color": randomColor()
  };

  const getLastDistribution = () => {
    var total = 0;
    for (var i = 0; i < segments.length - 1; i++) {
      total += parseInt(segments[i].demand_distribution) || 0;
    }

    return 100 - total;
  };

  return (
    caseStudy && <Card>
      <Card.Header>
        <AutoSaveText
          saveKey={'text.market_segments_heading'}
          text={caseStudy.text.market_segments_heading || 'Market Segments'}
          {...props}
        />
      </Card.Header>
      <Container>
        <Row style={{ position: 'relative' }}>
          <EditableListRowToolbar
            template={template}
            saveKey="market.segments"
            list={segments}
            toolbarStyle={{ top: '-30px' }}
            {...props}
          />
          {segments && segments.map((segment, sidx) => (
            <Col key={sidx}>
              <EditableListColToolbar
                saveKey="market.segments"
                list={segments}
                idx={segment.idx}
                {...props}
              />
              <Card.Body style={{ position: 'relative' }}>
                <Card.Subtitle style={{margin: '10px 0'}}>
                  <AutoSaveText
                    text={segment.name}
                    saveKey="market.segments.$[i].name"
                    filters={[{ "i.idx": segment.idx }]}
                    {...props}
                  />
                </Card.Subtitle>
                <Card.Text>
                  <AutoSaveText
                    text={segment.description}
                    saveKey="market.segments.$[i].description"
                    filters={[{ "i.idx": segment.idx }]}
                    {...props}
                  />
                </Card.Text>
                {props.mode == 'edit' &&
                  <Container>
                    <Card.Text>Chart Color</Card.Text>
                    <AutoSaveInput
                      type="color"
                      value={segment.color}
                      saveKey="market.segments.$[i].color"
                      filters={[{ "i.idx": segment.idx }]}
                      {...props}
                    />
                    <Card.Text>Ideal Price</Card.Text>
                    <AutoSaveInput
                      type="currency_int_pos"
                      value={segment.ideal_price}
                      saveKey="market.segments.$[i].ideal_price"
                      filters={[{ "i.idx": segment.idx }]}
                      {...props}
                    />
                    <Card.Text>Demand Distribution Ratio</Card.Text>
                    <AutoSaveInput
                      type="int_pos"
                      value={segment.demand_distribution}
                      saveKey="market.segments.$[i].demand_distribution"
                      filters={[{ "i.idx": segment.idx }]}
                      {...props}
                    />
                  </Container>
                }
              </Card.Body>
            </Col>
          ))}
        </Row>
      </Container>
    </Card>
  );
};

export default MarketSegmentsSummary;
