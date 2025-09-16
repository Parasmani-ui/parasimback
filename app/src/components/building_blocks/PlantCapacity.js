import React, { useState } from "react";
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import gameConfig from '../../gameConfig';
import AutoSaveText from '../utils/AutoSaveText';
import EditableImage from '../utils/EditableImage';
import AutoSaveInput from '../utils/AutoSaveInput';
import EditableListRowToolbar from '../utils/EditableListRowToolbar';
import EditableListColToolbar from '../utils/EditableListColToolbar';
import FormatData from '../FormatData';
import ShowToast from '../utils/ShowToast';
import db from '../utils/db';

const PlantCapacity = (props) => {
    const gameData = props.gameData;
    const caseStudy = props.caseStudy;
    const plants = caseStudy.plants;
    const financials = props.mode == 'edit' ? caseStudy.financials : gameData.financials;
    const plantOptions = caseStudy.plants.options;
    const [selectedPlant, setSelectedPlant] = useState(props.mode == 'edit' ? plants.selected : props.selectedPlant);

    plantOptions.sort((a, b) => { return a.idx - b.idx; });

    const template = (idx) => {
        const icons = ['none_plant.png', 'small_plant.png', 'medium_plan.png', 'large_plant.png'];
        return {
            "idx": 0,
            "label": "Label",
            "capacity": 0,
            "investment": 0,
            "icon": 'blank.jpg'
        };
    };

    const handleRadioClick = async (e) => {
        setSelectedPlant(e.target.value);
        props.mode == 'edit' ?
            await db.saveCaseStudyData(props, "plants.selected", e.target.value) :
            props.setSelectedPlant(e.target.value);
    };

    const updateCapacity = async (event) => {
        const capacity = parseInt(event.value || 0);
        var _plant = null;
        for (var i = 0; i < plantOptions.length; i++) {
            if (plantOptions[i].label == selectedPlant) {
                _plant = plantOptions[i];
                break;
            }
        }

        financials.capacity = capacity;
        const _capacity = financials.capacity + (_plant ? parseInt(_plant.capacity || 0) : 0);
        financials.utilisation = _capacity ? Math.round((financials.production * 100 / _capacity) * 100) / 100 : 'NA';
        if (financials.utilisation > 100) {
            ShowToast({ icon: 'danger', heading: 'Error in production vs capacity', message: 'The planned production exceeds capacity' });
        }
        if (props.mode == 'edit') {
            await db.saveCaseStudyData(props, "financials", financials, null, true);
            await props.updateData();
        }
    };

    return (
        <>
            <Card>
                <Card.Header>
                    <AutoSaveText
                        saveKey="text.plant_capacity_heading"
                        text={caseStudy.text.plant_capacity_heading || 'Plant Capacity Planning'}
                        {...props}
                    />
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col>
                            <Row>
                                <Col style={{ width: '100px' }}>
                                    <EditableImage
                                        src={gameConfig.getCaseStudyImagePath(caseStudy.key, caseStudy.images.capacity_image || 'factory-green.svg')}
                                        style={{ height: '100px' }}
                                        saveKey={'images.capacity_image'}
                                        {...props}
                                    />
                                </Col>
                                <Col>
                                    <Card.Subtitle>
                                        <AutoSaveText
                                            saveKey="text.capacity_label"
                                            text={caseStudy.text.capacity_label || 'Capacity'}
                                            {...props}
                                        />
                                    </Card.Subtitle>
                                    <div>
                                        {props.mode == 'edit' ?
                                            <AutoSaveInput
                                                type="int_pos"
                                                saveKey="financials.capacity"
                                                value={financials.capacity}
                                                updateParent={updateCapacity}
                                                {...props}
                                            />
                                            :
                                            financials.capacity
                                        }
                                        &nbsp;
                                        <AutoSaveText
                                            saveKey="text.units_label"
                                            text={caseStudy.text.units_label || 'units'}
                                            {...props}
                                        />
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                        <Col>
                            <Row>
                                <Col style={{ width: '100px' }}>
                                    <EditableImage
                                        src={gameConfig.getCaseStudyImagePath(caseStudy.key, caseStudy.images.production_image || 'factory-grey.svg')}
                                        style={{ height: '100px' }}
                                        saveKey={'images.production_image'}
                                        {...props}
                                    />
                                </Col>
                                <Col>
                                    <Card.Subtitle>
                                        <AutoSaveText
                                            saveKey="text.production_label"
                                            text={caseStudy.text.production_label || 'Production'}
                                            {...props}
                                        />
                                    </Card.Subtitle>
                                    <div>
                                        <FormatData
                                            caseStudy={caseStudy}
                                            format="thousands_indicator_int"
                                            name="production"
                                            value={financials.production || 0}
                                        />
                                        &nbsp;
                                        <AutoSaveText
                                            saveKey="text.units_label"
                                            text={caseStudy.text.units_label || 'units'}
                                            {...props}
                                        />
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                        <Col>
                            <Row>
                                <Col style={{ width: '100px' }}>
                                    <EditableImage
                                        src={gameConfig.getCaseStudyImagePath(caseStudy.key, caseStudy.images.utilisation_image || 'factory-brown.svg')}
                                        style={{ height: '100px' }}
                                        saveKey={'images.utilisation_image'}
                                        {...props}
                                    />
                                </Col>
                                <Col>
                                    <Card.Subtitle>
                                        <AutoSaveText
                                            saveKey="text.utilisation_label"
                                            text={caseStudy.text.utilisation_label || 'Utilisation'}
                                            {...props}
                                        />
                                    </Card.Subtitle>
                                    <div style={{ 'color': parseFloat(financials.utilisation || 0) > 100 ? 'red' : 'initial' }}>
                                        <FormatData
                                            caseStudy={caseStudy}
                                            format="percent_dec"
                                            name="utilisation"
                                            value={financials.utilisation || 0}
                                        />
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
            <div style={{height: '15px'}}></div>
            <Card>
                <Card.Header>
                    <AutoSaveText
                        saveKey="text.install_new_plant_heading"
                        text={caseStudy.text.install_new_plant_heading || 'Install New Plant (Operational Next Quarter)'}
                        {...props}
                    />
                    <EditableListRowToolbar
                        template={template}
                        saveKey="plants.options"
                        list={plants.options}
                        toolbarStyle={{ top: '-25px' }}
                        {...props}
                    />
                </Card.Header>
                <Card.Body>
                    <Row style={{ textAlign: 'center' }}>
                        {plantOptions.map((plant, idx) => (
                            <Col key={idx} className={selectedPlant === plant.label ? 'selected-plant-option' : ''} 
                                style={{ 
                                    marginLeft: idx == 0 ? '10px' : '15px', 
                                    marginRight: idx == (plantOptions.length - 1) ? '10px' : 0, 
                                    padding: '15px', 
                                    border: selectedPlant == plant.label ? '2px solid #993333' : '1px solid grey',
                                    backgroundColor: selectedPlant == plant.label ? 'var(--subcard-background-color)' : '#eeeeee',
                                    boxShadow: 'var(--card-shadow)'
                                }}
                            >
                                <EditableListColToolbar
                                    saveKey="plants.options"
                                    list={plants.options}
                                    idx={plant.idx}
                                    {...props}
                                />
                                {props.editing &&
                                    <span style={{ textAlign: 'left' }}>
                                        <Form.Check
                                            value={plant.label}
                                            type="radio"
                                            onChange={handleRadioClick}
                                            checked={selectedPlant === plant.label}
                                        />
                                    </span>
                                }
                                <EditableImage
                                    src={gameConfig.getCaseStudyImagePath(caseStudy.key, plant.icon)}
                                    style={{ height: '120px' }}
                                    saveKey="plants.options.$[i].icon"
                                    filters={[{ "i.idx": plant.idx }]}
                                    toolbarStyle={{ display: 'flex', position: 'absolute', right: 0, top: '25px' }}
                                    owner={plant.label}
                                    {...props}
                                />
                                <Card.Title>
                                    <AutoSaveText
                                        text={plant.label}
                                        saveKey="plants.options.$[i].label"
                                        filters={[{ "i.idx": plant.idx }]}
                                        owner={plant.label}
                                        {...props}
                                    />
                                </Card.Title>
                                <Row>
                                    <Col>
                                        <Card.Subtitle>
                                            <AutoSaveText
                                                saveKey="text.capacity_label"
                                                text={caseStudy.text.capacity_label || 'Capacity'}
                                                {...props}
                                            />
                                        </Card.Subtitle>
                                        {props.mode == 'edit' ?
                                            <AutoSaveInput
                                                type="int_pos"
                                                saveKey="plants.options.$[i].capacity"
                                                value={plant.capacity || '0'}
                                                filters={[{ "i.idx": plant.idx }]}
                                                owner={plant.label}
                                                {...props}
                                            />
                                            :
                                            <Card.Text>
                                                {plant.capacity || '0'}
                                            </Card.Text>
                                        }
                                        <Card.Text>
                                            <AutoSaveText
                                                saveKey="text.units_label"
                                                text={caseStudy.text.units_label || 'units'}
                                                {...props}
                                            />
                                        </Card.Text>
                                        <Card.Subtitle>
                                            <AutoSaveText
                                                saveKey="text.investment_label"
                                                text={caseStudy.text.investment_label || 'Investment'}
                                                {...props}
                                            />
                                        </Card.Subtitle>
                                        {props.mode == 'edit' ?
                                            <AutoSaveInput
                                                type="currency_int_pos"
                                                saveKey="plants.options.$[i].investment"
                                                value={plant.investment || '0'}
                                                filters={[{ "i.idx": plant.idx }]}
                                                owner={plant.label}
                                                {...props}
                                            />
                                            :
                                            <Card.Subtitle>
                                                <FormatData
                                                    caseStudy={caseStudy}
                                                    format="price_int"
                                                    name="plant_investment"
                                                    value={plant.investment || '0'}
                                                />
                                            </Card.Subtitle>
                                        }
                                    </Col>
                                </Row>
                            </Col>
                        ))
                        }
                    </Row>
                </Card.Body>
            </Card>
        </>
    );
};

export default PlantCapacity;
