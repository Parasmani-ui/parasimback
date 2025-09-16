import React from "react";
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import LinkThumbnail from "../building_blocks/LinkThumbnail";

const Home = (props) => {
    const tabs = {
        'Introduction': {
            'case_study': {
                image: 'case_study_link_thumbnail',
                heading: 'Case Study',
            },
            'dashboard_user': {
                image: 'dashboard_link_thumbnail',
                heading: 'Dashboard',
            },
            'leaderboard': {
                image: 'leaderboard_link_thumbnail',
                heading: 'Leaderboard',
            },
            'games_list': {
                image: 'games_list_link_thumbnail',
                heading: 'Games List',
            }
        },
        'Analysis': {
            'demand_forecast': {
                image: 'demand_forecast_link_thumbnail',
                heading: 'Demand Forecast',
            },
            'marketShare': {
                image: 'market_share_link_thumbnail',
                heading: 'Market Share',
            },
            'competition': {
                image: 'competition_link_thumbnail',
                heading: 'Competition',
            },
            'project_results': {
                image: 'projects_results_link_thumbnail',
                heading: 'Project Results',
            }
        },
        'Accounts': {
            'income_statement': {
                image: 'income_statement_link_thumbnail',
                heading: 'Income Statement',
            },
            'cashflow_statement': {
                image: 'cashflow_statement_link_thumbnail',
                heading: 'Cashflow Statement',
            },
            'balance_sheet': {
                image: 'balance_sheet_link_thumbnail',
                heading: 'Balance Sheet',
            },
            'financial_ratios': {
                image: 'financial_ratios_link_thumbnail',
                heading: 'Financial Ratios',
            }
        },
        'Decisions': {
            'products': {
                image: 'products_link_thumbnail',
                heading: 'Products',
            },
            'marketing': {
                image: 'marketing_link_thumbnail',
                heading: 'Marketing',
            },
            'manufacturing': {
                image: 'manufacturing_link_thumbnail',
                heading: 'Manufacturing',
            },
            'human_resources': {
                image: 'human_resources_link_thumbnail',
                heading: 'Human Resources',
            },

            'finance': {
                image: 'financing_link_thumbnail',
                heading: 'Financing',
                marginTop: true
            },
            'special_projects': {
                image: 'special_projects_link_thumbnail',
                heading: 'Special Projects',
                marginTop: true
            },
            'projections': {
                image: 'projections_link_thumbnail',
                heading: 'Projections',
                marginTop: true
            },
            'submit_decisions': {
                image: 'submit_link_thumbnail',
                heading: 'Submit Decisions',
                marginTop: true
            }
        }
    };

    return (
        <>
            {Object.keys(tabs).map((tabName, tidx) => (
                <Card key={tidx} className="container-card">
                    <Card.Header>{tabName}</Card.Header>
                    <Card.Body>
                        <Row>
                            {Object.keys(tabs[tabName]).map((pageName, pidx) => (
                                <Col key={pidx} lg={3} md={6} sm={6} style={{marginTop: tabs[tabName][pageName].marginTop ? '15px' : 0}}>
                                    <LinkThumbnail {...props} pageName={pageName} data={tabs[tabName][pageName]} />
                                </Col>
                            ))}
                        </Row>
                    </Card.Body>
                </Card>
            ))}
        </>
    );
};

export default Home;
