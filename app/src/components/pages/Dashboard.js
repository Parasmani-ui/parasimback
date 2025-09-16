import React from "react";
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ScoreThumbnail from '../building_blocks/ScoreThumbnail';
import RankThumbnail from '../building_blocks/RankThumbnail';
import RevenueThumbnail from '../building_blocks/RevenueThumbnail';
import ProfitsThumbnail from '../building_blocks/ProfitsThumbnail';
import MarketShareThumbnail from '../building_blocks/MarketShareThumbnail';
import UnitsSoldThumbnail from '../building_blocks/UnitsSoldThumbnail';
import StockPriceThumbnail from '../building_blocks/StockPriceThumbnail';
import StockChangeThumbnail from '../building_blocks/StockChangeThumbnail';
import Rankings from '../building_blocks/Rankings';
import DashboardTabbedCharts from '../building_blocks/DashboardTabbedCharts';
import KeyPerformanceMetrics from '../building_blocks/KeyPerformanceMetrics';

const Dashboard = (props) => {
    const gameData = props.gameData;
    const caseStudy = props.caseStudy;

    return (
        <Card className="container-card">
            <Card.Body>
                <Row>
                    <Col md={3}>
                        <ScoreThumbnail {...props} />
                    </Col>
                    <Col md={3}>
                        <RevenueThumbnail {...props} />
                    </Col>
                    <Col md={3}>
                        <MarketShareThumbnail {...props} />
                    </Col>
                    <Col md={3}>
                        <StockPriceThumbnail {...props} />
                    </Col>
                </Row>
                <div style={{height: '25px'}}></div>
                <Row>
                    <Col md={3}>
                        <RankThumbnail {...props} />
                    </Col>
                    <Col md={3}>
                        <ProfitsThumbnail {...props} />
                    </Col>
                    <Col md={3}>
                        <UnitsSoldThumbnail {...props} />
                    </Col>
                    <Col md={3}>
                        <StockChangeThumbnail {...props} />
                    </Col>
                </Row>
                <div style={{height: '25px'}}></div>
                <Row>
                    <Col md={6}>
                        <Rankings {...props} />
                    </Col>
                    <Col md={6}>
                        <DashboardTabbedCharts {...props} />
                    </Col>
                </Row>
                <div style={{height: '25px'}}></div>
                <KeyPerformanceMetrics {...props} />
            </Card.Body>
        </Card>
    );
};

export default Dashboard;
