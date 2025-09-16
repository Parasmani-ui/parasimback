import React from "react";
import FinancialStatement from '../utils/FinancialStatement';
import db from '../utils/db';

const CashflowStatement = (props) => {
    const caseStudy = props.caseStudy;
    const vars = [
        {
            type: 'heading',
            text: 'Cash Inflow'
        },
        {
            name: 'cash_balance_open',
            text: 'Opening Balance',
            static: true,
            in: true
        },
        {
            name: 'revenue',
            text: 'Revenue',
            static: true,
            in: true
        },
        {
            name: 'interest_income',
            text: 'Income From Investments',
            static: true,
            in: true
        },
        {
            name: 'cashflow_debt',
            text: 'Debt',
            static: true,
            in: true
        },
        {
            type: 'exp',
            name: "stock_sale",
            text: 'Equity Sales',
            static: true,
            in: true
        },
        {
            type: 'heading',
            text: 'Cash Outflow'
        },
        {
            name: 'material_cost',
            text: 'Material Cost',
            static: true,
            out: true
        },
        {
            name: 'labour_cost',
            text: 'Labour Cost',
            static: true,
            out: true
        },
        {
            name: 'promotions',
            text: 'Promotions',
            static: true,
            out: true
        },
        {
            name: 'advertising',
            text: 'Advertising',
            static: true,
            out: true
        },
        {
            name: 'sales_force',
            text: 'Sales Force',
            static: true,
            out: true
        },
        {
            name: 'training_budget',
            text: 'Training Cost',
            static: true,
            out: true
        },
        {
            name: 'administrative_costs',
            text: 'Administrative Costs',
            static: true,
            out: true
        },
        {
            name: 'overheads',
            text: 'Overheads',
            static: true,
            out: true,
            hide: true
        },
        {
            name: 'miscellaneous_cost_1',
            text: 'Miscellaneous Cost 1',
            static: true,
            out: true,
            hide: true
        },
        {
            name: 'miscellaneous_cost_2',
            text: 'Miscellaneous Cost 2',
            static: true,
            out: true,
            hide: true
        },
        {
            name: 'miscellaneous_cost_3',
            text: 'Miscellaneous Cost 3',
            static: true,
            out: true,
            hide: true
        },
        {
            name: 'miscellaneous_cost_4',
            text: 'Miscellaneous Cost 4',
            static: true,
            out: true,
            hide: true
        },
        {
            name: 'miscellaneous_cost_5',
            text: 'Miscellaneous Cost 5',
            static: true,
            out: true,
            hide: true
        },
        {
            type: 'heading',
            text: 'Investments'
        },
        {
            name: 'cashflow_investment',
            text: 'Cashflow Investment',
            static: true,
            out: true
        },
        {
            name: 'cashflow_plant',
            text: 'Cashflow Investment (Plant)',
            static: true,
            out: true
        },
        {
            name: 'cashflow_research',
            text: 'Cashflow Investment (HR - Innovation)',
            static: true,
            out: true
        },
        {
            name: 'cashflow_projects',
            text: 'Cashflow Investment (Projects)',
            static: true,
            out: true
        },
        {
            type: 'heading',
            text: 'Loan Payments'
        },
        {
            name: 'interest',
            text: 'Interest',
            static: true,
            out: true
        },
        {
            name: 'installment',
            text: 'Loan Installment',
            static: true,
            cost: true
        },
        {
            name: 'emergency_loan_interest',
            text: 'Emergency Loan Interest',
            static: true,
            out: true
        },
        {
            name: 'emergency_loan_paid',
            text: 'Emergency Loan Paid',
            static: true,
            out: true
        },
        {
            type: 'heading',
            text: 'Taxes'
        },
        {
            name: 'sales_tax',
            text: 'Sales Tax',
            static: true,
            out: true,
            hide: true
        },
        {
            name: 'corporate_tax',
            text: 'Corporate Tax',
            static: true,
            out: true
        },
        {
            type: 'heading',
            text: 'Cash Balance'
        },
        {
            name: 'dividend',
            text: 'Dividend',
            static: true,
            out: true,
            hide: true
        },
        {
            name: 'emergency_loan_taken',
            text: 'Emergency Loan Taken',
            static: true,
            in: true
        },
        {
            name: 'cash_balance',
            text: 'Closing Balance',
            static: true
        },
    ];

    return <FinancialStatement vars={vars} heading="Cashflow Statement" headingName="cashflow_statement_heading" {...props} />
};

export default CashflowStatement;
