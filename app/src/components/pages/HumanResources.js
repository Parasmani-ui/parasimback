import React from "react";
import { useState } from 'react';
import Card from 'react-bootstrap/Card';
import Confirm from '../utils/Confirm';
import EditingToolbar from '../utils/EditingToolbar';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Icon from '../Icon.js';
import FormatData from '../FormatData';
import AutoSaveText from '../utils/AutoSaveText';
import AutoSaveInput from '../utils/AutoSaveInput';
import { _functions } from '../../context/hooks.js';
import db from '../utils/db';
import ShowToast from '../utils/ShowToast';

const HumanResources = (props) => {
    const caseStudy = props.caseStudy;
    const gameData = props.gameData;
    const [editing, setEditing] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [financials, setFinancials] = useState(JSON.parse(JSON.stringify(props.mode == 'edit' ? caseStudy.financials : gameData.financials)));

    const handleInputChange = (event) => {
        const _financials = { ...financials };

        switch (event.target.name) {
            case 'planned_workforce':
                _financials.planned_workforce = event.target.value;
                const plannedWorkforce = parseInt(_financials.planned_workforce || 0);
                const change = plannedWorkforce - parseInt(_financials.existing_workforce || 0);
                _financials.recruitment_cost = Math.abs(change * (change > 0 ? parseInt(caseStudy.financials.avg_hiring_cost || 0) : parseInt(caseStudy.financials.avg_firing_cost || 0)));
                _financials.salary_cost = plannedWorkforce * parseInt(caseStudy.financials.avg_salary || 0);
                _financials.employment_cost = _financials.recruitment_cost + _financials.salary_cost;
                break;

            case 'innovation_budget':
                const maxi = parseInt(_financials.innovation_budget_max || 0);
                _financials.innovation_budget = event.target.value;
                const innovationBudget = parseInt(_financials.innovation_budget || 0);
                if (innovationBudget > maxi) {
                    ShowToast({ icon: 'danger', heading: 'Invalid value', message: 'Innovation budget cannot exceed ' + maxi });
                    return;
                }

                const _ratioi = innovationBudget * 100 / maxi;
                const _scalei = _ratioi > 80 ? 100 * (1 - Math.exp(-0.03 * _ratioi)) : .8 * _ratioi + 4;
                _financials.productivity_increase = _scalei * parseInt(caseStudy.financials.productivity_improvement_max || 0) / 100;
                break;

            case 'training_budget':
                const maxt = parseInt(_financials.training_budget_max || 0);
                _financials.training_budget = event.target.value;
                const trainingBudget = parseInt(_financials.training_budget || 0);
                if (trainingBudget > maxt) {
                    ShowToast({ icon: 'danger', heading: 'Invalid value', message: 'Training budget cannot exceed ' + maxt });
                    return;
                }

                const _ratiot = trainingBudget * 100 / maxt;
                const _scalet = _ratiot > 80 ? 100 * (1 - Math.exp(-0.03 * _ratiot)) : .8 * _ratiot + 4;
                _financials.efficiency_increase = _scalet * parseInt(caseStudy.financials.sales_effectiveness_max || 0) / 100;
                break;
        }

        setFinancials(JSON.parse(JSON.stringify(_financials)));
        setDirty(true);
    };

    const updateCaseStudy = async (event) => {
        const keys = event.saveKey.split('.');
        if (keys[0] == 'financials') {
            const _financials = { ...financials };
            _financials[keys[1]] = event.value;

            switch (keys[1]) {
                case 'existing_workforce':
                case 'avg_salary':
                    _financials.salary_cost = parseInt(_financials.existing_workforce || 0) * parseInt(_financials.avg_salary || 0);
                    _financials.employment_cost = _financials.salary_cost;

                    await db.saveCaseStudyData(props, "financials", _financials, null, true);
                    setFinancials(_financials);
                    await props.updateData();
                    break;
            }
        }
    };

    const handleEditClick = (component) => {
        setEditing(true);
    };

    const handleSaveClick = async (component) => {
        const _financials = JSON.parse(JSON.stringify(financials));

        if (_financials.planned_workforce && !/^[0-9]+$/.test(_financials.planned_workforce.toString())) {
            ShowToast({ icon: 'danger', heading: 'Input Error', message: 'Planned Workforce can only be a positive integer value.' });
            return;
        }

        if (_financials.innovation_budget && !/^[0-9]+$/.test(_financials.innovation_budget.toString())) {
            ShowToast({ icon: 'danger', heading: 'Input Error', message: 'Innovation Budget can only be a positive integer value.' });
            return;
        }

        if (_financials.training_budget && !/^[0-9]+$/.test(_financials.training_budget.toString())) {
            ShowToast({ icon: 'danger', heading: 'Input Error', message: 'Training Budget can only be a positive integer value.' });
            return;
        }

        setFinancials(_financials);
        gameData.financials = _financials;
        setDirty(false);
        setEditing(false);
        await props.updateGameData(gameData);
    };

    const handleCloseClick = (component) => {
        if (!dirty) {
            setEditing(false);
            return;
        }

        Confirm({
            body: <span>Do you want to stop editing? <br /> You would lose your unsaved changes.</span>,
            callback: () => {
                setEditing(false);
                setDirty(false);
                setFinancials(JSON.parse(JSON.stringify(gameData.financials)));
            },
            title: 'You have unsaved changes!',
            buttonText: 'Stop Editing'
        });
    };

    return (
        <>
            <Card className="container-card">
                {props.mode != 'edit' &&
                    <EditingToolbar
                        editing={editing}
                        handleEditClick={handleEditClick}
                        handleSaveClick={handleSaveClick}
                        handleCloseClick={handleCloseClick}
                        style={{ position: 'absolute', height: '20px', top: '-43px', right: '109px' }}
                        readOnly={props.readOnly}
                    />
                }
                <Card.Body>
                    <Card>
                        <Card.Header>
                            <AutoSaveText
                                saveKey="text.manpower_planning_heading"
                                text={caseStudy.text.manpower_planning_heading || 'Manpower Planning'}
                                {...props}
                            />
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col lg={4} md={6} sm={12} style={{ padding: '3px' }}>
                                    <Form.Label>
                                        <AutoSaveText
                                            saveKey="text.existing_workforce_heading"
                                            text={caseStudy.text.existing_workforce_heading || 'Existing Workforce'}
                                            {...props}
                                        />
                                    </Form.Label>
                                    <div>
                                        {props.mode == 'edit' ?
                                            <AutoSaveInput
                                                type="int_pos"
                                                saveKey="financials.existing_workforce"
                                                value={financials.existing_workforce}
                                                updateParent={updateCaseStudy}
                                                {...props}
                                            />
                                            :
                                            <span>{financials.existing_workforce || 0}</span>
                                        }
                                    </div>
                                </Col>
                                <Col lg={4} md={6} sm={12} style={{ padding: '3px' }}>
                                    <Form.Label>
                                        <AutoSaveText
                                            saveKey="text.required_workforce_heading"
                                            text={caseStudy.text.required_workforce_heading || 'Required Workforce'}
                                            {...props}
                                        />
                                    </Form.Label>
                                    <div>
                                        <span>{financials.required_workforce}</span>
                                    </div>
                                </Col>
                                <Col lg={4} md={6} sm={12} style={{ padding: '3px' }}>
                                    <Form.Label>
                                        <AutoSaveText
                                            saveKey="text.planned_workforce_heading"
                                            text={caseStudy.text.planned_workforce_heading || 'Planned Workforce'}
                                            {...props}
                                        />
                                        &nbsp;*
                                    </Form.Label>
                                    {
                                        editing && props.mode != 'edit' && 
                                            <Form.Control 
                                                name="planned_workforce" 
                                                type="number" 
                                                value={financials.planned_workforce} 
                                                onChange={handleInputChange} 
                                            />
                                    }
                                    {
                                        !editing &&
                                        <div>
                                            {props.mode == 'edit' ?
                                                <span>In Game Decision</span>
                                                :
                                                <span>{financials.planned_workforce}</span>
                                            }
                                        </div>
                                    }
                                </Col>
                            </Row>
                            <Row style={{ marginTop: '20px' }}>
                                <Col lg={4} md={6} sm={12} style={{ padding: '3px' }}>
                                    <Form.Label>
                                        <AutoSaveText
                                            saveKey="text.salary_cost_heading"
                                            text={caseStudy.text.salary_cost_heading || 'Salary Cost'}
                                            {...props}
                                        />
                                    </Form.Label>
                                    <div>
                                        <FormatData
                                            caseStudy={caseStudy}
                                            format="price_int"
                                            name="salary_cost"
                                            value={financials.salary_cost || 0}
                                        />
                                    </div>
                                </Col>
                                <Col lg={4} md={6} sm={12} style={{ padding: '3px' }}>
                                    <Form.Label>
                                        <AutoSaveText
                                            saveKey="text.recruitment_cost_heading"
                                            text={caseStudy.text.recruitment_cost_heading || 'Recruitment Or Redundancy Cost'}
                                            {...props}
                                        />
                                    </Form.Label>
                                    <div>
                                        <FormatData
                                            caseStudy={caseStudy}
                                            format="price_int"
                                            name="recruitment_cost"
                                            value={financials.recruitment_cost || 0}
                                        />
                                    </div>
                                </Col>
                                <Col lg={4} md={6} sm={12} style={{ padding: '3px' }}>
                                    <Form.Label>
                                        <AutoSaveText
                                            saveKey="text.employment_cost_heading"
                                            text={caseStudy.text.employment_cost_heading || 'Employment Cost'}
                                            {...props}
                                        />
                                    </Form.Label>
                                    <div>
                                        <FormatData
                                            caseStudy={caseStudy}
                                            format="price_int"
                                            name="employment_cost"
                                            value={financials.employment_cost || 0}
                                        />
                                    </div>
                                </Col>
                            </Row>
                            <Row style={{ marginTop: '20px' }}>
                                <Col lg={4} md={6} sm={12} style={{ padding: '3px' }}>
                                    <Form.Label>
                                        <AutoSaveText
                                            saveKey="text.avg_salary_label"
                                            text={caseStudy.text.avg_salary_label || 'Average Salary'}
                                            {...props}
                                        />
                                    </Form.Label>
                                    <div>
                                        {props.mode == 'edit' ?
                                            <AutoSaveInput
                                                type="currency_int_pos"
                                                saveKey="financials.avg_salary"
                                                value={financials.avg_salary}
                                                updateParent={updateCaseStudy}
                                                {...props}
                                            />
                                            :
                                            <FormatData
                                                caseStudy={caseStudy}
                                                format="price_int"
                                                name="avg_salary"
                                                value={caseStudy.financials.avg_salary || 0}
                                            />
                                        }
                                    </div>
                                </Col>
                                <Col lg={4} md={6} sm={12} style={{ padding: '3px' }}>
                                    <Form.Label>
                                        <AutoSaveText
                                            saveKey="text.avg_hiring_cost_label"
                                            text={caseStudy.text.avg_hiring_cost_label || 'Average Hiring Cost'}
                                            {...props}
                                        />
                                    </Form.Label>
                                    <div>
                                        {props.mode == 'edit' ?
                                            <AutoSaveInput
                                                type="currency_int_pos"
                                                saveKey="financials.avg_hiring_cost"
                                                value={caseStudy.financials.avg_hiring_cost}
                                                {...props}
                                            />
                                            :
                                            <FormatData
                                                caseStudy={caseStudy}
                                                format="price_int"
                                                name="avg_hiring_cost"
                                                value={caseStudy.financials.avg_hiring_cost || 0}
                                            />
                                        }
                                    </div>
                                </Col>
                                <Col lg={4} md={6} sm={12} style={{ padding: '3px' }}>
                                    <Form.Label>
                                        <AutoSaveText
                                            saveKey="text.avg_firing_cost_label"
                                            text={caseStudy.text.avg_firing_cost_label || 'Average Redundancy Cost'}
                                            {...props}
                                        />
                                    </Form.Label>
                                    <div>
                                        {props.mode == 'edit' ?
                                            <AutoSaveInput
                                                type="currency_int_pos"
                                                saveKey="financials.avg_firing_cost"
                                                value={caseStudy.financials.avg_firing_cost}
                                                {...props}
                                            />
                                            :
                                            <FormatData
                                                caseStudy={caseStudy}
                                                format="price_int"
                                                name="avg_firing_costt"
                                                value={caseStudy.financials.avg_firing_cost || 0}
                                            />
                                        }
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                    <Card style={{ marginTop: '20px' }}>
                        <Card.Header>
                            <AutoSaveText
                                saveKey="text.training_cost_heading"
                                text={caseStudy.text.training_cost_heading || 'Innovation and Training'}
                                {...props}
                            />
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col lg={6} md={6} sm={12} style={{ padding: '3px' }}>
                                    <Form.Label>
                                        <AutoSaveText
                                            saveKey="text.innovation_budget_heading"
                                            text={caseStudy.text.innovation_budget_heading || 'Innovation Budget'}
                                            {...props}
                                        />
                                    </Form.Label>
                                    {
                                        editing &&
                                        <InputGroup className="mb-3">
                                            <InputGroup.Text id="basic-addon1"><Icon name={caseStudy.currency} /></InputGroup.Text>
                                            <Form.Control 
                                                name="innovation_budget" 
                                                type="number" 
                                                value={financials.innovation_budget} 
                                                onChange={handleInputChange} 
                                            />
                                        </InputGroup>

                                    }
                                    {!editing &&
                                        <div>
                                            {props.mode == 'edit' ?
                                                <AutoSaveInput
                                                    type="currency_int_pos"
                                                    saveKey="financials.innovation_budget"
                                                    value={financials.innovation_budget}
                                                    {...props}
                                                />
                                                :
                                                <FormatData
                                                    caseStudy={caseStudy}
                                                    format="price_int"
                                                    name="innovation_budget"
                                                    value={financials.innovation_budget || 0}
                                                />
                                            }
                                        </div>
                                    }
                                </Col>
                                <Col lg={6} md={6} sm={12} style={{ padding: '3px' }}>
                                    <Form.Label>
                                        <AutoSaveText
                                            saveKey="text.training_budget_heading"
                                            text={caseStudy.text.training_budget_heading || 'Training Budget'}
                                            {...props}
                                        />
                                    </Form.Label>
                                    {
                                        editing &&
                                        <InputGroup className="mb-3">
                                            <InputGroup.Text id="basic-addon1"><Icon name={caseStudy.currency} /></InputGroup.Text>
                                            <Form.Control 
                                                name="training_budget" 
                                                type="number" 
                                                value={financials.training_budget} 
                                                onChange={handleInputChange} 
                                            />
                                        </InputGroup>
                                    }
                                    {!editing &&
                                        <div>
                                            {props.mode == 'edit' ?
                                                <AutoSaveInput
                                                    type="currency_int_pos"
                                                    saveKey="financials.training_budget"
                                                    value={financials.training_budget}
                                                    {...props}
                                                />
                                                :
                                                <FormatData
                                                    caseStudy={caseStudy}
                                                    format="price_int"
                                                    name="training_budget"
                                                    value={financials.training_budget || 0}
                                                />
                                            }
                                        </div>
                                    }
                                </Col>
                                <Col lg={6} md={6} sm={12} style={{ padding: '3px' }}>
                                    <Form.Label>
                                        <AutoSaveText
                                            saveKey="text.innovation_maxlimit_heading"
                                            text={caseStudy.text.innovation_maxlimit_heading || 'Innovation Budget Max Limit'}
                                            {...props}
                                        />
                                    </Form.Label>
                                    {props.mode == 'edit' ?
                                        <AutoSaveInput
                                            type="currency_int_pos"
                                            saveKey="financials.innovation_budget_max"
                                            value={financials.innovation_budget_max}
                                            {...props}
                                        />
                                        :
                                        <FormatData
                                            caseStudy={caseStudy}
                                            format="price_int"
                                            name="innovation_budget_max"
                                            value={financials.innovation_budget_max || 0}
                                        />
                                    }
                                </Col>
                                <Col lg={6} md={6} sm={12} style={{ padding: '3px' }}>
                                    <Form.Label>
                                        <AutoSaveText
                                            saveKey="text.training_maxlimit_heading"
                                            text={caseStudy.text.training_maxlimit_heading || 'Training Budget Max Limit'}
                                            {...props}
                                        />
                                    </Form.Label>
                                    {props.mode == 'edit' ?
                                        <AutoSaveInput
                                            type="currency_int_pos"
                                            saveKey="financials.training_budget_max"
                                            value={financials.training_budget_max || ''}
                                            {...props}
                                        />
                                        :
                                        <FormatData
                                            caseStudy={caseStudy}
                                            format="price_int"
                                            name="training_budget_max"
                                            value={financials.training_budget_max || 0}
                                        />
                                    }
                                </Col>
                                <Col lg={6} md={6} sm={12} style={{ padding: '3px' }}>
                                    <Form.Label>
                                        <AutoSaveText
                                            saveKey="text.productivity_increase_heading"
                                            text={caseStudy.text.productivity_increase_heading || 'Estimated Increase in Productivity'}
                                            {...props}
                                        /> (in %)
                                    </Form.Label>
                                    <div>
                                        {props.mode == 'edit' ?
                                            <span>In game calculation</span>
                                            :
                                            <FormatData
                                                caseStudy={caseStudy}
                                                format="percent_dec"
                                                name="training_budget_max"
                                                value={financials.productivity_increase || 0}
                                            />
                                        }
                                    </div>
                                </Col>
                                <Col lg={6} md={6} sm={12} style={{ padding: '3px' }}>
                                    <Form.Label>
                                        <AutoSaveText
                                            saveKey="text.sales_effectiveness_increase_heading"
                                            text={caseStudy.text.sales_effectiveness_increase_heading || 'Estimated Increase in Sales Effectiveness and Service Level'}
                                            {...props}
                                        /> (in %)
                                    </Form.Label>
                                    <div>
                                        {props.mode == 'edit' ?
                                            <span>In game calculation</span>
                                            :
                                            <FormatData
                                                caseStudy={caseStudy}
                                                format="percent_dec"
                                                name="training_budget_max"
                                                value={financials.efficiency_increase || 0}
                                            />
                                        }
                                    </div>
                                </Col>
                                <Col lg={6} md={6} sm={12} style={{ padding: '3px' }}>
                                    <Form.Label>
                                        <AutoSaveText
                                            saveKey="text.productivity_improvement_max_heading"
                                            text={caseStudy.text.productivity_improvement_max_heading || 'Productivity Improvement Max Limit'}
                                            {...props}
                                        />
                                    </Form.Label>
                                    {props.mode == 'edit' ?
                                        <AutoSaveInput
                                            type="pct_int_pos"
                                            saveKey="financials.productivity_improvement_max"
                                            value={caseStudy.financials.productivity_improvement_max}
                                            updateParent={updateCaseStudy}
                                            {...props}
                                        />
                                        :
                                        <div>
                                            <FormatData
                                                caseStudy={caseStudy}
                                                format="percent_dec"
                                                name="productivity_improvement_max"
                                                value={financials.productivity_improvement_max || 0}
                                            />
                                        </div>
                                    }
                                </Col>
                                <Col lg={6} md={6} sm={12} style={{ padding: '3px' }}>
                                    <Form.Label>
                                        <AutoSaveText
                                            saveKey="text.sales_effectiveness_max_heading"
                                            text={caseStudy.text.sales_effectiveness_max_heading || 'Sales Effectiveness Max Limit'}
                                            {...props}
                                        />
                                    </Form.Label>
                                    {props.mode == 'edit' ?
                                        <AutoSaveInput
                                            type="pct_int_pos"
                                            saveKey="financials.sales_effectiveness_max"
                                            value={caseStudy.financials.sales_effectiveness_max || ''}
                                            updateParent={updateCaseStudy}
                                            {...props}
                                        />
                                        :
                                        <div>
                                            <FormatData
                                                caseStudy={caseStudy}
                                                format="percent_dec"
                                                name="sales_effectiveness_max"
                                                value={financials.sales_effectiveness_max || 0}
                                            />
                                        </div>
                                    }
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                    {props.mode == 'edit' &&
                        <Card>
                            <Card.Header>
                                <AutoSaveText
                                    saveKey="text.manpower_breakdown_heading"
                                    text={caseStudy.text.manpower_breakdown_heading || 'Manpower Breakdown'}
                                    {...props}
                                />
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col>
                                        <Card.Text>
                                            <AutoSaveText
                                                saveKey="text.labour_cost_pct_label"
                                                text={caseStudy.text.labour_cost_pct_label || 'Labour Cost'}
                                                {...props}
                                            />
                                        </Card.Text>
                                        <AutoSaveInput
                                            type="pct_int_pos"
                                            saveKey="financials.labour_cost_pct"
                                            value={caseStudy.financials.labour_cost_pct}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <Card.Text style={{ paddingLeft: '20px' }}>
                                            <AutoSaveText
                                                saveKey="text.sales_cost_pct"
                                                text={caseStudy.text.sales_cost_pct || 'Sales Cost'}
                                                {...props}
                                            />
                                        </Card.Text>
                                        <Card.Text style={{ paddingLeft: '20px' }}>{100 - parseInt(caseStudy.financials.labour_cost_pct || 0)} %</Card.Text>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <Card.Text>
                                            <AutoSaveText
                                                saveKey="text.fixed_labour_cost_label"
                                                text={caseStudy.text.fixed_labour_cost_label || 'Fixed Labour Cost'}
                                                {...props}
                                            />
                                        </Card.Text>
                                        <AutoSaveInput
                                            type="currency_int_pos"
                                            saveKey="financials.fixed_labour_cost"
                                            value={caseStudy.financials.fixed_labour_cost}
                                            {...props}
                                        />
                                    </Col>
                                    <Col>
                                        <Card.Text style={{ paddingLeft: '20px' }}>
                                            <AutoSaveText
                                                saveKey="text.fixed_sales_cost"
                                                text={caseStudy.text.fixed_sales_cost || 'Fixed Sales Cost'}
                                                {...props}
                                            />
                                        </Card.Text>
                                        <AutoSaveInput
                                            type="currency_int_pos"
                                            saveKey="financials.fixed_sales_cost"
                                            value={caseStudy.financials.fixed_sales_cost}
                                            {...props}
                                        />
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    }
                </Card.Body>
            </Card>
            <div style={{ position: 'relative', padding: '20px', height: '80px', textAlign: 'center' }}>
                <EditingToolbar
                    editing={editing}
                    handleEditClick={handleEditClick}
                    handleSaveClick={handleSaveClick}
                    handleCloseClick={handleCloseClick}
                    style={{ position: 'absolute', height: '20px', right: props.mode == 'edit' ? 0 : '109px' }}
                    readOnly={props.readOnly}
                />
            </div>
        </>
    );
};

export default HumanResources;