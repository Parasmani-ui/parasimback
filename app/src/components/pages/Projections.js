import React, { useState, useEffect } from 'react';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import { Line } from 'react-chartjs-2';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import AutoSaveText from '../utils/AutoSaveText';
import FormatData from '../FormatData';
import 'chartjs-plugin-annotation';

Chart.register(CategoryScale);
Chart.register(LinearScale);
Chart.register(PointElement);
Chart.register(LineElement);

const Projections = (props) => {
    const gameData = props.gameData;
    const caseStudy = props.caseStudy;
    const [products, setProducts] = useState(JSON.parse(JSON.stringify(gameData ? gameData.products.sort((a, b) => {return a.idx - b.idx}) : null)));
    const [financials, setFinancials] = useState(null);
    const [cashData, setCashData] = useState(null);
    const [profitData, setProfitData] = useState(null);

    if (!products || !caseStudy) {
        return '';
    }

    useEffect(() => {
        const _labels = [];
        const _profit = [];
        const _cash = [];
        const _projections = {};
    
        for (var i = 0; i <= 10; i++) {
            const pct = i * 10;
            _labels.push(pct.toString() + ' %')
            const [_products, _financials] = projection(caseStudy, gameData, pct);
            if (!_financials) {
                return;
            }

            _projections[pct] = _financials;
            _profit[i] = _financials.profit;
            _cash[i] = _financials.cash_balance;
            if (pct == 100) {
                setFinancials(_financials);
                setProducts(_products);
            }

            const _profitData = {
                labels: _labels,
                datasets: [
                    {
                        label: 'Net Profit',
                        data: _profit,
                        borderColor: 'pink',
                        backgroundColor: 'pink',
                        lineTension: 0.1
                    }
                ]
            };

            setProfitData(_profitData);
        
            const _cashData = {
                labels: _labels,
                datasets: [
                    {
                        label: 'Cash Balance',
                        data: _cash,
                        borderColor: 'pink',
                        backgroundColor: 'pink',
                        lineTension: 0.1
                    }
                ]
            };
            setCashData(_cashData);
        }
    }, []);

    const options = {
        scales: {
            y: {
                beginAtZero: true
            }
        },
        responsive: true,
        plugins: {
            legend: {
                display: false
            },
            annotation: {
                annotations: [
                    {
                        type: 'line',
                        mode: 'horizontal',
                        scaleID: 'y',
                        value: 1,
                        borderColor: 'red',
                        borderWidth: 1
                    }
                ]
            }
        }
    };        

    return financials && cashData && profitData &&
        <Card className="container-card">
            <Card.Body>
                <Row>
                    <Col>
                        <Card>
                            <Card.Header>
                                <AutoSaveText
                                    saveKey="text.profit_vs_sales_heading"
                                    text={caseStudy.text.profit_vs_sales_heading || 'Net Profit vs Sales'}
                                    {...props}
                                />
                            </Card.Header>
                            <Card.Body>
                                <Line data={profitData} options={options} />
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col>
                        <Card>
                            <Card.Header>
                                <AutoSaveText
                                    saveKey="text.cash_vs_sales_heading"
                                    text={caseStudy.text.cash_vs_sales_heading || 'Cash Balance vs Sales'}
                                    {...props}
                                />
                            </Card.Header>
                            <Card.Body>
                                <Line data={cashData} options={options} />
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                <div style={{height: '15px'}}></div>
                <IncomeProjections products={products} financials={financials} caseStudy={caseStudy} user={props.user} />
                <div style={{height: '15px'}}></div>
                <CashflowProjections financials={financials} caseStudy={caseStudy} user={props.user} />
                <div style={{height: '15px'}}></div>
                <BalanceSheetProjections financials={financials} caseStudy={caseStudy} user={props.user} />
            </Card.Body>
        </Card>
    ;
};

export default Projections;

