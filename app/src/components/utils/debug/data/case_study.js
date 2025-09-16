const caseStudy = {
    key: 'test_case_study',
    name: 'Test Case    Study',
    currency: 'dollar',
    financials: {
        max_shares_issue: 450000,
        dividend_rate: 3.20,
        max_debt_borrow: 1000000,
        interest_rate: 11.4,
    },
    company: {
        name: "Super Mobile Ltd",
        headquarter: "Mumbai",
        description: "Revolutionizing the way we communicate, our company offers cutting-edge technology solutions for businesses worldwide. Our expert team is dedicated to delivering exceptional customer service and innovative strategies to help our clients stay ahead of the curve.",
        objective: "As our new CEO, your objective is to drive growth and profitability while maintaining our commitment to innovation and customer satisfaction. We are confident in your ability to lead the company towards continued success and look forward to seeing your vision come to fruition.",
        industry: "Phone Manufacturing",
        welcome: "Welcome to Super Mobile Ltd!",
        logo: "data/case_studies/test_case_study/images/random_logo_1.png"
    },
    officer: {
        name: "Celina Diaz",
        title: "Chairperson",
        image: "data/case_studies/test_case_study/images/profile_image.png"
    },
    market: {
        segments: {
            upper: {
                name: "Affluent",
                description: "Affluents want to go for the best gadget in the market. Typically people who would buy the latest flagship phone. They do not mind paying if the phone meets their need.",
                price: 1000,
                size: 100000
            },
            middle: {
                name: "Aspirational",
                description: "Aspirationals opt for mid-range handsets that promise to deliver high performance but are still affordable. Many value seekers have had experience of using smartphone before and wish to upgrade.",
                price: 800,
                size: 1000000
            },
            lower: {
                name: "Budget Conscious",
                description: "Budget Conscious people do not want to overspend on devices and a basic configuration is enough for their needs. For a lot of these people this is their first smartphone.",
                price: 500,
                size: 200000
            },
        },
        channels: [
            {
                idx: 0,
                name: "Online Stores",
                description: "They comprise of nationalized retail chains and online channels. While our current sales through this channel are not very high, market indicates that more and more customers are moving towards this channel.",
            },
            {
                idx: 1,
                name: "Retail Stores",
                description: "Value-seekers and Affluents are known to prefer this channel, primarily because of a better and customized shopping experience.",
            },
            {
                idx: 2,
                name: "Distributors",
                description: "Reports show that the Conservatives segment has an inclination towards this channel owing to the perception of getting extra discounts as compared to the company owned stores.",
            }
        ],
    },
    product: {
        type: "Mobile Phone",
        overhead_cost: 2000,
        cost: 'fn:product_cost',
        margin: 'fn:margin',
        margin_pct: 'fn:margin_pct',
        unitSingle: 'phone',
        unitPlural: 'phones',
        variants: [
            {
                name: "Nextus 9",
                target: "Affluent",
                idx: 2
            },
            {
                name: "Nextus 7",
                target: "Budget Conscious",
                idx: 0
            },
            {
                name: "Nextus 8",
                target: "Aspirational",
                idx: 1
            }
        ],
        specs: [
            {
                feature: "Memory",
                idx: 0,
                values: [
                    {
                        value: "1GB",
                        cost: 100,
                        weight: 20,
                        idx: 0
                    },
                    {
                        value: "4GB",
                        cost: 180,
                        weight: 90,
                        idx: 2
                    },
                    {
                        value: "2GB",
                        cost: 150,
                        weight: 50,
                        idx: 1
                    },
                    
                ],
            },
            {
                feature: "Camera",
                idx: 1,
                values: [
                    {
                        value: "4MP",
                        cost: 100,
                        weight: 20,
                        idx: 0
                    },
                    {
                        value: "8MP",
                        cost: 150,
                        weight: 50,
                        idx: 1
                    },
                    {
                        value: "16MP",
                        cost: 180,
                        weight: 90,
                        idx: 2
                    }
                ],
            },
            {
                feature: "Screen Size",
                idx: 2,
                values: [
                    {
                        value: '5"',
                        cost: 100,
                        weight: 20,
                        idx: 0
                    },
                    {
                        value: '7"',
                        cost: 150,
                        weight: 50,
                        idx: 1
                    },
                    {
                        value: '9"',
                        cost: 180,
                        weight: 90,
                        idx: 2
                    }
                ],
            },
        ],
    },
    vars: {
        innovation_impact_factor: 2000,
        training_impact_factor: 3000
    },
    exp: {
        innovation_impact: '($innovation_budget/(caseStudy.vars.innovation_impact_factor*gameData.financials.planned_workforce)).toFixed(2)',
        training_impact: '($training_budget/(caseStudy.vars.training_impact_factor*gameData.financials.planned_workforce)).toFixed(2)',
    },
    quarters: {
        labels: {
            '0': 'Q4-LY',
            '1': 'Q1',
            '2': 'Q2',
            '3': 'Q3',
            '4': 'Q4'
        },
        demandMessagesUp: {
            '0': {
                title: 'Selfie Mania!', 
                text: [
                    'A couple of govt. initiatives have really pushed up the demand. Reduction in tax slabs has left people with more disposable income to spend and purchase goods. The demand for consumer goods is expected to go up.',
                    'People have started shifting towards bigger devices with better cameras. Due to the rise of digitized content, no amount of memory (storage) seems to be sufficient!'
                ]
            },
            '1': {
                title: 'Selfie Mania!', 
                text: [
                    'A couple of govt. initiatives have really pushed up the demand. Reduction in tax slabs has left people with more disposable income to spend and purchase goods. The demand for consumer goods is expected to go up.',
                    'People have started shifting towards bigger devices with better cameras. Due to the rise of digitized content, no amount of memory (storage) seems to be sufficient!'
                ]
            },
            '2': {
                title: 'Selfie Mania!', 
                text: [
                    'A couple of govt. initiatives have really pushed up the demand. Reduction in tax slabs has left people with more disposable income to spend and purchase goods. The demand for consumer goods is expected to go up.',
                    'People have started shifting towards bigger devices with better cameras. Due to the rise of digitized content, no amount of memory (storage) seems to be sufficient!'
                ]
            },
            '3': {
                title: 'Selfie Mania!', 
                text: [
                    'A couple of govt. initiatives have really pushed up the demand. Reduction in tax slabs has left people with more disposable income to spend and purchase goods. The demand for consumer goods is expected to go up.',
                    'People have started shifting towards bigger devices with better cameras. Due to the rise of digitized content, no amount of memory (storage) seems to be sufficient!'
                ]
            },
            '4': {
                title: 'Selfie Mania!', 
                text: [
                    'A couple of govt. initiatives have really pushed up the demand. Reduction in tax slabs has left people with more disposable income to spend and purchase goods. The demand for consumer goods is expected to go up.',
                    'People have started shifting towards bigger devices with better cameras. Due to the rise of digitized content, no amount of memory (storage) seems to be sufficient!'
                ]
            },
        },
        demandMessagesDown: {
            '0': {
                title: 'Economic Downturn!', 
                text: [
                    'Recent tax increases and higher inflation have really hit the consumers hard. This has lead to reduced sales of luxury items and electronic devices.',
                    'There is reduced demand for new phones in the market as people are wary of switching due to current market situation.'
                ]
            },
            '1': {
                title: 'Economic Downturn!', 
                text: [
                    'Recent tax increases and higher inflation have really hit the consumers hard. This has lead to reduced sales of luxury items and electronic devices.',
                    'There is reduced demand for new phones in the market as people are wary of switching due to current market situation.'
                ]
            },
            '2': {
                title: 'Economic Downturn!', 
                text: [
                    'Recent tax increases and higher inflation have really hit the consumers hard. This has lead to reduced sales of luxury items and electronic devices.',
                    'There is reduced demand for new phones in the market as people are wary of switching due to current market situation.'
                ]
            },
            '3': {
                title: 'Economic Downturn!', 
                text: [
                    'Recent tax increases and higher inflation have really hit the consumers hard. This has lead to reduced sales of luxury items and electronic devices.',
                    'There is reduced demand for new phones in the market as people are wary of switching due to current market situation.'
                ]
            },
            '4': {
                title: 'Economic Downturn!', 
                text: [
                    'Recent tax increases and higher inflation have really hit the consumers hard. This has lead to reduced sales of luxury items and electronic devices.',
                    'There is reduced demand for new phones in the market as people are wary of switching due to current market situation.'
                ]
            },
        }
    },
    labels: {
        unitsSold: 'Phones Sold',

    },
    special_projects: {
        integrated_it_systems: {
            key: 'integrated_it_systems',
            name: 'Integrated IT System',
            image: 'case_studies/test_case_study/images/pexels-miguel-a-padrinan-343457.jpg',
            description: 'Investing in this project helps you integrate all processes and link them under one system. Departments can connect better and information is seemingly available without much loss.',
            options: {
                invest: {
                    label: 'Invest',
                    investment: 7000000,
                    failure_risk: 20,
                    impact: [{
                        value: 'decrease',
                        label: 'Material Cost',
                        min: 2,
                        max: 3
                    },
                    {
                        value: 'increase',
                        label: 'Customer Service Level',
                        min: 5,
                        max: 7
                    },
                    {
                        value: 'increase',
                        lable: 'Productivity',
                        min: 3,
                        max: 5
                    }]
                },
            },
        },
        lens_technology: {
            key: 'lens_technology',
            name: 'Lens Technology',
            image: 'case_studies/test_case_study/images/pexels-steve-johnson-1050558.jpg',
            description: 'Investing in this project helps you to design devices with bigger screen size and retina displays. You can either invest in research for minor Product Upgrade or for Cutting-edge Technology. The cost, risk and rewards vary depending on the kind of research you conduct.',
            options: {
                minor: {
                    idx: 0,
                    label: 'Minor Investment',
                    investment: 10000000,
                    failure_risk: 20,
                    impact: [{
                        value: 'increase',
                        label: 'Demand',
                        min: 3,
                        max: 5
                    },
                    {
                        value: 'increase',
                        label: 'Product Cost',
                        min: 3,
                        max: 5
                    }]
                },
                major: {
                    idx: 1,
                    label: 'Major Investment',
                    investment: 30000000,
                    failure_risk: 35,
                    impact: [{
                        value: 'increase',
                        label: 'Demand',
                        min: 5,
                        max: 7
                    },
                    {
                        value: 'increase',
                        label: 'Product Cost',
                        min: 7,
                        max: 9
                    }]
                },
            },
        }
    },

    _themeOverrides: {
    },

    _functionOverrides: {
        /*
        example': 'function (user, caseStudy, gameData, value) {
            do processing
            return value',
        }
        */
    },

    _formatOverrides: {
        /*
        example': 'function (user, caseStudy, gameData, value) {
            do processing
            return value',
        }
        */
    },
    
    _hookOverrides: {
        /*
        example': 'function (user, caseStudy, gameData, data) {
            do processing
            return data',
        }
        */
    },

    progressBarColors: {
        '0': 'danger',
        '33': 'warning',
        '75': 'success'
    },

    kpmMessages: {
        stock_price: {
            '0': "The stock is underperforming. You need to take decisions to improve its performance.",
            '33': "Average performing stock. Investors are not yet convinced about the company's potential.",
            '75': "The stock is doing well. Keep it up!"
        },
        profits: {
            '0': "Profits are low - message.",
            '33': "Average profits - message.",
            '75': "Your profits are good. Keep it up!"
        },
        marketShare: {
            '0': "Low value message.",
            '33': "Average value message.",
            '75': "Good value message!"
        },
        customerService: {
            '0': "Low value message.",
            '33': "Average value message.",
            '75': "Good value message!"
        },
        utilization: {
            '0': "Low value message.",
            '33': "Average value message.",
            '75': "Good value message!"
        },
        fulfilment: {
            '0': "Low value message.",
            '33': "Average value message.",
            '75': "Good value message!"
        },
        continuousImprovement: {
            '0': "Low value message.",
            '33': "Average value message.",
            '75': "Good value message!"
        },
        innovation: {
            '0': "Low value message.",
            '33': "Average value message.",
            '75': "Good value message!"
        },
    },
    kpmIcons: {
        '0': 'danger',
        '33': 'warning',
        '75': 'success'
    }
};

export default caseStudy;