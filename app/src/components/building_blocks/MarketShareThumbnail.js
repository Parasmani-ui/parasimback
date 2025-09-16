import React from "react";
import Card from 'react-bootstrap/Card';
import ProgressBarColored from '../utils/ProgressBarColored';
import AutoSaveText from '../utils/AutoSaveText';
import AutoSaveInput from '../utils/AutoSaveInput';

const MarketShareThumbnail = (props) => {
  const gameData = props.gameData;
  const team = props.user.team;
  const caseStudy = props.caseStudy;
  const gameState = props.gameState;

  return (
    <Card style={{height: '150px'}}>
      <Card.Header>
        <AutoSaveText
          saveKey="text.market_share_thumbnail_heading"
          text={caseStudy.text.market_share_thumbnail_heading || props.blockHeading || 'Market Share'}
          {...props}
        />
      </Card.Header>
      <Card.Body>
        <ProgressBarColored now={gameData.financials.marketShare} {...props} />
      </Card.Body>
      <Card.Footer>
      <Card.Text className="thumbnail_footer_text center">{gameData.financials.marketShare}%</Card.Text>
      </Card.Footer>
    </Card>
  );
};

export default MarketShareThumbnail;
