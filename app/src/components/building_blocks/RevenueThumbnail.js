import React from "react";
import Card from 'react-bootstrap/Card';
import FormatData from '../FormatData';
import AutoSaveText from '../utils/AutoSaveText';

const RevenueThumbnail = (props) => {
  const gameData = props.gameData;
  const caseStudy = props.caseStudy;

  return (
    <Card style={{height: '150px'}}>
      <Card.Header>
        <AutoSaveText
          saveKey="text.revenue_thumbnail_heading"
          text={caseStudy.text.revenue_thumbnail_heading || props.blockHeading || 'Revenue'}
          {...props}
        />
      </Card.Header>
      <Card.Body style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Card.Title>
            <FormatData
              caseStudy={caseStudy}
              format="price_int"
              name="compmany_revenue"
              value={props.mode == 'edit' ? caseStudy.financials.revenue : gameData.financials.revenue} />
        </Card.Title>
      </Card.Body>
    </Card>
  );
};

export default RevenueThumbnail;
