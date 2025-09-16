import React from "react";
import Card from 'react-bootstrap/Card';
import Icon from '../Icon.js';
import gameConfig from '../../gameConfig';
import EditableImage from '../utils/EditableImage';
import AutoSaveText from '../utils/AutoSaveText';

const OfficerDetails = (props) => {
  const caseStudy = props.caseStudy;

  return (
    caseStudy && <Card style={{ padding: '20px' }}>

        <EditableImage 
            src={gameConfig.getCaseStudyImagePath(caseStudy.key, caseStudy.images.logo)}
            style={{height: '100px'}}
            saveKey={'images.logo'}
            {...props}
        />
        <Card.Body>
            <Card.Title style={{ textAlign: 'center' }}>
              <AutoSaveText 
                saveKey="text.company_name"
                text={caseStudy.text.company_name} 
                {...props}
              />
            </Card.Title>
            <Card.Text style={{ position: 'relative', height: '25px', margin: 0, textAlign: 'center' }} >
                <span>
                <span >
                  <Icon name="headquarter" style={{ height: '24px' }} />
                </span>
                <AutoSaveText 
                    saveKey="text.headquarter"
                    text={caseStudy.text.headquarter} 
                    {...props} 
                />
                </span>
            </Card.Text>
        </Card.Body>
    </Card>
  );
};

export default OfficerDetails;
