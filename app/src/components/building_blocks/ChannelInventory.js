import React from "react";
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import FormatData from '../FormatData';
import AutoSaveText from '../utils/AutoSaveText';
import AutoSaveInput from '../utils/AutoSaveInput';

const ChannelInventory = (props) => {
    const gameData = props.gameData;
    const caseStudy = props.caseStudy;

    const products = (props.mode == 'edit' ? caseStudy.products : gameData.products).sort((a, b) => {return a.idx - b.idx});
    const channels = caseStudy.market.channels;

    const updateInventory = async (event) => {
        if (props.mode != 'edit') {
            return;
        }
        
        const idx = event.filters[0]['i.idx'];
        const list = event.saveKey.split('.');
        const channelName = list.pop();
        await props.inventoryUpdated(idx, channelName, parseInt(event.value || 0));
    };

    return (
        <Card>
            <Card.Header>
                <AutoSaveText
                    saveKey="text.channel_inventory_heading"
                    text={caseStudy.text.channel_inventory_heading || 'Channel Inventory Report'}
                    {...props}
                />
            </Card.Header>
            <Card.Body>
                <Table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            {channels.map((channel, cidx) => (
                                <th key={cidx}>{channel.name}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product, pidx) => (
                            <tr key={pidx}>
                                <td>
                                    {product.name}
                                </td>
                                {channels.map((channel, cidx) => (
                                    <td key={cidx}>
                                        {props.mode == 'edit' ?
                                            <AutoSaveInput
                                                type="int_pos"
                                                saveKey={'products.$[i].channelInventory.' + channel.name}
                                                value={product.channelInventory[channel.name] || '0'}
                                                filters={[{"i.idx": pidx}]}
                                                updateParent={updateInventory}
                                                {...props}
                                            />
                                            :
                                            <FormatData
                                                caseStudy={caseStudy}
                                                format="thousands_indicator_int"
                                                value={product.channelInventory[channel.name] || '0'}
                                            />
                                        }
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card.Body>
        </Card>
    );
};

export default ChannelInventory;
