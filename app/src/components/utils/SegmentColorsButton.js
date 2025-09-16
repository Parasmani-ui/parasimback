import React from "react";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Icon from '../Icon.js';
import ShowModal from './ShowModal';
import { post } from './ServerCall';
import ShowToast from './ShowToast';
import AutoSaveInput from './AutoSaveInput';
import db from '../utils/db';

const SegmentColorsButton = (props) => {
    const gameData = props.gameData;
    const caseStudy = props.caseStudy;
    const segments = props.mode != 'edit' && gameData.segments ? gameData.segments : caseStudy.market.segments;

    segments.sort((a, b) => { return a.idx - b.idx; });

    const saveColor = async (idx, color) => {
        if (props.mode == 'edit') {
            await db.saveCaseStudyData(props, "market.segments.$[i].color", color, [{"i.idx": idx}]);
            return;
        }

        if (!gameData.segments) {
            gameData.segments = caseStudy.market.segments;
        }
        gameData.segments[idx].color = color;
        await props.updateGameData(gameData);
    };

    const editColorsClicked = () => {
        ShowModal({
          title: 'Edit Segment Colors',
          closeButtonText: 'Close',
          body: <Container style={{minWidth: '300px'}}>
            <Row style={{fontWeight: 'bold', marginBottom: '20px'}}>
              <Col>Market Segment</Col>
              <Col>Chart Color</Col>
            </Row>
            {segments.map((segment, idx) => (
              <Row key={segment.idx}>
                <Col>{segment.name}</Col>
                <Col>
                  <AutoSaveInput
                    type="color"
                    value={segment.color}
                    onSave={async color => await saveColor(idx, color)}
                    {...props}
                  />
                </Col>
              </Row>
            ))}
          </Container>
        });
      };

    return (
        <span className="toolbar_button edit_colors" onClick={editColorsClicked} ><Icon name="colors" /></span>
    );
};

export default SegmentColorsButton;
