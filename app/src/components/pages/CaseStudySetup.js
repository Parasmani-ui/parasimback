import React from "react";
import { useState } from "react";
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';
import AutoSaveText from '../utils/AutoSaveText';
import AutoSaveInput from '../utils/AutoSaveInput';
import db from '../utils/db';
import updateAccounts from "../utils/UpdateAccounts";
import Icon from "../Icon";

const CaseStudySetup = (props) => {
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [operationInProgress, setOperationInProgress] = useState(false);

    const pageData = props.pageData || {};
    const gameData = props.gameData;
    const caseStudy = props.caseStudy;
    const segments = caseStudy ? caseStudy.market.segments.sort((a, b) => { return a.idx - b.idx; }) : null;

    const factors = [
        {
            factor: 'price',
            label: 'Price'
        },
        {
            factor: 'features',
            label: 'Features'
        },
        {
            factor: 'advertisement',
            label: 'Advertisement'
        },
        {
            factor: 'promotions',
            label: 'Promotions'
        }
    ];

    caseStudy && caseStudy.special_projects.forEach((project) => {
        factors.push({
            type: 'project',
            factor: project.key,
            label: project.name
        });
    });

    const handleProductCheckboxChange = () => {
        const update = async () => {
            await db.saveCaseStudyData(props, "product.allowAdd", !caseStudy.product.allowAdd);
        };
        update();
    };

    const handleRedistributionCheckboxChange = () => {
        const update = async () => {
            await db.saveCaseStudyData(props, "allowRedistribution", !caseStudy.allowRedistribution);
        };
        update();
    };

    const toolbarStyle = {
        display: 'flex',
        position: 'absolute',
        right: 0,
        top: 0,
        textAlign: 'right',
        zIndex: 1
    };

    const _update = async () => {
        if (operationInProgress) {
            return;
        }

        setButtonDisabled(true);
        setOperationInProgress(true);

        await updateAccounts(props);

        setButtonDisabled(false);
        setOperationInProgress(false);
    };

    return (
        caseStudy ?
            <>
                <div style={{ backgroundColor: 'white', border: '1px solid darkgrey', padding: '10px', textAlign: 'center' }}>
                    {!caseStudy.accounts_updated && <span className='editable_wrapper update_accounts_toolbar' style={{ position: 'relative', display: 'block' }} >
                        <span className="toolbar" style={toolbarStyle}>
                            <span className="toolbar_button update_button" onClick={_update} disabled={buttonDisabled}><Icon name="update" /></span>
                        </span>
                    </span>
                    }
                    <span style={{ fontWeight: 'bold' }}>Editing Case Study</span>
                    <h3>{props.caseStudy.name}</h3>
                    <h4>Case Study Setup</h4>
                    {caseStudy.accounts_updated ?
                        <span style={{ color: 'green', fontWeight: 'bold' }}>Accounts updated</span>
                        :
                        <span style={{ color: 'red', fontWeight: 'bold' }}>Accounts need to be updated</span>
                    }
                </div>
                <Card className="container-card">
                    <Card.Body>
                        <Card>
                            <Card.Header>
                                <AutoSaveText
                                    saveKey="text.setup_parameters_heading"
                                    text={caseStudy.text.setup_parameters_heading || 'Setup Parameters'}
                                    {...props}
                                />
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col>
                                        <AutoSaveText
                                            saveKey="text.sales_tax_rate_label"
                                            text={caseStudy.text.sales_tax_rate_label || 'Sales Tax Rate'}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveInput
                                            type="pct_int_pos"
                                            saveKey="financials.sales_tax_rate"
                                            value={caseStudy.financials.sales_tax_rate}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveText
                                            saveKey="text.corporate_tax_rate_label"
                                            text={caseStudy.text.corporate_tax_rate_label || 'Corporate Tax Rate'}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveInput
                                            type="pct_int_pos"
                                            saveKey="financials.corporate_tax_rate"
                                            value={caseStudy.financials.corporate_tax_rate}
                                            {...props}
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <AutoSaveText
                                            saveKey="text.overheads_label"
                                            text={caseStudy.text.overheads_label || 'Overheads'}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveInput
                                            type="currency_int_pos"
                                            saveKey="financials.overheads"
                                            value={caseStudy.financials.overheads}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveText
                                            saveKey="text.miscellaneous_cost_1_label"
                                            text={caseStudy.text.miscellaneous_cost_1_label || 'Miscellaneous Cost 1'}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveInput
                                            type="currency_int_pos"
                                            saveKey="financials.miscellaneous_cost_1"
                                            value={caseStudy.financials.miscellaneous_cost_1}
                                            {...props}
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <AutoSaveText
                                            saveKey="text.miscellaneous_cost_2_label"
                                            text={caseStudy.text.miscellaneous_cost_2_label || 'Miscellaneous Cost 2'}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveInput
                                            type="currency_int_pos"
                                            saveKey="financials.miscellaneous_cost_2"
                                            value={caseStudy.financials.miscellaneous_cost_2}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveText
                                            saveKey="text.miscellaneous_cost_3_label"
                                            text={caseStudy.text.miscellaneous_cost_3_label || 'Miscellaneous Cost 3'}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveInput
                                            type="currency_int_pos"
                                            saveKey="financials.miscellaneous_cost_3"
                                            value={caseStudy.financials.miscellaneous_cost_3}
                                            {...props}
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <AutoSaveText
                                            saveKey="text.miscellaneous_cost_4_label"
                                            text={caseStudy.text.miscellaneous_cost_4_label || 'Miscellaneous Cost 4'}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveInput
                                            type="currency_int_pos"
                                            saveKey="financials.miscellaneous_cost_4"
                                            value={caseStudy.financials.miscellaneous_cost_4}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveText
                                            saveKey="text.miscellaneous_cost_5_label"
                                            text={caseStudy.text.miscellaneous_cost_5_label || 'Miscellaneous Cost 5'}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveInput
                                            type="currency_int_pos"
                                            saveKey="financials.miscellaneous_cost_5"
                                            value={caseStudy.financials.miscellaneous_cost_5}
                                            {...props}
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <AutoSaveText
                                            saveKey="text.admin_cost_pct_label"
                                            text={caseStudy.text.admin_cost_pct_label || 'Admin Cost'}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveInput
                                            type="pct_int_pos"
                                            saveKey="financials.admin_overhead"
                                            value={caseStudy.financials.admin_overhead}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveText
                                            saveKey="text.fixed_admin_cost_label"
                                            text={caseStudy.text.fixed_admin_cost_label || 'Fixed Admin Cost'}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveInput
                                            type="currency_int_pos"
                                            saveKey="financials.fixed_admin_cost"
                                            value={caseStudy.financials.fixed_admin_cost}
                                            {...props}
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <AutoSaveText
                                            saveKey="text.depreciation_rate_research_label"
                                            text={caseStudy.text.depreciation_rate_research_label || 'Depreciation Rate (HR - Innovation)'}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveInput
                                            type="pct_dec_pos"
                                            saveKey="financials.depreciation_rate_research"
                                            value={caseStudy.financials.depreciation_rate_research}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveText
                                            saveKey="text.depreciation_rate_projects_label"
                                            text={caseStudy.text.depreciation_rate_projects_label || 'Depreciation Rate Projects'}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveInput
                                            type="pct_dec_pos"
                                            saveKey="financials.depreciation_rate_projects"
                                            value={caseStudy.financials.depreciation_rate_projects}
                                            {...props}
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <AutoSaveText
                                            saveKey="text.depreciation_rate_plant_label"
                                            text={caseStudy.text.depreciation_rate_plant_label || 'Depreciation Rate Plant'}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveInput
                                            type="pct_dec_pos"
                                            saveKey="financials.depreciation_rate_plant"
                                            value={caseStudy.financials.depreciation_rate_plant}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveText
                                            saveKey="text.plant_value_label"
                                            text={caseStudy.text.plant_value_label || 'Original Plant Value'}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveInput
                                            type="currency_int_pos"
                                            saveKey="financials.investment_plant"
                                            value={caseStudy.financials.investment_plant}
                                            {...props}
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <AutoSaveText
                                            saveKey="text.pratio_label"
                                            text={caseStudy.text.pratio_label || 'P Ratio'}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveInput
                                            type="dec_pos"
                                            saveKey="financials.pratio"
                                            value={caseStudy.financials.pratio}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveText
                                            saveKey="text.allow_product_add_label"
                                            text={caseStudy.text.allow_product_add_label || 'Allow Product Add'}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <input
                                            type="checkbox"
                                            id="product_add_checkbox"
                                            checked={caseStudy.product.allowAdd}
                                            onChange={handleProductCheckboxChange}
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <AutoSaveText
                                            saveKey="text.allowRedistribution_label"
                                            text={caseStudy.text.allowRedistribution_label || 'Allow Demand Redistribution'}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <input
                                            type="checkbox"
                                            id="allowRedistribution_checkbox"
                                            checked={caseStudy.allowRedistribution}
                                            onChange={handleRedistributionCheckboxChange}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveText
                                            saveKey="text.redistribution_level_label"
                                            text={caseStudy.text.redistribution_level_label || 'If Unmet Demand is More than'}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveInput
                                            type="pct_int_pos"
                                            saveKey="redistribution_level"
                                            value={caseStudy.redistribution_level}
                                            {...props}
                                        />
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                        <div style={{ height: '15px' }}></div>
                        <Card>
                            <Card.Header>
                                <AutoSaveText
                                    saveKey="text.kpi_criteria_heading"
                                    text={caseStudy.text.kpi_criteria_heading || 'KPI Criteria'}
                                    {...props}
                                />
                            </Card.Header>
                            <Card.Body>
                                <AutoSaveText
                                    saveKey="kpi_criteria_explanation"
                                    text={pageData.kpi_criteria_explanation || 'KPI Criteria Explanation goes here'}
                                    saveFn="saveSiteData"
                                    {...props}
                                />
                                <Row>
                                    <Col>
                                        <Card>
                                            <Card.Header>
                                                <AutoSaveText
                                                    saveKey="text.kpm_financial_heading"
                                                    text={caseStudy.text.kpm_financial_heading || 'Financials'}
                                                    {...props}
                                                />
                                            </Card.Header>
                                            <Card.Body>
                                                <Row>
                                                    <Col>
                                                        <AutoSaveText
                                                            saveKey="text.kpi_stock_price_label"
                                                            text={caseStudy.text.kpi_stock_price_label || 'Stock Price'}
                                                            {...props}
                                                        />
                                                    </Col>
                                                    <Col>
                                                        <AutoSaveInput
                                                            type="pct_int_pos"
                                                            saveKey="kpi_criteria.stock_price"
                                                            value={caseStudy.kpi_criteria.stock_price}
                                                            {...props}
                                                        />
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col>
                                                        <AutoSaveText
                                                            saveKey="text.kpi_profits_label"
                                                            text={caseStudy.text.kpi_profits_label || 'Profits'}
                                                            {...props}
                                                        />
                                                    </Col>
                                                    <Col>
                                                        <AutoSaveInput
                                                            type="pct_int_pos"
                                                            saveKey="kpi_criteria.profits"
                                                            value={caseStudy.kpi_criteria.profits}
                                                            {...props}
                                                        />
                                                    </Col>
                                                </Row>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col>
                                        <Card>
                                            <Card.Header>
                                                <AutoSaveText
                                                    saveKey="text.kpm_customer_heading"
                                                    text={caseStudy.text.kpm_customer_heading || 'Customer'}
                                                    {...props}
                                                />
                                            </Card.Header>
                                            <Card.Body>
                                                <Row>
                                                    <Col>
                                                        <AutoSaveText
                                                            saveKey="text.kpi_market_share_label"
                                                            text={caseStudy.text.kpi_market_share_label || 'Market Share'}
                                                            {...props}
                                                        />
                                                    </Col>
                                                    <Col>
                                                        <AutoSaveInput
                                                            type="pct_int_pos"
                                                            saveKey="kpi_criteria.market_share"
                                                            value={caseStudy.kpi_criteria.market_share}
                                                            {...props}
                                                        />
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col>
                                                        <AutoSaveText
                                                            saveKey="text.kpi_customer_service_level_label"
                                                            text={caseStudy.text.kpi_customer_service_level_label || 'Customer Service Level'}
                                                            {...props}
                                                        />
                                                    </Col>
                                                    <Col>
                                                        <AutoSaveInput
                                                            type="pct_int_pos"
                                                            saveKey="kpi_criteria.customer_service_level"
                                                            value={caseStudy.kpi_criteria.customer_service_level}
                                                            {...props}
                                                        />
                                                    </Col>
                                                </Row>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <Card>
                                            <Card.Header>
                                                <AutoSaveText
                                                    saveKey="text.kpm_inernal_business_heading"
                                                    text={caseStudy.text.kpm_inernal_business_heading || 'Internal Business'}
                                                    {...props}
                                                />
                                            </Card.Header>
                                            <Card.Body>
                                                <Row>
                                                    <Col>
                                                        <AutoSaveText
                                                            saveKey="text.kpi_utilization_label"
                                                            text={caseStudy.text.kpi_utilization_label || 'Utilization'}
                                                            {...props}
                                                        />
                                                    </Col>
                                                    <Col>
                                                        <AutoSaveInput
                                                            type="pct_int_pos"
                                                            saveKey="kpi_criteria.utilization"
                                                            value={caseStudy.kpi_criteria.utilization}
                                                            {...props}
                                                        />
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col>
                                                        <AutoSaveText
                                                            saveKey="text.kpi_fulfilments_label"
                                                            text={caseStudy.text.kpi_financials_label || 'Fulfilment'}
                                                            {...props}
                                                        />
                                                    </Col>
                                                    <Col>
                                                        <AutoSaveInput
                                                            type="pct_int_pos"
                                                            saveKey="kpi_criteria.fulfilment"
                                                            value={caseStudy.kpi_criteria.fulfilment}
                                                            {...props}
                                                        />
                                                    </Col>
                                                </Row>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col>
                                        <Card>
                                            <Card.Header>
                                                <AutoSaveText
                                                    saveKey="text.kpm_learning_and_growth_heading"
                                                    text={caseStudy.text.kpm_learning_and_growth_heading || 'Learning & Growth'}
                                                    {...props}
                                                />
                                            </Card.Header>
                                            <Card.Body>
                                                <Row>
                                                    <Col>
                                                        <AutoSaveText
                                                            saveKey="text.kpi_continuous_improvement_label"
                                                            text={caseStudy.text.kpi_continuous_improvement_label || 'Continuous Improvement'}
                                                            {...props}
                                                        />
                                                    </Col>
                                                    <Col>
                                                        <AutoSaveInput
                                                            type="pct_int_pos"
                                                            saveKey="kpi_criteria.continuous_improvement"
                                                            value={caseStudy.kpi_criteria.continuous_improvement}
                                                            {...props}
                                                        />
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col>
                                                        <AutoSaveText
                                                            saveKey="text.kpi_innovation_label"
                                                            text={caseStudy.text.kpi_innovation_label || 'Innovation'}
                                                            {...props}
                                                        />
                                                    </Col>
                                                    <Col>
                                                        <AutoSaveInput
                                                            type="pct_int_pos"
                                                            saveKey="kpi_criteria.innovation"
                                                            value={caseStudy.kpi_criteria.innovation}
                                                            {...props}
                                                        />
                                                    </Col>
                                                </Row>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                        <div style={{ height: '15px' }}></div>
                        <Card>
                            <Card.Header>
                                <AutoSaveText
                                    saveKey="text.kpi_benchmarks_heading"
                                    text={caseStudy.text.kpi_benchmarks_heading || 'KPI Benchmarks'}
                                    {...props}
                                />
                            </Card.Header>
                            <Card.Body>
                                <AutoSaveText
                                    saveKey="kpi_benchmarking_explanation"
                                    text={pageData.kpi_benchmarking_explanation || 'KPI Benchmarking Explanation goes here'}
                                    saveFn="saveSiteData"
                                    {...props}
                                />
                                <Row>
                                    <Col>
                                        <AutoSaveText
                                            saveKey="text.stock_price_benchmark_label"
                                            text={caseStudy.text.stock_price_benchmark_label || 'Stock Price'}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveInput
                                            type="currency_dec_pos"
                                            saveKey="kpi_criteria.stock_price_benchmark"
                                            value={caseStudy.kpi_criteria.stock_price_benchmark}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveText
                                            saveKey="text.profit_benchmark_label"
                                            text={caseStudy.text.profit_benchmark_label || 'Profits'}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveInput
                                            type="currency_int_pos"
                                            saveKey="kpi_criteria.profit_benchmark"
                                            value={caseStudy.kpi_criteria.profit_benchmark}
                                            {...props}
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <AutoSaveText
                                            saveKey="text.market_share_benchmark_label"
                                            text={caseStudy.text.market_share_benchmark_label || 'Market Share'}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveInput
                                            type="pct_dec_pos"
                                            saveKey="kpi_criteria.market_share_benchmark"
                                            value={caseStudy.kpi_criteria.market_share_benchmark}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveText
                                            saveKey="text.service_benchmark_label"
                                            text={caseStudy.text.service_benchmark_label || 'Customer Service'}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveInput
                                            type="currency_int_pos"
                                            saveKey="kpi_criteria.service_benchmark"
                                            value={caseStudy.kpi_criteria.service_benchmark}
                                            {...props}
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <AutoSaveText
                                            saveKey="text.utilisation_benchmark_label"
                                            text={caseStudy.text.utilisation_benchmark_label || 'Utilisation'}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveInput
                                            type="pct_int_pos"
                                            saveKey="kpi_criteria.utilisation_benchmark"
                                            value={caseStudy.kpi_criteria.utilisation_benchmark}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveText
                                            saveKey="text.fulfilment_benchmark_label"
                                            text={caseStudy.text.fulfilment_benchmark_label || 'Fulfilment'}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveInput
                                            type="pct_int_pos"
                                            saveKey="kpi_criteria.fulfilment_benchmark"
                                            value={caseStudy.kpi_criteria.fulfilment_benchmark}
                                            {...props}
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <AutoSaveText
                                            saveKey="text.ci_benchmark_label"
                                            text={caseStudy.text.ci_benchmark_label || 'Continuous Improvement'}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveInput
                                            type="currency_int_pos"
                                            saveKey="kpi_criteria.ci_benchmark"
                                            value={caseStudy.kpi_criteria.ci_benchmark}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveText
                                            saveKey="text.innovation_benchmark_label"
                                            text={caseStudy.text.innovation_benchmark_label || 'Innovation'}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveInput
                                            type="currency_int_pos"
                                            saveKey="kpi_criteria.innovation_benchmark"
                                            value={caseStudy.kpi_criteria.innovation_benchmark}
                                            {...props}
                                        />
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                        <div style={{ height: '15px' }}></div>
                        <Card>
                            <Card.Header>
                                <AutoSaveText
                                    saveKey="text.sales_criteria_heading"
                                    text={caseStudy.text.sales_criteria_heading || 'Sales Projections Criteria'}
                                    {...props}
                                />
                            </Card.Header>
                            <Card.Body>
                                <AutoSaveText
                                    saveKey="sales_criteria_explanation"
                                    text={pageData.sales_criteria_explanation || 'Sales Projection Criteria Explanation goes here'}
                                    saveFn="saveSiteData"
                                    {...props}
                                />
                                <Table>
                                    <thead>
                                        <tr>
                                            <th>Factor</th>
                                            {segments.map((segment, idx) => (
                                                <th key={idx}>{segment.name}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {factors.map((fact, fidx) => (
                                            <tr key={fidx}>
                                                <td>{fact.label}</td>
                                                {segments.map((segment, sidx) => (
                                                    <td key={sidx}>
                                                        <AutoSaveInput
                                                            type="pct_int_pos"
                                                            saveKey={'demand_criteria.' + segment.idx + '.' + fact.factor}
                                                            value={caseStudy.demand_criteria[segment.idx] ? caseStudy.demand_criteria[segment.idx][fact.factor] : 0}
                                                            {...props}
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                        <div style={{ height: '15px' }}></div>
                        <Card>
                            <Card.Header>
                                <AutoSaveText
                                    saveKey="text.demand_criteria_heading"
                                    text={caseStudy.text.demand_criteria_heading || 'Demand Change Criteria'}
                                    {...props}
                                />
                            </Card.Header>
                            <Card.Body>
                                <AutoSaveText
                                    saveKey="demand_variance_explanation"
                                    text={pageData.demand_variance_explanation || 'Demand variance explanation goes here'}
                                    saveFn="saveSiteData"
                                    {...props}
                                />
                                <Row>
                                    <Col>
                                        <AutoSaveText
                                            saveKey="text.min_natural_variance_label"
                                            text={caseStudy.text.min_natural_variance_label || 'Min Natural Variance'}
                                            {...props}
                                        />
                                        <AutoSaveInput
                                            type="pct_int_neg"
                                            saveKey="demand_change_criteria.min_natural_variance"
                                            value={caseStudy.demand_change_criteria.min_natural_variance}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveText
                                            saveKey="text.max_natural_variance_label"
                                            text={caseStudy.text.max_natural_variance_label || 'Max Natural Variance'}
                                            {...props}
                                        />
                                        <AutoSaveInput
                                            type="pct_int_neg"
                                            saveKey="demand_change_criteria.max_natural_variance"
                                            value={caseStudy.demand_change_criteria.max_natural_variance}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveText
                                            saveKey="text.demand_variance_min_label"
                                            text={caseStudy.text.demand_variance_min_label || 'Min Demand Variance'}
                                            {...props}
                                        />
                                        <AutoSaveInput
                                            type="pct_int_neg"
                                            saveKey="demand_change_criteria.demand_variance_min"
                                            value={caseStudy.demand_change_criteria.demand_variance_min}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveText
                                            saveKey="text.demand_variance_max_label"
                                            text={caseStudy.text.demand_variance_max_label || 'Max Demand Variance'}
                                            {...props}
                                        />
                                        <AutoSaveInput
                                            type="pct_int_neg"
                                            saveKey="demand_change_criteria.demand_variance_max"
                                            value={caseStudy.demand_change_criteria.demand_variance_max}
                                            {...props}
                                        />
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                        <div style={{ height: '15px' }}></div>
                        <Card>
                            <Card.Header>
                                <AutoSaveText
                                    saveKey="text.segment_demand_factor_heading"
                                    text={caseStudy.text.segment_demand_factor_heading || 'Product Segment Demand Factors'}
                                    {...props}
                                />
                            </Card.Header>
                            <Card.Body>
                                <AutoSaveText
                                    saveKey="segment_demand_factor_explanation"
                                    text={pageData.segment_demand_factor_explanation || 'Product Segment demand variance explanation goes here'}
                                    saveFn="saveSiteData"
                                    {...props}
                                />
                                <Row>
                                    <Col>
                                        <AutoSaveText
                                            saveKey="text.demand_for_target_segment_label"
                                            text={caseStudy.text.demand_for_target_segment_label || 'Demand for Target segment'}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveInput
                                            type="int_pos"
                                            saveKey="demand_change_criteria.demand_for_target_segment"
                                            value={caseStudy.demand_change_criteria.demand_for_target_segment}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveText
                                            saveKey="text.demand_for_non_target_label"
                                            text={caseStudy.text.demand_for_non_target_label || 'Demand for non Target segment'}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveInput
                                            type="int_pos"
                                            saveKey="demand_change_criteria.demand_for_non_target"
                                            value={caseStudy.demand_change_criteria.demand_for_non_target}
                                            {...props}
                                        />
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                        <div style={{ height: '15px' }}></div>
                        <Card>
                            <Card.Header>
                                <AutoSaveText
                                    saveKey="text.distribution_demand_variance_heading"
                                    text={caseStudy.text.distribution_demand_variance_heading || 'Distribution Demand Variance'}
                                    {...props}
                                />
                            </Card.Header>
                            <Card.Body>
                                <AutoSaveText
                                    saveKey="dist_demand_var_explanation"
                                    text={pageData.dist_demand_var_explanation || 'Distribution demand variance explanation goes here'}
                                    saveFn="saveSiteData"
                                    {...props}
                                />
                                <Row>
                                    <Col>
                                        <AutoSaveText
                                            saveKey="text.distribution_variance_min_label"
                                            text={caseStudy.text.distribution_variance_min_label || 'Minimum'}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveInput
                                            type="pct_int_neg"
                                            saveKey="distribution_variance_min"
                                            value={caseStudy.distribution_variance_min}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveText
                                            saveKey="text.distribution_variance_max_label"
                                            text={caseStudy.text.distribution_variance_max_label || 'Maximum'}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoSaveInput
                                            type="pct_int_neg"
                                            saveKey="distribution_variance_max"
                                            value={caseStudy.distribution_variance_max}
                                            {...props}
                                        />
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                        <div style={{ height: '15px' }}></div>
                        <Card>
                            <Card.Header>
                                <AutoSaveText
                                    saveKey="text.price_constants_heading"
                                    text={caseStudy.text.price_constants_heading || 'Price Constants'}
                                    {...props}
                                />
                            </Card.Header>
                            <Card.Body>
                                <AutoSaveText
                                    saveKey="price_constants_explanation"
                                    text={pageData.price_constants_explanation || 'Price constants explanation goes here'}
                                    saveFn="saveSiteData"
                                    {...props}
                                />
                                <Table>
                                    <thead>
                                        <tr>
                                            <th>Factor</th>
                                            {segments.map((segment, idx) => (
                                                <th key={idx}>{segment.name}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Lower Price</td>
                                            {segments.map((segment, idx) => (
                                                <td key={idx}>
                                                    <AutoSaveInput
                                                        type="int_pos"
                                                        saveKey={'price_constants.' + segment.idx + '.lower'}
                                                        value={caseStudy.price_constants && caseStudy.price_constants[segment.idx] ? caseStudy.price_constants[segment.idx].lower : ''}
                                                        {...props}
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <td>Higher Price</td>
                                            {segments.map((segment, idx) => (
                                                <td key={idx}>
                                                    <AutoSaveInput
                                                        type="int_pos"
                                                        saveKey={'price_constants.' + segment.idx + '.higher'}
                                                        value={caseStudy.price_constants && caseStudy.price_constants[segment.idx] ? caseStudy.price_constants[segment.idx].higher : ''}
                                                        {...props}
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                        <div style={{ height: '15px' }}></div>
                        <Card>
                            <Card.Header>
                                <AutoSaveText
                                    saveKey="text.marketing_constants_heading"
                                    text={caseStudy.text.marketing_constants_heading || 'Marketing Constants'}
                                    {...props}
                                />
                            </Card.Header>
                            <Card.Body>
                                <AutoSaveText
                                    saveKey="marketing_constants_explanation"
                                    text={pageData.marketing_constants_explanation || 'Marketing constants explanation goes here'}
                                    saveFn="saveSiteData"
                                    {...props}
                                />
                                <Row>
                                    <Col>Advertising Constant</Col>
                                    <Col>
                                        <AutoSaveInput
                                            type="int_pos"
                                            saveKey="price_constants.advertising_constant"
                                            value={caseStudy.price_constants.advertising_constant ? caseStudy.price_constants.advertising_constant : ''}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>Promotions Constant</Col>
                                    <Col>
                                        <AutoSaveInput
                                            type="int_pos"
                                            saveKey="price_constants.promotions_constant"
                                            value={caseStudy.price_constants.promotions_constant ? caseStudy.price_constants.promotions_constant : ''}
                                            {...props}
                                        />
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Card.Body>
                </Card>
            </>
            :
            <div style={{ backgroundColor: 'white', borderRadius: '5px', border: '1px solid darkgrey', padding: '10px', textAlign: 'center' }}>
                <h2>Please select a case study from Case Studies page.</h2>
            </div>
    );
};

export default CaseStudySetup;
