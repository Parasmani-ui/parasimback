import React from "react";
import Card from 'react-bootstrap/Card';
import FormatData from '../FormatData';
import AutoSaveText from '../utils/AutoSaveText';

const ProfitsThumbnail = (props) => {
  const gameData = props.gameData;
  const caseStudy = props.caseStudy;

  return (
    <Card style={{height: '150px'}}>
      <Card.Header>
        <AutoSaveText
          saveKey="text.profits_thumbnail_heading"
          text={caseStudy.text.profits_thumbnail_heading || props.blockHeading || 'Profits'}
          {...props}
        />
      </Card.Header>
      <Card.Body style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Card.Title>
            <FormatData
              caseStudy={caseStudy}
              format="price_int"
              name="compmany_profit"
              value={props.mode == 'edit' ? caseStudy.financials.profit : gameData.financials.profit} />
        </Card.Title>
      </Card.Body>
    </Card>
  );
};

export default ProfitsThumbnail;
