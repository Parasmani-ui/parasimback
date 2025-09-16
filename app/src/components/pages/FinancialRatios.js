import React from "react";
import Card from 'react-bootstrap/Card';
import AutoSaveText from '../utils/AutoSaveText';
import Table from 'react-bootstrap/Table';
import FormatData from '../FormatData';

const FinancialRatios = (props) => {
    const caseStudy = props.caseStudy;
    const allQuartersData = props.allQuartersData;
    const noOfQtr = props.mode == 'edit' ? 0 : Object.keys(allQuartersData).length;
    const qtrs = props.mode == 'edit' ? [caseStudy.quarters.labels[noOfQtr]] : Object.values(caseStudy.quarters.labels).splice(0, (noOfQtr - 1));
    const pageData = props.siteData && props.siteData[props.pageName] ? props.siteData[props.pageName] : {};

    const ratios = {
        'Profit Margin Ratio': "[#].profit * 100/[#].revenue",
        'Return on Assets': "[#].profit * 100/[#].total_assets",
        'Return on Equity': "[#].profit * 100/[#].share_capital",
        'Quick Ratio': "([#].total_assets - [#].inventory_cost)/[#].total_liabilities",
        'Gross Margin Ratio': "[#].gross_profit * 100/[#].revenue",
        'Asset Turnover Ratio': "[#].revenue/[#].total_assets",
        'Debt Ratio': "[#].revenue/[#].total_assets",
        'Working Capital Ratio': "[#].total_assets/[#].total_liabilities",
        'Asset to Equity Ratio': "[#].total_assets/[#].share_capital"
    };

    const evaluateRatio = (name, exp, qtr, i) => {
        const _exp = exp.replaceAll('[#]', 'allQuartersData[i].financials');
        return eval(_exp) || 0;
    };

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
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(ratios).map((name, idx) => (
                            <tr key={idx}>
                                <td>{name}</td>
                                {qtrs.map((qtr, i) => (
                                    <td key={i} style={{textAlign: 'right', paddingRight: '10px'}}>
                                        <FormatData
                                            caseStudy={caseStudy}
                                            format="number_dec"
                                            name={name}
                                            value={evaluateRatio(name, ratios[name], qtr, i)}
                                        />
                                    </td>
                                ))}
                                <td>
                                <AutoSaveText
                                    saveKey={name.replace(/\s*/g, '_') + '_description'}
                                    text={pageData[name.replace(/\s*/g, '_') + '_description'] || (name + ' description')}
                                    saveFn="saveSiteData"
                                    {...props}
                                />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card.Body>
        </Card>
    );
};

export default FinancialRatios;
