import React from "react";
import { useState, useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import FormatData from '../FormatData';
import EditingToolbar from '../utils/EditingToolbar';
import AutoSaveText from '../utils/AutoSaveText';
import AutoSaveInput from '../utils/AutoSaveInput';
import db from '../utils/db';
import ShowToast from '../utils/ShowToast';
import Confirm from '../utils/Confirm';

const Financing = (props) => {
    const gameData = props.gameData;
    const caseStudy = props.caseStudy;
    const [editing, setEditing] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [financials, setFinancials] = useState(JSON.parse(JSON.stringify(props.mode == 'edit' ? caseStudy.financials : gameData.financials)));

    const handleInputChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;

        const _financials = JSON.parse(JSON.stringify(financials));
        _financials[name] = value;

        _financials.cashflow_investment = _financials.invest - _financials.withdraw;

        setFinancials(_financials);
        setDirty(true);
    };

    const handleEditClick = (component) => {
        setEditing(true);
    };

    const handleSaveClick = async (component) => {
        const _financials = JSON.parse(JSON.stringify(financials));
        const maxBorrow = Math.round(parseFloat(_financials.stock_price || 0) * parseInt(_financials.shares_issued || 0) * parseInt(caseStudy.financials.max_debt_borrow_pct || 0) / 100);

        if (_financials.issue_shares && !/^[0-9]+$/.test(_financials.issue_shares.toString())) {
            ShowToast({ icon: 'danger', heading: 'Input Error', message: 'Issue Shares can only be a positive integer value.' });
            return;
        }

        if (_financials.borrow_debt && !/^[0-9]+$/.test(_financials.borrow_debt.toString())) {
            ShowToast({ icon: 'danger', heading: 'Input Error', message: 'Borrow Debt can only be a positive integer value.' });
            return;
        }
        
        if (_financials.invest && !/^[0-9]+$/.test(_financials.invest.toString())) {
            ShowToast({ icon: 'danger', heading: 'Input Error', message: 'Invest can only be a positive integer value.' });
            return;
        }

        if (_financials.withdraw && !/^[0-9]+$/.test(_financials.withdraw.toString())) {
            ShowToast({ icon: 'danger', heading: 'Input Error', message: 'Withdraw can only be a positive integer value.' });
            return;
        }

        if (parseInt(_financials.issue_shares || 0) > _financials.max_shares_issue ) {
            ShowToast({ icon: 'danger', heading: 'Crossed Shares Limit', message: 'Shares issue over max share issue is not allowed.' });
            return;
        }
        
        if (parseInt(_financials.borrow_debt || 0) > maxBorrow ) {
            ShowToast({ icon: 'danger', heading: 'Borrow Limit', message: 'Total amount to borrow cannot exceed max allowed.' });
            return;
        }

        if (parseInt(_financials.withdraw || 0) > (parseInt(_financials.investment_amount || 0) + parseInt(_financials.invest || 0))) {
            ShowToast({ icon: 'danger', heading: 'Decision error', message: 'Total amount to withdraw cannot exceed the current and previous investment' });
            return;
        }

        if ((parseInt(_financials.invest || 0) - parseInt(_financials.withdraw || 0)) > _financials.cash_balance) {
            ShowToast({ icon: 'danger', heading: 'Decision error', message: 'Total amount to invest cannot exceed the cash balance' });
            return;
        }

        setDirty(false);
        setEditing(false);
        gameData.financials = _financials;
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

    const updateShareCapital = async (event) => {
        if (props.mode != 'edit') {
            return;
        }

        const _financials = { ...financials };
        if (event) {
            const keys = event.saveKey.split('.');
            if (keys[0] != 'financials') {
                return;
            }

            const varName = keys[1];
            const value = parseInt(event.value || 0);

            _financials[varName] = value;
        }

        _financials.share_capital = parseInt(_financials.shares_issued || 0) * parseInt(_financials.shares_facevalue || 0);
        _financials.max_shares_issue = parseInt(_financials.shares_issued || 0) * parseInt(_financials.max_shares_issue_pct || 0) / 100;
        setFinancials(_financials);
        await db.saveCaseStudyData(props, "financials", _financials, null, true);
        await props.updateData();
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
                    <Row>
                        <Col lg={6} md={12} sm={12}>
                            <Card style={{ height: '100%' }}>
                                <Card.Header>
                                    <AutoSaveText
                                        saveKey="text.equity_finanance_heading"
                                        text={caseStudy.text.equity_finanance_heading || 'Equity Financing'}
                                        {...props}
                                    />
                                </Card.Header>
                                <Card.Body>
                                    <Row>
                                        <Col>
                                            <Card.Text>
                                                <AutoSaveText
                                                    saveKey="text.shares_issued_label"
                                                    text={caseStudy.text.shares_issued_label || 'Shares Issued'}
                                                    {...props}
                                                />
                                            </Card.Text>
                                        </Col>
                                        <Col>
                                            {props.mode == 'edit' ?
                                                <AutoSaveInput
                                                    type="int_pos"
                                                    saveKey="financials.shares_issued"
                                                    value={financials.shares_issued}
                                                    updateParent={updateShareCapital}
                                                    {...props}
                                                />
                                                :
                                                <FormatData
                                                    caseStudy={caseStudy}
                                                    format="thousands_indicator_int"
                                                    name="shares_issued"
                                                    value={financials.shares_issued || 0}
                                                />
                                            }
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Card.Text>
                                                <AutoSaveText
                                                    saveKey="text.shares_facevalue_label"
                                                    text={caseStudy.text.shares_facevalue_label || 'Shares Face Value'}
                                                    {...props}
                                                />
                                            </Card.Text>
                                        </Col>
                                        <Col>
                                            {props.mode == 'edit' ?
                                                <AutoSaveInput
                                                    type="currency_int_pos"
                                                    saveKey="financials.shares_facevalue"
                                                    value={financials.shares_facevalue}
                                                    updateParent={updateShareCapital}
                                                    {...props}
                                                />
                                                :
                                                <FormatData
                                                    caseStudy={caseStudy}
                                                    format="price_int"
                                                    name="shares_facevalue"
                                                    value={financials.shares_facevalue || 0}
                                                />
                                            }
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Card.Text>
                                                <AutoSaveText
                                                    saveKey="text.stock_price_label"
                                                    text={caseStudy.text.stock_price_label || 'Stock Price'}
                                                    {...props}
                                                />
                                            </Card.Text>
                                        </Col>
                                        <Col>
                                            {/*props.mode == 'edit' ?
                                                <AutoSaveInput
                                                    type="currency_dec_pos"
                                                    saveKey="financials.stock_price"
                                                    value={financials.stock_price}
                                                    {...props}
                                                />
                                                :
                                                <FormatData
                                                    caseStudy={caseStudy}
                                                    format="price_dec"
                                                    name="stock_price"
                                                    value={financials.stock_price || 0}
                                                />
                                            */}
                                            <FormatData
                                                caseStudy={caseStudy}
                                                format="price_dec"
                                                name="stock_price"
                                                value={financials.stock_price || 0}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Card.Text>
                                                <AutoSaveText
                                                    saveKey="text.share_capital_label"
                                                    text={caseStudy.text.share_capital_label || 'Share Capital'}
                                                    {...props}
                                                />
                                            </Card.Text>
                                        </Col>
                                        <Col>
                                            <FormatData
                                                caseStudy={caseStudy}
                                                format="price_int"
                                                name="share_capital"
                                                value={financials.share_capital || 0}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Card.Text>
                                                <AutoSaveText
                                                    saveKey="text.max_share_issue_label"
                                                    text={caseStudy.text.max_share_issue_label || 'Max Share Issue'}
                                                    {...props}
                                                />

                                            </Card.Text>
                                        </Col>
                                        <Col>
                                            <FormatData
                                                caseStudy={caseStudy}
                                                format="thousands_indicator_int"
                                                name="max_shares_issue"
                                                value={financials.max_shares_issue || 0}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Card.Text>
                                                <AutoSaveText
                                                    saveKey="text.issue_shares_label"
                                                    text={caseStudy.text.issue_shares_label || 'Issue Shares'}
                                                    {...props}
                                                />
                                            </Card.Text>
                                        </Col>
                                        <Col>
                                            {props.mode == 'edit' &&
                                                <Card.Text>In game decision</Card.Text>
                                            }
                                            {editing && props.mode != 'edit' && parseInt(financials.shares_facevalue || 0) <= parseFloat(financials.stock_price) &&
                                                <Form.Control
                                                    name="issue_shares"
                                                    type="number"
                                                    value={financials.issue_shares || ''}
                                                    onChange={handleInputChange}
                                                />
                                            }
                                            {editing && props.mode != 'edit' && parseInt(financials.shares_facevalue || 0) > parseFloat(financials.stock_price) &&
                                                <span>Issue Shares Not Allowed</span>
                                            }
                                            {!editing && props.mode != 'edit' && parseInt(financials.shares_facevalue || 0) <= parseFloat(financials.stock_price) &&
                                                <FormatData
                                                    caseStudy={caseStudy}
                                                    format="thousands_indicator_int"
                                                    name="issue_shares"
                                                    value={financials.issue_shares || 0}
                                                />
                                            }
                                            {!editing && props.mode != 'edit' && parseInt(financials.shares_facevalue || 0) > parseFloat(financials.stock_price) &&
                                                <span>Issue Shares Not Allowed</span>
                                            }
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Card.Text>
                                                <AutoSaveText
                                                    saveKey="text.cash_inflow_equity_label"
                                                    text={caseStudy.text.cash_inflow_equity_label || 'Cash Inflow'}
                                                    {...props}
                                                />
                                            </Card.Text>
                                        </Col>
                                        <Col>
                                            <FormatData
                                                caseStudy={caseStudy}
                                                format="price_int"
                                                name="cash_inflow"
                                                value={financials.issue_shares && financials.stock_price ? financials.issue_shares * financials.stock_price : 0}
                                            />
                                        </Col>
                                    </Row>
                                    {/*<Row>
                                        <Col>
                                            <Card.Text>
                                                <AutoSaveText
                                                    saveKey="text.quarterly_dividend_label"
                                                    text={caseStudy.text.quarterly_dividend_label || 'Quarterly Dividend'}
                                                    {...props}
                                                />
                                            </Card.Text>
                                        </Col>
                                        <Col>
                                            <FormatData
                                                caseStudy={caseStudy}
                                                format="price_int"
                                                name="dividend"
                                                value={financials.dividend || 0}
                                            />
                                        </Col>
                                        </Row>*/}
                                    <Row>
                                        <Col>
                                            <Card.Text>
                                                <AutoSaveText
                                                    saveKey="text.share_dilution_label"
                                                    text={caseStudy.text.share_dilution_label || 'Share Dilution'}
                                                    {...props}
                                                />
                                            </Card.Text>
                                        </Col>
                                        <Col>
                                            <FormatData
                                                caseStudy={caseStudy}
                                                format="percent_dec"
                                                name={('share_dilution')}
                                                value={financials.issue_shares && financials.shares_issued ? (financials.issue_shares * 100 / financials.shares_issued).toFixed(2) : 0}
                                            />
                                        </Col>
                                    </Row>
                                    {props.mode == 'edit' &&
                                        <Row>
                                            <Col>
                                                <Card.Text>
                                                    <AutoSaveText
                                                        saveKey="text.dividend_rate_label"
                                                        text={caseStudy.text.dividend_rate_label || 'Dividend Rate (Admin Only)'}
                                                        {...props}
                                                    />
                                                </Card.Text>
                                            </Col>
                                            <Col>
                                                <AutoSaveInput
                                                    type="pct_dec_pos"
                                                    saveKey="financials.dividend_rate"
                                                    value={caseStudy.financials.dividend_rate}
                                                    {...props}
                                                />
                                            </Col>
                                        </Row>
                                    }
                                    {props.mode == 'edit' &&
                                        <Row>
                                            <Col>
                                                <Card.Text>
                                                    <AutoSaveText
                                                        saveKey="text.max_shares_issue_pct_label"
                                                        text={caseStudy.text.max_shares_issue_pct_label || 'Max Shares Issue % (Admin Only)'}
                                                        {...props}
                                                    />

                                                </Card.Text>
                                            </Col>
                                            <Col>
                                                <AutoSaveInput
                                                    type="pct_int_pos"
                                                    saveKey="financials.max_shares_issue_pct"
                                                    value={caseStudy.financials.max_shares_issue_pct || 0}
                                                    updateParent={updateShareCapital}
                                                    {...props}
                                                />
                                            </Col>
                                        </Row>
                                    }
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col lg={6} md={12} sm={12}>
                            <Card style={{ height: '100%' }}>
                                <Card.Header>
                                    <AutoSaveText
                                        saveKey="text.debt_finanance_heading"
                                        text={caseStudy.text.debt_finanance_heading || 'Debt Financing'}
                                        {...props}
                                    />
                                </Card.Header>
                                <Card.Body>
                                    <Row>
                                        <Col>
                                            <Card.Text>
                                                <AutoSaveText
                                                    saveKey="text.debt_due_label"
                                                    text={caseStudy.text.debt_due_label || 'Debt Due'}
                                                    {...props}
                                                />
                                            </Card.Text>
                                        </Col>
                                        <Col>
                                            <FormatData
                                                caseStudy={caseStudy}
                                                format="thousands_indicator_int"
                                                name="debt_due"
                                                value={financials.debt_due || 0}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Card.Text>
                                                <AutoSaveText
                                                    saveKey="text.interest_rate_label"
                                                    text={caseStudy.text.interest_rate_label || 'Interest Rate'}
                                                    {...props}
                                                />
                                            </Card.Text>
                                        </Col>
                                        <Col>
                                            {props.mode == 'edit' ?
                                                <AutoSaveInput
                                                    type="pct_dec_pos"
                                                    saveKey="financials.interest_rate"
                                                    value={caseStudy.financials.interest_rate}
                                                    {...props}
                                                />
                                                :
                                                <FormatData
                                                    caseStudy={caseStudy}
                                                    format="percent_dec"
                                                    name="interest_rate"
                                                    value={caseStudy.financials.interest_rate || 0}
                                                />
                                            }
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Card.Text>
                                                <AutoSaveText
                                                    saveKey="text.max_debt_borrow_label"
                                                    text={caseStudy.text.max_debt_borrow_label || 'Max Debt Borrow'}
                                                    {...props}
                                                />
                                            </Card.Text>
                                        </Col>
                                        <Col>
                                            <FormatData
                                                caseStudy={caseStudy}
                                                format="price_int"
                                                name="max_debt_borrow"
                                                value={Math.round(parseFloat(financials.stock_price || 0) * parseInt(financials.shares_issued || 0) * parseInt(caseStudy.financials.max_debt_borrow_pct || 0) / 100)}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Card.Text>
                                                <AutoSaveText
                                                    saveKey="text.borrow_debt_label"
                                                    text={caseStudy.text.borrow_debt_label || 'Borrow Debt'}
                                                    {...props}
                                                />
                                            </Card.Text>
                                        </Col>
                                        <Col>
                                            {props.mode == 'edit' &&
                                                <Card.Text>In game decision</Card.Text>
                                            }
                                            {editing && props.mode != 'edit' &&
                                                <Form.Control
                                                    name="borrow_debt"
                                                    type="number"
                                                    value={financials.borrow_debt || ''}
                                                    onChange={handleInputChange}
                                                />
                                            }
                                            {!editing && props.mode != 'edit' &&
                                                <Card.Text>
                                                    <FormatData
                                                        caseStudy={caseStudy}
                                                        format="thousands_indicator_int"
                                                        name="borrow_debt"
                                                        value={financials.borrow_debt || 0}
                                                    />
                                                </Card.Text>
                                            }
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Card.Text>
                                                <AutoSaveText
                                                    saveKey="text.cash_inflow_debt_label"
                                                    text={caseStudy.text.cash_inflow_debt_label || 'Cash Inflow'}
                                                    {...props}
                                                />
                                            </Card.Text>
                                        </Col>
                                        <Col>
                                            <FormatData
                                                caseStudy={caseStudy}
                                                format="price_int"
                                                name={('cash_inflow')}
                                                value={financials.borrow_debt || 0}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Card.Text>
                                                <AutoSaveText
                                                    saveKey="text.quarterly_interest_payement_label"
                                                    text={caseStudy.text.quarterly_interest_payement_label || 'Quarterly Interest Payment'}
                                                    {...props}
                                                />
                                            </Card.Text>
                                        </Col>
                                        <Col>
                                            <FormatData
                                                caseStudy={caseStudy}
                                                format="price_int"
                                                name="interest_payment"
                                                value={financials.borrow_debt && caseStudy.financials.interest_rate ?
                                                    (parseInt(financials.debt_due || 0) + parseInt(financials.borrow_debt || 0)) * parseFloat(caseStudy.financials.interest_rate || 0) / 100 : 0}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Card.Text>
                                                <AutoSaveText
                                                    saveKey="text.debt_duration_label"
                                                    text={caseStudy.text.debt_duration_label || 'Debt Duration'}
                                                    {...props}
                                                />
                                            </Card.Text>
                                        </Col>
                                        <Col>
                                            {props.mode == 'edit' ?
                                                <AutoSaveInput
                                                    type="int_pos"
                                                    saveKey="financials.debt_duration"
                                                    value={caseStudy.financials.debt_duration || 0}
                                                    {...props}
                                                />
                                                :
                                                <Card.Text>
                                                    {caseStudy.financials.debt_duration}
                                                </Card.Text>
                                            }
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Card.Text>
                                                <AutoSaveText
                                                    saveKey="text.debt_to_equity_ratio_label"
                                                    text={caseStudy.text.debt_to_equity_ratio_label || 'Expected Debt To Equity Ratio'}
                                                    {...props}
                                                />
                                            </Card.Text>
                                        </Col>
                                        <Col>
                                            <FormatData
                                                caseStudy={caseStudy}
                                                format="percent_dec"
                                                name={('debt_to_equity')}
                                                value={
                                                    parseInt((parseInt(financials.debt_due || 0) + parseInt(financials.borrow_debt || 0)) /
                                                        ((parseInt(financials.shares_issued || 0) + parseInt(financials.issue_shares || 0)) * parseInt(financials.stock_price || 0)) || 0)}
                                            />
                                        </Col>
                                    </Row>
                                    {props.mode == 'edit' &&
                                        <Row>
                                            <Col>
                                                <Card.Text>
                                                    <AutoSaveText
                                                        saveKey="text.max_debt_borrow_pct_label"
                                                        text={caseStudy.text.max_debt_borrow_pct_label || 'Max Borrow % of Share Capital'}
                                                        {...props}
                                                    />
                                                </Card.Text>
                                            </Col>
                                            <Col>
                                                <AutoSaveInput
                                                    type="pct_int_pos"
                                                    saveKey="financials.max_debt_borrow_pct"
                                                    value={caseStudy.financials.max_debt_borrow_pct || 0}
                                                    {...props}
                                                />
                                            </Col>
                                        </Row>
                                    }
                                    {props.mode == 'edit' &&
                                        <Row>
                                            <Col>
                                                <Card.Text>
                                                    <AutoSaveText
                                                        saveKey="text.min_cash_balance_label"
                                                        text={caseStudy.text.min_cash_balance_label || 'Min Cash Balance Required'}
                                                        {...props}
                                                    />
                                                </Card.Text>
                                            </Col>
                                            <Col>
                                                <AutoSaveInput
                                                    type="currency_int_pos"
                                                    saveKey="financials.min_cash_balance_required"
                                                    value={caseStudy.financials.min_cash_balance_required || 0}
                                                    {...props}
                                                />
                                            </Col>
                                        </Row>
                                    }
                                    {props.mode == 'edit' &&
                                        <Row>
                                            <Col>
                                                <Card.Text>
                                                    <AutoSaveText
                                                        saveKey="text.emergency_loan_amount_label"
                                                        text={caseStudy.text.emergency_loan_amount_label || 'Emergency Loan Amount'}
                                                        {...props}
                                                    />
                                                </Card.Text>
                                            </Col>
                                            <Col>
                                                <AutoSaveInput
                                                    type="currency_int_pos"
                                                    saveKey="financials.emergency_loan_amount"
                                                    value={caseStudy.financials.emergency_loan_amount || 0}
                                                    {...props}
                                                />
                                            </Col>
                                        </Row>
                                    }
                                    {props.mode == 'edit' &&
                                        <Row>
                                            <Col>
                                                <Card.Text>
                                                    <AutoSaveText
                                                        saveKey="text.emergency_loan_pct_label"
                                                        text={caseStudy.text.emergency_loan_pct_label || 'Emergency Loan Interest per Qtr'}
                                                        {...props}
                                                    />
                                                </Card.Text>
                                            </Col>
                                            <Col>
                                                <AutoSaveInput
                                                    type="pct_int_pos"
                                                    saveKey="financials.emergency_loan_int_pct"
                                                    value={caseStudy.financials.emergency_loan_int_pct || 0}
                                                    {...props}
                                                />
                                            </Col>
                                        </Row>
                                    }
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Card style={{ marginTop: '20px' }}>
                        <Card.Header>
                            <AutoSaveText
                                saveKey="text.investment_heading"
                                text={caseStudy.text.investment_heading || 'Investments'}
                                {...props}
                            />
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col>
                                    {/*<Card.Text>
                                        <AutoSaveText
                                            saveKey="text.investment_amount_label"
                                            text={caseStudy.text.investment_amount_label || 'Investment Amount'}
                                            {...props}
                                        />
                            </Card.Text>*/}
                                </Col>
                                <Col>
                                    {/* props.mode == 'edit' ?
                                        <AutoSaveInput
                                            type="currency_int_pos"
                                            saveKey="financials.investment_amount"
                                            value={caseStudy.financials.investment_amount || ''}
                                            {...props}
                                        />
                                        :
                                        <FormatData
                                            caseStudy={caseStudy}
                                            format="price_int"
                                            name="investment_amount"
                                            value={caseStudy.financials.investment_amount || 0}
                                        />
                        */}
                                </Col>
                                <Col>
                                    <Card.Text>
                                        <AutoSaveText
                                            saveKey="text.investment_interest_rate_label"
                                            text={caseStudy.text.investment_interest_rate_label || 'Investment Interest Rate'}
                                            {...props}
                                        />
                                    </Card.Text>
                                </Col>
                                <Col>
                                    {props.mode == 'edit' ?
                                        <AutoSaveInput
                                            type="pct_dec_pos"
                                            saveKey="financials.investment_interest_rate"
                                            value={caseStudy.financials.investment_interest_rate || ''}
                                            {...props}
                                        />
                                        :
                                        <FormatData
                                            caseStudy={caseStudy}
                                            format="percent_dec"
                                            name="investment_interest_rate"
                                            value={caseStudy.financials.investment_interest_rate || 0}
                                        />
                                    }
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Card.Text>
                                        <AutoSaveText
                                            saveKey="text.invest_label"
                                            text={caseStudy.text.invest_label || 'Investment'}
                                            {...props}
                                        />
                                    </Card.Text>
                                </Col>
                                <Col>
                                    {props.mode == 'edit' ?
                                        <span>In game decision</span>
                                        :
                                        editing ?
                                            <Form.Control
                                                name="invest"
                                                type="number"
                                                value={financials.invest || ''}
                                                onChange={handleInputChange}
                                            />
                                            :
                                            <FormatData
                                                caseStudy={caseStudy}
                                                format="amount_int"
                                                name="invest"
                                                value={financials.invest || '0'}
                                            />
                                    }
                                </Col>
                                <Col>
                                    <Card.Text>
                                        <AutoSaveText
                                            saveKey="text.withdraw_label"
                                            text={caseStudy.text.withdraw_label || 'Withdraw'}
                                            {...props}
                                        />
                                    </Card.Text>
                                </Col>
                                <Col>
                                    {props.mode == 'edit' ?
                                        <span>In game decision</span>
                                        :
                                        editing ?
                                            <Form.Control
                                                name="withdraw"
                                                type="number"
                                                value={financials.withdraw || ''}
                                                onChange={handleInputChange}
                                            />
                                            :
                                            <FormatData
                                                caseStudy={caseStudy}
                                                format="amount_int"
                                                name="withdraw"
                                                value={financials.withdraw || '0'}
                                            />
                                    }
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
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

export default Financing;
