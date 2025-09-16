import React from "react";
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import AutoSaveText from '../utils/AutoSaveText';
import CallFunction from '../CallFunction';
import FormatData from '../FormatData';

const DecisionsSummary = (props) => {
    const gameData = props.gameData;
    const caseStudy = props.caseStudy;
    const noOfQtr = gameData.data ? Object.keys(gameData.data).length : 0;
    const tabs = Object.values(caseStudy.quarters.labels).splice(0, noOfQtr - 1);

    return (
        props.isAdmin ?
            !!noOfQtr &&
            <Card className="container-card">
                <Card.Body>
                    <Tabs defaultActiveKey={caseStudy.quarters.labels[(noOfQtr - 2).toString()]} name="competition_tabs">
                        {tabs.map((qtr, qidx) => (
                            <Tab
                                key={qidx}
                                eventKey={caseStudy.quarters.labels[(qidx).toString()]}
                                title={caseStudy.quarters.labels[(qidx).toString()]}
                            >
                                <ProductSummary {...props} qidx={qidx} />
                                <div style={{height: '15px'}}></div>
                                <ProjectsSummary {...props} qidx={qidx} />
                                <div style={{height: '15px'}}></div>
                                <FinancingSummary {...props} qidx={qidx} />
                                <div style={{height: '15px'}}></div>
                                <OtherDecisions {...props} qidx={qidx} />
                            </Tab>
                        ))}
                    </Tabs>
                </Card.Body>
            </Card>
            :
            <>
                <ProductSummary {...props} qidx={noOfQtr - 1} />
                <div style={{height: '15px'}}></div>
                <ProjectsSummary {...props} qidx={noOfQtr - 1} />
                <div style={{height: '15px'}}></div>
                <FinancingSummary {...props} qidx={noOfQtr - 1} />
                <div style={{height: '15px'}}></div>
                <OtherDecisions {...props} qidx={noOfQtr - 1} />
            </>
    );
};

export default DecisionsSummary;

