import React from "react";
import { useState } from 'react';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FormatData from '../FormatData';
import AutoSaveText from '../utils/AutoSaveText';
import Icon from '../Icon.js';
import ShowModal from '../utils/ShowModal';
import AutoSaveInput from '../utils/AutoSaveInput';

const CapacityReport = (props) => {
    const game = props.game;
    const caseStudy = props.caseStudy;
    const gameState = props.gameState;
    const gameData = props.gameData;
    const currentQuarter = parseInt(gameState.current_quarter || 0);
    const teams = props.mode == 'edit' ? Object.values(gameState.teams) : props.teams;

    const [show, setShow] = useState(false);
    const [labels, setLabels] = useState(caseStudy);

    var totalCapacity = 0;
    var totalProduction = 0;
    const production = {};

    teams.forEach((team) => {
        const capacity = props.mode == 'edit' ? parseInt(caseStudy.financials.capacity || 0) : parseInt(team.capacity || 0);
        totalCapacity += capacity;
        var _prod = 0;
        const products = props.mode == 'edit' ? caseStudy.products : team.products[currentQuarter - 1];
        products.forEach((product) => {
            _prod += product.actualProduction;
        });
        production[team.name] = _prod;
        totalProduction += _prod;
    });

    const toolbarStyle = {
        display: 'flex',
        position: 'absolute',
        right: 0,
        top: 0,
        textAlign: 'right',
        zIndex: 1
      };
    
    const buttonClicked = () => {
        ShowModal({
            title: 'Edit Team Defaults',
            closeButtonText: 'Close',
            body: <Container style={{ minWidth: '300px' }}>
                <Row>
                  <Col>Default Capacity</Col>
                  <Col>
                    <AutoSaveInput
                        type="int_pos"
                        saveKey="financials.capacity"
                        value={caseStudy.financials.capacity || 0}
                      {...props}
                    />
                  </Col>
                </Row>
            </Container>
          });      
    };

    return (
        <Card style={{height: '100%'}}>
            <Card.Header>
                {props.mode == 'edit' && <span className='editable_wrapper demand_forecast_toolbar' style={{ position: 'relative', display: 'block' }} >
                    <span className="toolbar" style={toolbarStyle}>
                        <span className="toolbar_button edit_colors" onClick={buttonClicked} ><Icon name="capacity" /></span>
                    </span>
                </span>
                }

                <AutoSaveText
                    saveKey="text.capacity_report_heading"
                    text={caseStudy.text.capacity_report_heading || 'Capacity Report'}
                    {...props}
                />
            </Card.Header>
            <Card.Body style={{ overflowX: 'hidden', overflowY: 'scroll' }}>
                <Table bordered hover style={{ fontSize: '0.8rem' }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left' }}>
                                <AutoSaveText
                                    saveKey="text.team_row_heading"
                                    text={caseStudy.text.team_row_heading || 'Team Name'}
                                    {...props}
                                />
                            </th>
                            <th>
                                <AutoSaveText
                                    saveKey="text.capacity_row_heading"
                                    text={caseStudy.text.capacity_row_heading || 'Capacity'}
                                    {...props}
                                />
                            </th>
                            <th>
                                <AutoSaveText
                                    saveKey="text.production_row_heading"
                                    text={caseStudy.text.production_row_heading || 'Production'}
                                    {...props}
                                />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {teams.map((team, idx) => (
                            <tr key={idx}>
                                <td style={{ textAlign: 'left' }}>{team.name}</td>
                                <td>
                                    <FormatData
                                        caseStudy={caseStudy}
                                        format="thousands_indicator_int"
                                        name="capacity"
                                        value={props.mode == 'edit' ? caseStudy.financials.capacity || 0 : team.capacity} />
                                </td>
                                <td>
                                    <FormatData
                                        caseStudy={caseStudy}
                                        format="thousands_indicator_int"
                                        name="capacity"
                                        value={props.mode == 'edit' ? caseStudy.financials.capacity || 0 : production[team.name]} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <th style={{ textAlign: 'right' }}>
                                <AutoSaveText
                                    saveKey="text.total_footer_text"
                                    text={caseStudy.text.total_footer_text || 'Total Capacity'}
                                    {...props}
                                />
                            </th>
                            <th>
                                <FormatData
                                    caseStudy={caseStudy}
                                    format="thousands_indicator_int"
                                    name="capacity"
                                    value={totalCapacity} />
                            </th>
                            <th>
                                <FormatData
                                    caseStudy={caseStudy}
                                    format="thousands_indicator_int"
                                    name="capacity"
                                    value={totalProduction} />
                            </th>
                        </tr>
                    </tfoot>
                </Table>
            </Card.Body>
        </Card>
    );
};

export default CapacityReport;
