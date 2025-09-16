import React from "react";
import { useState, useEffect } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Select from 'react-select';
import EditableImage from '../utils/EditableImage';
import AutoSaveText from '../utils/AutoSaveText';
import AutoSaveInput from '../utils/AutoSaveInput';
import StatesSelect from '../utils/StatesSelect';
import gameConfig from '../../gameConfig';
import db from '../utils/db';

const InstituteGeneralInfo = (props) => {
    const institute = props.institute;
    const user = props.user;
    //const [state, setState] = useState(props.institute.state);
    //const [region, setRegion] = useState(props.institute.region);
    //const [month, setMonth] = useState(props.institute.session_start_month);
    const showOnWebsite = props.institute.showOnWebsite;

    const onStateSelect = async (state) => {
        await db.saveInstituteData(props, 'state', state);
        const institute = { ...props.institute };
        institute.state = state;
        //setState(state);
        await props.updateInstitute(institute);
    };

    const onMonthSelect = async (month) => {
        await db.saveInstituteData(props, 'session_start_month', month);
        const institute = { ...props.institute };
        institute.session_start_month = month;
        //setMonth(month);
        await props.updateInstitute(institute);
    };

    const onRegionSelect = async (region) => {
        await db.saveInstituteData(props, 'region', region);
        const institute = { ...props.institute };
        institute.region = region;
        //setRegion(region);
        await props.updateInstitute(institute);
    };

    const checkBoxChanged = async (e) => {
        const { checked } = e.target;
        await db.saveInstituteData(props, 'showOnWebsite', checked);
        institute.showOnWebsite = checked;
        await props.updateInstitute(institute);
    };

    const updateInstitute = async (obj) => {
        institute[obj.saveKey] = obj.value;
        await props.updateInstitute(institute);
    };

    return (
        <Card>
            <Card.Body>
                <Row>
                    <Col md={3} style={{ position: 'relative' }}>
                        <EditableImage
                            src={gameConfig.getImagePath(props.institute.logo)}
                            style={{ display: 'block', width: '100%' }}
                            saveKey="logo"
                            saveFn="saveInstituteImage"
                            editable={props.user.role == 'superadmin' || (props.user.role == 'admin' && props.user.institute_key == institute.key)}
                            updateParent={updateInstitute}
                            owner={institute.key}
                            {...props}
                        />
                    </Col>
                    <Col md={9}>
                        <Card.Title>
                            <AutoSaveText
                                saveKey="name"
                                text={institute.name}
                                saveFn="saveInstituteData"
                                editable={props.user.role == 'superadmin' || (props.user.role == 'admin' && props.user.institute_key == institute.key)}
                                updateParent={updateInstitute}
                                owner={institute.key}
                                {...props}
                            />
                        </Card.Title>
                        <Card.Text>
                            <AutoSaveText
                                style={{ minHeight: '100px' }}
                                saveKey="description"
                                text={institute.description || 'Institute description'}
                                saveFn="saveInstituteData"
                                editable={props.user.role == 'superadmin' || (props.user.role == 'admin' && props.user.institute_key == institute.key)}
                                updateParent={updateInstitute}
                                owner={institute.key}
                                {...props}
                            />
                        </Card.Text>
                        <div style={{ position: 'relative' }}>
                            <Row>
                                <Col md={2}>
                                    <Card.Text>State: *</Card.Text>
                                </Col>
                                <Col md={4} style={{ paddingRight: '10px' }}>
                                    {props.user.role == 'superadmin' ?
                                        <StatesSelect 
                                            state={institute.state || ''}
                                            onSelect={onStateSelect}
                                            editableState={true} {...props} 
                                        />
                                        :
                                        <Card.Text>{institute.state}</Card.Text>
                                    }
                                </Col>
                                <Col md={2}>
                                    <Card.Text>Region: *</Card.Text>
                                </Col>
                                <Col md={4} style={{ paddingRight: '10px' }}>
                                    {props.user.role == 'superadmin' ?
                                        <RegionSelect
                                            region={institute.region || ''} 
                                            onSelect={onRegionSelect} 
                                            editableRegion={true} 
                                            {...props} 
                                        />
                                        :
                                        <Card.Text>{institute.region}</Card.Text>
                                    }
                                </Col>
                            </Row>
                            <Row style={{ marginTop: '20px' }}>
                                <Col md={2}>Address: *</Col>
                                <Col>
                                    <AutoSaveInput
                                        type="text"
                                        saveKey="address"
                                        value={institute.address}
                                        saveFn="saveInstituteData"
                                        editable={props.user.role == 'superadmin' || (props.user.role == 'admin' && props.user.institute_key == institute.key)}
                                        updateParent={updateInstitute}
                                        owner={institute.key}
                                        {...props}
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col md={2}>Country:</Col>
                                <Col md={4}>
                                    <AutoSaveInput
                                        type="text"
                                        saveKey="country"
                                        value={institute.country || 'India'}
                                        saveFn="saveInstituteData"
                                        editable={props.user.role == 'superadmin' || (props.user.role == 'admin' && props.user.institute_key == institute.key)}
                                        updateParent={updateInstitute}
                                        owner={institute.key}
                                        {...props}
                                    />
                                </Col>
                                <Col md={6} />
                            </Row>
                            <Row>
                                <Col md={2}>Website Link:</Col>
                                <Col>
                                    <AutoSaveInput
                                        type="text"
                                        saveKey="website"
                                        value={institute.website}
                                        saveFn="saveInstituteData"
                                        editable={props.user.role == 'superadmin' || (props.user.role == 'admin' && props.user.institute_key == institute.key)}
                                        updateParent={updateInstitute}
                                        owner={institute.key}
                                        {...props}
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col md={2}>Session Start Month</Col>
                                <Col>
                                    <MonthSelect 
                                        month={institute.session_start_month || ''} 
                                        onSelect={onMonthSelect} 
                                        editableMonth={props.user.role == 'superadmin'} 
                                        {...props}
                                    />
                                </Col>
                                <Col md={2}>Max Self Play Games</Col>
                                <Col>
                                    <AutoSaveInput
                                        type="number"
                                        saveKey="max_self_play_games"
                                        value={institute.max_self_play_games || ''}
                                        saveFn="saveInstituteData"
                                        editable={props.user.role == 'superadmin' || (props.user.role == 'admin' && props.user.institute_key == institute.key)}
                                        updateParent={updateInstitute}
                                        owner={institute.key}
                                        {...props}
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col md={2}></Col>
                                <Col></Col>
                                <Col md={2}><Form.Label>Show On Website</Form.Label></Col>
                                <Col>
                                    <Form.Check checked={institute.showOnWebsite || false} onChange={checkBoxChanged} />
                                </Col>
                            </Row>
                        </div>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};

export default InstituteGeneralInfo;

const RegionSelect = (props) => {
    const options = [
        {
            label: 'North',
            value: 'North'
        },
        {
            label: 'South',
            value: 'South'
        },
        {
            label: 'East',
            value: 'East'
        },
        {
            label: 'West',
            value: 'West'
        },
        {
            label: 'North East',
            value: 'North East'
        },
        {
            label: 'International',
            value: 'International'
        },
    ];
    var region = props.region;
    var selected = null;

    options.forEach((_opt) => {
        if (_opt.label == region) {
            selected = _opt;
        }
    });

    const onChange = (option) => {
        props.onSelect(option.value);
    };

    return (
        props.editableRegion ?
            <Select
                className="region_select"
                name="region_select"
                options={options}
                value={selected}
                onChange={onChange}
            />
            :
            <span>{props.region}</span>
    );
};


const MonthSelect = (props) => {
    const options = [
        {
            label: 'January',
            value: '1'
        },
        {
            label: 'February',
            value: '2'
        },
        {
            label: 'March',
            value: '3'
        },
        {
            label: 'April',
            value: '4'
        },
        {
            label: 'May',
            value: '5'
        },
        {
            label: 'June',
            value: '6'
        },
        {
            label: 'July',
            value: '7'
        },
        {
            label: 'August',
            value: '8'
        },
        {
            label: 'September',
            value: '9'
        },
        {
            label: 'October',
            value: '10'
        },
        {
            label: 'November',
            value: '11'
        },
        {
            label: 'December',
            value: '12'
        }
    ];
    const monthValue = [
        '',
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ];

    var month = props.month;
    var selected = null;

    options.forEach((_opt) => {
        if (_opt.value == month) {
            selected = _opt;
        }
    });

    const onChange = (option) => {
        props.onSelect(option.value);
    };

    return (
        props.editableMonth ?
            <Select
                className="month_select"
                name="month_select"
                options={options}
                value={selected}
                onChange={onChange}
            />
            :
            <span>{monthValue[parseInt(props.month || 0)]}</span>
    );
};
