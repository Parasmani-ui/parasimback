import React from "react";
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import AutoSaveText from '../utils/AutoSaveText';
import VolumeMarketSharePie from '../building_blocks/VolumeMarketSharePie';
import RevenueMarketSharePie from '../building_blocks/RevenueMarketSharePie';
import ProductVolumeSharePie from '../building_blocks/ProductVolumeSharePie';
import ProductRevenueSharePie from '../building_blocks/ProductRevenueSharePie';
import ChannelInventory from '../building_blocks/ChannelInventory';

const MarketShare = (props) => {
    const caseStudy = props.caseStudy;
    const gameData = props.gameData;

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
        <Card className="container-card">
            <Card.Body>
                <Row>
                    <Col lg={3}>
                        <VolumeMarketSharePie {...props} />
                    </Col>
                    <Col lg={3}>
                        <RevenueMarketSharePie {...props} />
                    </Col>
                    <Col lg={3}>
                        <ProductVolumeSharePie {...props} />
                    </Col>
                    <Col lg={3}>
                        <ProductRevenueSharePie {...props} />
                    </Col>
                </Row>
                <div style={{ marginTop: '20px' }}>
                    <ChannelInventory inventoryUpdated={inventoryUpdated} {...props} />
                </div>
            </Card.Body>
        </Card>
    );
};

export default MarketShare;
