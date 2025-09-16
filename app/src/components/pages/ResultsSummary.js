import React from "react";
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import AutoSaveText from '../utils/AutoSaveText';
import CallFunction from '../CallFunction';
import FormatData from '../FormatData';
import ProductVolumeSharePie from '../building_blocks/ProductVolumeSharePie';
import ProductRevenueSharePie from '../building_blocks/ProductRevenueSharePie';
import ScoreThumbnail from '../building_blocks/ScoreThumbnail';
import RankThumbnail from '../building_blocks/RankThumbnail';
import ProfitsThumbnail from '../building_blocks/ProfitsThumbnail';
import RevenueThumbnail from '../building_blocks/RevenueThumbnail';
import MarketShareThumbnail from '../building_blocks/MarketShareThumbnail';
import UnitsSoldThumbnail from '../building_blocks/UnitsSoldThumbnail';
import StockPriceThumbnail from '../building_blocks/StockPriceThumbnail';
import StockChangeThumbnail from '../building_blocks/StockChangeThumbnail';
import DashboardTabbedCharts from '../building_blocks/DashboardTabbedCharts';
import KeyPerformanceMetrics from '../building_blocks/KeyPerformanceMetrics';

const ResultsSummary = (props) => {
    const containerStyle = {
        position: 'relative'
    };

    const pieStyle = {
        position: 'absolute',
        width: '100%',
        minHeight: '300px'
    };

    return (
        <Card style={{paddingTop: '30px', height: '1500px'}}>
            <Card.Body>
            <Row>
                <Col style={containerStyle}>
                <ScoreThumbnail {...props} />
                </Col>
                <Col style={containerStyle}>
                <RevenueThumbnail {...props} />
                </Col>
                <Col>
                <MarketShareThumbnail {...props} />
                </Col>
                <Col>
                <StockPriceThumbnail {...props} />
                </Col>
            </Row>
            <Row>
                <Col style={containerStyle}>
                <RankThumbnail {...props} />
                </Col>
                <Col style={containerStyle}>
                <ProfitsThumbnail {...props} />
                </Col>
                <Col>
                <UnitsSoldThumbnail {...props} />
                </Col>
                <Col>
                <StockChangeThumbnail {...props} />
                </Col>
            </Row>
            <Row>
            <Col style={containerStyle} md={3}>
                    <ProductVolumeSharePie hideColors={true} {...props} style={pieStyle} />
                </Col>
                <Col style={containerStyle} md={3}>
                    <ProductRevenueSharePie hideColors={true} {...props} style={pieStyle} />
                </Col>
                <Col md={6}>
                    <DashboardTabbedCharts {...props} />
                </Col>
            </Row>
            <Row>
                <Col>
                    <KeyPerformanceMetrics {...props} />
                </Col>
            </Row>
            </Card.Body>
        </Card>
    );
};

export default ResultsSummary;
