import React from "react";
import Card from 'react-bootstrap/Card';
import ProgressBarColored from '../utils/ProgressBarColored';
import AutoSaveText from '../utils/AutoSaveText';

const UnitsSoldThumbnail = (props) => {
  const gameData = props.gameData;
  const caseStudy = props.caseStudy;

  return (
    <Card style={{height: '150px'}}>
      <Card.Header>
        <AutoSaveText
          saveKey="text.units_sold_thumbnail_heading"
          text={caseStudy.text.units_sold_thumbnail_heading || props.blockHeading || 'UnitsSold'}
          {...props}
        />
      </Card.Header>
      <Card.Body style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Card.Title>{props.mode == 'edit' ? caseStudy.financials.unitsSold : gameData.financials.unitsSold}</Card.Title>
      </Card.Body>
    </Card>
  );
};

export default UnitsSoldThumbnail;
