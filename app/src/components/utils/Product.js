import React from "react";
import { useState } from 'react';
import Card from 'react-bootstrap/Card';
import Select from 'react-select'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import AutoSaveText from './AutoSaveText';
import FormatData from '../FormatData';
import CallFunction from '../CallFunction';


const Product = (props) => {
    return props.mode == 'edit' ? <ProductSpec {...props} /> : <UserProduct {...props} />;
};

const ProductSpec = (props) => {
    const caseStudy = props.caseStudy;
    const product = props.product;
    const productKey = product.product_key;

    return (
        <Card>
            <Card.Header>
                <AutoSaveText
                    saveKey="product.variants.$[i].name"
                    text={product.name}
                    filters={[{ "i.product_key": product.product_key }]}
                    {...props}
                />
            </Card.Header>
            <Card.Body>
                <Card.Text>
                    test
                </Card.Text>
            </Card.Body>
        </Card>
    );
};

const UserProduct = (props) => {
    const DELIMITER = '||';
    const editing = props.editing;
    const caseStudy = props.caseStudy;
    const gameData = props.gameData;
    const product = props.product;
    const user = props.user;
    const products = props.products.sort((a, b) => {return a.idx - b.idx});
    const setDirty = props.setDirty;
    const [targetDescription, setTargetDescription] = useState('');

    const onSelectChange = (option) => {
        const [productName, feature] = option.key.split(DELIMITER);

        products.every(prod => {
            if (prod.name == productName) {
                prod.specs[feature] = option.value;
                return false;
            }
            return true;
        });
        setDirty(true);
    };

    const onSegmentChange = (option) => {
        products.every(prod => {
            if (prod.name == product.name) {
                prod.target = option.value;
                setTargetDescription(prod.description);
                return false;
            }
            return true;
        });
        setDirty(true);
    };

    const onChangeInput = (e) => {
        const [productName, varName] = e.target.name.split(DELIMITER);

        products.every(prod => {
            if (prod.name == productName) {
                prod[varName] = e.target.value;
                return false;
            }
            return true;
        });
        setDirty(true);
    };

    var dropdownOptions = {};
    caseStudy.product.specs.forEach((feature) => {
        const options = [];
        const _sorted = feature.values;
        _sorted.sort((a, b) => { return a.idx - b.idx; });
        feature.values.forEach((val) => {
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
            const options = JSON.parse(JSON.stringify(dropdownOptions[feature]));
            const selected = product.specs[feature];
            options.map((opt) => (opt.key = name + DELIMITER + feature));
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

    return (
        <Card>
            <Card.Header>
                {editing ?
                    <input name={(product.name + '||name')} type="text" onChange={onChangeInput} defaultValue={product.name} placeholder="Product Name..." />
                    :
                    product.name
                }
            </Card.Header>
            <Card.Body>
                <Row style={{ fontWeight: 'bold', marginBottom: '1rem' }}>
                    <Col lg={6} md={6} sm={12} xs={12} xxs={12}>Target: </Col><Col lg={6} md={6} sm={12} xs={12} xxs={12}>
                        {editing ?
                            <div>
                                <Select
                                    className="options_select"
                                    name={product.name}
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
                <Row style={{ margin: '20px 0 5px 0' }}>
                    <Card.Subtitle>Product Features</Card.Subtitle>
                </Row>                {
                    !editing && Object.keys(product.specs).map((key) => (
                        <Row key={key} className={key}>
                            <Col className="label" lg={6} md={6} sm={12} xs={12} xxs={12}>{key}:</Col>
                            <Col className="value" lg={6} md={6} sm={12} xs={12} xxs={12}>{product.specs[key]}</Col>
                        </Row>
                    ))
                }
                {
                    editing && Object.keys(product.specs).map((key) => (
                        <Row key={key} className={key}>
                            <Col className="form_label" lg={6} md={6} sm={12} xs={12} xxs={12}>{key}:</Col>
                            <Col lg={6} md={6} sm={12} xs={12} xxs={12}>
                                <Select
                                    className="options_select"
                                    name={product.name + '|' + key}
                                    options={productOptions[product.name][key].options}
                                    defaultValue={productOptions[product.name][key].defaultValue}
                                    onChange={onSelectChange}
                                />
                            </Col>
                        </Row>
                    ))
                }
                <Row style={{ margin: '20px 0 5px 0' }}>
                    <Card.Subtitle>Product Pricing</Card.Subtitle>
                </Row>
                <Row key={(product.name + '_cost')}>
                    <Col lg={6} md={6} sm={12} xs={12} xxs={12}>Cost:</Col>
                    <Col lg={6} md={6} sm={12} xs={12} xxs={12}>
                        <CallFunction
                            user={user}
                            caseStudy={caseStudy}
                            gameData={gameData}
                            context={product}
                            fn={caseStudy.product.cost}
                            format="price_int"
                            name={(product.name + '_cost_price')}
                        />
                    </Col>
                </Row>
                <Row key={(product.name + '_sales_price')}>
                    <Col lg={6} md={6} sm={12} xs={12} xxs={12}>Sales Price:</Col>
                    <Col lg={6} md={6} sm={12} xs={12} xxs={12}>
                        {
                            !editing && (
                                <FormatData
                                    caseStudy={caseStudy}
                                    format="price_int"
                                    name={(product.name + '_sales_price')}
                                    value={product.salesPrice} />
                            )
                        }
                        {
                            editing && (
                                <input name={(product.name + '||salesPrice')} type="number" onChange={onChangeInput} defaultValue={product.salesPrice} placeholder="Sales Price..." />
                            )
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
                            fn={caseStudy.product.marginPct}
                            format="percent_dec"
                            name={(product.name + '_margin_pct')}
                        />
                    </Col>
                </Row>
                <Row style={{ margin: '20px 0 5px 0' }}>
                    <Card.Subtitle>Capacity</Card.Subtitle>
                </Row>
                <Row key={product.name + '_inventory'}>
                    <Col lg={6} md={6} sm={12} xs={12} xxs={12}>Inventory:</Col>
                    <Col lg={6} md={6} sm={12} xs={12} xxs={12}>{product.inventory}</Col>
                </Row>
                <Row key={product.name + '_plannedProduction'}>
                    <Col lg={6} md={6} sm={12} xs={12} xxs={12}>Planned Production:</Col>
                    <Col lg={6} md={6} sm={12} xs={12} xxs={12}>
                        {
                            !editing && (
                                <span>{product.plannedProduction}</span>
                            )
                        }
                        {
                            editing && (
                                <input name={(product.name + '||plannedProduction')} type="number" onChange={onChangeInput} defaultValue={product.plannedProduction} placeholder="Planned Production..." />
                            )
                        }
                    </Col>
                </Row>
            </Card.Body>
        </Card>

    );
};

export default Product;
