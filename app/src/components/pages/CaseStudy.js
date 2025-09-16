import React from "react";
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import OfficerDetails from '../building_blocks/OfficerDetails';
import CompanyNameLogo from '../building_blocks/CompanyNameLogo';
import CompanyIntroduction from '../building_blocks/CompanyIntroduction';
import Objective from '../building_blocks/Objective';
import MarketSegmentsSummary from '../building_blocks/MarketSegmentsSummary';
import DistributionChannelsSummary from '../building_blocks/DistributionChannelsSummary';

const CaseStudy = (props) => {
    const gameData = props.gameData;
    const caseStudy = props.caseStudy;
    const heading = props.pageName;

    return (
        <Card className="container-card">
            <Card.Body>
                <Row>
                    <Col md={3}>
                        <CompanyNameLogo {...props} />
                        <div style={{height: '25px'}}></div>
                        <OfficerDetails {...props} />
                    </Col>
                    <Col md={9}>
                        <CompanyIntroduction {...props} />
                    </Col>
                </Row>
                <div style={{height: '25px'}}></div>
                <Objective {...props} />
                <div style={{height: '25px'}}></div>
                <MarketSegmentsSummary {...props} />
                <div style={{height: '25px'}}></div>
                <DistributionChannelsSummary {...props} />
            </Card.Body>
        </Card>
    );
};

export default CaseStudy;
