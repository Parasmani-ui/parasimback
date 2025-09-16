import React from "react";
import Select from 'react-select';
import { useState } from 'react';
import Card from 'react-bootstrap/Card';
import { uuid } from '../utils/common';
import Confirm from '../utils/Confirm';
import EditingToolbar from '../utils/EditingToolbar';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Icon from '../Icon.js';
import FormatData from '../FormatData';
import gameConfig from '../../gameConfig';
import EditableImage from '../utils/EditableImage';
import EditableListRowToolbar from '../utils/EditableListRowToolbar';
import EditableListColToolbar from '../utils/EditableListColToolbar';
import AutoSaveText from '../utils/AutoSaveText';
import AutoSaveInput from "../utils/AutoSaveInput";
import db from '../utils/db';

const SpecialProjects = (props) => {
    const caseStudy = props.caseStudy;
    const gameData = props.gameData;
    const [editing, setEditing] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [specialProjects, setSpecialProjects] = useState(JSON.parse(JSON.stringify(gameData.special_projects)));
    const projects = caseStudy.special_projects.sort((a, b) => { return a.idx - b.idx; });

    const template = () => {
        const _template = caseStudy.special_projects_template;
        _template.key = uuid();
        return _template;
    };

    const optionsTemplate = caseStudy.options_template;
    const featureOptions = [];
    caseStudy.product.specs.forEach((spec) => {
        const option = {};
        option.label = spec.feature;
        option.value = spec.feature;
        option.specidx = spec.idx;
        featureOptions.push(option);
    });

    const impactOptions = [
        {
            label: 'Material Cost Reduction',
            value: 'material_cost_impact'
        },
        {
            label: 'Sales Effectiveness Increase',
            value: 'sales_effectiveness_impact'
        },
        {
            label: 'Productivity Increase',
            value: 'productivity_impact'
        },
    ];

    const levelOptions = [];
    for (var i = 1; i <= 5; i++) {
        levelOptions.push({
            label: i.toString(),
            value: i
        });
    }

    const _sort = (options) => {
        options.sort((a, b) => { return a.idx - b.idx; });
        return options;
    };

    const handleEditClick = (component) => {
        setEditing(true);
    };

    const handleRadioChange = (event) => {
        var _projects = specialProjects ? JSON.parse(JSON.stringify(specialProjects)) : {};
        _projects[event.target.name] = event.target.value;
        setSpecialProjects(_projects);
        setDirty(true);
    };

    const handleSaveClick = async (component) => {
        setSpecialProjects(JSON.parse(JSON.stringify(specialProjects)));
        gameData.special_projects = specialProjects;
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
                setSpecialProjects(JSON.parse(JSON.stringify(gameData.special_projects)));
            },
            title: 'You have unsaved changes!',
            buttonText: 'Stop Editing'
        });
    };

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

    const handleTypeChange = async (_idx, pidx, value) => {
        const project = projects[_idx];
        project.minLevel = null;
        project.maxLevel = null;
        project.selectedOption = null;
        project.type = value;
        await db.saveCaseStudyData(props, 'special_projects.$[i]', project, [{ "i.idx": pidx }]);
    };

    const projectOptionChanged = async (pidx, option) => {
        await db.saveCaseStudyData(props, 'special_projects.$[i].selectedOption', option, [{ "i.idx": pidx }]);
    };

    const levelOptionChanged = async (name, pidx, oidx, option) => {
        await db.saveCaseStudyData(props, 'special_projects.$[i].options.$[j].' + name, option, [{ "i.idx": pidx }, { "j.idx": oidx }]);
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
                {props.mode == 'edit' &&
                    <EditableListRowToolbar
                        template={template()}
                        saveKey="special_projects"
                        list={projects}
                        {...props}
                    />
                }
                <Card.Body>
                    {projects && projects.map((project, idx) => (
                        <div key={idx}>
                            <Card style={{ marginTop: idx ? '15px' : 0 }}>
                                <Card.Header>
                                    <EditableListColToolbar
                                        saveKey="special_projects"
                                        list={projects}
                                        idx={idx}
                                        {...props}
                                    />
                                    <AutoSaveText
                                        saveKey="special_projects.$[i].name"
                                        text={project.name || 'Project Name'}
                                        filters={[{ "i.idx": idx }]}
                                        {...props}
                                    />
                                </Card.Header>
                                <Card.Body>
                                    <Row>
                                        <Col lg={3} md={4} sm={12}>
                                            <EditableImage
                                                style={{ height: '10em', width: '100%' }}
                                                src={gameConfig.getCaseStudyImagePath(caseStudy.key, project.image)}
                                                imageMode="background"
                                                saveKey="special_projects.$[i].image"
                                                filters={[{ "i.idx": idx }]}
                                                {...props}
                                            />
                                        </Col>
                                        <Col lg={9} md={8} sm={12}>
                                            <p>
                                                <AutoSaveText
                                                    saveKey="special_projects.$[i].description"
                                                    text={project.description || 'Project Description'}
                                                    filters={[{ "i.idx": idx }]}
                                                    toolbarStyle={{ top: '-25px', right: 0 }}
                                                    {...props}
                                                />
                                            </p>
                                            {props.mode == 'edit' &&
                                                <>
                                                    <p>
                                                        <input type="radio" value="innovation" name={'project_type-' + idx} checked={project.type == "innovation"} onChange={async (event) => { await handleTypeChange(idx, project.idx, event.target.value) }} />
                                                        <span style={{ paddingLeft: '10px' }}>
                                                            Innovation
                                                        </span>
                                                    </p>
                                                    <p>
                                                        <input type="radio" value="process" name={'project_type-' + idx} checked={project.type == "process"} onChange={async (event) => { await handleTypeChange(idx, project.idx, event.target.value) }} />
                                                        <span style={{ paddingLeft: '10px' }}>
                                                            Process
                                                        </span>
                                                    </p>
                                                </>
                                            }
                                        </Col>
                                    </Row>
                                    {props.mode != 'edit' && !editing && (!specialProjects || !specialProjects[project.key] || specialProjects[project.key] == 'Dont Invest') &&
                                        <div>You have not invested in this project.</div>
                                    }
                                    {props.mode != 'edit' && !editing && specialProjects && specialProjects[project.key] && specialProjects[project.key] != 'Dont Invest' &&
                                        <div>
                                            You have invested {
                                                <FormatData
                                                    caseStudy={caseStudy}
                                                    format="price_int"
                                                    name="investment"
                                                    value={getProjectInvestment(project)}
                                                />
                                            } in this project.
                                        </div>
                                    }
                                    {(props.mode == 'edit' || editing) &&
                                        <Card>
                                            <Card.Header>
                                                <EditableListRowToolbar
                                                    template={optionsTemplate}
                                                    saveKey="special_projects.$[i].options"
                                                    list={_sort(project.options)}
                                                    filters={[{ "i.idx": idx }]}
                                                    {...props}
                                                />
                                                <input type="radio" value="Dont Invest" name={project.key} checked={specialProjects && specialProjects[project.key] == "Dont Invest"} onChange={handleRadioChange} />
                                                <span style={{ paddingLeft: '10px' }}>
                                                    <AutoSaveText
                                                        saveKey="text.dont_invest_label"
                                                        text={caseStudy.text.dont_invest_label || 'Dont Invest'}
                                                        {...props}
                                                    />
                                                </span>
                                            </Card.Header>
                                        </Card>
                                    }
                                    {((props.mode != 'edit' && editing) || props.mode == 'edit') &&
                                        <Row>
                                            {_sort(project.options).map((option, oidx) => (
                                                <Col key={uuid()} lg={4} md={6} sm={12}>
                                                    <Card>
                                                        <Card.Header>
                                                            <EditableListColToolbar
                                                                saveKey="special_projects.$[i].options"
                                                                filters={[{ "i.idx": idx }]}
                                                                list={_sort(project.options)}
                                                                idx={oidx}
                                                                {...props}
                                                            />
                                                            <input type="radio" value={option.label} name={project.key} checked={specialProjects && specialProjects[project.key] == option.label} onChange={handleRadioChange} />
                                                            <span style={{ paddingLeft: '10px' }}>
                                                                <AutoSaveText
                                                                    saveKey="special_projects.$[i].options.$[j].label"
                                                                    text={option.label || 'Option Label'}
                                                                    filters={[{ "i.idx": idx }, { "j.idx": oidx }]}
                                                                    {...props}
                                                                />
                                                            </span>
                                                        </Card.Header>
                                                        <Card.Body>
                                                            <Row>
                                                                <Col md={3}>
                                                                    <AutoSaveText
                                                                        saveKey="text.special_projects_invest_label"
                                                                        text={caseStudy.text.special_projects_invest_label || 'Investment'}
                                                                        {...props}
                                                                    />
                                                                </Col>
                                                                <Col>
                                                                    {props.mode == 'edit' ?
                                                                        <AutoSaveInput
                                                                            type="currency_int_pos"
                                                                            saveKey="special_projects.$[i].options.$[j].investment"
                                                                            value={option.investment || '0'}
                                                                            filters={[{ "i.idx": idx }, { "j.idx": oidx }]}
                                                                            {...props}
                                                                        />
                                                                        :
                                                                        <FormatData
                                                                            caseStudy={caseStudy}
                                                                            format="price_int"
                                                                            name="profit"
                                                                            value={option.investment || 0}
                                                                        />
                                                                    }
                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                                <Col md={3}>
                                                                    <AutoSaveText
                                                                        saveKey="text.special_projects_failure_risk_label"
                                                                        text={caseStudy.text.special_projects_failure_risk_label || 'Failure Risk'}
                                                                        {...props}
                                                                    />
                                                                </Col>
                                                                <Col>
                                                                    {props.mode == 'edit' ?
                                                                        <AutoSaveInput
                                                                            type="pct_int_pos"
                                                                            saveKey="special_projects.$[i].options.$[j].failure_risk"
                                                                            value={option.failure_risk || '0'}
                                                                            filters={[{ "i.idx": idx }, { "j.idx": oidx }]}
                                                                            {...props}
                                                                        />
                                                                        :
                                                                        (option.failure_risk || '0') + ' %'
                                                                    }
                                                                </Col>
                                                            </Row>
                                                        </Card.Body>
                                                        {project.type == 'process' &&
                                                            <Card.Body>
                                                                <Card.Subtitle >
                                                                    <AutoSaveText
                                                                        saveKey="text.special_projects_improve_heading"
                                                                        text={caseStudy.text.special_projects_improve_heading || 'Improve'}
                                                                        {...props}
                                                                    />
                                                                </Card.Subtitle>
                                                                {props.mode == 'edit' ?
                                                                    <Select
                                                                        className="impact_select"
                                                                        name="impact_select"
                                                                        options={impactOptions}
                                                                        value={project.selectedOption}
                                                                        onChange={async (option) => { await projectOptionChanged(project.idx, option) }}
                                                                    />
                                                                    :
                                                                    <span>{project.selectedOption.label || 'not defined'}</span>
                                                                }
                                                                <Row>
                                                                    <Col md={3}>Min</Col>
                                                                    <Col>
                                                                        {props.mode == 'edit' ?
                                                                            <AutoSaveInput
                                                                                type="pct_int_pos"
                                                                                saveKey="special_projects.$[i].options.$[j].minLevel"
                                                                                value={option.minLevel || '0'}
                                                                                filters={[{ "i.idx": idx }, { "j.idx": oidx }]}
                                                                                {...props}
                                                                            />
                                                                            :
                                                                            (option.minLevel || '0') + ' %'
                                                                        }
                                                                    </Col>
                                                                </Row>
                                                                <Row>
                                                                    <Col md={3}>Max</Col>
                                                                    <Col>
                                                                        {props.mode == 'edit' ?
                                                                            <AutoSaveInput
                                                                                type="pct_int_pos"
                                                                                saveKey="special_projects.$[i].options.$[j].maxLevel"
                                                                                value={option.maxLevel || '0'}
                                                                                filters={[{ "i.idx": idx }, { "j.idx": oidx }]}
                                                                                {...props}
                                                                            />
                                                                            :
                                                                            (option.maxLevel || '0') + ' %'
                                                                        }
                                                                    </Col>
                                                                </Row>
                                                            </Card.Body>
                                                        }
                                                        {project.type == 'innovation' &&
                                                            <Card.Body>
                                                                <Card.Subtitle >
                                                                    <AutoSaveText
                                                                        saveKey="text.special_projects_innovation_heading"
                                                                        text={caseStudy.text.special_projects_innovation_heading || 'Upgrade'}
                                                                        {...props}
                                                                    />
                                                                </Card.Subtitle>

                                                                {props.mode == 'edit' ?
                                                                    <Select
                                                                        className="feature_select"
                                                                        name="feature_select"
                                                                        options={featureOptions}
                                                                        value={project.selectedOption}
                                                                        onChange={async (option) => { await projectOptionChanged(project.idx, option) }}
                                                                    />
                                                                    :
                                                                    <span>{project.selectedOption && project.selectedOption.label ? project.selectedOption.label : 'not defined'}</span>
                                                                }
                                                                <Row>
                                                                    <Col md={3}>Min</Col>
                                                                    <Col>
                                                                        {props.mode == 'edit' ?
                                                                            <Select
                                                                                className="min_level_select"
                                                                                name="min_level_select"
                                                                                options={levelOptions}
                                                                                value={option.minLevel}
                                                                                onChange={async (option) => { await levelOptionChanged('minLevel', project.idx, oidx, option) }}
                                                                            />
                                                                            :
                                                                            (option.minLevel && option.minLevel.label ? option.minLevel.label : 'not selected')
                                                                        }
                                                                    </Col>
                                                                    <Col>Level</Col>
                                                                </Row>
                                                                <Row>
                                                                    <Col md={3}>Max</Col>
                                                                    <Col>
                                                                        {props.mode == 'edit' ?
                                                                            <Select
                                                                                className="level_select"
                                                                                name="level_select"
                                                                                options={levelOptions}
                                                                                value={option.maxLevel}
                                                                                onChange={async (option) => { await levelOptionChanged('maxLevel', project.idx, oidx, option) }}
                                                                            />
                                                                            :
                                                                            (option.maxLevel && option.maxLevel.label ? option.maxLevel.label : 'not selected')
                                                                        }
                                                                    </Col>
                                                                    <Col>Level</Col>
                                                                </Row>
                                                            </Card.Body>
                                                        }
                                                    </Card>
                                                </Col>
                                            ))}
                                        </Row>
                                    }
                                </Card.Body>
                            </Card>
                        </div>
                    ))}
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

export default SpecialProjects;