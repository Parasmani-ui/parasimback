import React from "react";
import FinancialStatement from '../utils/FinancialStatement';
import db from '../utils/db';
import ShowToast from '../utils/ShowToast';

const IncomeStatement = (props) => {
    const caseStudy = props.caseStudy;
    const vars = [
        {
            type: 'heading',
            text: 'Income'
        },
        {
            name: 'revenue',
            text: 'Revenue',
            static: true,
            income: true
        },
        {
            name: 'interest_income',
            text: 'Income From Investments',
            static: true,
            income: true
        },
        {
            type: 'heading',
            text: 'Expenses'
        },
        {
            name: 'material_cost',
            text: 'Material Cost',
            static: true,
            cost: true
        },
        {
            name: 'labour_cost',
            text: 'Labour Cost',
            static: true,
            cost: true
        },
        {
            name: 'gross_contribution',
            text: 'Gross Contribution',
            static: true
        },
        {
            name: 'training_budget',
            text: 'Training Cost',
            static: true,
            cost: true
        },
        {
            name: 'opening_inventory_cost',
            text: 'Opening Inventory Value',
            static: true,
        },
        {
            name: 'inventory_cost',
            text: 'Closing Inventory Value',
            static: true,
        },
        {
            name: 'change_in_inventory_cost',
            text: 'Change In Inventory',
            static: true,
            cost: true
        },
        {
            type: 'heading',
            text: 'Depreciation'
        },
        {
            name: 'current_depreciation_plant',
            text: 'Depreciation (Plant)',
            static: true,
            cost: true,
            //minus: true
        },
        {
            name: 'current_depreciation_research',
            text: 'Depreciation (HR - Innovation)',
            static: true,
            cost: true,
            //minus: true
        },
        {
            name: 'current_depreciation_projects',
            text: 'Depreciation (Projects)',
            static: true,
            cost: true,
            //minus: true
        },
        {
            type: 'heading',
            text: 'Costs'
        },
        {
            name: 'promotions',
            text: 'Promotions',
            static: true,
            cost: true
        },
        {
            name: 'advertising',
            text: 'Advertising',
            static: true,
            cost: true
        },
        {
            name: 'sales_force',
            text: 'Sales Force',
            static: true,
            cost: true
        },
        {
            name: 'administrative_costs',
            text: 'Administrative Costs',
            static: true,
            cost: true
        },
        {
            name: 'overheads',
            text: 'Overheads',
            static: true,
            cost: true,
            hide: true
        },
        {
            name: 'miscellaneous_cost_1',
            text: 'Miscellaneous Cost 1',
            static: true,
            cost: true,
            hide: true
        },
        {
            name: 'miscellaneous_cost_2',
            text: 'Miscellaneous Cost 2',
            static: true,
            cost: true,
            hide: true
        },
        {
            name: 'miscellaneous_cost_3',
            text: 'Miscellaneous Cost 3',
            static: true,
            cost: true,
            hide: true
        },
        {
            name: 'miscellaneous_cost_4',
            text: 'Miscellaneous Cost 4',
            static: true,
            cost: true,
            hide: true
        },
        {
            name: 'miscellaneous_cost_5',
            text: 'Miscellaneous Cost 5',
            static: true,
            cost: true,
            hide: true
        },
        {
            type: 'heading',
            text: 'Interest Payments'
        },
        {
            name: 'interest',
            text: 'Interest',
            static: true,
            cost: true
        },
        {
            name: 'emergency_loan_interest',
            text: 'Emergency Loan Interest',
            static: true,
            cost: true
        },
        {
            name: 'gross_profit',
            text: 'Profit Before Tax',
            static: true
        },
        {
            type: 'heading',
            text: 'Taxes'
        },
        {
            name: 'sales_tax',
            text: 'Sales Tax',
            static: true,
            cost: true,
            hide: true
        },
        {
            name: 'corporate_tax',
            text: 'Corporate Tax',
            static: true
        },
        {
            type: 'heading',
            text: 'Earnings'
        },
        {
            name: 'profit',
            text: 'Net Profit',
            static: true
        },
        {
            name: 'dividend',
            text: 'Dividend',
            static: true,
            cost: true,
            hide: true
        },
        {
            name: 'retained_earnings',
            text: 'Retained Earnings',
            static: true
        },
        /*
        {
            name: 'total_retained_earnings',
            text: 'Total Retained Earnings',
            static: true
        }
        */
    ];

    return <FinancialStatement vars={vars} heading="Income Statement" headingName="income_statement_heading" {...props} />
};

export default IncomeStatement;
