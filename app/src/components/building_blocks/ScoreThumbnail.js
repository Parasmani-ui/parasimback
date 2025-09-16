import React from "react";
import Card from 'react-bootstrap/Card';
import ProgressBarColored from '../utils/ProgressBarColored';
import AutoSaveText from '../utils/AutoSaveText';

const ScoreThumbnail = (props) => {
  const game = props.game;
  const caseStudy = props.caseStudy;
  const gameData = props.gameData;
  const gameDataObject = props.gameDataObject || (props.game ? props.game.game_data : null);
  const score = props.mode == 'edit' ? caseStudy.initial_scores.score : gameData.scores.score;

  return (
    <Card style={{ height: '150px' }}>
      <Card.Header className="center">
        <AutoSaveText
          saveKey="text.score_thumbnail_heading"
          text={caseStudy.text.score_thumbnail_heading || props.blockHeading || 'Last Quarter Score'}
          {...props}
        />
      </Card.Header>
      <Card.Body>
        <ProgressBarColored now={score} {...props} />
      </Card.Body>
      <Card.Footer>
        {gameDataObject && gameDataObject.game_status == 'finished' ?
          <Card.Text className="thumbnail_footer_text center">Final Score: {gameDataObject.score || 0}</Card.Text>
          :
          <Card.Text className="thumbnail_footer_text center">{score}</Card.Text>
        }
      </Card.Footer>
    </Card>
  );
};

export default ScoreThumbnail;
