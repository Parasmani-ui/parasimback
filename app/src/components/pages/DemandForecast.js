import React from "react";
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import DemandForecastLine from '../building_blocks/DemandForecastLine';
import DemandMessage from '../building_blocks/DemandMessage';
import IndustrySalesLine from '../building_blocks/IndustrySalesLine';
import IndustryProductionLine from '../building_blocks/IndustryProductionLine';
import CapacityReport from '../building_blocks/CapacityReport';
import CapacityBar from '../building_blocks/CapacityBar';

const DemandForecast = (props) => {
    const gameData = props.gameData;
    const caseStudy = props.caseStudy;

    return (
        <Card className="container-card">
            <Card.Body>
                <Row>
                    <Col md={6}>
                        <DemandForecastLine {...props} />
                    </Col>
                    <Col md={6}>
                        <DemandMessage {...props} />
                    </Col>
                </Row>
                <div style={{height: '25px'}}></div>
                <Row>
                    <Col md={6}>
                        <IndustrySalesLine {...props} />
                    </Col>
                    <Col md={6}>
                        <IndustryProductionLine {...props} />
                    </Col>
                </Row>
                <div style={{height: '25px'}}></div>
                <Row>
                    <Col md={6}>
                        <CapacityReport {...props} />
                    </Col>
                    <Col md={6}>
                        <CapacityBar {...props} />
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};

export default DemandForecast;