const ProductSummary = (props) => {
    const gameData = props.gameData;
    const caseStudy = props.caseStudy;
    const user = props.user;
    const qidx = props.qidx;
    const products = (props.isAdmin ? gameData.data[qidx].products : gameData.products).sort((a, b) => {return a.idx - b.idx});

    return <Card>
        <Card.Header>Products</Card.Header>
        <Card.Body>
            <Row>
                {products && products.map((product, idx) => (
                    <Col key={idx}>
                        <Card style={{backgroundColor: 'var(--subcard-background-color)'}}>
                            <Card.Header>{product.name}</Card.Header>
                            <Card.Body>
                                <Card.Body>
                                    <Row style={{ fontWeight: 'bold', marginBottom: '1rem' }}>
                                        <Col lg={6} md={6} sm={12} xs={12} xxs={12}>Target: </Col>
                                        <Col lg={6} md={6} sm={12} xs={12} xxs={12}>
                                            {product.target}
                                        </Col>
                                    </Row>
                                    <Row style={{ marginTop: '10px', marginBottom: '10px' }}>
                                        <Card.Subtitle>Product Features</Card.Subtitle>
                                    </Row>
                                    {product.specs && Object.keys(product.specs).map((key, sidx) => (
                                        <Row key={sidx} className={key}>
                                            <Col className="label" lg={6} md={6} sm={12} xs={12} xxs={12}>{key}:</Col>
                                            <Col className="value" lg={6} md={6} sm={12} xs={12} xxs={12}>{product.specs[key]}</Col>
                                        </Row>
                                    ))
                                    }
                                    <Row style={{ marginTop: '15px', marginBottom: '10px' }}>
                                        <Card.Subtitle>Product Pricing</Card.Subtitle>
                                    </Row>
                                    <Row>
                                        <Col lg={6} md={6} sm={12} xs={12} xxs={12}>Cost:</Col>
                                        <Col lg={6} md={6} sm={12} xs={12} xxs={12}>
                                            <CallFunction
                                                user={user}
                                                caseStudy={caseStudy}
                                                gameData={gameData}
                                                context={product}
                                                fn={caseStudy.product.cost}
                                                format="price_int"
                                                name={(product.name + '_cost_price')}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col lg={6} md={6} sm={12} xs={12} xxs={12}>Sales Price:</Col>
                                        <Col lg={6} md={6} sm={12} xs={12} xxs={12}>
                                            <FormatData
                                                caseStudy={caseStudy}
                                                format="price_int"
                                                name={(product.name + '_sales_price')}
                                                value={product.salesPrice} />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col lg={6} md={6} sm={12} xs={12} xxs={12}>Margin:</Col>
                                        <Col lg={6} md={6} sm={12} xs={12} xxs={12}>
                                            <CallFunction
                                                user={user}
                                                caseStudy={caseStudy}
                                                gameData={gameData}
                                                context={product}
                                                fn={caseStudy.product.margin}
                                                format="amount_int"
                                                name={(caseStudy.product.name + '_margin')}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col lg={6} md={6} sm={12} xs={12} xxs={12}>Margin Percentage:</Col>
                                        <Col lg={6} md={6} sm={12} xs={12} xxs={12}>
                                            <CallFunction
                                                user={user}
                                                caseStudy={caseStudy}
                                                gameData={gameData}
                                                context={product}
                                                fn={caseStudy.product.margin_pct}
                                                format="percent_dec"
                                                name={(product.name + '_margin_pct')}
                                            />
                                        </Col>
                                    </Row>
                                    <Row style={{ marginTop: '15px', marginBottom: '10px' }}>
                                        <Card.Subtitle>Capacity</Card.Subtitle>
                                    </Row>
                                    <Row>
                                        <Col lg={6} md={6} sm={12} xs={12} xxs={12}>Inventory:</Col>
                                        <Col lg={6} md={6} sm={12} xs={12} xxs={12}>{product.inventory}</Col>
                                    </Row>
                                    <Row>
                                        <Col lg={6} md={6} sm={12} xs={12} xxs={12}>Planned Production:</Col>
                                        <Col lg={6} md={6} sm={12} xs={12} xxs={12}>{product.plannedProduction}</Col>
                                    </Row>
                                    <Row style={{ marginTop: '15px', marginBottom: '10px' }}>
                                        <Card.Subtitle>Marketing Plan</Card.Subtitle>
                                    </Row>
                                    <Row>
                                        <Col lg={6} md={6} sm={12} xs={12} xxs={12}>Advertising Budget:</Col>
                                        <Col lg={6} md={6} sm={12} xs={12} xxs={12}>
                                            <FormatData
                                                caseStudy={caseStudy}
                                                format="price_int"
                                                name="advertising_budget"
                                                value={product.marketing.advertising_budget || '0'} />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col lg={6} md={6} sm={12} xs={12} xxs={12}>Promotions Budget:</Col>
                                        <Col lg={6} md={6} sm={12} xs={12} xxs={12}>
                                            <FormatData
                                                caseStudy={caseStudy}
                                                format="price_int"
                                                name="promotions_budget"
                                                value={product.marketing.promotions_budget || '0'} />
                                        </Col>
                                    </Row>
                                    <Row style={{ marginTop: '15px', marginBottom: '10px' }}>
                                        <Card.Subtitle>Channel Distribution</Card.Subtitle>
                                    </Row>
                                    {product.channelDistribution && Object.keys(product.channelDistribution).map((channel, idx) => (
                                        <Row key={channel + idx} style={{ marginTop: '5px' }}>
                                            <Col lg={9} md={9} sm={9}>{channel}</Col>
                                            <Col lg={3} md={3} sm={3}><div>{product.channelDistribution[channel]}</div></Col>
                                        </Row>
                                    ))}
                                </Card.Body>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Card.Body>
    </Card>;
};

const ProjectsSummary = (props) => {
    const caseStudy = props.caseStudy;
    const gameData = props.gameData;
    const qidx = props.qidx;
    const specialProjects = props.isAdmin ? gameData.data[qidx].special_projects : gameData.special_projects;
    const projects = caseStudy.special_projects.sort((a, b) => { return a.idx - b.idx; });

    const getProjectInvestment = (project) => {
        const value = specialProjects[project.key];
        if (!value) {
            return 0;
        }

        for (var i = 0; i < project.options.length; i++) {
            if (project.options[i].label == value) {
                return parseInt(project.options[i].investment || 0);
            }
        }

        return 0;
    };

    return <Card>
        <Card.Header>Special Projects</Card.Header>
        <Card.Body>
            {projects && projects.map((project, idx) => (
                <Row key={idx}>
                    <Col>{project.name}</Col>
                    <Col>
                        {(!specialProjects || !specialProjects[project.key] || specialProjects[project.key] == 'Dont Invest') &&
                            <div>You have not invested in this project.</div>
                        }
                        {specialProjects && specialProjects[project.key] && specialProjects[project.key] != 'Dont Invest' &&
                            <div>
                                You have invested {
                                    <FormatData
                                        caseStudy={caseStudy}
                                        format="price_int"
                                        name="investment"
                                        value={getProjectInvestment(project) || 0}
                                    />
                                } in this project.
                            </div>
                        }
                    </Col>
                </Row>
            ))}
        </Card.Body>
    </Card>;
};

const FinancingSummary = (props) => {
    const gameData = props.gameData;
    const caseStudy = props.caseStudy;
    const qidx = props.qidx;
    const financials = props.isAdmin ? gameData.data[qidx].financials : gameData.financials;

    return <Card>
        <Card.Header>Financing</Card.Header>
        <Card.Body>
            <Row>
                <Col>Issue Shares</Col>
                <Col>
                    <FormatData
                        caseStudy={caseStudy}
                        format="thousands_indicator_int"
                        name="issue_shares"
                        value={financials.issue_shares || 0}
                    />
                </Col>
                <Col>Shares Dilution</Col>
                <Col>
                    <FormatData
                        caseStudy={caseStudy}
                        format="percent_dec"
                        name="share_dilution"
                        value={financials.issue_shares && financials.shares_issued ? (parseInt(financials.issue_shares || 0) * 100 / parseInt(financials.shares_issued || 1)).toFixed(2) : 0}
                    />
                </Col>
            </Row>
            <Row>
                <Col>Borrow Debt</Col>
                <Col>
                    <FormatData
                        caseStudy={caseStudy}
                        format="price_int"
                        name="borrow_debt"
                        value={financials.borrow_debt || 0}
                    />
                </Col>
                <Col>Debt Duration</Col>
                <Col>
                    {financials.debt_duration}
                </Col>
            </Row>
            <Row>
                <Col>Investment</Col>
                <Col>
                    <FormatData
                        caseStudy={caseStudy}
                        format="price_int"
                        name="invest"
                        value={financials.invest || 0}
                    />
                </Col>
                <Col>Withdraw Investment</Col>
                <Col>
                    <FormatData
                        caseStudy={caseStudy}
                        format="price_int"
                        name="withdraw"
                        value={financials.withdraw || 0}
                    />
                </Col>
            </Row>
        </Card.Body>
    </Card>
};

const OtherDecisions = (props) => {
    const caseStudy = props.caseStudy;
    const gameData = props.gameData;
    const qidx = props.qidx;
    const financials = props.isAdmin ? gameData.data[qidx].financials : gameData.financials;
    const selectedPlant = props.isAdmin ? (gameData.data[qidx].selectedPlant || 'None') : (gameData.selectedPlant || 'None');
    const plants = caseStudy.plants;
    const plantOptions = plants.options;

    var _plant = null;
    for (var i = 0; i < plantOptions.length; i++) {
        if (plantOptions[i].label == selectedPlant) {
            _plant = plantOptions[i];
            break;
        }
    }

    return <Card>
        <Card.Header>Other Decisions</Card.Header>
        <Card.Body>
            <Row style={{ marginTop: '15px', marginBottom: '10px' }}>
                <Card.Subtitle>Human Resources</Card.Subtitle>
            </Row>
            <Row>
                <Col>Planned Workforce</Col>
                <Col>{financials.planned_workforce || 0}</Col>
                <Col>Employment Cost</Col>
                <Col>
                    <FormatData
                        caseStudy={caseStudy}
                        format="price_int"
                        name="employment_cost"
                        value={financials.employment_cost || 0}
                    />
                </Col>
            </Row>
            <Row>
                <Col>Innovation Budget</Col>
                <Col>
                    <FormatData
                        caseStudy={caseStudy}
                        format="price_int"
                        name="innovation_budget"
                        value={financials.innovation_budget || 0}
                    />
                </Col>
                <Col>Training Budget</Col>
                <Col>
                    <FormatData
                        caseStudy={caseStudy}
                        format="price_int"
                        name="training_budget"
                        value={financials.training_budget || 0}
                    />
                </Col>
            </Row>
            <Row style={{ marginTop: '15px', marginBottom: '10px' }}>
                <Card.Subtitle>Previous Plant</Card.Subtitle>
            </Row>
            <Row>
                <Col>Plant Capacity</Col>
                <Col>
                    {financials.capacity || '0'}
                </Col>
                <Col>Plant Value</Col>
                <Col>
                    <FormatData
                        caseStudy={caseStudy}
                        format="price_int"
                        name="investment_plant"
                        value={financials.investment_plant || '0'}
                    />
                </Col>
            </Row>
            <Row style={{ marginTop: '15px', marginBottom: '10px' }}>
                <Card.Subtitle>New Plant</Card.Subtitle>
            </Row>
            <Row>
                <Col>Plant Capacity</Col>
                <Col>
                    {_plant ? _plant.capacity : '0'}
                </Col>
                <Col>Plant Investment</Col>
                <Col>
                    <FormatData
                        caseStudy={caseStudy}
                        format="price_int"
                        name="plant_investment"
                        value={_plant ? _plant.investment : '0'}
                    />
                </Col>
            </Row>
        </Card.Body>
    </Card>;
};
