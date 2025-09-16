import React from "react";
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ProgressBarColored from '../utils/ProgressBarColored';
import Icon from '../Icon';
import AutoSaveText from '../utils/AutoSaveText';
import EditLabelsToolbar from '../utils/EditLabelsToolbar';

const KeyPerformanceMetrics = (props) => {
    const allQuartersData = props.allQuartersData;
    const caseStudy = props.caseStudy;

    const noOfQtr = Object.keys(allQuartersData).length;
    const tabs = Object.values(caseStudy.quarters.labels).splice(0, noOfQtr - 1);

    return (
        <Card>
            <Card.Header>
                <AutoSaveText
                    saveKey="text.key_performance_summary_heading"
                    text={caseStudy.text.key_performance_summary_heading || props.blockHeading || 'Key Performance Metrics'}
                    {...props}
                />
            </Card.Header>
            <Card.Body>
                <Tabs defaultActiveKey={caseStudy.quarters.labels[(noOfQtr - 2).toString()]} name="kpm_tabs">
                    {
                        tabs.map((qtr, idx) => (
                            <Tab 
                                style={{ fontSize: '0.9rem' }} 
                                key={caseStudy.quarters.labels[(idx).toString()]} 
                                eventKey={caseStudy.quarters.labels[(idx).toString()]} 
                                title={caseStudy.quarters.labels[(idx).toString()]}
                            >
                                <Row>
                                    <Col lg={6} md={6} sm={12}>
                                        <KPICard
                                            idx={idx}
                                            cardHeading="kpm_financial_heading"
                                            cardDefaultHeading="Financial"
                                            unit={{
                                                key1: "stock_price",
                                                heading1: "Stock Price",
                                                key2: "profits",
                                                heading2: "Profits"
                                            }}
                                            {...props}
                                        />
                                    </Col>
                                    <Col lg={6} md={6} sm={12}>
                                        <KPICard
                                            idx={idx}
                                            cardHeading="kpm_customer_heading"
                                            cardDefaultHeading="Customer"
                                            unit={{
                                                key1: "marketShare",
                                                heading1: "Market Share",
                                                key2: "customerService",
                                                heading2: "Customer Service"
                                            }}
                                            {...props}
                                        />
                                    </Col>
                                </Row>
                                <Row style={{marginTop: '15px'}}>
                                    <Col lg={6} md={6} sm={12}>
                                        <KPICard
                                            idx={idx}
                                            cardHeading="kpm_process_heading"
                                            cardDefaultHeading="Business Process"
                                            unit={{
                                                key1: "utilization",
                                                heading1: "Utilization",
                                                key2: "fulfilment",
                                                heading2: "Demand Fulfilment"
                                            }}
                                            {...props}
                                        />
                                    </Col>
                                    <Col lg={6} md={6} sm={12}>
                                        <KPICard
                                            idx={idx}
                                            cardHeading="kpm_learning_heading"
                                            cardDefaultHeading="Learning and Growth"
                                            unit={{
                                                key1: "continuousImprovement",
                                                heading1: "Continuous Improvement",
                                                key2: "innovation",
                                                heading2: "Innovation"
                                            }}
                                            {...props}
                                        />
                                    </Col>
                                </Row>
                            </Tab>
                        ))
                    }
                </Tabs>
            </Card.Body>
        </Card>
    );
};

const KPICard = (props) => {
    const caseStudy = props.caseStudy;
    return (
        <Card style={{ backgroundColor: 'var(--subcard-background-color)', border: '1px solid lightgrey'}}>
            <Card.Header>
                <AutoSaveText
                    saveKey={"text." + props.cardHeading}
                    text={caseStudy.text[props.cardHeading] || props.cardDefaultHeading}
                    {...props}
                />
            </Card.Header>
            <Card.Body>
                <KPIUnit unitKey={props.unit.key1} kpiHeading={props.unit.heading1} {...props} />
                <KPIUnit unitKey={props.unit.key2} kpiHeading={props.unit.heading2} {...props} />
            </Card.Body>
        </Card>

    );
};

const KPIUnit = (props) => {
    const idx = props.idx;
    const allQuartersData = props.allQuartersData;
    const caseStudy = props.caseStudy;

    return (
        <Row>
            <Col md={12}>
                <Row>
                    <Col style={{fontSize: '0.9em'}}>
                        <AutoSaveText
                            saveKey={"text." + props.unitKey + "_heading"}
                            text={caseStudy.text[props.unitKey + "_heading"] || props.kpiHeading}
                            {...props}
                        />
                    </Col>
                    <Col style={{ textAlign: 'right', fontSize: '0.9em' }} md={4} sm={5}>
                        <span style={{ fontWeight: 'bold' }}>
                            {allQuartersData[idx].scores[props.unitKey]}
                        </span>
                        {/*<span>/100</span>*/}
                    </Col>
                </Row>
                <ProgressBarColored now={allQuartersData[idx].scores[props.unitKey]} {...props} />
            </Col>
            <Col style={{ fontSize: '0.8rem', padding: '0.6rem', height: '5rem' }} md={12}>
                <EditLabelsToolbar 
                    labelName={props.unitKey} 
                    toolbarStyle={{right: '-25px'}}
                    {...props} 
                />
                {getMessageFromValue(caseStudy,props.unitKey, allQuartersData[idx].scores[props.unitKey])}
            </Col>
        </Row>
    );
};

const getMessageFromValue = (caseStudy, name, value) => {
    const kpmIcons = caseStudy.progressBarColors;
    const messages = caseStudy.kpmMessages[name];
    if (!messages) {
        console.error('Error: Messages for ' + name + ' not defined in case study kpm messages');
        return <div><span><Icon name="blank" /></span><span></span></div>;
    }

    var icon = null;
    for (var prop in kpmIcons) {
        if (parseInt(value) >= parseInt(kpmIcons[prop])) {
            icon = prop;
        }
    }

    const msg = messages[icon];
    return <div><span><Icon name={icon} /></span><span>{msg}</span></div>;
};

export default KeyPerformanceMetrics;