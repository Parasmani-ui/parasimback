import React, { useCallback } from "react";
import { useState, useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import { post } from '../utils/ServerCall';
import Icon from '../Icon';
import gameConfig from '../../gameConfig';
import Confirm from '../utils/Confirm';
import { compareObjects } from '../utils/common';

const ChangeSystemColors = (props) => {
    const defaultColors = gameConfig.defaultColors;
    const [originalOverrideColors, setOriginalOverrideColors] = useState({});
    const [overrideColors, setOverrideColors] = useState({});
    const [newColors, setNewColors] = useState({});
    const [dirty, setDirty] = useState(false);
    const heading = props.heading || 'Change System Colors';

    const checkDirty = () => {
        const _overrides = !compareObjects(overrideColors, originalOverrideColors);
        const _colors = !compareObjects(newColors, { ...defaultColors, ...originalOverrideColors });

        setDirty(_overrides || _colors);
    };

    useEffect(() => {
        async function fetchData() {
            const _overrideColors = await post('sadmin/get_colors', props.user, null);
            if (_overrideColors && _overrideColors.rc) {
                return;
            }
            if (!_overrideColors) {
                return;
            }
            setOriginalOverrideColors(_overrideColors);
            setOverrideColors(_overrideColors);
            const _newColors = { ...defaultColors, ..._overrideColors };
            setNewColors(_newColors);
        }

        const _overrideColors = JSON.parse(sessionStorage.getItem('system_data_override_colors'));
        const _originalOverrideColors = JSON.parse(sessionStorage.getItem('system_data_override_colors_original'));
        const _newColors = JSON.parse(sessionStorage.getItem('system_data_new_colors'));

        if (_overrideColors && _newColors && _originalOverrideColors) {
            setOriginalOverrideColors(_originalOverrideColors);
            setOverrideColors(_overrideColors);
            setNewColors(_newColors);
        }
        else {
            fetchData();
        }
    }, []);

    useEffect(() => {
        sessionStorage.setItem('system_data_override_colors', JSON.stringify(overrideColors));
        checkDirty();
    }, [overrideColors]);

    useEffect(() => {
        sessionStorage.setItem('system_data_new_colors', JSON.stringify(newColors));
        checkDirty();
    }, [newColors]);

    useEffect(() => {
        sessionStorage.setItem('system_data_override_colors_original', JSON.stringify(originalOverrideColors));
    }, [originalOverrideColors]);

    const changeColor = (prop, value) => {
        const _newColors = { ...newColors };
        _newColors[prop] = value;
        setNewColors(_newColors);
    };

    const saveColors = async () => {
        if (!dirty) {
            return;
        }

        var _colors = overrideColors;
        for (var prop in newColors) {
            if (newColors[prop] != (overrideColors[prop] || defaultColors[prop])) {
                _colors[prop] = newColors[prop];
            }
        }

        for (var prop in _colors) {
            if (_colors[prop] == defaultColors[prop]) {
                delete _colors[prop];
            }
        }

        const output = await post('sadmin/save_colors', props.user, _colors);
        sessionStorage.removeItem('system_data_override_colors_original');
        sessionStorage.removeItem('system_data_override_colors');
        sessionStorage.removeItem('system_data_new_colors');
        setOriginalOverrideColors(_colors);
        setOverrideColors(_colors);
        setNewColors({ ...defaultColors, ..._colors });
        await props.updateTheme();
    };

    const undoColors = () => {
        if (!dirty) {
            return;
        }

        Confirm({
            body: <span>All changes you made would be reverted back.</span>,
            callback: () => {
                setOverrideColors({ ...originalOverrideColors });
                setNewColors({ ...defaultColors, ...overrideColors });
                setDirty(false);
            },
            title: 'Do you want to undo all changes?',
            buttonText: 'Undo All'
        });
    };

    const undoColor = (prop) => {
        if (originalOverrideColors.hasOwnProperty(prop) && !overrideColors.hasOwnProperty(prop)) {
            const _overrideColors = { ...overrideColors };
            _overrideColors[prop] = originalOverrideColors[prop];
            setOverrideColors(_overrideColors);
        }
        const _newColors = { ...newColors };
        _newColors[prop] = overrideColors[prop] || defaultColors[prop];
        setNewColors(_newColors);
        checkDirty();
    };

    const removeOverride = (prop) => {
        const _overrideColors = { ...overrideColors };
        delete _overrideColors[prop];
        setOverrideColors(_overrideColors);
        const _newColors = { ...newColors };
        _newColors[prop] = defaultColors[prop];
        setNewColors(_newColors);
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
                            <th onClick={saveColors} >{dirty && <Icon name="save" />}</th>
                            <th onClick={undoColors} >{dirty && <Icon name="undo" />}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {overrideColors && newColors && originalOverrideColors && Object.keys(defaultColors).map((prop) => (
                            <tr key={prop}>
                                <td>{prop}</td>
                                <td style={{ position: 'relative' }}>
                                    <div className="valign_middle" style={{ height: '30px', width: '30px', backgroundColor: defaultColors[prop], border: '1px solid darkgray', display: 'inline-block' }}></div>
                                    <div className="valign_middle" style={{ display: 'inline-block', left: '50px' }}>{defaultColors[prop]}</div>
                                </td>
                                <td style={{ position: 'relative' }}>
                                    {overrideColors.hasOwnProperty(prop) &&
                                        <div>
                                            <div className="valign_middle" style={{ height: '30px', width: '30px', backgroundColor: overrideColors[prop], border: '1px solid darkgray', display: 'inline-block' }}></div>
                                            <div className="valign_middle" style={{ display: 'inline-block', left: '50px' }}>{overrideColors[prop]}</div>
                                        </div>
                                    }
                                </td>
                                <td onClick={() => removeOverride(prop)} >
                                    {overrideColors.hasOwnProperty(prop) &&
                                        <Icon name="cross" />
                                    }
                                </td>
                                <td style={{ position: 'relative' }}>
                                    <input type="color" className="valign_middle" style={{ height: '30px', width: '30px', border: '1px solid darkgray', display: 'inline-block' }} value={newColors[prop] || '#ffffff'} onChange={(e) => changeColor(prop, e.target.value)} />
                                    <div className="valign_middle" style={{ display: 'inline-block', left: '50px' }}>{newColors[prop]}</div>
                                </td>
                                <td>
                                    {((overrideColors[prop] != newColors[prop] && defaultColors[prop] != newColors[prop]) ||
                                        (originalOverrideColors.hasOwnProperty(prop) && !overrideColors.hasOwnProperty(prop))) &&
                                        <span className="errormsg">Changed</span>
                                    }
                                </td>
                                <td onClick={() => undoColor(prop)} >
                                    {((overrideColors[prop] != newColors[prop] && defaultColors[prop] != newColors[prop]) ||
                                        (originalOverrideColors.hasOwnProperty(prop) && !overrideColors.hasOwnProperty(prop))) &&
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

export default ChangeSystemColors;
