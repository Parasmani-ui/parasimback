const gameState = {
    demand: {
        'Affluent': [ 8000, 9000 ],
        'Aspirational': [ 10000, 11000 ],
        'Budget Conscious': [ 18000, 19000 ],
    },
    production: {
        'Affluent': [ 8000, 9000 ],
        'Aspirational': [ 10000, 11000 ],
        'Budget Conscious': [ 18000, 19000 ],
    },
    sales: {
        'Affluent': [ 8000, 9000 ],
        'Aspirational': [ 10000, 11000 ],
        'Budget Conscious': [ 18000, 19000 ],
    },
    teams:{
        'Delhi Capitals': {
            name: 'Delhi Capitals',
            rank: 6,
            score: 64,
            unitsSold: 1500,
            revenue: 1804349,
            profit: 256721,
            color: '#135689',
            capacity: 30000,
            // the products are only used for display in competition page
            // the keys and values here should be fully formatted for purpose of display
            // as this would be done via batch job this can be done easily
            // once set for each quarter these values are only displayed in 1 place and not used in any other way 
            // so batch job can make the key proper label and value even an HTML with styles included
            // same strategy can be used for all display only items which are only updated by batch job
            products: {
                '0': {
                'Nextus 9': {
                    target: 'Affluent',
                    shareVolume: '2.5%',
                    shareValue: '2.5%',
                    actualProduction: '1,735',
                    desiredProduction: '1,845',
                    actualSales: '1,534',
                    potentialSales: '1,735',
                    price: '24,000',
                    'Memory': '2GB',
                    'Camera': '8MP',
                    'Screen Size': '7"'
                },
                'Nextus 8': {
                    target: 'Affluent',
                    shareVolume: '2.5%',
                    shareValue: '2.5%',
                    actualProduction: '1,735',
                    desiredProduction: '1,845',
                    actualSales: '1,534',
                    potentialSales: '1,735',
                    price: '24,000',
                    'Memory': '2GB',
                    'Camera': '8MP',
                    'Screen Size': '7"'
                },
                'Nextus 7': {
                    target: 'Affluent',
                    shareVolume: '2.5%',
                    shareValue: '2.5%',
                    actualProduction: '1,735',
                    desiredProduction: '1,845',
                    actualSales: '1,534',
                    potentialSales: '1,735',
                    price: '24,000',
                    'Memory': '2GB',
                    'Camera': '8MP',
                    'Screen Size': '7"'
                }
            },
            '1': {
                'Nextus 9': {
                    target: 'Affluent',
                    shareVolume: '2.5%',
                    shareValue: '2.5%',
                    actualProduction: '1,735',
                    desiredProduction: '1,845',
                    actualSales: '1,534',
                    potentialSales: '1,735',
                    price: '24,000',
                    'Memory': '2GB',
                    'Camera': '8MP',
                    'Screen Size': '7"'
                },
                'Nextus 8': {
                    target: 'Affluent',
                    shareVolume: '2.5%',
                    shareValue: '2.5%',
                    actualProduction: '1,735',
                    desiredProduction: '1,845',
                    actualSales: '1,534',
                    potentialSales: '1,735',
                    price: '24,000',
                    'Memory': '2GB',
                    'Camera': '8MP',
                    'Screen Size': '7"'
                },
                'Nextus 7': {
                    target: 'Affluent',
                    shareVolume: '2.5%',
                    shareValue: '2.5%',
                    actualProduction: '1,735',
                    desiredProduction: '1,845',
                    actualSales: '1,534',
                    potentialSales: '1,735',
                    price: '24,000',
                    'Memory': '2GB',
                    'Camera': '8MP',
                    'Screen Size': '7"'
                }
            }
            }
        },
        'CSK': {
            name: 'CSK',
            rank: 5,
            score: 73,
            unitsSold: 1000,
            revenue: 1404249,
            profit: 356721,
            color: '#564798',
            capacity: 31000,
            products: {
                '0': {
                'Nextus 9': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 26000,
                    'Memory': '4GB',
                    'Camera': '16MP',
                    'Screen Size': '9"'
                },
                'Nextus 8': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '2GB',
                    'Camera': '8MP',
                    'Screen Size': '7"'
                },
                'Nextus 7': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '1GB',
                    'Camera': '4MP',
                    'Screen Size': '5"'
                }
            },
            '1': {
                'Nextus 9': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '2GB',
                    'Camera': '8MP',
                    'Screen Size': '7"'
                },
                'Nextus 8': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '2GB',
                    'Camera': '8MP',
                    'Screen Size': '7"'
                },
                'Nextus 7': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '1GB',
                    'Camera': '4MP',
                    'Screen Size': '5"'
                }
            }
            }
        },
        'Mumbai Indians': {
            name: 'Mumbai Indians',
            rank: 4,
            score: 75,
            unitsSold: 1500,
            revenue: 2807349,
            profit: 236729,
            color: '#477232',
            capacity: 32000,
            products: {
                '0': {
                'Nextus 9': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 26000,
                    'Memory': '4GB',
                    'Camera': '16MP',
                    'Screen Size': '9"'
                },
                'Nextus 8': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '2GB',
                    'Camera': '8MP',
                    'Screen Size': '7"'
                },
                'Nextus 7': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '1GB',
                    'Camera': '4MP',
                    'Screen Size': '5"'
                }
            },
            '1': {
                'Nextus 9': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 26000,
                    'Memory': '4GB',
                    'Camera': '16MP',
                    'Screen Size': '9"'
                },
                'Nextus 8': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '2GB',
                    'Camera': '8MP',
                    'Screen Size': '7"'
                },
                'Nextus 7': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '1GB',
                    'Camera': '4MP',
                    'Screen Size': '5"'
                }
            }
            }
        },
        'RCB': {
            name: 'RCB',
            rank: 3,
            score: 82,
            unitsSold: 1300,
            revenue: 1874349,
            profit: 256721,
            color: '#432313',
            capacity: 29000,
            products: {
                '0': {
                'Nextus 9': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 26000,
                    'Memory': '4GB',
                    'Camera': '16MP',
                    'Screen Size': '9"'
                },
                'Nextus 8': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '2GB',
                    'Camera': '8MP',
                    'Screen Size': '7"'
                },
                'Nextus 7': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '1GB',
                    'Camera': '4MP',
                    'Screen Size': '5"'
                }
            },
            '1': {
                'Nextus 9': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 26000,
                    'Memory': '4GB',
                    'Camera': '16MP',
                    'Screen Size': '9"'
                },
                'Nextus 8': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '2GB',
                    'Camera': '8MP',
                    'Screen Size': '7"'
                },
                'Nextus 7': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '1GB',
                    'Camera': '4MP',
                    'Screen Size': '5"'
                }
            }
            }
        },
        'NY Yankees': {
            name: 'NY Yankees',
            rank: 2,
            score: 89,
            unitsSold: 1500,
            revenue: 2304749,
            profit: 456721,
            color: '#527239',
            capacity: 28000,
            products: {
                '0': {
                'Nextus 9': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 26000,
                    'Memory': '4GB',
                    'Camera': '16MP',
                    'Screen Size': '9"'
                },
                'Nextus 8': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '2GB',
                    'Camera': '8MP',
                    'Screen Size': '7"'
                },
                'Nextus 7': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '1GB',
                    'Camera': '4MP',
                    'Screen Size': '5"'
                }
            },
            '1': {
                'Nextus 9': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 26000,
                    'Memory': '4GB',
                    'Camera': '16MP',
                    'Screen Size': '9"'
                },
                'Nextus 8': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '2GB',
                    'Camera': '8MP',
                    'Screen Size': '7"'
                },
                'Nextus 7': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '1GB',
                    'Camera': '4MP',
                    'Screen Size': '5"'
                }
            }
            }
        },
        'Rajasthan Royals': {
            name: 'Rajasthan Royals',
            rank: 1,
            score: 94,
            unitsSold: 1700,
            revenue: 2504349,
            profit: 556721,
            color: '#245704',
            capacity: 27000,
            products: {
                '0': {
                'Nextus 9': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 26000,
                    'Memory': '4GB',
                    'Camera': '16MP',
                    'Screen Size': '9"'
                },
                'Nextus 8': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '2GB',
                    'Camera': '8MP',
                    'Screen Size': '7"'
                },
                'Nextus 7': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '1GB',
                    'Camera': '4MP',
                    'Screen Size': '5"'
                }
            },
            '1': {
                'Nextus 9': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 26000,
                    'Memory': '4GB',
                    'Camera': '16MP',
                    'Screen Size': '9"'
                },
                'Nextus 8': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '2GB',
                    'Camera': '8MP',
                    'Screen Size': '7"'
                },
                'Nextus 7': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '1GB',
                    'Camera': '4MP',
                    'Screen Size': '5"'
                }
            }
            }
        },
        'Chicago Cubs': {
            name: 'Chicago Cubs',
            rank: 7,
            score: 62,
            unitsSold: 1100,
            revenue: 1304349,
            profit: 196721,
            color: '#56a2c4',
            capacity: 35000,
            products: {
                '0': {
                'Nextus 9': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 26000,
                    'Memory': '4GB',
                    'Camera': '16MP',
                    'Screen Size': '9"'
                },
                'Nextus 8': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '2GB',
                    'Camera': '8MP',
                    'Screen Size': '7"'
                },
                'Nextus 7': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '1GB',
                    'Camera': '4MP',
                    'Screen Size': '5"'
                }
            },
            '1': {
                'Nextus 9': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 26000,
                    'Memory': '4GB',
                    'Camera': '16MP',
                    'Screen Size': '9"'
                },
                'Nextus 8': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '2GB',
                    'Camera': '8MP',
                    'Screen Size': '7"'
                },
                'Nextus 7': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '1GB',
                    'Camera': '4MP',
                    'Screen Size': '5"'
                }
            }
            }
        },
        'East Bengal FC': {
            name: 'East Bengal FC',
            rank: 8,
            score: 59,
            unitsSold: 1000,
            revenue: 1204349,
            profit: 186721,
            color: '#f672d4',
            capacity: 25000,
            products: {
                '0': {
                'Nextus 9': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 26000,
                    'Memory': '4GB',
                    'Camera': '16MP',
                    'Screen Size': '9"'
                },
                'Nextus 8': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '2GB',
                    'Camera': '8MP',
                    'Screen Size': '7"'
                },
                'Nextus 7': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '1GB',
                    'Camera': '4MP',
                    'Screen Size': '5"'
                }
            },
            '1': {
                'Nextus 9': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 26000,
                    'Memory': '4GB',
                    'Camera': '16MP',
                    'Screen Size': '9"'
                },
                'Nextus 8': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '2GB',
                    'Camera': '8MP',
                    'Screen Size': '7"'
                },
                'Nextus 7': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '1GB',
                    'Camera': '4MP',
                    'Screen Size': '5"'
                }
            }
            }
        },
        'AC Milan': {
            name: 'AC Milan',
            rank: 9,
            score: 55,
            unitsSold: 900,
            revenue: 1104349,
            profit: 176721,
            color: '#167274',
            capacity: 33000,
            products: {
                '0': {
                'Nextus 9': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 26000,
                    'Memory': '4GB',
                    'Camera': '16MP',
                    'Screen Size': '9"'
                },
                'Nextus 8': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '2GB',
                    'Camera': '8MP',
                    'Screen Size': '7"'
                },
                'Nextus 7': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '1GB',
                    'Camera': '4MP',
                    'Screen Size': '5"'
                }
            },
            '1': {
                'Nextus 9': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 26000,
                    'Memory': '4GB',
                    'Camera': '16MP',
                    'Screen Size': '9"'
                },
                'Nextus 8': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '2GB',
                    'Camera': '8MP',
                    'Screen Size': '7"'
                },
                'Nextus 7': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '1GB',
                    'Camera': '4MP',
                    'Screen Size': '5"'
                }
            }
            }
        },
        'LA Lakers': {
            name: 'LA Lakers',
            rank: 10,
            score: 53,
            unitsSold: 800,
            revenue: 1004349,
            profit: 166721,
            color: '#592134',
            capacity: 32000,
            products: {
                '0': {
                'Nextus 9': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 26000,
                    'Memory': '4GB',
                    'Camera': '16MP',
                    'Screen Size': '9"'
                },
                'Nextus 8': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '2GB',
                    'Camera': '8MP',
                    'Screen Size': '7"'
                },
                'Nextus 7': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '1GB',
                    'Camera': '4MP',
                    'Screen Size': '5"'
                }
            },
            '1': {
                'Nextus 9': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 26000,
                    'Memory': '4GB',
                    'Camera': '16MP',
                    'Screen Size': '9"'
                },
                'Nextus 8': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '2GB',
                    'Camera': '8MP',
                    'Screen Size': '7"'
                },
                'Nextus 7': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '1GB',
                    'Camera': '4MP',
                    'Screen Size': '5"'
                }
            }
            }
        },
        'All Blacks': {
            name: 'All Blacks',
            rank: 11,
            score: 45,
            unitsSold: 700,
            revenue: 904349,
            profit: 156721,
            color: '#561234',
            capacity: 28000,
            products: {
                '0': {
                'Nextus 9': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 26000,
                    'Memory': '4GB',
                    'Camera': '16MP',
                    'Screen Size': '9"'
                },
                'Nextus 8': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '2GB',
                    'Camera': '8MP',
                    'Screen Size': '7"'
                },
                'Nextus 7': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '1GB',
                    'Camera': '4MP',
                    'Screen Size': '5"'
                }
            },
            '1': {
                'Nextus 9': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 26000,
                    'Memory': '4GB',
                    'Camera': '16MP',
                    'Screen Size': '9"'
                },
                'Nextus 8': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '2GB',
                    'Camera': '8MP',
                    'Screen Size': '7"'
                },
                'Nextus 7': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '1GB',
                    'Camera': '4MP',
                    'Screen Size': '5"'
                }
            }
            }
        },
        'KKR': {
            name: 'KKR',
            rank: 12,
            score: 39,
            unitsSold: 600,
            revenue: 804349,
            profit: 146721,
            color: '#123234',
            capacity: 33000,
            products: {
                '0': {
                'Nextus 9': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 26000,
                    'Memory': '4GB',
                    'Camera': '16MP',
                    'Screen Size': '9"'
                },
                'Nextus 8': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '2GB',
                    'Camera': '8MP',
                    'Screen Size': '7"'
                },
                'Nextus 7': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '1GB',
                    'Camera': '4MP',
                    'Screen Size': '5"'
                }
            },
            '1': {
                'Nextus 9': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 26000,
                    'Memory': '4GB',
                    'Camera': '16MP',
                    'Screen Size': '9"'
                },
                'Nextus 8': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '2GB',
                    'Camera': '8MP',
                    'Screen Size': '7"'
                },
                'Nextus 7': {
                    target: 'Affluent',
                    shareVolume: 2.5,
                    shareValue: 2.5,
                    actualProduction: 1735,
                    desiredProduction: 1845,
                    actualSales: 1534,
                    potentialSales: 1735,
                    price: 24000,
                    'Memory': '1GB',
                    'Camera': '4MP',
                    'Screen Size': '5"'
                }
            }
            }
        },
    },
};

export default gameState;
