import React from "react";
import { useState, useEffect, useRef } from 'react';
import Container from 'react-bootstrap/Container';
import Select from 'react-select';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Confirm from '../utils/Confirm';
import EditingToolbar from '../utils/EditingToolbar';
import AutoSaveInput from "../utils/AutoSaveInput";
import EditableListRowToolbar from '../utils/EditableListRowToolbar';
import EditableListColToolbar from '../utils/EditableListColToolbar';
import AutoSaveText from '../utils/AutoSaveText';
import { uuid, randomColor, compareObjects } from '../utils/common';
import FormatData from '../FormatData';
import CallFunction from '../CallFunction';
import { post } from '../utils/ServerCall';
import ShowToast from '../utils/ShowToast';
import db from '../utils/db';
import Icon from '../Icon';

const UserProducts = (props) => {
    const gameData = props.gameData;
    const caseStudy = props.caseStudy;
    const specs = caseStudy.product.specs;
    const fixedProducts = caseStudy.products.length;
    const [products, setProducts] = (useState(props.mode == 'edit' ? [...caseStudy.products] : [...props.gameData.products])).sort((a, b) => { return a.idx - b.idx });
    const [editing, setEditing] = useState(false);
    //const [dirty, setDirty] = useState(false);

    // when SingleProduct calls setDirty it changes the state and the fields are redrawn so they lose focus after first character
    /*
    const setDirty = (flag) => {
        dirty = flag;
    };
    */
    //specs.sort((a, b) => { return a.idx - b.idx; });

    const templateProduct = { ...caseStudy.products[0] };
    templateProduct.color = randomColor();
    templateProduct.name = 'Product Name';
    templateProduct.idx = 0;

    const templateSpecs = {
        feature: "Feature",
        idx: 0,
        values: [
            {
                value: "",
                cost: 0,
                weight: 0,
                idx: 0
            }
        ]
    };

    products.sort((a, b) => { return a.idx - b.idx; });

    const handleEditClick = (component) => {
        setEditing(true);
    };

    const handleSaveClick = async (component) => {
        if (props.mode == 'edit') {
            await db.saveCaseStudyData(props, "products", caseStudy.products);
            setEditing(false);
            return;
        }

        const ideals = {};
        for (var i = 0; i < caseStudy.market.segments.length; i++) {
            const _segment = caseStudy.market.segments[i];
            ideals[_segment.name] = parseInt(_segment.ideal_price || 0);
        }

        for (var i = 0; i < products.length; i++) {
            const product = products[i];

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
        }

        const list = [...products];

        setProducts(list);
        //setDirty(false);
        setEditing(false);
        gameData.products = list;
        await props.updateGameData(gameData);
    };

    const handleCloseClick = (component) => {
        const same = compareObjects(products, props.gameData.products);

        // compareObjects not working as of now - leave it like this and focus on other things first
        if (!same) {
            Confirm({
                body: <span>Do you want to stop editing? <br /> You would lose your unsaved changes.</span>,
                callback: () => {
                    setEditing(false);
                    //setDirty(false);
                    setProducts(props.mode == 'edit' ? [...caseStudy.products] : [...props.gameData.products]);
                },
                title: 'You have unsaved changes!',
                buttonText: 'Stop Editing'
            });
        }
        else {
            setEditing(false);
        }
    };

    const saveSpecs = async () => {
        const specs = {};
        caseStudy.product.specs.forEach((spec) => {
            specs[spec.feature] = { ...spec };
            const values = {};
            spec.values.forEach((val) => {
                values[val.value] = val;
            });
            specs[spec.feature].values = values;
        });

        caseStudy.products.forEach((prod) => {
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
        });
        await db.saveCaseStudyData(props, "product.specs", caseStudy.product.specs, null, true);
        await db.saveCaseStudyData(props, "products", caseStudy.products);
    };

    const listChanged = async (list) => {
        caseStudy.products.map((_prod) => {
            const prev = _prod.specs;
            const updated = {};
            list.map((spec) => {
                updated[spec.feature] = prev[spec.feature] || '';
            });
            _prod.specs = updated;
        });

        caseStudy.specs = list;
        await saveSpecs();
    }

    const specNameChanged = async (idx, name) => {
        caseStudy.product.specs[idx].feature = name;
        await listChanged(caseStudy.product.specs);
    };

    const specCostChanged = async (fidx, vidx, cost) => {
        caseStudy.product.specs[fidx].values[vidx].cost = cost;
        await listChanged(caseStudy.product.specs);
    };

    const updateCaseStudy = async (event) => {
        switch (event.saveKey) {
            case 'product.product_manpower':
                const value = parseFloat(event.value || 0);
                var production = 0;
                products.forEach((product) => {
                    production += parseInt(product.plannedProduction || 0);
                });
                const manpower = Math.ceil(production * value);
                await db.saveCaseStudyData(props, "financials.required_workforce", manpower, null, true);
                await props.updateData();
                break;
        }
    };

    const updateProducts = () => {
        setProducts([...products]);
    };

    const toolbarStyle = {
        display: 'flex',
        position: 'absolute',
        right: '190px',
        top: '-24px',
        textAlign: 'right',
        zIndex: 1
    };

    const userProductAdd = () => {
        if (products.length >= 6) {
            ShowToast({icon: 'danger', heading: 'Cannot add product', message: 'Maximum of 6 products are allowed'});
            return;
        }
        const _products = [...products];
        const newProduct = JSON.parse(JSON.stringify(_products[0]));
        newProduct.color = randomColor();
        newProduct.name = 'Product ' + (_products.length + 1);
        newProduct.idx = _products.length;
        newProduct.unitsSold = 0;
        newProduct.inventory = 0;
        newProduct.revenue = 0;
        newProduct.marketShare = 0;
        newProduct.revenueShare = 0;
        newProduct.marketShareSegment = 0;
        newProduct.revenueShareSegment = 0;
        newProduct.plannedProduction = 0;
        newProduct.actualProduction = 0;
        for (var prop in newProduct.channelInventory) {
            newProduct.channelInventory[prop] = 0;
        }
        //newProduct.specs = {..._products[0].specs};
        _products.push(newProduct);
        setProducts(_products);
    };

    const userProductDelete = (idx) => {
        const _products = [...products];
        const list = [];
        for (var i = 0; i < _products.length; i++) {
            if (_products[i].idx == idx) {
                continue;
            }
            list.push(_products[i]);
        }

        for (var i = fixedProducts; i < list.length; i++) {
            list[i].idx = i;
        }
        setProducts(list);
    };

    return (
        <>
            <Card className="container-card">
                <EditableListRowToolbar
                    template={templateProduct}
                    saveKey="products"
                    list={caseStudy.products}
                    toolbarStyle={{ top: '-35px', right: '210px' }}
                    {...props}
                />
                {props.mode != 'edit' && editing && caseStudy.product.allowAdd && props.selectedGame && props.selectedGame.allowProductAdd &&
                    <span className='editable_wrapper product_add_toolbar' style={{ position: 'relative', display: 'block' }} >
                        <span className="toolbar" style={{
                            display: 'flex',
                            position: 'absolute',
                            right: '5px',
                            top: '5px',
                            textAlign: 'right',
                            zIndex: 1
                        }}>
                            <span className="toolbar_button product_add_button" onClick={userProductAdd} ><Icon name="add" /></span>
                        </span>
                    </span>
                }
                <EditingToolbar
                    editing={editing}
                    handleEditClick={handleEditClick}
                    handleSaveClick={handleSaveClick}
                    handleCloseClick={handleCloseClick}
                    style={{ position: 'absolute', height: '20px', top: '-43px', right: props.mode == 'edit' ? 0 : '109px' }}
                    readOnly={props.readOnly}
                />
                
                <Card.Body>
                    <Row>
                        {props.mode != 'edit' && products.map((product, idx) => (
                            <Col lg={4} md={6} sm={12} key={uuid() + idx}>
                                <SingleProduct
                                    product={product}
                                    editing={editing}
                                    products={products}
                                    userProductDelete={userProductDelete}
                                    updateProducts={updateProducts}
                                    {...props}
                                />
                            </Col>
                        ))}
                        {props.mode == 'edit' && caseStudy.products.map((product, idx) => (
                            <Col lg={4} md={6} sm={12} key={uuid() + idx}>
                                <EditableListColToolbar
                                    saveKey="products"
                                    list={caseStudy.products}
                                    idx={product.idx}
                                    toolbarStyle={{ top: '7px', right: '7px' }}
                                    {...props}
                                />
                                <SingleProduct
                                    product={product}
                                    editing={editing}
                                    products={caseStudy.products}
                                    userProductDelete={userProductDelete}
                                    updateProducts={updateProducts}
                                    {...props}
                                />
                            </Col>
                        ))}
                    </Row>
                </Card.Body>
            </Card>
            {props.mode == 'edit' &&
                <>
                    <Card>
                        <Card.Header>Product Configuration (Admin Only)</Card.Header>
                        <Card.Body>
                            <Row>
                                <Col lg={4}>
                                    <Card.Text>
                                        <AutoSaveText
                                            saveKey="text.product_type_label"
                                            text={caseStudy.text.product_type_label || 'Product Type'}
                                            {...props}
                                        />
                                    </Card.Text>
                                    <AutoSaveInput
                                        type="alphanum"
                                        value={caseStudy.product.type}
                                        saveKey="product.type"
                                        {...props}
                                    />
                                </Col>
                                <Col lg={4}>
                                    <Card.Text>
                                        <AutoSaveText
                                            saveKey="text.overhead_cost_label"
                                            text={caseStudy.text.overhead_cost_label || 'Overhead Cost'}
                                            {...props}
                                        />
                                    </Card.Text>
                                    <AutoSaveInput
                                        type="currency_int_pos"
                                        value={caseStudy.product.overhead_cost}
                                        saveKey="product.overhead_cost"
                                        {...props}
                                    />
                                </Col>
                                <Col lg={4}>
                                    <Card.Text>
                                        <AutoSaveText
                                            saveKey="text.manpower_requirement_label"
                                            text={caseStudy.text.manpower_requirement_label || 'Manpower Requirement'}
                                            {...props}
                                        />
                                    </Card.Text>
                                    <AutoSaveInput
                                        type="dec_pos"
                                        value={caseStudy.product.product_manpower || 1}
                                        saveKey="product.product_manpower"
                                        updateParent={updateCaseStudy}
                                        {...props}
                                    />
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Header>
                            Product Specs (Admin Only)
                            <EditableListRowToolbar
                                template={templateSpecs}
                                saveKey="product.specs"
                                list={caseStudy.product.specs}
                                toolbarStyle={{ top: '-25px' }}
                                onListChange={listChanged}
                                {...props}
                            />
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                {specs.map((feature, idx) => (
                                    <Col key={idx} style={{ position: 'relative' }}>
                                        <EditableListColToolbar
                                            saveKey={'product.specs'}
                                            list={caseStudy.product.specs}
                                            idx={feature.idx}
                                            onListChange={listChanged}
                                            toolbarStyle={{ top: '7px', right: '7px' }}
                                            {...props}
                                        />
                                        <ProductSpec 
                                            feature={feature} 
                                            specNameChanged={specNameChanged}
                                            specCostChanged={specCostChanged}
                                            {...props} 
                                        />
                                    </Col>
                                ))}
                            </Row>
                        </Card.Body>
                    </Card>
                </>
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

const ProductSpec = (props) => {
    const feature = props.feature;
    const values = feature && feature.values ? feature.values.sort((a, b) => { return a.idx - b.idx; }) : [];

    const template = {
        "idx": 0,
        "value": "",
        "cost": 0,
        "weight": 0,
    };

    const checkBoxChanged = async (checkbox, featureId, valueId) => {
        const { checked } = checkbox;
        await db.saveCaseStudyData(props, "product.specs.$[i].values.$[j].locked", checked, [{ "i.idx": featureId }, { "j.idx": valueId }]);
    };

    return (
        values && <Card>
            <Card.Header>
                <AutoSaveText
                    saveKey="product.specs.$[i].feature"
                    text={feature.feature || 'Feature'}
                    filters={[{ "i.idx": feature.idx }]}
                    onSave={async (name) => await props.specNameChanged(feature.idx, name)}
                    {...props}
                />
            </Card.Header>
            <Card.Body>
                <EditableListRowToolbar
                    template={template}
                    saveKey="product.specs.$[i].values"
                    list={values}
                    filters={[{ "i.idx": feature.idx }]}
                    toolbarStyle={{ top: '25px' }}
                    {...props}
                />
                {values && values.map((value, idx) => (
                    <div key={uuid()}>
                        <EditableListColToolbar
                            saveKey="product.specs.$[i].values"
                            list={values}
                            idx={idx}
                            filters={[{ "i.idx": feature.idx }]}
                            dontMove={false}
                            {...props}
                        />
                        <Card>
                            <Card.Body>
                                <Card.Text>Value</Card.Text>
                                <AutoSaveInput
                                    type="alphanum"
                                    value={value.value || ''}
                                    saveKey="product.specs.$[i].values.$[j].value"
                                    filters={[{ "i.idx": feature.idx }, { "j.idx": value.idx }]}
                                    {...props}
                                />
                                <Card.Text>Cost</Card.Text>
                                <AutoSaveInput
                                    type="currency_int_pos"
                                    value={value.cost || ''}
                                    saveKey="product.specs.$[i].values.$[j].cost"
                                    filters={[{ "i.idx": feature.idx }, { "j.idx": value.idx }]}
                                    onSave={async (cost) => await props.specCostChanged(feature.idx, value.idx, cost)}
                                    {...props}
                                />
                                <Card.Text>Weight</Card.Text>
                                <AutoSaveInput
                                    type="int_pos"
                                    value={value.weight || ''}
                                    saveKey="product.specs.$[i].values.$[j].weight"
                                    filters={[{ "i.idx": feature.idx }, { "j.idx": value.idx }]}
                                    {...props}
                                />
                                <Row>
                                    <Col><Form.Check checked={value.locked} onChange={async (event) => { await checkBoxChanged(event.target, feature.idx, value.idx) }} /></Col>
                                    <Col>Locked</Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </div>
                ))}
            </Card.Body>
        </Card>
    );
};

const SingleProduct = (props) => {
    const editing = props.editing;
    const caseStudy = props.caseStudy;
    const gameData = props.gameData;
    const product = props.product;
    const user = props.user;
    const products = props.products.sort((a, b) => { return a.idx - b.idx });
    const fixedProducts = caseStudy.products.length;
    //const setDirty = props.setDirty;
    const [targetDescription, setTargetDescription] = useState('');

    const dropdownOptions = {};

    const specs = gameData.specs || caseStudy.product.specs;

    const specsIndexed = {};
    caseStudy.product.specs.forEach((spec) => {
        specsIndexed[spec.feature] = { ...spec };
        const values = {};
        spec.values.forEach((val) => {
            values[val.value] = val;
        });
        specsIndexed[spec.feature].values = values;
    });

    specs.forEach((feature) => {
        const options = [];
        const _sorted = feature.values;
        _sorted.sort((a, b) => { return a.idx - b.idx; });
        feature.values.forEach((val) => {
            if (val.locked) {
                return;
            }
            const option = {};
            option.label = val.value;
            option.value = val.value;
            options.push(option);
        });
        dropdownOptions[feature.feature] = options;
    });

    var productOptions = {};
    products.forEach((product) => {
        const name = product.name;
        const features = {};
        for (var feature in product.specs) {
            const options = dropdownOptions[feature];
            if (!options) {
                console.error('options not found ', feature, dropdownOptions);
                continue;
            }
            const selected = product.specs[feature];
            options.map((opt) => (opt.key = feature));
            features[feature] = {
                defaultValue: { value: selected, label: selected },
                options: options,
            };
        }
        productOptions[name] = features;
    });

    const segmentOptions = [];
    const segments = caseStudy.market.segments.sort((a, b) => { return a.idx - b.idx; });
    segments.forEach((val) => {
        const option = {};
        option.label = val.name;
        option.value = val.name;
        segmentOptions.push(option);
    });

    const onSelectChange = (option) => {
        product.specs[option.key] = option.value;

        var productCost = parseInt(caseStudy.product.overhead_cost || 0);

        for (var prop in product.specs) {
            const feature = specsIndexed[prop];
            if (!feature) {
                continue;
            }

            const value = feature.values[product.specs[prop]];
            if (!value) {
                continue;
            }

            productCost += parseInt(value.cost || 0);
        }
        product.cost = productCost;

        props.updateProducts();
        //setDirty(true);
    };

    const onSegmentChange = (option) => {
        product.target = option.value;
        //setDirty(true);
    };

    const onChangeInput = (e) => {
        product[e.target.name] = e.target.value;
        //setDirty(true);
    };

    const toolbarStyle = {
        display: 'flex',
        position: 'absolute',
        right: 0,
        top: '-31px',
        textAlign: 'right',
        zIndex: 1
    };

    return (
        <Card>
            <Card.Header>
                {editing ?
                    <Form.Control
                        type="text"
                        name="name"
                        defaultValue={product.name || ''}
                        onChange={onChangeInput}
                        placeholder="Product Name"
                    />
                    :
                    <AutoSaveText
                        saveKey="products.$[i].name"
                        text={product.name || 'Product Name'}
                        filters={[{ "i.idx": product.idx }]}
                        {...props}
                    />
                }
                {props.mode != 'edit' && editing && caseStudy.product.allowAdd && props.selectedGame.allowProductAdd && product.idx >= fixedProducts &&
                    <span className='editable_wrapper product_delete_toolbar' style={{ position: 'relative', display: 'block' }} >
                        <span className="toolbar" style={toolbarStyle}>
                            <span className="toolbar_button product_delete_button" onClick={() => { props.userProductDelete(product.idx) }} ><Icon name="remove" /></span>
                        </span>
                    </span>
                }
            </Card.Header>
            <Card.Body>
                <Row style={{ fontWeight: 'bold', marginBottom: '1rem' }}>
                    <Col lg={6} md={6} sm={12} xs={12} xxs={12}>Target: *</Col>
                    <Col lg={6} md={6} sm={12} xs={12} xxs={12}>
                        {editing ?
                            <div>
                                <Select
                                    className="options_select"
                                    name={product.idx}
                                    options={segmentOptions}
                                    defaultValue={{ value: product.target, label: product.target }}
                                    onChange={onSegmentChange}
                                />
                                <Card.Text>{targetDescription}</Card.Text>
                            </div>
                            :
                            product.target
                        }
                    </Col>
                </Row>
                <Row style={{ marginTop: '10px', marginBottom: '10px' }}>
                    <Card.Subtitle>Product Features</Card.Subtitle>
                </Row>
                {
                    !editing && Object.keys(product.specs).map((key) => (
                        <Row key={uuid()} className={key}>
                            <Col className="label" lg={6} md={6} sm={12} xs={12} xxs={12}>{key}: *</Col>
                            <Col className="value" lg={6} md={6} sm={12} xs={12} xxs={12}>{product.specs[key]}</Col>
                        </Row>
                    ))
                }
                {
                    editing && Object.keys(product.specs).map((key) => (
                        <Row key={uuid()} className={key}>
                            <Col className="form_label" lg={6} md={6} sm={12} xs={12} xxs={12}>{key}:</Col>
                            <Col lg={6} md={6} sm={12} xs={12} xxs={12}>
                                <Select
                                    className="options_select"
                                    name={key}
                                    options={productOptions[product.name][key].options}
                                    defaultValue={productOptions[product.name][key].defaultValue}
                                    onChange={onSelectChange}
                                />
                            </Col>
                        </Row>
                    ))
                }
                <Row style={{ marginTop: '15px', marginBottom: '10px' }}>
                    <Card.Subtitle>Product Pricing</Card.Subtitle>
                </Row>
                <Row key={uuid()}>
                    <Col lg={6} md={6} sm={12} xs={12} xxs={12}>Cost:</Col>
                    <Col lg={6} md={6} sm={12} xs={12} xxs={12}>
                    <FormatData
                        caseStudy={caseStudy}
                        format="price_int"
                        name="cost"
                        value={product.cost} />
                    </Col>
                </Row>
                <Row key={(product.name + '_sales_price')}>
                    <Col lg={6} md={6} sm={12} xs={12} xxs={12}>Sales Price: *</Col>
                    <Col lg={6} md={6} sm={12} xs={12} xxs={12}>
                        {!editing ?
                            <FormatData
                                caseStudy={caseStudy}
                                format="price_int"
                                name={(product.name + '_sales_price')}
                                value={product.salesPrice} />
                            :
                            <Form.Control 
                                name="salesPrice" 
                                type="number" 
                                onChange={onChangeInput} 
                                defaultValue={product.salesPrice || '0'} 
                                placeholder="Sales Price..." 
                            />
                        }
                    </Col>
                </Row>
                <Row key={(product.name + '_margin')}>
                    <Col lg={6} md={6} sm={12} xs={12} xxs={12}>Margin:</Col>
                    <Col lg={6} md={6} sm={12} xs={12} xxs={12}>
                        <CallFunction
                            user={user}
                            caseStudy={caseStudy}
                            gameData={gameData}
                            context={product}
                            fn={caseStudy.product.margin}
                            format="amount_int"
                            name={(caseStudy.product.name + '_margin')}
                        />
                    </Col>
                </Row>
                <Row key={(product.name + '_margin_pct')}>
                    <Col lg={6} md={6} sm={12} xs={12} xxs={12}>Margin Percentage:</Col>
                    <Col lg={6} md={6} sm={12} xs={12} xxs={12}>
                        <CallFunction
                            user={user}
                            caseStudy={caseStudy}
                            gameData={gameData}
                            context={product}
                            fn={caseStudy.product.margin_pct}
                            format="percent_dec"
                            name={(product.name + '_margin_pct')}
                        />
                    </Col>
                </Row>
                <Row style={{ marginTop: '15px', marginBottom: '10px' }}>
                    <Card.Subtitle>UI</Card.Subtitle>
                </Row>
                {props.mode == 'edit' &&
                    <Row>
                        <Col lg={6} md={6} sm={12} xs={12} xxs={12}>Chart Color:</Col>
                        <Col lg={6} md={6} sm={12} xs={12} xxs={12}>
                            <AutoSaveInput
                                type="color"
                                value={product.color}
                                saveKey="products.$[i].color"
                                filters={[{ "i.idx": product.idx }]}
                                {...props}
                            />
                        </Col>
                    </Row>
                }
                {props.mode != 'edit' && editing &&
                    <Row>
                        <Col lg={6} md={6} sm={12} xs={12} xxs={12}>Chart Color:</Col>
                        <Col lg={6} md={6} sm={12} xs={12} xxs={12}>
                            <Form.Control
                                type="color"
                                name="color"
                                defaultValue={product.color || '#ffffff'}
                                onChange={onChangeInput}
                                style={{ width: '100%' }}
                            />
                        </Col>
                    </Row>
                }
                {props.mode != 'edit' && !editing &&
                    <Row>
                        <Col lg={6} md={6} sm={12} xs={12} xxs={12}>Chart Color:</Col>
                        <Col lg={6} md={6} sm={12} xs={12} xxs={12}>
                            <Form.Control
                                type="color"
                                name="color"
                                defaultValue={product.color || '#ffffff'}
                                style={{ width: '100%' }}
                                disabled
                            />
                        </Col>
                    </Row>
                }
            </Card.Body>
        </Card>

    );
};

export default UserProducts;
