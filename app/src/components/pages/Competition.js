import React from "react";
import { useEffect, useState, useRef } from "react";
import Card from 'react-bootstrap/Card';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';
import Icon from "../Icon";
import Container from 'react-bootstrap/Container';
import AutoSaveText from '../utils/AutoSaveText';
import { post } from '../utils/ServerCall';
import ProductSalesBar from '../building_blocks/ProductSalesBar';
import ProductRevenueBar from '../building_blocks/ProductRevenueBar';
import FormatData from "../FormatData";
import { uuid } from '../utils/common';

const Competition = (props) => {
    const game = props.game;
    const gameState = props.gameState;
    const gameData = props.gameData;
    const caseStudy = props.caseStudy;
    const allQuartersData = props.allQuartersData;
    const noOfQtr = Object.keys(allQuartersData).length;
    const tabs = Object.values(caseStudy.quarters.labels).splice(0, noOfQtr - 1);
    const teams = props.mode == 'edit' ? Object.values(gameState.teams) : props.teams;
    const [isSticky, setIsSticky] = useState(false);
    const tableRef = useRef(null);

    useEffect(() => {
        const parent = props.competitionRef;

        const handleScroll = () => {
            const tableTop = tableRef.current.getBoundingClientRect().top;
            setIsSticky(tableTop <= 0);

            console.log('scroll', tableTop);
        };

        if (parent && parent.current) {
            parent.current.addEventListener('scroll', handleScroll);
        }
        else
        {
            console.log('attaching window');
            window.addEventListener('scroll', handleScroll);
        }

        return () => parent && parent.current ? parent.current.removeEventListener('scroll', handleScroll) : window.removeEventListener('scroll', handleScroll);
    }, []);

    const specs = caseStudy.product.specs;
    specs.sort((a, b) => { return a.idx - b.idx; });
    const features = specs.map((spec) => (spec.feature));

    const products = caseStudy.products;

    const labels = {
        target: <div style={{ textAlign: 'center' }}>Target</div>,
        marketShare: <><div style={{ textAlign: 'center' }}>Market Share (Volume)</div><div style={{ textAlign: 'center' }}>%</div></>,
        revenueShare: <><div style={{ textAlign: 'center' }}>Market Share (Value)</div><div style={{ textAlign: 'center' }}>%</div></>,
        marketShareSegment: <><div style={{ textAlign: 'center' }}>Market Share By Segment</div><div style={{ textAlign: 'center' }}>%</div></>,
        revenueShareSegment: <><div style={{ textAlign: 'center' }}>Revenue Share By Segment</div><div style={{ textAlign: 'center' }}>%</div></>,
        revenue: <><div style={{ textAlign: 'center' }}>Revenue</div><div style={{ textAlign: 'center' }}>$</div></>,
        salesPrice: <><div style={{ textAlign: 'center' }}>MRP</div><div style={{ textAlign: 'center' }}>$</div></>,
        potential_sales_demand: <><div style={{ textAlign: 'center' }}>Potential Sales (Demand)</div><div style={{ textAlign: 'center' }}>(units)</div></>,
        potential_sales_supply: <div style={{ textAlign: 'center' }}>Units Available for Sale</div>,
        unitsSold: <div style={{ textAlign: 'center' }}>Units Sold</div>,
        plannedProduction: <><div style={{ textAlign: 'center' }}>Planned Production</div><div style={{ textAlign: 'center' }}>(units)</div></>,
        actualProduction: <><div style={{ textAlign: 'center' }}>Actual Production</div><div style={{ textAlign: 'center' }}>(units)</div></>,
    };

    const separator = ['salesPrice', 'revenue', 'unitsSold', 'potential_sales_demand', 'potential_sales_supply', 'plannedProduction', 'actualProduction'];

    const ncols = Object.keys(labels).length + Object.keys(specs).length;

    return (
        !!noOfQtr && caseStudy &&
        <>
            <Card className="container-card competition-card">
                <Card.Body style={{ minWidth: '900px' }}>
                    <Row sm={2}>
                        <Col>
                            <ProductSalesBar {...props} />
                        </Col>
                        <Col>
                            <ProductRevenueBar {...props} />
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <div className="card-header" style={{ padding: '10px' }}>
                <AutoSaveText
                    saveKey="text.competition_table_heading"
                    text={caseStudy.text.competition_table_heading || 'Competition Analysis'}
                    {...props}
                />
            </div>

            <Tabs defaultActiveKey={caseStudy.quarters.labels[(noOfQtr - 2).toString()]} name="competition_tabs">
                {tabs && gameState && tabs.map((qtr, qidx) => (
                    <Tab
                        key={qidx}
                        eventKey={qtr}
                        title={qtr}
                    >
                        <div ref={tableRef} style={{postion: 'relative'}}>
                            <Table style={{ fontSize: '0.7rem', width: '100%' }}>
                                <thead className={isSticky ? 'sticky-header' : 'normal-header'}>
                                    <tr>
                                        <>
                                            <th style={{ minWidth: '80px', width: 'auto', textAlign: 'center' }}>Product</th>
                                            {Object.keys(labels).map((field, fidx) => (
                                                <th key={uuid()}>{labels[field]}</th>
                                            ))}
                                            {features.map((field, fidx) => (
                                                <th key={uuid()} style={{ textAlign: 'center' }}>{field}</th>
                                            ))}
                                        </>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teams.map((team, tidx) => (
                                        <React.Fragment key={tidx}>
                                            <tr style={{ backgroundColor: '#efefef', fontWeight: 'bold' }}>
                                                <td colSpan={ncols + 1} style={{ textAlign: 'center' }}>{team.name}</td>
                                            </tr>
                                            {(props.mode == 'edit' ? products : team.products[qidx]).
                                                sort((a, b) => { return a.idx - b.idx }).
                                                map((product, pidx) => (
                                                    <tr key={pidx}>
                                                        <>
                                                            <td style={{ fontWeight: 'bold', width: 'auto' }}>{product.name}</td>
                                                            {Object.keys(labels).map((field, fidx) => (
                                                                <td key={uuid()} style={{ width: 'auto' }}>
                                                                    {separator.includes(field) ?
                                                                        <div style={{ textAlign: 'right' }}>
                                                                            <FormatData
                                                                                caseStudy={caseStudy}
                                                                                format="thousands_indicator_int"
                                                                                name={field}
                                                                                value={product[field] || '0'} />
                                                                        </div>
                                                                        :
                                                                        <div style={{ textAlign: 'left' }}>
                                                                            {product[field] || '0'}
                                                                        </div>
                                                                    }
                                                                </td>
                                                            ))}
                                                            {Object.keys(product.specs).map((field, fidx) => (
                                                                <td key={uuid()} style={{ width: 'auto' }}>
                                                                    {product.specs[field]}
                                                                </td>
                                                            ))}
                                                        </>
                                                    </tr>
                                                ))}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </Tab>
                ))}
            </Tabs>
        </>
    );
};

export default Competition;
