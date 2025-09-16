import React from "react";
import Card from 'react-bootstrap/Card';
import Rankings from './Rankings';
import AutoSaveText from '../utils/AutoSaveText';

const LeaderBoard = (props) => {
  const caseStudy = props.caseStudy;
  
  return (
    <Card className="center">
    <Card.Header>
    <AutoSaveText
          saveKey="text.leaderboard_heading"
          text={caseStudy.text.leaderboard_heading || props.blockHeading || 'Leaderboard'}
          {...props}
        />
    </Card.Header>
    <Card.Body style={{overflowY: 'scroll'}}>
    <Rankings {...props} />
    </Card.Body>
    </Card>
  );
};

export default LeaderBoard;
