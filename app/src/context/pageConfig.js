import React from "react";
//import DynamicPage from '../components/DynamicPage';
import Home from '../components/pages/Home';
import CaseStudy from '../components/pages/CaseStudy';
import Dashboard from '../components/pages/Dashboard';
import DemandForecast from '../components/pages/DemandForecast';
import UserProducts from '../components/pages/UserProducts';
import MarketShare from '../components/pages/MarketShare';
import Competition from '../components/pages/Competition';
import SpecialProjects from '../components/pages/SpecialProjects';
import HumanResources from '../components/pages/HumanResources';
import SalesAndMarketing from '../components/pages/SalesAndMarketing';
import Manufacturing from '../components/pages/Manufacturing';
import Financing from '../components/pages/Financing';
import SubmitDecisions from '../components/pages/SubmitDecisions';
import IncomeStatement from '../components/pages/IncomeStatement';
import CashflowStatement from '../components/pages/CashflowStatement';
import BalanceSheet from '../components/pages/BalanceSheet';
import FinancialRatios from '../components/pages/FinancialRatios';
import Projections from '../components/pages/Projections';
import ProjectResults from '../components/pages/ProjectResults';

import EditPage from '../components/EditPage';
import CaseStudiesList from '../components/pages/CaseStudiesList';
import InstitutesList from '../components/pages/InstitutesList';
import CaseStudySetup from '../components/pages/CaseStudySetup';
import EditInstitute from '../components/pages/EditInstitute';
import SystemSetup from '../components/pages/SystemSetup';

import Users from '../components/pages/Users';
import Games from '../components/pages/Games';
import ChangeSystemImages from '../components/pages/ChangeSystemImages';
import ChangeSystemStyles from '../components/pages/ChangeSystemStyles';
import ChangeSystemColors from '../components/pages/ChangeSystemColors';
import LeaderBoard from '../components/pages/LeaderBoard';

const pageConfig = {
    //'DynamicPage': DynamicPage,
    'EditPage': EditPage,
    'Home': Home,
    'CaseStudy': CaseStudy,
    'Dashboard': Dashboard,
    'DemandForecast': DemandForecast,
    'UserProducts': UserProducts,
    'MarketShare': MarketShare,
    'Competition': Competition,
    'SpecialProjects': SpecialProjects,
    'HumanResources': HumanResources,
    'SalesAndMarketing': SalesAndMarketing,
    'Manufacturing': Manufacturing,
    'IncomeStatement': IncomeStatement,
    'CashflowStatement': CashflowStatement,
    'BalanceSheet': BalanceSheet,
    'FinancialRatios': FinancialRatios,
    'ProjectResults': ProjectResults,
    'Financing': Financing,
    'Projections': Projections,
    'SubmitDecisions': SubmitDecisions,

    'CaseStudiesList': CaseStudiesList,
    'InstitutesList': InstitutesList,
    'CaseStudySetup': CaseStudySetup,
    'EditInstitute': EditInstitute,
    'SystemSetup': SystemSetup,
    
    'LeaderBoard': LeaderBoard,
    'Users': Users,
    'Games': Games,
    'ChangeSystemImages': ChangeSystemImages,
    'ChangeSystemStyles': ChangeSystemStyles,
    'ChangeSystemColors': ChangeSystemColors
};

export default pageConfig;
