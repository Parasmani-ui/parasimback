const pageList = {
    home: {
        heading: 'Home',
        component: 'Home'
    },
    case_study: {
        heading: 'Case Study',
        component: 'CaseStudy'
    },
    dashboard_user: {
        heading: 'Dashboard',
        component: 'Dashboard'
    },
    demand_forecast: {
        heading: 'Demand Forecast',
        component: 'DemandForecast'
    },
    /*
    case_study: {
        heading: 'Case Study',
        component: 'DynamicPage',
        cols: { lg: 12, md: 6, sm: 3, xs: 3, xxs: 3 },
        breakpoints: { lg: 900, md: 700, sm: 500, xs: 300, xxs: 0 },
        blocks: [
            {
                blockName: 'company_info',
                layout: { lg: { x: 0, y: 0, w: 3, h: 8 }, md: { x: 0, y: 0, w: 3, h: 8 }, sm: { x: 0, y: 0, w: 3, h: 8 }, xs: { x: 0, y: 0, w: 3, h: 8 }, xxs: { x: 0, y: 0, w: 3, h: 8 } }
            },
            {
                blockName: 'officer_details_summary',
                layout: { lg: { x: 0, y: 8, w: 3, h: 8 }, md: { x: 3, y: 0, w: 3, h: 8 }, sm: { x: 3, y: 0, w: 3, h: 8 }, xs: { x: 0, y: 8, w: 3, h: 8 }, xxs: { x: 0, y: 8, w: 3, h: 8 } }
            },
            {
                blockName: 'company_introduction',
                layout: { lg: { x: 3, y: 8, w: 9, h: 8 }, md: { x: 0, y: 8, w: 9, h: 8 }, sm: { x: 0, y: 8, w: 9, h: 8 }, xs: { x: 0, y: 8, w: 9, h: 8 }, xxs: { x: 0, y: 8, w: 9, h: 8 } }
            },
            {
                blockName: 'objective',
                layout: { lg: { x: 3, y: 8, w: 9, h: 8 }, md: { x: 0, y: 16, w: 9, h: 8 }, sm: { x: 0, y: 16, w: 9, h: 8 }, xs: { x: 0, y: 16, w: 9, h: 8 }, xxs: { x: 0, y: 16, w: 9, h: 8 } }
            },
            {
                blockName: 'market_segments',
                layout: { lg: { x: 0, y: 16, w: 12, h: 8 }, md: { x: 0, y: 24, w: 12, h: 12 }, sm: { x: 0, y: 24, w: 12, h: 14 }, xs: { x: 0, y: 24, w: 12, h: 16 }, xxs: { x: 0, y: 24, w: 12, h: 18 } },
                layout_edit: { lg: { x: 0, y: 16, w: 12, h: 16 }, md: { x: 0, y: 24, w: 15, h: 16 }, sm: { x: 0, y: 24, w: 12, h: 18 }, xs: { x: 0, y: 24, w: 12, h: 20 }, xxs: { x: 0, y: 24, w: 12, h: 22 } }
            },
            {
                blockName: 'distribution_channels',
                layout: { lg: { x: 0, y: 26, w: 12, h: 8 }, md: { x: 0, y: 34, w: 12, h: 12 }, sm: { x: 0, y: 34, w: 12, h: 14 }, xs: { x: 0, y: 34, w: 12, h: 16 }, xxs: { x: 0, y: 34, w: 12, h: 18 } },
                layout_edit: { lg: { x: 0, y: 26, w: 12, h: 12 }, md: { x: 0, y: 34, w: 15, h: 14 }, sm: { x: 0, y: 34, w: 12, h: 16 }, xs: { x: 0, y: 34, w: 12, h: 18 }, xxs: { x: 0, y: 34, w: 12, h: 20 } }
            },
        ],
    },
    dashboard_user: {
        heading: 'Dashboard',
        component: 'DynamicPage',
        cols: { lg: 12, md: 6, sm: 3, xs: 3, xxs: 3 },
        breakpoints: { lg: 1100, md: 700, sm: 500, xs: 300, xxs: 0 },
        styles: {},
        gridItemStyles: {},
        gridItemClasses: [],
        blockContainerStyles: {},
        blockStyles: {},
        classes: [],
        blockClasses: [],
        blocks: [
            {
                blockName: 'score_thumbnail',
                layout: { lg: { x: 0, y: 0, w: 3, h: 5 }, md: { x: 0, y: 0, w: 3, h: 5 }, sm: { x: 0, y: 0, w: 3, h: 5 }, xs: { x: 0, y: 0, w: 3, h: 5 }, xxs: { x: 0, y: 0, w: 3, h: 5 } }
            },
            {
                blockName: 'rank_thumbnail',
                layout: { lg: { x: 0, y: 5, w: 3, h: 5 }, md: { x: 0, y: 5, w: 3, h: 5 }, sm: { x: 0, y: 5, w: 3, h: 5 }, xs: { x: 0, y: 5, w: 3, h: 5 }, xxs: { x: 0, y: 4, w: 3, h: 5 } }
            },
            {
                blockName: 'revenue_thumbnail',
                layout: { lg: { x: 3, y: 0, w: 3, h: 5 }, md: { x: 3, y: 0, w: 3, h: 5 }, sm: { x: 3, y: 0, w: 3, h: 5 }, xs: { x: 0, y: 8, w: 3, h: 5 }, xxs: { x: 3, y: 0, w: 3, h: 5 } }
            },
            {
                blockName: 'profits_thumbnail',
                layout: { lg: { x: 3, y: 5, w: 3, h: 5 }, md: { x: 3, y: 5, w: 3, h: 5 }, sm: { x: 0, y: 5, w: 3, h: 5 }, xs: { x: 3, y: 5, w: 3, h: 5 }, xxs: { x: 3, y: 5, w: 3, h: 5 } }
            },
            {
                blockName: 'market_share_thumbnail',
                layout: { lg: { x: 6, y: 0, w: 3, h: 5 }, md: { x: 6, y: 0, w: 3, h: 5 }, sm: { x: 6, y: 0, w: 3, h: 5 }, xs: { x: 6, y: 0, w: 3, h: 5 }, xxs: { x: 6, y: 0, w: 3, h: 5 } }
            },
            {
                blockName: 'units_sold_thumbnail',
                layout: { lg: { x: 6, y: 5, w: 3, h: 5 }, md: { x: 6, y: 5, w: 3, h: 5 }, sm: { x: 6, y: 5, w: 3, h: 5 }, xs: { x: 6, y: 0, w: 3, h: 5 }, xxs: { x: 6, y: 5, w: 3, h: 5 } }
            },
            {
                blockName: 'stock_thumbnail',
                layout: { lg: { x: 9, y: 0, w: 3, h: 5 }, md: { x: 9, y: 0, w: 3, h: 5 }, sm: { x: 9, y: 0, w: 3, h: 5 }, xs: { x: 0, y: 24, w: 3, h: 8 }, xxs: { x: 9, y: 0, w: 3, h: 5 } }
            },
            {
                blockName: 'stock_change_thumbnail',
                layout: { lg: { x: 9, y: 5, w: 3, h: 5 }, md: { x: 9, y: 5, w: 3, h: 5 }, sm: { x: 9, y: 5, w: 3, h: 5 }, xs: { x: 0, y: 24, w: 3, h: 8 }, xxs: { x: 9, y: 5, w: 3, h: 5 } }
            },
            {
                blockName: 'rankings',
                layout: { lg: { x: 0, y: 8, w: 6, h: 13 }, md: { x: 0, y: 16, w: 6, h: 13 }, sm: { x: 0, y: 32, w: 6, h: 13 }, xs: { x: 0, y: 32, w: 6, h: 15 }, xxs: { x: 0, y: 32, w: 6, h: 15 } }
            },
            {
                blockName: 'dashboard_charts',
                layout: { lg: { x: 6, y: 8, w: 6, h: 13 }, md: { x: 0, y: 28, w: 6, h: 20 }, sm: { x: 0, y: 44, w: 6, h: 13 }, xs: { x: 0, y: 44, w: 6, h: 13 }, xxs: { x: 0, y: 44, w: 6, h: 13 } }
            },
            {
                blockName: 'key_performance_metrics',
                layout: { lg: { x: 0, y: 20, w: 12, h: 20 }, md: { x: 0, y: 40, w: 12, h: 20 }, sm: { x: 0, y: 56, w: 12, h: 36 }, xs: { x: 0, y: 56, w: 12, h: 36 }, xxs: { x: 0, y: 56, w: 12, h: 36 } }
            }
        ],
    },
    rankings: {
        heading: 'Rankings',
        component: 'DynamicPage',
        cols: { lg: 12, md: 6, sm: 3, xs: 3, xxs: 3 },
        breakpoints: { lg: 1100, md: 700, sm: 500, xs: 300, xxs: 0 },
        blocks: [
            {
                blockName: 'blank',
                layout: { lg: { x: 0, y: 0, w: 12, h: 8 }, md: { x: 0, y: 0, w: 6, h: 8 }, sm: { x: 0, y: 0, w: 3, h: 8 } }
            }
        ]
    },
    demand_forecast: {
        heading: 'Demand Forecast',
        component: 'DynamicPage',
        cols: { lg: 12, md: 6, sm: 3, xs: 3, xxs: 3 },
        breakpoints: { lg: 900, md: 600, sm: 300, xs: 150, xxs: 0 },
        blocks: [
            {
                blockName: 'demand_forecast_line',
                layout: { lg: { x: 0, y: 0, w: 6, h: 14 }, md: { x: 0, y: 0, w: 6, h: 14 }, sm: { x: 0, y: 0, w: 3, h: 10 } }
            },
            {
                blockName: 'demand_message',
                layout: { lg: { x: 6, y: 0, w: 6, h: 14 }, md: { x: 0, y: 14, w: 6, h: 14 }, sm: { x: 0, y: 10, w: 3, h: 10 } }
            },
            {
                blockName: 'industry_sales_line',
                layout: { lg: { x: 0, y: 14, w: 6, h: 14 }, md: { x: 0, y: 28, w: 6, h: 14 }, sm: { x: 0, y: 20, w: 3, h: 10 } }
            },
            {
                blockName: 'industry_production_line',
                layout: { lg: { x: 6, y: 14, w: 6, h: 14 }, md: { x: 0, y: 42, w: 6, h: 14 }, sm: { x: 0, y: 30, w: 3, h: 10 } }
            },
            {
                blockName: 'capacity_report',
                layout: { lg: { x: 0, y: 28, w: 6, h: 14 }, md: { x: 0, y: 56, w: 6, h: 14 }, sm: { x: 0, y: 40, w: 3, h: 14 } }
            },
            {
                blockName: 'capacity_bar',
                layout: { lg: { x: 6, y: 28, w: 6, h: 14 }, md: { x: 0, y: 56, w: 6, h: 14 }, sm: { x: 0, y: 40, w: 3, h: 14 } }
            }
        ]
    },
    */
    marketShare: {
        heading: 'Market Share',
        component: 'MarketShare'
        /*
        component: 'DynamicPage',
        cols: { lg: 12, md: 6, sm: 3, xs: 3, xxs: 3 },
        breakpoints: { lg: 900, md: 600, sm: 300, xs: 150, xxs: 0 },
        blocks: [
            {
                blockName: 'volume_market_share_pie',
                layout: { lg: { x: 0, y: 0, w: 6, h: 15 }, md: { x: 0, y: 0, w: 6, h: 15 }, sm: { x: 0, y: 0, w: 3, h: 8 } }
            },
            {
                blockName: 'revenue_market_share_pie',
                layout: { lg: { x: 6, y: 0, w: 6, h: 15 }, md: { x: 0, y: 15, w: 6, h: 15 }, sm: { x: 0, y: 8, w: 3, h: 8 } }
            },
            {
                blockName: 'product_volume_share_pie',
                layout: { lg: { x: 0, y: 15, w: 6, h: 15 }, md: { x: 0, y: 30, w: 6, h: 15 }, sm: { x: 0, y: 16, w: 3, h: 8 } }
            },
            {
                blockName: 'product_revenue_share_pie',
                layout: { lg: { x: 6, y: 15, w: 6, h: 15 }, md: { x: 0, y: 45, w: 6, h: 15 }, sm: { x: 0, y: 24, w: 3, h: 8 } }
            },
        ]
        */
    },
    competition: {
        heading: 'Competition',
        component: 'Competition'
    },
    project_results: {
        heading: 'Project Results',
        component: 'ProjectResults'
    },
    /* keep it here in case they ask for this page back
    sales_analysis: {
        heading: 'Sales Analysis',
        component: 'DynamicPage',
        cols: { lg: 12, md: 6, sm: 3, xs: 3, xxs: 3 },
        breakpoints: { lg: 1100, md: 700, sm: 500, xs: 300, xxs: 0 },
        blocks: [
            {
                blockName: 'product_volume_share_pie',
                layout: { lg: { x: 0, y: 0, w: 6, h: 12 }, md: { x: 0, y: 0, w: 6, h: 12 }, sm: { x: 0, y: 0, w: 3, h: 12 } }
            },
            {
                blockName: 'product_revenue_share_pie',
                layout: { lg: { x: 6, y: 0, w: 6, h: 12 }, md: { x: 0, y: 12, w: 6, h: 12 }, sm: { x: 0, y: 12, w: 3, h: 12 } }
            },
            {
                blockName: 'channel_inventory',
                layout: { lg: { x: 0, y: 12, w: 12, h: 12 }, md: { x: 0, y: 12, w: 6, h: 12 }, sm: { x: 0, y: 24, w: 3, h: 12 } }
            },
        ]
    },
    */
    income_statement: {
        heading: 'Income Statement',
        component: 'IncomeStatement'
    },
    cashflow_statement: {
        heading: 'Cashflow Statement',
        component: 'CashflowStatement'
    },
    balance_sheet: {
        heading: 'Balance Sheet',
        component: 'BalanceSheet'
    },
    financial_ratios: {
        heading: 'Financial Ratios',
        component: 'FinancialRatios'
    },
    special_projects: {
        heading: 'Special Projects',
        component: 'SpecialProjects'
    },
    marketing: {
        heading: 'Marketing',
        component: 'SalesAndMarketing'
    },
    manufacturing: {
        heading: 'Manufacturing Operations',
        component: 'Manufacturing',
    },
    human_resources: {
        heading: 'Human Resources',
        component: 'HumanResources',
    },
    financing: {
        heading: 'Project Financing',
        component: 'Financing',
    },
    projections: {
        heading: 'Projections',
        component: 'Projections',
    },
    submit_decisions: {
        heading: 'Submit Decisions',
        component: 'SubmitDecisions',
    },

    products: {
        heading: 'Products',
        component: 'UserProducts'
    },

    // admin
    /*
    dashboard_admin: {
        heading: 'Dashboard',
        component: 'AdminDashboard',
    },
    */
    users: {
        heading: 'Users',
        component: 'Users',
    },
    games: {
        heading: 'Games',
        component: 'Games',
    },

    // superadmin
    /*
    dashboard_sadmin: {
        heading: 'Dashboard',
        component: 'SuperAdminDashboard',
    },
    */
    system_setup: {
        heading: 'System Setup',
        component: 'SystemSetup',
    },
    case_studies_list: {
        heading: 'Case Studies List',
        component: 'CaseStudiesList',
    },
    institutes_list: {
        heading: 'Institutes List',
        component: 'InstitutesList',
    },
    edit_institute: {
        heading: 'Edit Institute',
        component: 'EditInstitute',
    },
    system_styles: {
        heading: 'System Styles',
        component: 'ChangeSystemStyles',
    },
    system_colors: {
        heading: 'System Colors',
        component: 'ChangeSystemColors',
    },
    system_images: {
        heading: 'System Images',
        component: 'ChangeSystemImages',
    },
    institutes: {
        heading: 'Institutes',
        component: 'Institutes',
        cols: { lg: 12, md: 6, sm: 3, xs: 3, xxs: 3 },
        breakpoints: { lg: 900, md: 600, sm: 300, xs: 150, xxs: 0 },
        blocks: [
            {
                blockName: 'blank',
                layout: { lg: { x: 0, y: 0, w: 12, h: 8 }, md: { x: 0, y: 0, w: 6, h: 8 }, sm: { x: 0, y: 0, w: 3, h: 8 } }
            }
        ]
    },

    case_study_setup: {
        heading: 'Case Study Setup',
        component: 'CaseStudySetup',
        page_name: 'case_study_setup'
    },

    /*
    bot_decisions: {
        heading: 'BOT Decisions Training Data',
        component: 'BotDecisions',
        page_name: 'bot_decisions'
    },
    */

    // edit pages
    edit_home: {
        heading: 'Edit Home Page',
        component: 'EditPage',
        page_name: 'home'
    },
    edit_case_study: {
        heading: 'Edit Case Study Page',
        component: 'EditPage',
        page_name: 'case_study'
    },
    edit_dashboard_user: {
        heading: 'Edit Dashboard',
        component: 'EditPage',
        page_name: 'dashboard_user'
    },
    edit_products: {
        heading: 'Edit Products',
        component: 'EditPage',
        page_name: 'products'
    },
    edit_demand_forecast: {
        heading: 'Edit Demand Forecast',
        component: 'EditPage',
        page_name: 'demand_forecast'
    },
    edit_market_share: {
        heading: 'Edit Market Share',
        component: 'EditPage',
        page_name: 'marketShare'
    },
    edit_competition: {
        heading: 'Edit Competition',
        component: 'EditPage',
        page_name: 'competition'
    },
    edit_sales_analysis: {
        heading: 'Edit Sales Analysis',
        component: 'EditPage',
        page_name: 'sales_analysis'
    },
    edit_income_statement: {
        heading: 'Edit Income Statement',
        component: 'EditPage',
        page_name: 'income_statement'
    },
    edit_cashflow_statement: {
        heading: 'Edit Cashflow Statement',
        component: 'EditPage',
        page_name: 'cashflow_statement'
    },
    edit_balance_sheet: {
        heading: 'Edit Balance Sheet',
        component: 'EditPage',
        page_name: 'balance_sheet'
    },
    edit_financial_ratios: {
        heading: 'Edit Financial Ratios',
        component: 'EditPage',
        page_name: 'financial_ratios'
    },
    edit_special_projects: {
        heading: 'Edit Special Projects',
        component: 'EditPage',
        page_name: 'special_projects'
    },
    edit_marketing: {
        heading: 'Edit Marketing',
        component: 'EditPage',
        page_name: 'marketing'
    },
    edit_manufacturing: {
        heading: 'Edit Manufacturing',
        component: 'EditPage',
        page_name: 'manufacturing'
    },
    edit_human_resources: {
        heading: 'Edit Human Resources',
        component: 'EditPage',
        page_name: 'human_resources'
    },
    edit_financing: {
        heading: 'Edit Financing',
        component: 'EditPage',
        page_name: 'financing'
    },
    edit_submit_decisions: {
        heading: 'Edit Submit Decisions',
        component: 'EditPage',
        page_name: 'submit_decisions'
    },
    leaderboard: {
        heading: 'Leaderboard',
        component: 'LeaderBoard',
        page_name: 'leaderboard'
    },
    /*
    edit_rankings: {
        heading: 'Edit Rankings',
        component: 'EditPage',
        page_name: 'rankings'
    }
    */
};



export default pageList;
