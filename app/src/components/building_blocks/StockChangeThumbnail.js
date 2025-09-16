import React from "react";
import Card from 'react-bootstrap/Card';
import FormatData from '../FormatData';
import Icon from '../Icon';
import AutoSaveText from '../utils/AutoSaveText';
import AutoSaveInput from '../utils/AutoSaveInput';

const StockChangeThumbnail = (props) => {
  const caseStudy = props.caseStudy;

  const iconName = () => {
    const price = (props.mode == 'edit' ? caseStudy.financials.changeInStockChange : props.gameData.financials.changeInStockChange) || 0;
    if (price < 0) {
      return 'share_down';
    }
    if (price > 0) {
      return 'share_up';
    }
    return 'dash';
  };

  return (
    <Card style={{height: '150px'}}>
      <Card.Header>
        <AutoSaveText
          saveKey="text.stock_change_thumbnail_heading"
          text={caseStudy.text.stock_change_thumbnail_heading || props.blockHeading || 'Stock Change'}
          {...props}
        />
      </Card.Header>
      <Card.Body style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Card.Title>
          <FormatData
            caseStudy={caseStudy}
            format="amount_int"
            name="change_stock_change"
            value={(props.mode == 'edit' ? caseStudy.financials.changeInStockChange : props.gameData.financials.changeInStockPrice) || 0} />
          <Icon name={iconName()} />
          </Card.Title>
      </Card.Body>
      <Card.Footer>
      <Card.Text className="thumbnail_footer_text center">
        <Icon name={iconName()} />
          <FormatData
            caseStudy={caseStudy}
            format="percent_dec"
            name="change_stock_change_pct"
            value={(props.mode == 'edit' ? caseStudy.financials.changePctStockChange : props.gameData.financials.changePctStockPrice) || 0} />
        </Card.Text>
      </Card.Footer>
    </Card>
  );
};

export default StockChangeThumbnail;
