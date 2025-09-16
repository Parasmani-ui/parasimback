import React from "react";
import { useState, useEffect } from 'react';
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
import ChannelInventory from '../building_blocks/ChannelInventory';
import PlantCapacity from '../building_blocks/PlantCapacity';
import ShowToast from '../utils/ShowToast';
import db from '../utils/db';
import CallFunction from '../CallFunction';

const Manufacturing = (props) => {
    const gameData = props.gameData;
    const caseStudy = props.caseStudy;
    const financials = props.mode == 'edit' ? caseStudy.financials : gameData.financials;
    const plantOptions = caseStudy.plants.options;
    const [editing, setEditing] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [prodError, setProdError] = useState(false);

    const [products, setProducts] = useState(JSON.parse(JSON.stringify(props.mode == 'edit' ? caseStudy.products : gameData.products)).sort((a, b) => { return a.idx - b.idx }));
    const [selectedPlant, setSelectedPlant] = useState(gameData.selectedPlant || 'None');

    products.sort((a, b) => { return a.idx - b.idx; });

    const handleInputChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        const [idx, _name] = name.split('||');
        const _products = JSON.parse(JSON.stringify(products));
        _products[idx][_name] = value;
        setProducts(_products);
        setDirty(true);
    };

    const handleEditClick = (component) => {
        setEditing(true);
    };

    const handleSaveClick = async (component) => {
        const productManpower = parseFloat(caseStudy.product.product_manpower || 0);
        const _financials = { ...financials };
        var production = 0;

        const ideals = {};
        for (var i = 0; i < caseStudy.market.segments.length; i++) {
            const _segment = caseStudy.market.segments[i];
            ideals[_segment.name] = parseInt(_segment.ideal_price || 0);
        }

        for (var i = 0; i < products.length; i++) {
            const product = products[i];

            if (product.plannedProduction && !/^[0-9]+$/.test(product.plannedProduction.toString())) {
                ShowToast({ icon: 'danger', heading: 'Input Error', message: 'Planned Production for product ' + product.name + ' can only be a positive integer value.' });
                return;
            }

            if (product.salesPrice && !/^[0-9]+$/.test(product.salesPrice.toString())) {
                ShowToast({ icon: 'danger', heading: 'Input Error', message: 'Sales Price for product ' + product.name + ' can only be a positive integer value.' });
                return;
            }
            
            if (parseInt(product.salesPrice || 0) < parseInt(product.cost || 0)) {
                ShowToast({ icon: 'danger', heading: 'Input Error', message: 'Sales Price for product ' + product.name + ' can not be less than product cost.' });
                return;
            }

            if (parseInt(product.salesPrice || 0) > ideals[product.target] * 100) {
                ShowToast({ icon: 'danger', heading: 'Input Error', message: 'Sales Price for product ' + product.name + ' exceeds maximum price limit.' });
                return;
            }

            production += parseInt(product.plannedProduction || 0);
        }

        const productivityIncrease = 1 + (parseInt(financials.productivity_increase || 0) / 100 + parseInt(financials.productivity_impact || 0)) / 100;

        _financials.required_workforce = Math.ceil(production * productManpower / productivityIncrease);
        _financials.production = production;

        var _plant = null;
        for (var i = 0; i < plantOptions.length; i++) {
            if (plantOptions[i].label == selectedPlant) {
                _plant = plantOptions[i];
                break;
            }
        }

        const _capacity = parseInt(_financials.capacity || 0);// + (_plant ? parseInt(_plant.capacity || 0) : 0);
        _financials.utilisation = _capacity ? Math.round((_financials.production * 100 / _capacity) * 100) / 100 : 'NA';

        if (_financials.utilisation > 100) {
            ShowToast({ icon: 'danger', heading: 'Error in production vs capacity', message: 'The planned production exceeds capacity' });
            return;
        }

        setDirty(false);
        setEditing(false);

        gameData.financials = _financials;
        gameData.selectedPlant = selectedPlant;
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

    const plannedProductionUpdated = async (event) => {
        const productManpower = parseFloat(caseStudy.product.product_manpower || 0);
        var production = 0;
        products.forEach((product) => {
            production += event.filters[0]['i.idx'] == product.idx ? parseInt(event.value || 0) : parseInt(product.plannedProduction || 0);
        });

        const productivityIncrease = 1 + (parseInt(financials.productivity_increase || 0) / 100 + parseInt(financials.productivity_impact || 0)) / 100;

        financials.required_workforce = Math.ceil(production * productManpower / productivityIncrease);
        financials.production = production;

        var _plant = null;
        for (var i = 0; i < plantOptions.length; i++) {
            if (plantOptions[i].label == selectedPlant) {
                _plant = plantOptions[i];
                break;
            }
        }

        const _capacity = parseInt(financials.capacity || 0) + (_plant ? parseInt(_plant.capacity || 0) : 0);
        financials.utilisation = _capacity ? Math.round((financials.production * 100 / _capacity) * 100) / 100 : 'NA';

        const plantDepRate = parseFloat(caseStudy.financials.depreciation_rate_plant || 0);
        financials.current_depreciation_plant = Math.floor(parseInt(financials.investment_plant || 0) * plantDepRate / 100);

        if (financials.utilisation > 100) {
            ShowToast({ icon: 'danger', heading: 'Error in production vs capacity', message: 'The planned production exceeds capacity' });
            setProdError(true);
        }
        else {
            setProdError(false);
        }

        if (props.mode == 'edit') {
            const _prods = [...products];
            _prods[event.filters[0]['i.idx']].plannedProduction = event.value;

            const specs = {};
            caseStudy.product.specs.forEach((spec) => {
                specs[spec.feature] = { ...spec };
                const values = {};
                spec.values.forEach((val) => {
                    values[val.value] = val;
                });
                specs[spec.feature].values = values;
            });

            var revenue = 0;
            var unitsSold = 0;
            var materialCost = 0;
            _prods.forEach((prod) => {
                prod.revenue = parseInt(prod.unitsSold || 0) * parseInt(prod.salesPrice || 0);
                revenue += prod.revenue;
                unitsSold += parseInt(prod.unitsSold || 0);
                var productCost = parseInt(caseStudy.product.overhead_cost || 0);
                for (var prop in prod.specs) {
                    const feature = specs[prop];
                    if (!feature) {
                        continue;
                    }

                    const value = feature.values[prod.specs[prop]];
                    if (!value) {
                        continue;
                    }

                    productCost += parseInt(value.cost || 0);
                }
                prod.cost = productCost;
                materialCost += productCost * parseInt(prod.plannedProduction || 0);
            });

            financials.revenue = revenue;
            financials.unitsSold = unitsSold;
            financials.material_cost = materialCost;
            const taxRate = parseInt(financials.sales_tax_rate || 0);
            financials.sales_tax = Math.floor(revenue * taxRate / 100);

            setProducts(_prods);

            await db.saveCaseStudyData(props, "products", _prods, null, true);
            await db.saveCaseStudyData(props, "financials", financials, null, true);
        }
    };

    const updateRevenue = async (event) => {
        const idx = event.filters[0]['i.idx'];
        const value = parseInt(event.value || 0);
        const product = products[idx];

        const _prods = [...products];
        switch (event.saveKey) {
            case 'products.$[i].unitsSold':
                _prods[idx].unitsSold = value;
                break;

            case 'products.$[i].salesPrice':
                _prods[idx].salesPrice = value;
                break;
        }

        setProducts(_prods);

        if (props.mode == 'edit') {
            const specs = {};
            caseStudy.product.specs.forEach((spec) => {
                specs[spec.feature] = { ...spec };
                const values = {};
                spec.values.forEach((val) => {
                    values[val.value] = val;
                });
                specs[spec.feature].values = values;
            });

            var revenue = 0;
            var unitsSold = 0;
            var materialCost = 0;
            _prods.forEach((prod) => {
                prod.revenue = parseInt(prod.unitsSold || 0) * parseInt(prod.salesPrice || 0);
                revenue += prod.revenue;
                unitsSold += parseInt(prod.unitsSold || 0);
                var productCost = parseInt(caseStudy.product.overhead_cost || 0);
                for (var prop in prod.specs) {
                    const feature = specs[prop];
                    if (!feature) {
                        continue;
                    }

                    const value = feature.values[prod.specs[prop]];
                    if (!value) {
                        continue;
                    }

                    productCost += parseInt(value.cost || 0);
                }
                prod.cost = productCost;
                materialCost += productCost * parseInt(prod.plannedProduction || 0);
            });

            const financials = caseStudy.financials;

            financials.revenue = revenue;
            financials.unitsSold = unitsSold;
            financials.material_cost = materialCost;
            const taxRate = parseInt(financials.sales_tax_rate || 0);
            financials.sales_tax = Math.floor(revenue * taxRate / 100);

            setProducts(_prods);

            await db.saveCaseStudyData(props, "products", _prods, null, true);
            await db.saveCaseStudyData(props, "financials", financials, null, true);
            await props.updateData();
        }
    };

    const inventoryUpdated = async (idx, channelName, value) => {
        const _financials = { ...financials };
        const _prods = [...products];

        const specs = {};
        caseStudy.product.specs.forEach((spec) => {
            specs[spec.feature] = { ...spec };
            const values = {};
            spec.values.forEach((val) => {
                values[val.value] = val;
            });
            specs[spec.feature].values = values;
        });

        _prods[idx].channelInventory[channelName] = value;
        var inventory = 0;
        var materialCost = 0;
        var inventoryCost = 0;
        _prods.forEach((prod) => {
            prod.inventory = 0;
            for (var prop in prod.channelInventory) {
                prod.inventory += parseInt(prod.channelInventory[prop] || 0);
            }
            inventory += prod.inventory;

            var productCost = parseInt(caseStudy.product.overhead_cost || 0);
            for (var prop in prod.specs) {
                const feature = specs[prop];
                if (!feature) {
                    continue;
                }

                const value = feature.values[prod.specs[prop]];
                if (!value) {
                    continue;
                }

                productCost += parseInt(value.cost || 0);
            }
            prod.cost = productCost;
            materialCost += productCost * parseInt(prod.plannedProduction || 0);

            inventoryCost += prod.cost * parseInt(prod.inventory || 0);
        });

        _financials.material_cost = materialCost;
        _financials.inventory_cost = inventoryCost;
        _financials.change_in_inventory_cost = parseInt(_financials.opening_inventory_cost || 0) - _financials.inventory_cost;

        setProducts(_prods);
        await db.saveCaseStudyData(props, "products", _prods, null, true);
        await db.saveCaseStudyData(props, "financials", _financials, null, true);
        await props.updateData();
    };

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
                    <Card>
                        <Card.Header>
                            <AutoSaveText
                                saveKey="text.product_planning_label"
                                text={caseStudy.text.product_planning_label || 'Production Planning'}
                                {...props}
                            />
                        </Card.Header>
                        <Card.Body>
                            {products.map((product, idx) => (
                                <Card key={idx} className={product.name} style={{ backgroundColor: 'var(--subcard-background-color)', marginTop: idx ? '15px' : 0 }}>
                                    <Card.Header>{product.name}</Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col lg={4} md={6} sm={6}>
                                                <Card.Text>
                                                    <AutoSaveText
                                                        saveKey="text.revenue_label"
                                                        text={caseStudy.text.revenue_label || 'Revenue'}
                                                        {...props}
                                                    />
                                                </Card.Text>
                                                <FormatData
                                                    caseStudy={caseStudy}
                                                    format="price_int"
                                                    name="product_revenue"
                                                    value={product.revenue}
                                                />
                                            </Col>
                                            <Col lg={4} md={6} sm={6}>
                                                <Card.Text>
                                                    <AutoSaveText
                                                        saveKey="text.cost_label"
                                                        text={caseStudy.text.cost_label || 'Cost'}
                                                        {...props}
                                                    />
                                                </Card.Text>
                                                <FormatData
                                                    caseStudy={caseStudy}
                                                    format="price_int"
                                                    name="product_cost"
                                                    value={product.cost}
                                                />
                                            </Col>
                                            <Col lg={4} md={6} sm={6}>
                                                <Card.Text>
                                                    <AutoSaveText
                                                        saveKey="text.mrp_label"
                                                        text={caseStudy.text.mrp_label || 'MRP'}
                                                        {...props}
                                                    />
                                                    &nbsp;*
                                                </Card.Text>
                                                {props.mode == 'edit' &&
                                                    <AutoSaveInput
                                                        type="currency_int_pos"
                                                        saveKey="products.$[i].salesPrice"
                                                        value={product.salesPrice}
                                                        filters={[{ "i.idx": idx }]}
                                                        updateParent={updateRevenue}
                                                        {...props}
                                                    />
                                                }
                                                {!editing && props.mode != 'edit' &&
                                                    <FormatData
                                                        caseStudy={caseStudy}
                                                        format="price_int"
                                                        name="product_price"
                                                        value={product.salesPrice}
                                                    />
                                                }
                                                {editing && props.mode != 'edit' &&
                                                    <InputGroup className="mb-3">
                                                        <InputGroup.Text id="product_price"><Icon name={caseStudy.currency} /></InputGroup.Text>
                                                        <Form.Control 
                                                            name={product.idx + '||salesPrice'} 
                                                            value={product.salesPrice} 
                                                            onChange={handleInputChange} 
                                                        />
                                                    </InputGroup>
                                                }
                                            </Col>
                                        </Row>
                                        <Row style={{ marginTop: '20px' }}>
                                            <Col lg={4} md={6} sm={6}>
                                                <Card.Text>
                                                    <AutoSaveText
                                                        saveKey="text.inventory_label"
                                                        text={caseStudy.text.inventory_label || 'Inventory'}
                                                        {...props}
                                                    />
                                                </Card.Text>
                                                <FormatData
                                                    caseStudy={caseStudy}
                                                    format="thousands_indicator_int"
                                                    name="inventory"
                                                    value={product.inventory}
                                                />
                                            </Col>
                                            <Col lg={4} md={6} sm={6}>
                                                <Card.Text>
                                                    <AutoSaveText
                                                        saveKey="text.sales_label"
                                                        text={caseStudy.text.sales_label || 'Units Sold'}
                                                        {...props}
                                                    />
                                                </Card.Text>
                                                {props.mode == 'edit' ?
                                                    <AutoSaveInput
                                                        type="int_pos"
                                                        saveKey="products.$[i].unitsSold"
                                                        value={product.unitsSold}
                                                        filters={[{ "i.idx": idx }]}
                                                        updateParent={updateRevenue}
                                                        {...props}
                                                    />
                                                    :
                                                    <FormatData
                                                        caseStudy={caseStudy}
                                                        format="thousands_indicator_int"
                                                        name="unitsSold"
                                                        value={product.unitsSold}
                                                    />
                                                }
                                            </Col>
                                            <Col lg={4} md={6} sm={6}>
                                                <Card.Text>
                                                    <AutoSaveText
                                                        saveKey="text.planned_production_label"
                                                        text={caseStudy.text.planned_production_label || 'Planned Production'}
                                                        {...props}
                                                    />
                                                    &nbsp;*
                                                </Card.Text>
                                                {props.mode == 'edit' &&
                                                    <AutoSaveInput
                                                        type="int_pos"
                                                        saveKey="products.$[i].plannedProduction"
                                                        value={product.plannedProduction}
                                                        filters={[{ "i.idx": idx }]}
                                                        updateParent={plannedProductionUpdated}
                                                        {...props}
                                                    />
                                                }
                                                {!editing && props.mode != 'edit' &&
                                                    <FormatData
                                                        caseStudy={caseStudy}
                                                        format="thousands_indicator_int"
                                                        name="plannedProduction"
                                                        value={product.plannedProduction}
                                                    />
                                                }
                                                {editing && props.mode != 'edit' &&
                                                    <Form.Control 
                                                        name={product.idx + '||plannedProduction'} 
                                                        type="number" 
                                                        value={product.plannedProduction} 
                                                        onChange={handleInputChange} 
                                                    />
                                                }
                                                {prodError &&
                                                    <span style={{ color: 'red' }}>Planned production exceeds capacity</span>
                                                }
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            ))}
                        </Card.Body>
                    </Card>
                    <div style={{ height: '15px' }}></div>
                    <ChannelInventory inventoryUpdated={inventoryUpdated} {...props} />
                    <div style={{ height: '15px' }}></div>
                    <PlantCapacity selectedPlant={selectedPlant} setSelectedPlant={setSelectedPlant} editing={editing} {...props} />
                </Card.Body>
            </Card>
            <div style={{ position: 'relative', padding: '20px', height: '80px', textAlign: 'center' }}>
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

export default Manufacturing;
