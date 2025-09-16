import React from "react";
import { useState, useEffect } from 'react';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { oppositeColor } from '../utils/common';
import DistributionBar from '../utils/DistributionBar';
import Card from 'react-bootstrap/Card';
import Confirm from '../utils/Confirm';
import EditingToolbar from '../utils/EditingToolbar';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Icon from '../Icon.js';
import FormatData from '../FormatData';
import AutoSaveText from '../utils/AutoSaveText';
import AutoSaveInput from '../utils/AutoSaveInput';
import db from '../utils/db';
import ShowToast from '../utils/ShowToast';

Chart.register(ArcElement, Tooltip, Legend);

const SalesAndMarketing = (props) => {
    const caseStudy = props.caseStudy;
    const gameData = props.gameData;
    const channels = caseStudy.market.channels.sort((a, b) => { return a.idx - b.idx });
    const [editing, setEditing] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [products, setProducts] = useState(JSON.parse(JSON.stringify(props.mode == 'edit' ? caseStudy.products : gameData.products)).sort((a, b) => { return a.idx - b.idx }));
    const [distErrors, setDistErrors] = useState({});
    var color = '#FFFFFF';
    var backgroundColors = ['#FF0000', '#0000FF', '#00FF00'];

    useEffect(() => {
        if (props.mode == 'edit') {
            const errors = { ...distErrors };

            for (var i = 0; i < products.length; i++) {
                const product = products[i];
                var total = 0;
                for (var prop in product.channelDistribution) {
                    total += parseInt(product.channelDistribution[prop] || 0);
                }

                errors[i] = total != 100;
            }

            setDistErrors(errors);
        }
    }, []);

    if (caseStudy.distbar && caseStudy.distbar.color) {
        color = caseStudy.distbar.color;
    }

    if (props.mode != 'edit' && gameData.distbar && gameData.distbar.bgcolors) {
        color = gameData.distbar.color;
    }

    if (caseStudy.distbar && caseStudy.distbar.bgcolors) {
        backgroundColors = caseStudy.distbar.bgcolors;
    }

    if (props.mode != 'edit' && gameData.distbar && gameData.distbar.bgcolors) {
        backgroundColors = gameData.distbar.bgcolors;
    }

    products.sort((a, b) => { return a.idx - b.idx; });
    channels.sort((a, b) => { return a.idx - b.idx; });

    const handleInputChange = (event) => {
        const name = event.target.name;
        const value = parseInt(event.target.value || 0);
        const [idx, _name] = name.split('||');

        const _products = JSON.parse(JSON.stringify(products));
        _products[idx].marketing[_name] = value;

        setProducts(_products);
        setDirty(true);
    };

    const distInputChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        const [idx, _name] = name.split('||');

        const _products = JSON.parse(JSON.stringify(products));

        _products[idx].channelDistribution[_name] = value;

        setProducts(_products);
        setDirty(true);
    };

    const handleEditClick = (component) => {
        setEditing(true);
    };

    const handleSaveClick = async (component) => {
        for (var i = 0; i < products.length; i++) {
            const product = products[i];


            if (product.marketing.advertising_budget && !/^[0-9]+$/.test(product.marketing.advertising_budget.toString())) {
                ShowToast({ icon: 'danger', heading: 'Input Error', message: 'Advertising Budget for product ' + product.name + ' can only be a positive integer value.' });
                return;
            }

            if (product.marketing.promotions_budget && !/^[0-9]+$/.test(product.marketing.promotions_budget.toString())) {
                ShowToast({ icon: 'danger', heading: 'Input Error', message: 'Promotions Budget for product ' + product.name + ' can only be a positive integer value.' });
                return;
            }

            var total = 0;
            for (var prop in product.channelDistribution) {
                if (product.channelDistribution[prop] && !/^[0-9]+$/.test(product.channelDistribution[prop].toString())) {
                    ShowToast({ icon: 'danger', heading: 'Input Error', message: 'Distribution for ' + prop + ' for product ' + product.name + ' can only be a positive integer value.' });
                    return;
                }
                total += parseInt(product.channelDistribution[prop] || 0);
            }

            if (total != 100) {
                ShowToast({ icon: 'danger', heading: 'Distribution Total Error', message: 'Distribution total must be 100 for product ' + product.name });
                return;
            }
        }

        setDirty(false);
        setEditing(false);
        //await db.saveGameData(props, "products", products);

        gameData.products = JSON.parse(JSON.stringify(products));
        await props.updateGameData(gameData);
    };

    const handleCloseClick = (component) => {
        if (!dirty) {
            setEditing(false);
            return;
        }

        Confirm({
            body: <span>Do you want to stop editing? <br /> You would lose your unsaved changes.</span>,
            callback: () => {
                setEditing(false);
                setDirty(false);
                setProducts(JSON.parse(JSON.stringify(props.gameData.products)));
            },
            title: 'You have unsaved changes!',
            buttonText: 'Stop Editing'
        });
    };

    const distributionChanged = async (idx, obj) => {
        const channel = obj.saveKey.split('.').pop();
        const _products = JSON.parse(JSON.stringify(products));

        _products[idx].channelDistribution[channel] = obj.value;

        const distribution = _products[idx].channelDistribution;
        var total = 0;
        for (var prop in distribution) {
            total += parseInt(distribution[prop] || 0);
        }

        const errors = { ...distErrors };
        errors[idx] = total != 100;
        setDistErrors(errors);

        setProducts(_products);
        await db.saveCaseStudyData(props, "products", _products);
    };

    const saveColor = async (_color) => {
        props.mode == 'edit' ?
            await db.saveCaseStudyData(props, "distbar.color", _color) :
            await db.saveGameData(props, "distbar.color", _color);
    };

    const saveBGColor = async (idx, _color) => {
        backgroundColors[parseInt(idx)] = _color;
        props.mode == 'edit' ?
            await db.saveCaseStudyData(props, "distbar.bgcolors", backgroundColors) :
            await db.saveGameData(props, "distbar.bgcolors", backgroundColors);
    };

    const options = {
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    font: {
                        size: 10,
                    },
                },
            },
            tooltip: {
                enabled: true,
                callbacks: {
                    label: (context) => {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? Math.round(value / total * 100) : 0;
                        return `${label}: ${percentage}%`;
                    }
                }
            },
        },
    };

    const chartData = [];

    const _channels = {};
    channels.forEach((channel) => {
        _channels[channel.name] = channel;
        _channels[channel.name].border = oppositeColor(channel.color);
    });

    products.forEach((product) => {
        const _values = {};
        for (var name in _channels) {
            _channels[name].value = parseInt(product.channelDistribution[name] || 0);
        }

        const labels = Object.values(_channels).map(a => {return a.name});
        const values = Object.values(_channels).map(a => {return a.value});
        const _colors = Object.values(_channels).map(a => {return a.color});
        const _borders = Object.values(_channels).map(a => {return a.border});

        chartData.push({
            labels: labels,
            datasets: [
                {
                    label: 'Channel Distribution',
                    data: values,
                    backgroundColor: _colors,
                    borderColor: _borders,
                    borderWidth: 1,
                },
            ],
        });
    });

    return (
        <>
            <Card className="container-card">
                {props.mode != 'edit' &&
                    <EditingToolbar
                        editing={editing}
                        handleEditClick={handleEditClick}
                        handleSaveClick={handleSaveClick}
                        handleCloseClick={handleCloseClick}
                        style={{ position: 'absolute', height: '20px', top: '-43px', right: '109px' }}
                        readOnly={props.readOnly}
                    />
                }
                <Card.Body>
                    {products.map((product, idx) => (
                        <Card key={idx} style={{ height: '100%', marginTop: idx ? '15px' : 0 }}>
                            <Card.Header>
                                <span>{product.name}</span>
                                <span style={{display: 'inline-block', position: 'absolute', right: '15px'}}>Target: {product.target}</span>
                            </Card.Header>
                            <Card.Body>
                                <Row className={product.name}>
                                    <Col md={4} sm={12}>
                                        <Card style={{ height: '100%', backgroundColor: 'var(--subcard-background-color)' }}>
                                            <Card.Header>
                                                <AutoSaveText
                                                    saveKey="text.marketing_plan_heading"
                                                    text={caseStudy.text.marketing_plan_heading || 'Marketing Plan'}
                                                    {...props}
                                                />
                                            </Card.Header>
                                            <Card.Body>
                                                <Card.Text>
                                                    <AutoSaveText
                                                        saveKey="text.advertising_budget_heading"
                                                        text={caseStudy.text.advertising_budget_heading || 'Advertising Budget'}
                                                        {...props}
                                                    />
                                                </Card.Text>
                                                {props.mode == 'edit' &&
                                                    <AutoSaveInput
                                                        type="currency_int_pos"
                                                        saveKey="products.$[i].marketing.advertising_budget"
                                                        value={product.marketing.advertising_budget || ''}
                                                        filters={[{ "i.idx": idx }]}
                                                        {...props}
                                                    />
                                                }
                                                {!editing && props.mode != 'edit' &&
                                                    <Card.Text>
                                                        <FormatData
                                                            caseStudy={caseStudy}
                                                            format="price_int"
                                                            name="advertising_budget"
                                                            value={product.marketing.advertising_budget || '0'} />
                                                    </Card.Text>
                                                }
                                                {editing && props.mode != 'edit' &&
                                                    <InputGroup className="mb-3">
                                                        <InputGroup.Text id="advertising_budget">
                                                            <Icon name={caseStudy.currency} />
                                                        </InputGroup.Text>
                                                        <Form.Control
                                                            name={product.idx + '||advertising_budget'}
                                                            type="number"
                                                            value={product.marketing.advertising_budget || ''}
                                                            onChange={handleInputChange}
                                                        />
                                                    </InputGroup>
                                                }
                                                <Card.Text>
                                                    <AutoSaveText
                                                        saveKey="text.promotions_budget_heading"
                                                        text={caseStudy.text.promotions_budget_heading || 'Promotions Budget'}
                                                        {...props}
                                                    />
                                                </Card.Text>
                                                {props.mode == 'edit' &&
                                                    <AutoSaveInput
                                                        type="currency_int_pos"
                                                        saveKey="products.$[i].marketing.promotions_budget"
                                                        value={product.marketing.promotions_budget || ''}
                                                        filters={[{ "i.idx": idx }]}
                                                        {...props}
                                                    />
                                                }
                                                {!editing && props.mode != 'edit' &&
                                                    <Card.Text>
                                                        <FormatData
                                                            caseStudy={caseStudy}
                                                            format="price_int"
                                                            name="promotions_budget"
                                                            value={product.marketing.promotions_budget || '0'} />
                                                    </Card.Text>
                                                }
                                                {editing && props.mode != 'edit' &&
                                                    <InputGroup className="mb-3">
                                                        <InputGroup.Text id="promotions_budget"><Icon name={caseStudy.currency} /></InputGroup.Text>
                                                        <Form.Control 
                                                            name={product.idx + '||promotions_budget'} 
                                                            type="number" 
                                                            value={product.marketing.promotions_budget || ''} 
                                                            onChange={handleInputChange} 
                                                        />
                                                    </InputGroup>
                                                }
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col md={4} sm={12}>
                                        <Card style={{ height: '100%', backgroundColor: 'var(--subcard-background-color)' }}>
                                            <Card.Header>
                                                <AutoSaveText
                                                    saveKey="text.channel_distribution_heading"
                                                    text={caseStudy.text.channel_distribution_heading || 'Channel Distribution Ratio'}
                                                    {...props}
                                                />
                                            </Card.Header>
                                            <Card.Body>
                                                {channels.map((channel, cidx) => (
                                                    props.mode == 'edit' ?
                                                        <div key={cidx} style={{ marginTop: '5px' }}>
                                                            <div>{channel.name}</div>
                                                            <div>
                                                                <AutoSaveInput
                                                                    type="pct_int_pos"
                                                                    saveKey={'product.channelDistribution.' + channel.name}
                                                                    value={product.channelDistribution[channel.name] || ''}
                                                                    updateParent={async (obj) => { await distributionChanged(product.idx, obj) }}
                                                                    {...props}
                                                                />
                                                            </div>
                                                        </div>
                                                        :
                                                        <Row key={cidx} style={{ marginTop: '5px' }}>
                                                            <Col>{channel.name}</Col>
                                                            <Col>
                                                                {editing ?
                                                                    <Form.Control 
                                                                        name={product.idx + '||' + channel.name} 
                                                                        type="number" 
                                                                        value={product.channelDistribution[channel.name] || ''} 
                                                                        onChange={distInputChange} 
                                                                    />
                                                                    :
                                                                    <Card.Text>{product.channelDistribution[channel.name]} %</Card.Text>
                                                                }
                                                            </Col>
                                                        </Row>
                                                ))
                                                }
                                                {distErrors[idx] &&
                                                    <Card.Text style={{ color: 'red' }}>Total is not 100%</Card.Text>
                                                }
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col md={4} sm={12}>
                                        <Card style={{width: '100%', aspectRatio: 1}}>
                                        <Pie data={chartData[idx]} options={options} />
                                        </Card>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                    ))}
                </Card.Body>
            </Card>
            {props.mode == 'edit' &&
                <Card>
                    <Card.Header>
                        <AutoSaveText
                            saveKey="text.sales_admin_setup"
                            text={caseStudy.text.sales_admin_setup || 'Sales Admin Setup'}
                            {...props}
                        />
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col>
                                <AutoSaveText
                                    saveKey="text.marketing_cost_overhead_label"
                                    text={caseStudy.text.marketing_cost_overhead_label || 'Marketing Cost Overhead'}
                                    {...props}
                                />
                                <AutoSaveInput
                                    type="currency_int_pos"
                                    saveKey="financials.fixed_marketing_overhead_cost"
                                    value={caseStudy.financials.fixed_marketing_overhead_cost}
                                    {...props}
                                />
                            </Col>
                            <Col>
                                <AutoSaveText
                                    saveKey="text.fixed_promotion_cost_label"
                                    text={caseStudy.text.fixed_promotion_cost_label || 'Fixed Promotion Cost'}
                                    {...props}
                                />
                                <AutoSaveInput
                                    type="currency_int_pos"
                                    saveKey="financials.fixed_promotion_cost"
                                    value={caseStudy.financials.fixed_promotion_cost}
                                    {...props}
                                />
                            </Col>
                            <Col>
                                <AutoSaveText
                                    saveKey="text.fixed_advertising_cost_label"
                                    text={caseStudy.text.fixed_advertising_cost_label || 'Fixed Advertising Cost'}
                                    {...props}
                                />
                                <AutoSaveInput
                                    type="currency_int_pos"
                                    saveKey="financials.fixed_advertising_cost"
                                    value={caseStudy.financials.fixed_advertising_cost}
                                    {...props}
                                />
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            }
            <div style={{position: 'relative', padding: '20px', height: '80px', textAlign: 'center'}}>
            <EditingToolbar
                    editing={editing}
                    handleEditClick={handleEditClick}
                    handleSaveClick={handleSaveClick}
                    handleCloseClick={handleCloseClick}
                    style={{ position: 'absolute', height: '20px', right: props.mode == 'edit' ? 0 : '109px' }}
                    readOnly={props.readOnly}
                />
            </div>
        </>
    );
};

export default SalesAndMarketing;
