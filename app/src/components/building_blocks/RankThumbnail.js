import React from "react";
import Card from 'react-bootstrap/Card';
import ProgressBarColored from '../utils/ProgressBarColored';
import AutoSaveText from '../utils/AutoSaveText';

const RankThumbnail = (props) => {
  const game = props.game;
  const gameState = props.gameState;
  const caseStudy = props.caseStudy;
  const gameData = props.gameData;
  const gameDataObject = props.gameDataObject || (props.game ? props.game.game_data : null);
  const rank = gameData.scores.rank;
  const teams = props.mode == 'edit' ? Object.values(gameState.teams) : props.teams;

  const nteams = props.nteams || teams.length;

  return (
    <Card style={{ height: '150px' }}>
      <Card.Header className="center">
        <AutoSaveText
          saveKey="text.rank_thumbnail_heading"
          text={caseStudy.text.rank_thumbnail_heading || props.blockHeading || 'Last Querter Rank'}
          {...props}
        />
      </Card.Header>
      <Card.Body style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card.Title className="rank_label center">{rank}</Card.Title>
      </Card.Body>
      <Card.Footer>
        {gameDataObject && gameDataObject.game_status == 'finished' && !!gameDataObject.rank ?
          <Card.Text className="thumbnail_footer_text center">Final Game Rank: {gameDataObject.rank}</Card.Text>
          :
          <Card.Text className="thumbnail_footer_text center">{rank}</Card.Text>
        }
      </Card.Footer>
    </Card>
  );
};

export default RankThumbnail;
