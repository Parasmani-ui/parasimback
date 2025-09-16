import React from "react";
import { useState, useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import { post } from '../utils/ServerCall';
import Icon from '../Icon';
import gameConfig from '../../gameConfig';
import Confirm from '../utils/Confirm';
import { compareObjects } from '../utils/common';

const ChangeSystemStyles = (props) => {
    const defaultStyles = gameConfig.defaultStyles;
    const [originalOverrideStyles, setOriginalOverrideStyles] = useState({});
    const [overrideStyles, setOverrideStyles] = useState({});
    const [newStyles, setNewStyles] = useState({});
    const [dirty, setDirty] = useState(false);
    const heading = props.heading || 'Change System Styles';

    const checkDirty = () => {
        const _overrides = !compareObjects(overrideStyles, originalOverrideStyles);
        const _styles = !compareObjects(newStyles, { ...defaultStyles, ...originalOverrideStyles });

        setDirty(_overrides || _styles);
    };

    useEffect(() => {
        async function fetchData() {
            const _overrideStyles = await post('sadmin/get_styles', props.user, null);
            if (_overrideStyles && _overrideStyles.rc) {
                return;
            }
            if (!_overrideStyles) {
                return;
            }
            setOriginalOverrideStyles(_overrideStyles);
            setOverrideStyles(_overrideStyles);
            const _newStyles = { ...defaultStyles, ..._overrideStyles };
            setNewStyles(_newStyles);
        }

        const _overrideStyles = JSON.parse(sessionStorage.getItem('system_data_override_styles'));
        const _originalOverrideStyles = JSON.parse(sessionStorage.getItem('system_data_override_styles_original'));
        const _newStyles = JSON.parse(sessionStorage.getItem('system_data_new_styles'));

        if (_overrideStyles && _newStyles && _originalOverrideStyles) {
            setOriginalOverrideStyles(_originalOverrideStyles);
            setOverrideStyles(_overrideStyles);
            setNewStyles(_newStyles);
        }
        else {
            fetchData();
        }
    }, []);

    useEffect(() => {
        sessionStorage.setItem('system_data_override_styles', JSON.stringify(overrideStyles));
        checkDirty();
    }, [overrideStyles]);

    useEffect(() => {
        sessionStorage.setItem('system_data_new_styles', JSON.stringify(newStyles));
        checkDirty();
    }, [newStyles]);

    useEffect(() => {
        sessionStorage.setItem('system_data_override_styles_original', JSON.stringify(originalOverrideStyles));
    }, [originalOverrideStyles]);

    const changeStyle = (prop, value) => {
        const _newStyles = { ...newStyles };
        _newStyles[prop] = value;
        setNewStyles(_newStyles);
    };

    const saveStyles = async () => {
        if (!dirty) {
            return;
        }

        var _styles = overrideStyles;
        for (var prop in newStyles) {
            if (newStyles[prop] != (overrideStyles[prop] || defaultStyles[prop])) {
                _styles[prop] = newStyles[prop];
            }
        }

        for (var prop in _styles) {
            if (_styles[prop] == defaultStyles[prop]) {
                delete _styles[prop];
            }
        }

        await post('sadmin/save_styles', props.user, _styles);
        sessionStorage.removeItem('system_data_override_styles_original');
        sessionStorage.removeItem('system_data_override_styles');
        sessionStorage.removeItem('system_data_new_styles');
        setOriginalOverrideStyles(_styles);
        setOverrideStyles(_styles);
        setNewStyles({ ...defaultStyles, ..._styles });
        await props.updateTheme();
    };

    const undoStyles = () => {
        if (!dirty) {
            return;
        }

        Confirm({
            body: <span>All changes you made would be reverted back.</span>,
            callback: () => {
                setOverrideStyles({ ...originalOverrideStyles });
                setNewStyles({ ...defaultStyles, ...overrideStyles });
                setDirty(false);
            },
            title: 'Do you want to undo all changes?',
            buttonText: 'Undo All'
        });
    };

    const undoStyle = (prop) => {
        if (originalOverrideStyles.hasOwnProperty(prop) && !overrideStyles.hasOwnProperty(prop)) {
            const _overrideStyles = { ...overrideStyles };
            _overrideStyles[prop] = originalOverrideStyles[prop];
            setOverrideStyles(_overrideStyles);
        }
        const _newStyles = { ...newStyles };
        _newStyles[prop] = overrideStyles[prop] || defaultStyles[prop];
        setNewStyles(_newStyles);
        checkDirty();
    };

    const removeOverride = (prop) => {
        const _overrideStyles = { ...overrideStyles };
        delete _overrideStyles[prop];
        setOverrideStyles(_overrideStyles);
        const _newStyles = { ...newStyles };
        _newStyles[prop] = defaultStyles[prop];
        setNewStyles(_newStyles);
        checkDirty();
    };

    return (
        <Card className="container-card">
            <Card.Header>{heading}</Card.Header>
            <Card.Body>
                <Table>
                    <thead>
                        <tr>
                            <th>Variable</th>
                            <th>Default Value</th>
                            <th>Override Value</th>
                            <th></th>
                            <th>Effective Value</th>
                            <th onClick={saveStyles} >{dirty && <Icon name="save" />}</th>
                            <th onClick={undoStyles} >{dirty && <Icon name="undo" />}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {overrideStyles && newStyles && originalOverrideStyles && Object.keys(defaultStyles).map((prop) => (
                            <tr key={prop}>
                                <td>{prop}</td>
                                <td style={{ position: 'relative' }}>
                                    <div className="valign_middle" style={{ display: 'inline-block', left: '50px' }}>{defaultStyles[prop]}</div>
                                </td>
                                <td style={{ position: 'relative' }}>
                                    {overrideStyles.hasOwnProperty(prop) &&
                                        <div>
                                            <div className="valign_middle" style={{ display: 'inline-block', left: '50px' }}>{overrideStyles[prop]}</div>
                                        </div>
                                    }
                                </td>
                                <td onClick={() => removeOverride(prop)} >
                                    {overrideStyles.hasOwnProperty(prop) &&
                                        <Icon name="cross" />
                                    }
                                </td>
                                <td style={{ position: 'relative', width: '300px' }}>
                                    <input type="text" className="valign_middle" style={{ height: '30px', width: '250px', border: '1px solid darkgray', display: 'inline-block' }} value={newStyles[prop] || '#ffffff'} onChange={(e) => changeStyle(prop, e.target.value)} />
                                </td>
                                <td>
                                    {((overrideStyles[prop] != newStyles[prop] && defaultStyles[prop] != newStyles[prop]) ||
                                        (originalOverrideStyles.hasOwnProperty(prop) && !overrideStyles.hasOwnProperty(prop))) &&
                                        <span className="errormsg">Changed</span>
                                    }
                                </td>
                                <td onClick={() => undoStyle(prop)} >
                                    {((overrideStyles[prop] != newStyles[prop] && defaultStyles[prop] != newStyles[prop]) ||
                                        (originalOverrideStyles.hasOwnProperty(prop) && !overrideStyles.hasOwnProperty(prop))) &&
                                        <Icon name="undo" />
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card.Body>
        </Card>
    );
};

export default ChangeSystemStyles;
