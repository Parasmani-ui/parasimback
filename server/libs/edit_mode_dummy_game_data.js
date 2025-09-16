const _gameData = {
    financials: { // last quarter values
        revenue: 5300,
        profit: 1834,
        profitMargin: 18,
        stock_price: 305.43,
        changeInStockPrice: -6,
        changePctStockPrice: -1.1,
        marketShare: 12,
        unitsSold: 3000,
        material_cost: 5000,
        labour_cost: 6000,
        inventory_cost: 8000,
        gross_contribution: 60000,
        depreciation_plant: 5000,
        depreciation_research: 2000,
        total_depreciation: 7000,
        promotions: 6000,
        sales_force: 5000,
        service_force: 4000,
        admin: 2000,
        interest: 5000,
        taxes: 2000,
        change_in_inventory: 1500,
        cashflow_operations: 30000,
        cashflow_plant: 2000,
        cashflow_research: 3000,
        cashflow_investments: 5000,
        dividend: -4000,
        stock_sale: 0,
        long_debt: -2000,
        short_debt: 0,
        cashflow_financing: -5000,
        starting_cash: 28000,
        ending_cash: 55000,
        change_in_cash: 27000,
        shares_issued: 2000000,
        issue_shares: 0,
        debt_due: 2300000,
        borrow_debt: 0,
        existing_workforce: 480,
        required_workforce: 496,
        planned_workforce: 490,
        salary_cost: 43560000,
        recruitment_cost: 100000,
        employment_cost: 43560000,
        innovation_budget: 150000,
        training_budget: 100000,
        productivity_increase: 0.25,
        efficiency_increase: 0.49
    },
    scores: {
        score: 64,
        stock_price: 59,
        profits: 18,
        marketShare: 54,
        customerService: 34,
        utilization: 95,
        fulfilment: 23,
        continuousImprovement: 12,
        innovation: 0
    },
    special_projects: {
        integrated_it_systems: 'dont_invest',
        lens_technology: 'minor'
    },
    products: [
        {
            name: "Nextus 7",
            target: "Budget Conscious",
            specs: {
                "Memory": "2GB",
                "Camera": "4MP",
                "Screen Size": '5"',
            },
            plannedProduction: 500,
            cost: 5000,
            salesPrice: 7000,
            margin: 2000,
            inventory: 200,
            idx: 0,
            unitsSold: 3000,
            revenue: 13000,
            color: '#342aca',
            marketing: {
                advertising_budget: 1500000,
                promotions_budget: 800000
            },
            channelDistribution: {
                'Online Stores': '23%',
                'Retail Stores': '47%',
                'Distributors': '30%'
            },
            channelInventory: {
                'Online Stores': 0,
                'Retail Stores': 39,
                'Distributors': 1234
            },
        },
        {
            name: "Nextus 9",
            target: "Affluent",
            specs: {
                "Memory": "4GB",
                "Camera": "16MP",
                "Screen Size": '9"',
            },
            plannedProduction: 500,
            cost: 5000,
            salesPrice: 7000,
            margin: 2000,
            inventory: 200,
            idx: 2,
            unitsSold: 4000,
            revenue: 15000,
            color: '#e46faf',
            marketing: {
                advertising_budget: 1500000,
                promotions_budget: 800000
            },
            channelDistribution: {
                'Online Stores': '23%',
                'Retail Stores': '47%',
                'Distributors': '30%'
            },
            channelInventory: {
                'Online Stores': 0,
                'Retail Stores': 0,
                'Distributors': 34
            },
        },
        {
            name: "Nextus 8",
            target: "Aspirational",
            specs: {
                "Memory": "2GB",
                "Camera": "8MP",
                "Screen Size": '7"',
            },
            plannedProduction: 15000,
            cost: 5000,
            salesPrice: 7000,
            margin: 2000,
            inventory: 200,
            idx: 1,
            unitsSold: 2000,
            revenue: 9000,
            color: '#08ce1f',
            marketing: {
                advertising_budget: 1500000,
                promotions_budget: 800000
            },
            channelDistribution: {
                'Online Stores': '23%',
                'Retail Stores': '47%',
                'Distributors': '30%'
            },
            channelInventory: {
                'Online Stores': 234,
                'Retail Stores': 0,
                'Distributors': 5
            },
        },
        
    ],
    
};

module.exports = _gameData;
