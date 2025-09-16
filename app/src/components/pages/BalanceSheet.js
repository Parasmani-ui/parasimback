import React from "react";
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import AutoSaveText from '../utils/AutoSaveText.js';
import AutoSaveInput from '../utils/AutoSaveInput.js';
import FormatData from '../FormatData.js';
import Icon from '../Icon.js';
import db from '../utils/db.js';

const BalanceSheet = (props) => {
    const caseStudy = props.caseStudy;
    const allQuartersData = props.allQuartersData;
    const noOfQtr = props.mode == 'edit' ? 0 : Object.keys(allQuartersData).length;
    const qtrs = props.mode == 'edit' ? [caseStudy.quarters.labels[noOfQtr]] : Object.values(caseStudy.quarters.labels).splice(0, (noOfQtr - 1));

    const vars = [
        {
            type: 'heading',
            text: 'Assets'
        },
        {
            name: 'cash_balance',
            text: 'Cash Balance',
        },
        {
            name: 'investment_amount',
            text: 'Investment Amount',
        },
        {
            name: 'inventory_cost',
            text: 'Inventory Cost',
        },
        {
            name: 'investment_plant',
            text: 'Investment - Plant',
        },
        {
            name: 'depreciation_plant',
            text: 'Accumulated Depreciation - Plant',
            minus: true
        },
        {
            name: 'investment_research',
            text: 'Investment (HR - Innovation)',
        },
        {
            name: 'depreciation_research',
            text: 'Accumulated Depreciation (HR - Innovation)',
            minus: true
        },
        {
            name: 'investment_projects',
            text: 'Investment - Projects',
        },
        {
            name: 'depreciation_projects',
            text: 'Accumulated Depreciation - Projects',
            minus: true
        },
        {
            name: 'total_assets',
            text: 'Total Assets',
        },
        {
            type: 'heading',
            text: 'Liabilities'
        },
        {
            name: 'emergency_loan_taken',
            text: 'Emergency Loan',
        },
        {
            name: 'next_installment',
            text: 'Short Term Debt (Next Installment)',
        },
        /*
        {
            name: 'prev_loan_repayment',
            text: 'Previous Loan Payment',
            minus: true
        },
        */
        {
            name: 'long_term_debt',
            text: 'Current Long Term Debt',
        },
        {
            name: 'share_capital',
            text: 'Share Capital',
        },
        {
            name: 'share_premium',
            text: 'Share Premium',
        },
        {
            name: 'total_retained_earnings',
            text: 'Retained Earnings',
        },
        {
            name: 'liability_plus_equity',
            text: 'Total Liabilities + Shareholder Equity',
        },
    ];

    return (
        <Card className="container-card">
            <Card.Body>
                <Table>
                    <thead>
                        <tr>
                            <th>{/* blank */}</th>
                            {qtrs.map((qtr, i) => (
                                <th key={i} style={{textAlign: 'center'}}>
                                    {qtr}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {vars.map((_var, idx) => (
                            _var.type == 'heading' ? 
                            <tr key={idx} style={{backgroundColor: '#efefef'}}>
                                    <td style={{ fontWeight: 'bold' }}>{_var.text}</td>
                                    {qtrs.map((qtr, i) => (<td key={i}></td>))}
                            </tr>
                            :
                            <tr key={idx}>
                                <td>{_var.text}</td>
                                {qtrs.map((qtr, i) => (
                                <td key={i} style={{textAlign: 'right', paddingRight: '10px'}}>
                                    <FormatData
                                        caseStudy={caseStudy}
                                        format="amount_int"
                                        name={_var.name}
                                        value={(_var.minus ? -1 : 1) * ((props.mode == 'edit' ? caseStudy.financials[_var.name] : allQuartersData[i].financials[_var.name]) || '0')}
                                    />
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

export default BalanceSheet;
