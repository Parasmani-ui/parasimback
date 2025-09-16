import db from '../utils/db';
import ShowToast from './ShowToast';

const updateAccounts = async (props) => {
    const caseStudy = props.caseStudy;
    
    const financials = JSON.parse(JSON.stringify(caseStudy.financials));    
    const investment = parseInt(financials.invest || 0);
    const withdraw = parseInt(financials.withdraw || 0);

    financials.investment_amount = 0;
    financials.interest_income = 0;

    const plantDepRate = parseFloat(caseStudy.financials.depreciation_rate_plant || 0);
    financials.current_depreciation_plant = Math.floor(parseInt(financials.investment_plant || 0) * plantDepRate / 100);
    financials.depreciation_plant = financials.current_depreciation_plant;

    const researchDepRate = parseFloat(caseStudy.financials.depreciation_rate_research || 0);
    const newInvestmentResearch = parseInt(financials.innovation_budget || 0);

    financials.investment_research = newInvestmentResearch;
    financials.current_depreciation_research = Math.floor(financials.investment_research * researchDepRate / 100);
    financials.depreciation_research = financials.current_depreciation_research;

    financials.investment_projects = 0;
    financials.current_depreciation_projects = 0;
    financials.depreciation_projects = 0;
    financials.cashflow_projects = 0;

    financials.change_in_inventory_cost = parseInt(financials.opening_inventory_cost || 0) - parseInt(financials.inventory_cost || 0);

    const labourPct = parseInt(financials.labour_cost_pct || 0);
    const fixedLabourCost = parseInt(financials.fixed_labour_cost || 0);

    financials.labour_cost = Math.floor(fixedLabourCost + financials.employment_cost * labourPct / 100);
    financials.sales_force = financials.employment_cost - financials.labour_cost;

    var revenue = 0;
    var unitsSold = 0;
    var materialCost = 0;
    var promotions = 0;
    var advertising = 0;

    caseStudy.products.forEach((product) => {
        product.revenue = parseInt(product.salesPrice || 0) * parseInt(product.unitsSold || 0);
        revenue += product.revenue;
        unitsSold += parseInt(product.unitsSold || 0);
        materialCost += parseInt(product.cost || 0) * parseInt(product.plannedProduction || 0);
        promotions += parseInt(product.marketing.promotions_budget || 0);
        advertising += parseInt(product.marketing.advertising_budget || 0);
    });

    financials.revenue = revenue;
    financials.unitsSold = unitsSold;
    financials.material_cost = materialCost;
    financials.administrative_costs = Math.round((financials.revenue * parseInt(financials.admin_overhead || 0) / 100) + parseInt(financials.fixed_admin_cost || 0));
    financials.promotions = promotions;
    financials.advertising = advertising;

    const staxRate = parseInt(caseStudy.financials.sales_tax_rate || 0);
    financials.sales_tax = Math.floor(financials.revenue * staxRate / 100);

    const income = financials.revenue;
    const openingInventoryCost = parseInt(financials.opening_inventory_cost || 0);
    const closingInventoryCost = parseInt(financials.inventory_cost || 0);
    financials.change_in_inventory_cost = openingInventoryCost - closingInventoryCost;

    financials.emergency_loan_paid = 0;
    financials.emergency_loan_taken = 0;

    const duration = parseInt(caseStudy.financials.debt_duration || 0);
    if (!financials.debt) {
        financials.debt = [];
    }

    var totalDebt = 0;
    var debtDue = 0;
    var installment = 0;
    var next = 0;

    financials.debt.forEach((_debt) => {
        _debt.periods_serviced = 0;
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
    //financials.prev_loan_repayment = installment;
    const irate = parseFloat(caseStudy.financials.interest_rate || 0);
    financials.interest = Math.round((financials.debt_due + financials.installment) * irate / 100);
    financials.next_installment = next;
    financials.long_term_debt = financials.debt_due - financials.next_installment;

    financials.emergency_loan_interest = 0;
    financials.total_debt = financials.debt_due;

    const stockPrice = parseFloat(financials.stock_price || 0);
    const sharesIssued = parseInt(financials.shares_issued || 0);

    financials.share_premium = 0;
    financials.stock_sale = 0;
    financials.issue_shares = 0;

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
    financials.corporate_tax = financials.gross_profit > 0 ? Math.round(financials.gross_profit * taxRate / 100) : 0;
    financials.profit = financials.gross_profit - financials.corporate_tax;
    financials.gross_contribution = financials.revenue + financials.interest_income - financials.material_cost - financials.labour_cost; // - parseInt(financials.opening_inventory_cost || 0) + parseInt(financials.inventory_cost || 0);

    const dividendRate = parseFloat(caseStudy.financials.dividend_rate || 0);
    financials.dividend = financials.profit > 0 ? Math.round(financials.profit * dividendRate / 100) : 0;
    financials.retained_earnings = financials.profit - financials.dividend;
    financials.total_retained_earnings = financials.retained_earnings;

    financials.share_capital = Math.round(
        parseFloat(financials.shares_facevalue || 0) *
        parseInt(financials.shares_issued || 0)
    );

    financials.cash_balance_open =
        financials.share_capital +
        financials.debt_due -
        parseInt(financials.investment_plant || 0) -
        parseInt(financials.investment_research || 0) -
        parseInt(financials.investment_projects || 0);

    const cashIn = financials.revenue;

    const cashOut =
        financials.material_cost +
        financials.labour_cost +
        financials.sales_force +
        parseInt(financials.training_budget || 0) +
        financials.promotions +
        financials.advertising +
        financials.administrative_costs +
        parseInt(financials.overheads || 0) +
        parseInt(financials.miscellaneous_cost_1 || 0) +
        parseInt(financials.miscellaneous_cost_2 || 0) +
        parseInt(financials.miscellaneous_cost_3 || 0) +
        parseInt(financials.miscellaneous_cost_4 || 0) +
        parseInt(financials.miscellaneous_cost_5 || 0) +
        financials.interest +
        financials.installment +
        financials.sales_tax +
        financials.corporate_tax +
        financials.dividend;

    financials.cash_balance = financials.cash_balance_open + cashIn - cashOut;

    financials.taxes = financials.corporate_tax + financials.sales_tax;

    financials.total_depreciation =
        parseInt(financials.depreciation_research || 0) +
        parseInt(financials.depreciation_plant || 0) +
        parseInt(financials.depreciation_projects || 0);

    financials.total_assets =
        parseInt(financials.cash_balance || 0) +
        parseInt(financials.investment_plant || 0) +
        parseInt(financials.investment_research || 0) +
        parseInt(financials.investment_projects || 0) +
        parseInt(financials.inventory_cost || 0) -
        parseInt(financials.depreciation_plant || 0) -
        parseInt(financials.depreciation_research || 0) -
        parseInt(financials.depreciation_projects || 0);

    financials.total_liabilities = Math.floor(
        parseInt(financials.next_installment || 0) +
        parseInt(financials.total_retained_earnings || 0) +
        parseInt(financials.share_premium || 0) +
        parseInt(financials.long_term_debt || 0)
        // -
        //parseInt(financials.prev_loan_repayment || 0)
    );

    financials.liability_plus_equity = Math.floor(financials.total_liabilities + financials.share_capital);

    const pratio = parseFloat(financials.pratio || 100);
    const eps = financials.profit / parseInt(financials.shares_issued || 0);
    var stockPriceEPS = eps * pratio;
    if (eps <= 0.09 && eps > -0.1) {
        stockPriceEPS = 0.8 * parseFloat(financials.shares_facevalue || 10);
    } else if (eps <= -0.1 && eps > -0.6) {
        stockPriceEPS = 0.6 * parseFloat(financials.shares_facevalue || 10);
    } else if (eps <= -0.6 && eps > -0.95) {
        stockPriceEPS = 0.4 * parseFloat(financials.shares_facevalue || 10);
    } else if (eps <= -0.95) {
        stockPriceEPS = 0.2 * parseFloat(financials.shares_facevalue || 10);
    }

    financials.stock_price = Math.max(Math.round(stockPriceEPS * 100) / 100, 0.1);

    await db.saveCaseStudyData(props, "financials", financials, null, true);
    await db.saveCaseStudyData(props, "accounts_updated", true, null, true);
    await props.updateData();
    ShowToast({ icon: 'success', heading: 'Data updated', message: 'Updated the financial statements' });
};

export default updateAccounts;