import React from 'react';
import { useState } from 'react';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import FormatData from '../FormatData';
import AutoSaveText from './AutoSaveText';
import AutoSaveInput from './AutoSaveInput';
import Icon from '../Icon.js';
import ShowModal from './ShowModal';
import ShowToast from './ShowToast';

const FinancialStatement = (props) => {
    const caseStudy = props.caseStudy;
    const allQuartersData = props.allQuartersData;
    const noOfQtr = props.mode == 'edit' ? 0 : Object.keys(allQuartersData).length;
    const qtrs = props.mode == 'edit' ? [caseStudy.quarters.labels[noOfQtr]] : Object.values(caseStudy.quarters.labels).splice(0, (noOfQtr - 1));
    const vars = [];

    props.vars.forEach((_var) => {
        if (!_var.hide) {
            vars.push(_var);
            return;
        }

        if (props.mode == 'edit') {
            var value = parseInt(caseStudy.financials[_var.name] || 0);
            if (value) {
                vars.push(_var);
            }
        }
        else {
            var hasValue = false;
            for (var prop in allQuartersData) {
                var value = parseInt(allQuartersData[prop].financials[_var.name] || 0);
                if (value) {
                    hasValue = true;
                    break;
                }
            }
            if (hasValue) {
                vars.push(_var);
            }
        }
    });

    const addVar = () => {
        ShowModal({
            title: 'Add Variable',
            closeButtonText: 'Close',
            body: <Container style={{ minWidth: '400px' }}>
                <Row style={{ fontWeight: 'bold', marginBottom: '20px' }}>
                    <Col>Variable Name</Col>
                    <Col><Form.Control name="var_name" type="text" /></Col>
                </Row>
                <Row style={{ fontWeight: 'bold', marginBottom: '20px' }}>
                    <Col>Variable Text</Col>
                    <Col><Form.Control name="var_text" type="text" /></Col>
                </Row>
                <Row style={{ fontWeight: 'bold', marginBottom: '20px' }}>
                    <Col>Function</Col>
                    <Col><Form.Control name="var_func" as="textarea" /></Col>
                </Row>
            </Container>,
            buttons: [
                {
                    text: 'Save',
                    onClick: async () => {
                        //await db.saveCaseStudyData(props, "initial_segment_demand", demand);
                        ShowToast({ heading: 'save clicked' });
                        return true;
                    }
                }
            ]
        });
    };

    return (
        <Card className="container-card">
            <Card.Body>
                <Table>
                    <thead>
                        <tr>
                            <th>{/* blank */}</th>
                            {qtrs.map((qtr, i) => (
                                <th key={i} style={{ textAlign: 'center' }}>
                                    {qtr}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {vars.map((_var, idx) => (
                            <tr key={idx} style={{ backgroundColor: _var.type == 'heading' ? '#f1f1f1' : 'initial' }}>
                                <td style={{ fontWeight: _var.type == 'heading' ? 'bold' : 'normal' }}>
                                    <AutoSaveText
                                        saveKey={'text.' + _var.name + '_label'}
                                        text={caseStudy.text[_var.name + '_label'] || _var.text}
                                        {...props}
                                    />
                                </td>
                                {_var.type == 'heading' && qtrs.map((qtr, i) => (<td key={i}></td>))}
                                {_var.type != 'heading' && qtrs.map((qtr, i) => (
                                    props.mode == 'edit' && !_var.static ?
                                        <td key={i}>
                                            <AutoSaveInput
                                                type="currency_int_neg"
                                                saveKey={'financials.' + _var.name}
                                                value={caseStudy.financials[_var.name] || ''}
                                                {...props}
                                            />
                                        </td>
                                        :
                                        <td key={i} style={{ textAlign: 'right', paddingRight: '10px' }} >
                                            <Tooltip text={(Math.round((
                                                props.mode == 'edit' ?
                                                    parseInt(caseStudy.financials[_var.name] || 0) * 100 / parseInt(caseStudy.financials['revenue']) :
                                                    parseInt(allQuartersData[(i).toString()].financials[_var.name] || 0) * 100 / parseInt(allQuartersData[(i).toString()].financials['revenue'] || 0)
                                            ) * 100) / 100).toFixed(2) + '%'
                                            }>
                                                <FormatData
                                                    caseStudy={caseStudy}
                                                    format="amount_int"
                                                    name={_var.name}
                                                    value={(_var.minus ? -1 : 1) * (props.mode == 'edit' ? parseInt(caseStudy.financials[_var.name] || 0) : parseInt(allQuartersData[(i).toString()].financials[_var.name] || 0))}
                                                />
                                            </Tooltip>
                                        </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card.Body>
        </Card>
    );
};

export default FinancialStatement;

const Tooltip = ({ text, children }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    const handleMouseEnter = () => {
        setShowTooltip(true);
    };

    const handleMouseLeave = () => {
        setShowTooltip(false);
    };

    return (
        <div style={{ position: 'relative', display: 'inline-block' }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            {children}
            {showTooltip && <div style={{
                position: 'absolute',
                backgroundColor: 'black',
                color: 'white',
                padding: '5px',
                borderRadius: '5px',
                top: '-40px',
                left: '50%',
                transform: 'translateX(-50%)'
            }}>{text}</div>}
        </div>
    );
};
