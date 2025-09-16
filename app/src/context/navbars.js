const navbars = {
  user: [
    {
      text: 'Home',
      pageName: 'home',
      icon: 'home'
    },
    {
      text: "Introduction",
      icon: "present",
      children: [
        {
          text: "Case Study",
          pageName: "case_study",
          icon: "case_study"
        },
        {
          text: "Dashboard",
          pageName: "dashboard_user",
          icon: "dashboard"
        }
      ]
    },
    {
      text: "Analysis",
      icon: "results",
      children: [
        {
          text: "Demand Forecast",
          pageName: "demand_forecast",
          icon: "demand_forecast"
        },
        {
          text: "Market Share",
          pageName: "marketShare",
          icon: "market_share"
        },
        {
          text: "Competition",
          pageName: "competition",
          icon: "competition"
        },
        {
          text: "Project Results",
          pageName: "project_results",
          icon: "results"
        }
      ]
    },
    {
      text: "Accounts",
      icon: "accounts",
      children: [
        {
          text: "Income Statement",
          pageName: "income_statement",
          icon: "treasure"
        },
        {
          text: "Cashflow Statement",
          pageName: "cashflow_statement",
          icon: "cash_flow"
        },
        {
          text: "Balance Sheet",
          pageName: "balance_sheet",
          icon: "balance_sheet"
        },
        {
          text: "Financial Ratios",
          pageName: "financial_ratios",
          icon: "financial_ratio"
        },
      ]
    },
    {
      text: "Decisions",
      icon: "decisions",
      children: [
        {
          text: "Products",
          pageName: "products",
          icon: "products"
        },
        {
          text: "Marketing",
          pageName: "marketing",
          icon: "marketing"
        },
        {
          text: "Manufacturing",
          pageName: "manufacturing",
          icon: "manufacturing"
        },
        {
          text: "Human Resources",
          pageName: "human_resources",
          icon: "human_resources"
        },
        {
          text: "Finance",
          pageName: "financing",
          icon: "financing"
        },
        {
          text: "Special Projects",
          pageName: "special_projects",
          icon: "special_projects"
        },
      ]
    },
    {
      text: "Submission",
      icon: "finish",
      children: [
        {
          text: "Projections",
          pageName: "projections",
          icon: "projection"
        },
        {
          text: "Submit Decisions",
          pageName: "submit_decisions",
          icon: "submit_decisions"
        }
      ]
    }
    /*
    {
      text: "Leaderboard",
      pageName: "leaderboard",
      icon: "rankings"
    },
    */
  ],
  admin: [
    {
      text: "Settings",
      pageName: "edit_institute",
      icon: "system"
    },
    {
      text: "Users",
      pageName: "users",
      icon: "users"
    },
    {
      text: "Games",
      pageName: "games",
      icon: "games"
    },
    {
      text: "Leaderboard",
      pageName: "leaderboard",
      icon: "rankings"
    },
  ],
  superadmin: [
    {
      text: "Institutes List",
      pageName: "institutes_list",
      icon: "institute"
    },
    {
      text: "Edit Institute",
      pageName: "edit_institute",
      icon: "edit"
    },
    {
      text: "Users",
      pageName: "users",
      icon: "users"
    },
    {
      text: "Games",
      pageName: "games",
      icon: "games"
    },
    {
      text: "Case Studies",
      pageName: "case_studies_list",
      icon: "case_study"
    },
    {
      text: "Edit Case Study",
      icon: "edit_case_study",
      children: [
        {
          text: 'Case Study Setup',
          pageName: 'case_study_setup',
          icon: 'system'
        },
        {
          text: 'Home',
          pageName: 'edit_home',
          icon: 'home'
        },
        {
          text: "Case Study",
          pageName: "edit_case_study",
          icon: "case_study"
        },
        {
          text: "Products",
          pageName: "edit_products",
          icon: "products"
        },
        {
          text: "Demand Forecast",
          pageName: "edit_demand_forecast",
          icon: "demand_forecast"
        },
        {
          text: "Market Share",
          pageName: "edit_market_share",
          icon: "market_share"
        },
        /*
        {
          text: "Competition",
          pageName: "edit_competition",
          icon: "competition"
        },
        */
        {
          text: "Manufacturing",
          pageName: "edit_manufacturing",
          icon: "manufacturing"
        },
        {
          text: "Marketing",
          pageName: "edit_marketing",
          icon: "marketing"
        },
        {
          text: "Human Resources",
          pageName: "edit_human_resources",
          icon: "human_resources"
        },
        {
          text: "Finance",
          pageName: "edit_financing",
          icon: "financing"
        },
        {
          text: "Income Statement",
          pageName: "edit_income_statement",
          icon: "treasure"
        },
        {
          text: "Cashflow Statement",
          pageName: "edit_cashflow_statement",
          icon: "cash_flow"
        },
        {
          text: "Balance Sheet",
          pageName: "edit_balance_sheet",
          icon: "balance_sheet"
        },
        {
          text: "Financial Ratios",
          pageName: "edit_financial_ratios",
          icon: "financial_ratio"
        },
        {
          text: "Special Projects",
          pageName: "edit_special_projects",
          icon: "special_projects"
        },
        {
          text: "Dashboard",
          pageName: "edit_dashboard_user",
          icon: "dashboard"
        },
        {
          text: "Submit Decisions",
          pageName: "edit_submit_decisions",
          icon: "submit_decisions"
        },
      ]
    },
    {
      text: "System Data",
      icon: "system",
      children: [
        /*
        {
          text: "System Setup",
          pageName: "system_setup",
          icon: "system"
        },
        */
        {
          text: "System Styles",
          pageName: "system_styles",
          icon: "styles"
        },
        {
          text: "System Colors",
          pageName: "system_colors",
          icon: "colors"
        },
        {
          text: "System Images",
          pageName: "system_images",
          icon: "images"
        }
      ]
    },
    {
      text: "Leaderboard",
      pageName: "leaderboard",
      icon: "rankings"
    },
  ],
};

export default navbars;
