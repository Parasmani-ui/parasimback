import React from "react";
import Card from 'react-bootstrap/Card';
import FormatData from '../FormatData';
import Icon from '../Icon';
import AutoSaveText from '../utils/AutoSaveText';
import AutoSaveInput from '../utils/AutoSaveInput';

const StockPriceThumbnail = (props) => {
  const caseStudy = props.caseStudy;
  const heading = props.blockHeading || 'Stock Price';

  return (
    <Card style={{height: '150px'}}>
      <Card.Header>
        <AutoSaveText
          saveKey="text.stock_thumbnail_heading"
          text={caseStudy.text.stock_thumbnail_heading || props.blockHeading || 'Stock Price'}
          {...props}
        />
      </Card.Header>
      <Card.Body style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Card.Title className="stock_price">
            <FormatData
              caseStudy={caseStudy}
              format="price_dec"
              name="stock_price"
              value={(props.mode == 'edit' ? caseStudy.financials.stock_price : props.gameData.financials.stock_price) || 0} />
        </Card.Title>
      </Card.Body>
    </Card>
  );
};

export default StockPriceThumbnail;
