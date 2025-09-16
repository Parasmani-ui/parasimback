import React from "react";
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import AutoSaveText from '../utils/AutoSaveText';
import AutoSaveInput from '../utils/AutoSaveInput';
import EditableListRowToolbar from '../utils/EditableListRowToolbar';
import EditableListColToolbar from '../utils/EditableListColToolbar';
import { randomColor } from '../utils/common';
import db from '../utils/db';

const DistributionChannelsSummary = (props) => {
    const caseStudy = props.caseStudy;
    const channels = caseStudy.market.channels.sort((a, b) => { return a.idx - b.idx; });

    const template = {
        "idx": 0,
        "name": "Channel Name",
        "description": "Please edit this channel description.",
        "color": randomColor()
    };

    const listChanged = async (list) => {
        for (var i = 0; i < list.length; i++) {
            if (list[i].name == 'Channel Name') {
                list[i].name = 'Channel Name ' + i;
            }
        }
        await db.saveCaseStudyData(props, "market.channels", list);

        const _prods = caseStudy.products;
        const keys = list.map(val => val.name);
        _prods.forEach(prod => {
            var values = Object.values(prod.channelDistribution);
            var output = {};
            for (var i = 0; i < keys.length; i++) {
                output[keys[i]] = values[i] || 0;
            }
            prod.channelDistribution = output;
            
            values = Object.values(prod.channelInventory);
            output = {};
            for (var i = 0; i < keys.length; i++) {
                output[keys[i]] = values[i] || 0;
            }
            prod.channelInventory = output;
        });
        await db.saveCaseStudyData(props, "products", _prods);
    };

    const changeName = async (idx, text) => {
        const _channels = JSON.parse(JSON.stringify(caseStudy.market.channels));
        _channels[idx].name = text;
        await db.saveCaseStudyData(props, "market.channels", _channels);
        const _prods = caseStudy.products;
        const keys = _channels.map(val => val.name);
        _prods.forEach(prod => {
            var values = Object.values(prod.channelDistribution);
            var output = {};
            for (var i = 0; i < keys.length; i++) {
                output[keys[i]] = values[i];
            }
            prod.channelDistribution = output;
            
            values = Object.values(prod.channelInventory);
            output = {};
            for (var i = 0; i < keys.length; i++) {
                output[keys[i]] = values[i];
            }
            prod.channelInventory = output;
        });
        await db.saveCaseStudyData(props, "products", _prods);
    };

    return (
        caseStudy && <Card>
            <Card.Header>
                <AutoSaveText
                    saveKey={'text.distribution_channels_heading'}
                    text={caseStudy.text.distribution_channels_heading || 'Distribution Channels'}
                    {...props}
                />
            </Card.Header>
            <Container>
                <Row style={{ position: 'relative' }}>
                    <EditableListRowToolbar
                        template={template}
                        saveKey={'market.channels'}
                        list={channels}
                        toolbarStyle={{ top: '-30px' }}
                        onListChange={listChanged}
                        {...props}
                    />
                    {channels.map((channel) => (
                        <Col key={channel.idx}>
                            <EditableListColToolbar
                                saveKey={'market.channels'}
                                list={channels}
                                idx={channel.idx}
                                onListChange={listChanged}
                                {...props}
                            />
                            <Card.Body>
                                <Card.Subtitle style={{ margin: '10px 0' }}>
                                    <AutoSaveText
                                        saveKey={'market.channels.$[i].name'}
                                        text={channel.name}
                                        filters={[{ "i.idx": channel.idx }]}
                                        onSave={async (text) => {return await changeName(channel.idx, text)}}
                                        {...props}
                                    />
                                </Card.Subtitle>
                                <Card.Text>
                                    <AutoSaveText
                                        saveKey={'market.channels.$[i].description'}
                                        text={channel.description}
                                        filters={[{ "i.idx": channel.idx }]}
                                        {...props}
                                    />
                                </Card.Text>
                                {props.mode == 'edit' &&
                                    <>
                                        <Card.Text>Chart Color</Card.Text>
                                        <AutoSaveInput
                                            type="color"
                                            value={channel.color}
                                            saveKey="market.channels.$[i].color"
                                            filters={[{ "i.idx": channel.idx }]}
                                            {...props}
                                        />
                                    </>
                                }
                                {/*props.mode == 'edit' &&
                                    <Container>
                                        <Card.Text>Market Reach</Card.Text>
                                        <AutoSaveInput
                                            type="pct_int_pos"
                                            value={channel.market_reach}
                                            saveKey={'market.channels.$[i].market_reach'}
                                            filters={[{ "i.idx": channel.idx }]}
                                            {...props}
                                        />
                                        <Card.Text>Effectiveness</Card.Text>
                                        <AutoSaveInput
                                            type="pct_int_pos"
                                            value={channel.effectiveness}
                                            saveKey={'market.channels.$[i].effectiveness'}
                                            filters={[{ "i.idx": channel.idx }]}
                                            {...props}
                                        />
                                    </Container>
                            */}
                            </Card.Body>
                        </Col>
                    ))}
                </Row>
            </Container>
        </Card>
    );
};

export default DistributionChannelsSummary;