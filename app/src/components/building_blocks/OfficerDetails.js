import React from "react";
import Card from 'react-bootstrap/Card';
import gameConfig from '../../gameConfig';
import EditableImage from '../utils/EditableImage';
import AutoSaveText from '../utils/AutoSaveText';

const OfficerDetails = (props) => {
  const gameData = props.gameData;
  const caseStudy = props.caseStudy;

  return (
    caseStudy && <Card style={{ padding: '20px' }}>
        <EditableImage 
            src={gameConfig.getCaseStudyImagePath(caseStudy.key, caseStudy.images.officer)}
            style={{
              height: '100px',
            }}
            saveKey={'images.officer'}
            {...props}
        />
        <Card.Body style={{ textAlign: 'center' }}>
            <Card.Title className="officer_name">
            <AutoSaveText 
                saveKey="text.officer_name"
                text={caseStudy.text.officer_name}
                {...props}
              />
            </Card.Title>
            <Card.Text className="officer_title">
              <AutoSaveText 
                saveKey="text.officer_title"
                text={caseStudy.text.officer_title}
                {...props}
              />  
            </Card.Text>
        </Card.Body>
    </Card>
  );
};

export default OfficerDetails;