const IncomeProjections = (props) => {
    const caseStudy = props.caseStudy;
    const products = JSON.parse(JSON.stringify(props.products ? props.products.sort((a, b) => {return a.idx - b.idx}) : null));
    const financials = JSON.parse(JSON.stringify(props.financials ? props.financials : null));

    if (!products || !financials || !caseStudy) {
        return '';
    }

    const ivars = [
        {
            type: 'heading',
            text: 'Income'
        },
        {
            name: 'plannedProduction',
            text: 'Planned Production',
            format: 'thousands_indicator_int'
        },
        {
            name: 'actualProduction',
            text: 'Actual Production',
            format: 'thousands_indicator_int'
        },
        {
            name: 'opening_inventory',
            text: 'Opening Inventory',
            format: 'thousands_indicator_int'
        },
        {
            name: 'inventory',
            text: 'Inventory',
            format: 'thousands_indicator_int'
        },
        {
            name: 'unitsSold',
            text: 'Units Sold',
            format: 'thousands_indicator_int'
        },
        {
            name: 'salesPrice',
            text: 'MRP',
            format: 'price_int',
            hide_in_total: true
        },
        {
            name: 'revenue',
            text: 'Revenue',
            format: 'price_int'
        },
        {
            name: 'interest_income',
            text: 'Income From Investments',
            format: 'price_int',
            hide_in_product: true
        },
        {
            type: 'heading',
            text: 'Expenses'
        },
        {
            name: 'cost',
            text: 'Product Cost',
            format: 'price_int',
            hide_in_total: true
        },
        {
            name: 'material_cost',
            text: 'Material Cost',
            format: 'price_int'
        },
        {
            name: 'labour_cost',
            text: 'Labour Cost',
            format: 'price_int',
            hide_in_product: true
        },
        {
            name: 'training_budget',
            text: 'Training Cost',
            format: 'price_int',
            hide_in_product: true
        },
        {
            name: 'opening_inventory_cost',
            text: 'Opening Inventory Value',
            format: 'price_int'
        },
        {
            name: 'inventory_cost',
            text: 'Closing Inventory Value',
            format: 'price_int'
        },
        {
            name: 'change_in_inventory_cost',
            text: 'Change In Inventory',
            format: 'price_int'
        },
        {
            name: 'gross_contribution',
            text: 'Gross Contribution',
            format: 'price_int',
            hide_in_product: true
        },
        {
            type: 'heading',
            text: 'Depreciation'
        },
        {
            name: 'current_depreciation_plant',
            text: 'Depreciation (Plant)',
            format: 'price_int',
            hide_in_product: true
        },
        {
            name: 'current_depreciation_research',
            text: 'Depreciation (HR - Innovation)',
            format: 'price_int',
            hide_in_product: true
        },
        {
            name: 'current_depreciation_projects',
            text: 'Depreciation (Projects)',
            format: 'price_int',
            hide_in_product: true
        },
        {
            type: 'heading',
            text: 'Costs'
        },
        {
            name: 'promotions',
            text: 'Promotions',
            format: 'price_int'
        },
        {
            name: 'advertising',
            text: 'Advertising',
            format: 'price_int'
        },
        {
            name: 'sales_force',
            text: 'Sales Force',
            format: 'price_int',
            hide_in_product: true
        },
        {
            name: 'administrative_costs',
            text: 'Administrative Costs',
            format: 'price_int',
            hide_in_product: true
        },
        {
            name: 'overheads',
            text: 'Overheads',
            format: 'price_int',
            hide: true,
            hide_in_product: true
        },
        {
            name: 'miscellaneous_cost_1',
            text: 'Miscellaneous Cost 1',
            format: 'price_int',
            hide: true,
            hide_in_product: true
        },
        {
            name: 'miscellaneous_cost_2',
            text: 'Miscellaneous Cost 2',
            format: 'price_int',
            hide: true,
            hide_in_product: true
        },
        {
            name: 'miscellaneous_cost_3',
            text: 'Miscellaneous Cost 3',
            format: 'price_int',
            hide: true,
            hide_in_product: true
        },
        {
            name: 'miscellaneous_cost_4',
            text: 'Miscellaneous Cost 4',
            format: 'price_int',
            hide: true,
            hide_in_product: true
        },
        {
            name: 'miscellaneous_cost_5',
            text: 'Miscellaneous Cost 5',
            format: 'price_int',
            hide: true,
            hide_in_product: true
        },
        {
            type: 'heading',
            text: 'Interest Payments'
        },
        {
            name: 'interest',
            text: 'Interest',
            format: 'price_int',
            hide_in_product: true
        },
        {
            name: 'emergency_loan_interest',
            text: 'Emergency Loan Interest',
            format: 'price_int',
            hide_in_product: true
        },
        {
            type: 'heading',
            text: 'Taxes'
        },
        {
            name: 'sales_tax',
            text: 'Sales Tax',
            format: 'price_int',
            hide: true,
            hide_in_product: true
        },
        {
            name: 'gross_profit',
            text: 'Profit Before Tax',
            format: 'price_int',
            hide_in_product: true
        },
        {
            name: 'corporate_tax',
            text: 'Corporate Tax',
            format: 'price_int',
            hide_in_product: true
        },
        {
            type: 'heading',
            text: 'Earnings'
        },
        {
            name: 'profit',
            text: 'Net Profit',
            format: 'price_int',
            hide_in_product: true
        },
        {
            name: 'dividend',
            text: 'Dividend',
            format: 'price_int',
            hide: true,
            hide_in_product: true
        },
        {
            name: 'retained_earnings',
            text: 'Retained Earnings',
            format: 'price_int',
            hide_in_product: true
        },
        /*
        {
            name: 'total_retained_earnings',
            text: 'Total Retained Earnings',
            format: 'price_int',
            hide_in_product: true
        }
        */
    ];

    const _vars = [];
    ivars.forEach((_var) => {
        if (!_var.hide) {
            _vars.push(_var);
            return;
        }

        if (financials[_var.name]) {
            _vars.push(_var);
        }
    });

    return <Card>
        <Card.Header>
            <AutoSaveText
                saveKey="text.income_projections_heading"
                text={caseStudy.text.income_projections_heading || 'Income Statement Projections'}
                {...props}
            />
        </Card.Header>
        <Card.Body>
            <Table>
                <thead>
                    <tr>
                        <th></th>
                        {products && products.map((product, pidx) => (
                            <th key={pidx}>{product.name}</th>
                        ))}
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {_vars.map((_var, idx) => (
                        <tr key={idx}>
                            <td style={{ fontWeight: _var.type == 'heading' ? 'bold' : 'normal' }}>{_var.text}</td>
                            {products && products.map((product, pidx) => (
                                <td key={pidx}>
                                    {
                                        _var.type == 'heading' || _var.hide_in_product ? '' : (
                                            _var.format ?
                                                <FormatData
                                                    caseStudy={props.caseStudy}
                                                    format={_var.format}
                                                    name={_var.name}
                                                    value={product[_var.name] || 0}
                                                />
                                                :
                                                product[_var.name] || 0
                                        )
                                    }
                                </td>
                            ))}
                            <td>
                                {
                                    _var.type == 'heading' || _var.hide_in_total ? '' : (
                                        _var.format ?
                                            <FormatData
                                                caseStudy={props.caseStudy}
                                                format={_var.format}
                                                name={_var.name}
                                                value={financials[_var.name] || 0}
                                            />
                                            :
                                            financials[_var.name] || 0
                                    )
                                }
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Card.Body>
    </Card>;
};

const CashflowProjections = (props) => {
    const caseStudy = props.caseStudy;
    const financials = JSON.parse(JSON.stringify(props.financials ? props.financials : null));

    if (!financials || !caseStudy) {
        return '';
    }

    const vars = [
        {
            type: 'heading',
            text: 'Cash Inflow'
        },
        {
            name: 'cash_balance_open',
            text: 'Opening Balance',
        },
        {
            name: 'revenue',
            text: 'Revenue',
        },
        {
            name: 'interest_income',
            text: 'Income From Investments',
        },
        {
            name: 'borrow_debt',
            text: 'Debt',
        },
        {
            type: 'exp',
            name: "stock_sale",
            text: 'Equity Sales',
        },
        {
            type: 'heading',
            text: 'Cash Outflow'
        },
        {
            name: 'material_cost',
            text: 'Material Cost',
        },
        {
            name: 'labour_cost',
            text: 'Labour Cost',
        },
        {
            name: 'training_budget',
            text: 'Training Cost',
        },
        {
            name: 'promotions',
            text: 'Promotions',
        },
        {
            name: 'advertising',
            text: 'Advertising',
        },
        {
            name: 'sales_force',
            text: 'Sales Force',
        },
        {
            name: 'administrative_costs',
            text: 'Administrative Costs',
        },
        {
            name: 'overheads',
            text: 'Overheads',
            hide: true
        },
        {
            name: 'miscellaneous_cost_1',
            text: 'Miscellaneous Cost 1',
            hide: true
        },
        {
            name: 'miscellaneous_cost_2',
            text: 'Miscellaneous Cost 2',
            hide: true
        },
        {
            name: 'miscellaneous_cost_3',
            text: 'Miscellaneous Cost 3',
            hide: true
        },
        {
            name: 'miscellaneous_cost_4',
            text: 'Miscellaneous Cost 4',
            hide: true
        },
        {
            name: 'miscellaneous_cost_5',
            text: 'Miscellaneous Cost 5',
            hide: true
        },
        {
            type: 'heading',
            text: 'Investments'
        },
        {
            name: 'cashflow_investment',
            text: 'Cashflow Investment',
        },
        {
            name: 'cashflow_plant',
            text: 'Cashflow Investment (Plant)',
        },
        {
            name: 'cashflow_research',
            text: 'Cashflow Investment (HR - Innovation)',
        },
        {
            name: 'cashflow_projects',
            text: 'Cashflow Investment (Projects)',
        },
        {
            type: 'heading',
            text: 'Loan Payments'
        },
        {
            name: 'interest',
            text: 'Interest',
        },
        {
            name: 'installment',
            text: 'Loan Installment',
        },
        {
            name: 'emergency_loan_interest',
            text: 'Emergency Loan Interest',
        },
        {
            name: 'emergency_loan_paid',
            text: 'Emergency Loan Paid',
        },
        {
            name: 'sales_tax',
            text: 'Sales Tax',
            hide: true
        },
        {
            name: 'corporate_tax',
            text: 'Corporate Tax',
        },
        {
            name: 'dividend',
            text: 'Dividend',
            hide: true
        },
        {
            name: 'emergency_loan_taken',
            text: 'Emergency Loan Taken',
        },
        {
            name: 'cash_balance',
            text: 'Closing Balance',
        }
    ];

    const _vars = [];
    vars.forEach((_var) => {
        if (!_var.hide) {
            _vars.push(_var);
            return;
        }

        if (financials[_var.name]) {
            _vars.push(_var);
        }
    });

    return (
        <Card>
            <Card.Header style={{ position: 'relative' }}>
                <AutoSaveText
                    saveKey={'text.cashflow_projections_heading'}
                    text={caseStudy.text.cashflow_projections_heading || 'Cashflow Projections'}
                    {...props}
                />
            </Card.Header>
            <Card.Body>
                <Table>
                    <tbody>
                        {_vars.map((_var, idx) => (
                            <tr key={idx}>
                                <td style={{ fontWeight: _var.type == 'heading' ? 'bold' : 'normal' }}>
                                    <AutoSaveText
                                        saveKey={'text.' + _var.name + '_label'}
                                        text={caseStudy.text[_var.name + '_label'] || _var.text}
                                        {...props}
                                    />
                                </td>
                                <td>
                                    {_var.type != 'heading' && <FormatData
                                        caseStudy={caseStudy}
                                        format="amount_int"
                                        name={_var.name}
                                        value={parseInt(financials[_var.name] || 0) || 0}
                                    />
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card.Body>
        </Card>
    );
};

const BalanceSheetProjections = (props) => {
    const caseStudy = props.caseStudy;
    const financials = JSON.parse(JSON.stringify(props.financials ? props.financials : null));

    if (!financials || !caseStudy) {
        return '';
    }

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
            text: 'Depreciation - Plant',
        },
        {
            name: 'investment_research',
            text: 'Investment (HR - Investment)',
        },
        {
            name: 'depreciation_research',
            text: 'Depreciation (HR - Innovation)',
        },
        {
            name: 'investment_projects',
            text: 'Investment - Projects',
        },
        {
            name: 'depreciation_projects',
            text: 'Depreciation - Projects',
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
        <Card>
            <Card.Header style={{ position: 'relative' }}>
                <AutoSaveText
                    saveKey="text.balance_sheet_heading"
                    text={caseStudy.text.balance_sheet_heading || 'Balance Sheet'}
                    {...props}
                />
            </Card.Header>
            <Card.Body>
                <Table>
                    <tbody>
                        {vars.map((_var, idx) => (
                            <tr key={idx}>
                                <td style={{ fontWeight: _var.type == 'heading' ? 'bold' : 'normal' }}>
                                    <AutoSaveText
                                        saveKey={'text.' + _var.name + '_label'}
                                        text={caseStudy.text[_var.name + '_label'] || _var.text}
                                        {...props}
                                    />
                                </td>
                                <td>
                                    {_var.type != 'heading' && <FormatData
                                        caseStudy={caseStudy}
                                        format="amount_int"
                                        name={_var.name}
                                        value={(_var.minus ? -1 : 1) * (parseInt(financials[_var.name] || 0) || 0)}
                                    />
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card.Body>
        </Card>
    );
};

const projection = (caseStudy, gameData, level) => {
    const products = JSON.parse(JSON.stringify(gameData ? gameData.products.sort((a, b) => {return a.idx - b.idx}) : null));
    const financials = JSON.parse(JSON.stringify(gameData ? gameData.financials : null));
    if (!products || !financials) {
        return null;
    }

    const investment = parseInt(financials.invest || 0);
    const withdraw = parseInt(financials.withdraw || 0);
    const prevInvestment = parseInt(financials.investment_amount || 0);

    financials.investment_amount = prevInvestment + investment - withdraw;
    financials.cashflow_investment = investment - withdraw;
    const invrate = parseFloat(financials.investment_interest_rate || 0);
    const interest = Math.round(financials.investment_amount * invrate / 100);
    financials.interest_income = interest;

    const prevValue = parseInt(financials.investment_plant || 0);
    var capacity = parseInt(financials.capacity || 0);
    const cumdep = parseInt(financials.depreciation_plant || 0);
    const plantDepRate = parseFloat(caseStudy.financials.depreciation_rate_plant || 0);
    var newInvestment = 0;

    if (gameData.selectedPlant && gameData.selectedPlant != 'None') {
        var found = false;
        for (var i = 0; i < caseStudy.plants.options.length; i++) {
            const plant = caseStudy.plants.options[i];
            if (plant.label == gameData.selectedPlant) {
                newInvestment = parseInt(plant.investment || 0);
                capacity += parseInt(plant.capacity || 0);
                break;
            }
        }
    }

    financials.investment_plant = prevValue + newInvestment;
    financials.capacity = capacity;
    financials.cashflow_plant = newInvestment;

    financials.current_depreciation_plant = Math.floor(prevValue * plantDepRate / 100);
    financials.depreciation_plant = cumdep + financials.current_depreciation_plant;

    const prevResearchInvestment = parseInt(financials.investment_research || 0);
    const researchDepRate = parseFloat(caseStudy.financials.depreciation_rate_research || 0);
    const newInvestmentResearch = parseInt(financials.innovation_budget || 0);

    financials.investment_research = prevResearchInvestment + newInvestmentResearch;
    financials.cashflow_research = newInvestmentResearch;

    const resdep = parseInt(financials.depreciation_research || 0);

    financials.current_depreciation_research = Math.floor(financials.investment_research * researchDepRate / 100);
    financials.depreciation_research = resdep + financials.current_depreciation_research;

    const prevProjectInvestment = parseInt(financials.investment_projects || 0);
    const projDepRate = parseFloat(caseStudy.financials.depreciation_rate_projects || 0);
    const projDep = parseInt(financials.depreciation_projects || 0);

    const projects = {};

    caseStudy.special_projects && caseStudy.special_projects.forEach((project) => {
        projects[project.key] = project;
        projects[project.key].optidx = {};
        project.options.forEach((opt) => {
            projects[project.key].optidx[opt.label] = opt;
        });
    });

    var investmentProjects = 0;

    for (var key in gameData.special_projects) {
        const option = gameData.special_projects[key];
        investmentProjects += projects[key].optidx[option] ? parseInt(projects[key].optidx[option].investment || 0) : 0;
    }

    financials.investment_projects = prevProjectInvestment + investmentProjects;
    financials.current_depreciation_projects = Math.floor(financials.investment_projects * projDepRate / 100);
    financials.depreciation_projects = projDep + financials.current_depreciation_projects;
    financials.cashflow_projects = investmentProjects;

    const labourPct = parseInt(financials.labour_cost_pct || 0);
    const fixedLabourCost = parseInt(financials.fixed_labour_cost || 0);

    const existing = parseInt(financials.existing_workforce || 0);
    const planned = parseInt(financials.planned_workforce || financials.existing_workforce || 0);
    const salary = parseInt(financials.avg_salary || 0);
    financials.salary_cost = planned * salary;

    if (existing > planned) {
        const diff = existing - planned;
        const firingCost = parseInt(financials.avg_firing_cost || 0);
        financials.recruitment_cost = firingCost * diff;
    }
    else if (existing < planned) {
        const diff = planned - existing;
        const hiringCost = parseInt(financials.avg_hiring_cost || 0);
        financials.recruitment_cost = hiringCost * diff;
    }
    else {
        financials.recruitment_cost = 0;
    }

    financials.employment_cost = financials.salary_cost + financials.recruitment_cost;
    financials.existing_workforce = planned;
    financials.planned_workforce = planned;

    financials.labour_cost = Math.floor(fixedLabourCost + financials.employment_cost * labourPct / 100);
    financials.sales_force = financials.employment_cost - financials.labour_cost;

    const specValues = {};
    caseStudy.product.specs.forEach((spec) => {
        specValues[spec.feature] = {};
        spec.values.forEach((val) => {
            specValues[spec.feature][val.value] = val;
        });
    });

    const productOverhead = parseInt(caseStudy.product.overhead_cost || 0);
    for (var i = 0; i < gameData.products.length; i++) {
        const product = gameData.products[i];
        var featureCost = 0;
        for (var prop in product.specs) {
            const val = product.specs[prop];
            featureCost += parseInt(specValues[prop][val].cost || 0);
        }

        product.cost = featureCost + productOverhead;
    }

    const existingWorkforce = parseInt(financials.existing_workforce || 0);
    const plannedWorkforce = parseInt(financials.planned_workforce || 0);
    //var requiredWorkforce = parseInt(financials.required_workforce || 0);

    const productivityIncrease = 1 + (parseInt(financials.productivity_increase || 0) / 100 + parseInt(financials.productivity_impact || 0)) / 100;

    var production = 0;
    gameData.products.forEach((product) => {
        production += parseInt(product.plannedProduction || 0);
    });

    const productManpower = parseFloat(caseStudy.product.product_manpower || 0);
    const requiredWorkforce = Math.ceil(production * productManpower / productivityIncrease);
    financials.required_workforce = requiredWorkforce;
    const actualWorkforce = plannedWorkforce || existingWorkforce;

    financials.existing_workforce = actualWorkforce;
    financials.planned_workforce = actualWorkforce;

    var totalPlannedProduction = 0;
    var totalActualProduction = 0;
    var totalRevenue = 0;
    var totalUnitsSold = 0;
    var materialCost = 0;
    var promotions = 0;
    var advertising = 0;    
    var totalInventory = 0;
    var openingInventory = 0;
    var openingInventoryCost = 0;
    var closingInventoryCost = 0;

    const materialCostReduction = 1 - parseInt(financials.material_cost_impact || 0) / 100;

    products.forEach((product) => {
        const plannedProduction = parseInt(product.plannedProduction || 0);
        var actualProduction = Math.round(plannedProduction * actualWorkforce / requiredWorkforce);
        actualProduction = Math.min(actualProduction, plannedProduction);
        product.actualProduction = actualProduction;

        totalPlannedProduction += plannedProduction;
        totalActualProduction += actualProduction;

        const cost = parseInt(product.cost || 0);
        
        product.actualProduction = actualProduction;

        product.opening_inventory = parseInt(product.inventory || 0);
        openingInventory += product.opening_inventory;

        product.opening_inventory_cost = product.opening_inventory * cost;

        product.unitsSold = Math.round((product.opening_inventory + product.actualProduction) * level / 100);
        product.inventory = product.actualProduction + product.opening_inventory - product.unitsSold;

        product.inventory_cost  = product.inventory * cost;
        product.change_in_inventory_cost = product.opening_inventory_cost - product.inventory_cost;
        totalInventory += product.inventory;

        openingInventoryCost += product.opening_inventory_cost;
        closingInventoryCost += product.inventory_cost;

        product.revenue = parseInt(product.salesPrice || 0) * product.unitsSold;
        totalRevenue += product.revenue;
        totalUnitsSold += product.unitsSold;

        product.material_cost = Math.round(parseInt(product.cost || 0) * product.actualProduction * materialCostReduction);
        materialCost += product.material_cost;
        product.promotions = parseInt(product.marketing.promotions_budget || 0);
        promotions += product.promotions;
        product.advertising = parseInt(product.marketing.advertising_budget || 0);
        advertising += product.advertising;
    });

    financials.revenue = totalRevenue;
    financials.unitsSold = totalUnitsSold;
    financials.material_cost = materialCost;
    financials.administrative_costs = Math.round((financials.revenue * parseInt(financials.admin_overhead || 0) / 100) + parseInt(financials.fixed_admin_cost || 0));
    financials.promotions = promotions;
    financials.advertising = advertising;
    financials.opening_inventory = openingInventory;
    financials.opening_inventory_cost = openingInventoryCost;
    financials.inventory_cost = closingInventoryCost;
    financials.inventory = totalInventory;
    financials.change_in_inventory_cost = financials.opening_inventory_cost - financials.inventory_cost;
    financials.plannedProduction = totalPlannedProduction;
    financials.actualProduction = totalActualProduction;

    const staxRate = parseInt(caseStudy.financials.sales_tax_rate || 0);
    financials.sales_tax = Math.floor(financials.revenue * staxRate / 100);

    financials.emergency_loan_paid = parseInt(financials.emergency_loan_taken || 0);
    financials.emergency_loan_taken = 0;

    const duration = parseInt(caseStudy.financials.debt_duration || 0);
    if (!financials.debt) {
        financials.debt = [];
    }

    if (financials.borrow_debt) {
        financials.debt.push({
            amount: parseInt(financials.borrow_debt || 0),
            periods_serviced: 0
        });
    }

    var totalDebt = 0;
    var debtDue = 0;
    var installment = 0;
    var next = 0;

    financials.debt.forEach((_debt) => {
        _debt.periods_serviced = parseInt(_debt.periods_serviced || 0);
        _debt.amount = parseInt(_debt.amount || 0);

        if ((_debt.periods_serviced + 1) < duration) {
            const _next = _debt.amount && duration ? Math.round(_debt.amount / duration) : 0;
            next += _next;
        }

        if (_debt.periods_serviced < duration) {
            const _installment = _debt.amount && duration ? Math.round(_debt.amount / duration) : 0;
            installment += _installment;

            _debt.periods_serviced = _debt.periods_serviced + 1;
            debtDue += _debt.amount - (_installment * _debt.periods_serviced);
            totalDebt += _debt.amount;
        }
    });

    financials.debt_due = debtDue;
    financials.installment = installment;
    //financials.prev_loan_repayment = Math.round(financials.installment - financials.borrow_debt / duration);
    const irate = parseFloat(caseStudy.financials.interest_rate || 0);
    financials.interest = Math.round((financials.debt_due + financials.installment) * irate / 100);
    financials.next_installment = next;
    financials.long_term_debt = financials.debt_due - financials.next_installment;

    const eloanRate = parseFloat(financials.emergency_loan_int_pct || 0);
    const eloanP = parseInt(financials.emergency_loan_paid || 0);

    financials.emergency_loan_interest = eloanP * eloanRate / 100;
    financials.total_debt = parseInt(financials.debt_due || 0);

    const stockPrice = parseFloat(financials.stock_price || 0);
    const sharesIssued = parseInt(financials.shares_issued || 0);
    const issueShares = parseInt(financials.issue_shares || 0);
    var sharePremium = financials.share_premium || 0;

    if (issueShares) {
        financials.stock_sale = issueShares * stockPrice;
        financials.shares_issued = sharesIssued + issueShares;
        financials.issue_shares = 0;

        sharePremium += (stockPrice - parseFloat(financials.shares_facevalue || 0)) * issueShares;
    }
    else {
        financials.stock_sale = 0;
        financials.issue_shares = 0;
    }

    financials.share_premium = parseInt(sharePremium);

    const income = financials.revenue + financials.interest_income;

    const costs =
        financials.material_cost +
        financials.labour_cost +
        parseInt(financials.training_budget || 0) +
        financials.change_in_inventory_cost +
        financials.current_depreciation_plant +
        financials.current_depreciation_research +
        financials.current_depreciation_projects +
        financials.promotions +
        financials.advertising +
        financials.sales_force +
        financials.administrative_costs +
        parseInt(financials.overheads || 0) +
        parseInt(financials.miscellaneous_cost_1 || 0) +
        parseInt(financials.miscellaneous_cost_2 || 0) +
        parseInt(financials.miscellaneous_cost_3 || 0) +
        parseInt(financials.miscellaneous_cost_4 || 0) +
        parseInt(financials.miscellaneous_cost_5 || 0) +
        financials.interest +
        financials.emergency_loan_interest +
        financials.sales_tax;

    financials.gross_profit = income - costs;
    const taxRate = parseInt(financials.corporate_tax_rate || 0);
    financials.corporate_tax = financials.gross_profit > 0 ? parseInt(financials.gross_profit * taxRate / 100) : 0;
    financials.profit = financials.gross_profit - financials.corporate_tax;
    financials.gross_contribution = financials.revenue + financials.interest_income - financials.material_cost - financials.labour_cost; // - parseInt(financials.opening_inventory_cost || 0) + parseInt(financials.inventory_cost || 0);

    const dividendRate = parseFloat(caseStudy.financials.dividend_rate || 0);
    financials.dividend = financials.profit > 0 ? parseInt(financials.profit * dividendRate / 100) : 0;
    const prevRE = parseInt(financials.total_retained_earnings || 0);
    financials.retained_earnings = financials.profit - financials.dividend;
    financials.total_retained_earnings = prevRE + financials.retained_earnings;

    financials.cash_balance_open = parseInt(financials.cash_balance || 0);
    const open = financials.cash_balance_open;

    const cashIn =
        financials.revenue +
        parseInt(financials.borrow_debt || 0) +
        financials.stock_sale +
        financials.interest_income;

    const cashOut =
        financials.material_cost +
        financials.labour_cost +
        financials.sales_force +
        parseInt(financials.training_budget || 0) +
        financials.promotions +
        financials.advertising +
        financials.administrative_costs +
        financials.cashflow_investment +
        financials.cashflow_plant +
        financials.cashflow_research +
        financials.cashflow_projects +
        parseInt(financials.overheads || 0) +
        parseInt(financials.miscellaneous_cost_1 || 0) +
        parseInt(financials.miscellaneous_cost_2 || 0) +
        parseInt(financials.miscellaneous_cost_3 || 0) +
        parseInt(financials.miscellaneous_cost_4 || 0) +
        parseInt(financials.miscellaneous_cost_5 || 0) +
        financials.interest +
        financials.installment +
        financials.emergency_loan_interest +
        financials.emergency_loan_paid +
        financials.sales_tax +
        financials.corporate_tax +
        financials.dividend;

    financials.cash_balance = open + cashIn - cashOut;

    /*
    const minbal = parseInt(caseStudy.financials.min_cash_balance_required || 0);
    const amount = parseInt(caseStudy.financials.emergency_loan_amount || 0);

    if (financials.cash_balance < minbal) {
        financials.emergency_loan_taken = amount || (minbal - financials.cash_balance);
        financials.cash_balance += financials.emergency_loan_taken;
        financials.total_debt += financials.emergency_loan_taken;
    }
    */
   
    financials.total_depreciation =
        parseInt(financials.depreciation_research || 0) +
        parseInt(financials.depreciation_plant || 0) +
        parseInt(financials.depreciation_projects || 0);

    financials.total_assets =
        parseInt(financials.cash_balance || 0) +
        parseInt(financials.investment_amount || 0) +
        parseInt(financials.investment_plant || 0) +
        parseInt(financials.investment_research || 0) +
        parseInt(financials.investment_projects || 0) +
        parseInt(financials.inventory_cost || 0) -
        parseInt(financials.depreciation_plant || 0) -
        parseInt(financials.depreciation_research || 0) -
        parseInt(financials.depreciation_projects || 0);

    financials.total_liabilities =
        parseInt(financials.emergency_loan_taken || 0) +
        parseInt(financials.next_installment || 0) +
        parseInt(financials.long_term_debt || 0) +
        parseInt(financials.total_retained_earnings || 0) +
        parseInt(financials.share_premium || 0);
    // -
    //parseInt(financials.prev_loan_repayment || 0);

    financials.share_capital = Math.floor(
        parseFloat(financials.shares_facevalue || 0) *
        parseInt(financials.shares_issued || 0)
    );

    financials.liability_plus_equity = Math.floor(financials.total_liabilities + financials.share_capital);
    
    financials.taxes = financials.corporate_tax + financials.sales_tax;

    return [products, financials];
};
