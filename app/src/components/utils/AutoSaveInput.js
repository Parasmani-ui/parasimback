import React from "react";
import { useState, useEffect } from "react";
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { post } from './ServerCall';
import Icon from '../Icon.js';
import ShowToast from './ShowToast';
import db from '../utils/db';

const input_types = (props) => {
    const _input_types = {
        'currency_int_pos': {
            type: 'number',
            prefix: <Icon name={props.caseStudy && props.caseStudy.currency ? props.caseStudy.currency : 'dollar'} />,
            regex: /^[0-9]+$/,
            error: 'Only positive integer values allowed'
        },
        'currency_dec_pos': {
            type: 'number',
            prefix: <Icon name={props.caseStudy && props.caseStudy.currency ? props.caseStudy.currency : 'dollar'} />,
            regex: /^[0-9]+\.?[0-9]{0,2}$/,
            error: 'Only positive decimal values allowed'
        },
        'currency_int_neg': {
            type: 'number',
            prefix: <Icon name={props.caseStudy && props.caseStudy.currency ? props.caseStudy.currency : 'dollar'} />,
            regex: /^\-?[0-9]+$/,
            error: 'Only positive or negative integer values allowed'
        },
        'currency_dec_neg': {
            type: 'number',
            prefix: <Icon name={props.caseStudy && props.caseStudy.currency ? props.caseStudy.currency : 'dollar'} />,
            regex: /^\-?[0-9]+\.?[0-9]{0,2}$/,
            error: 'Only positive or negative decimal values allowed'
        },
        'pct_int_pos': {
            type: 'number',
            regex: /^[0-9]+$/,
            suffix: '%',
            error: 'Only positive integer values allowed'
        },
        'pct_dec_pos': {
            type: 'number',
            regex: /^[0-9]+\.?[0-9]{0,2}$/,
            suffix: '%',
            error: 'Only positive decimal values allowed'
        },
        'pct_int_neg': {
            type: 'number',
            regex: /^\-?[0-9]+$/,
            suffix: '%',
            error: 'Only positive integer values allowed'
        },
        'pct_dec_neg': {
            type: 'number',
            regex: /^\-?[0-9]+\.?[0-9]{0,2}$/,
            suffix: '%',
            error: 'Only positive decimal values allowed'
        },
        'int_pos': {
            type: 'number',
            regex: /^[0-9]+$/,
            error: 'Only positive integer values allowed'
        },
        'int_neg': {
            type: 'number',
            regex: /^\-?[0-9]+$/,
            error: 'Only positive or negative integer values allowed'
        },
        'dec_pos': {
            type: 'number',
            regex: /^[0-9]+\.?[0-9]{0,2}$/,
            error: 'Only positive decimal values allowed'
        },
        'dec_neg': {
            type: 'number',
            regex: /^\-?[0-9]+\.?[0-9]{0,2}$/,
            error: 'Only positive or negative decimal values allowed'
        },
        'alphanum_only': {
            regex: /^[a-zA-Z0-9\.\(\)\&\-\_\+\*\'\"]+$/,
            error: 'Only alphabets and numeric digits allowed'
        },
        'alphanum': {
            regex: /^[a-zA-Z0-9\s\.\(\)\&\-\_\+\*\'\"\[\]]+$/,
            error: 'Only alphabets, numeric digits and spaces allowed'
        },
    };

    const inputType = _input_types[props.type] || {type: props.type};
    inputType.regex = props.regex || inputType.regex;
    inputType.error = props.error || inputType.error || 'Invalid value in the input field';

    return inputType;
};

const AutoSaveInput = (props) => {
    const [owner, setOwner] = useState();
    const [value, setValue] = useState(props.value);
    const [showSave, setShowSave] = useState(false);
    const [valid, setValid] = useState(true);

    const inputType = input_types(props);
    const style = props.style || {};

    useEffect(() => {
        if (props.owner && props.owner != owner ) {
            setValue(props.value || '');
            setOwner(props.owner);
            setShowSave(false);
        }
        else
        {
            //setValue(value);
        }
    });

    const isValid = (value) => {
        return inputType.regex ? inputType.regex.test(value) : true;
    };

    const onSave = async () => {
        const _isValid = props.isValid || isValid;
        const errorMessage = props.errorMessage || inputType.error;

        if (!isValid(value)) {
            ShowToast({icon: 'danger', heading: 'Unable to save invalid value', small: inputType.type, message: errorMessage});
            setShowSave(true);
            return;
        }

        if (props.onSave) {
            const result = await props.onSave(value);
            if (result) {
                setShowSave(false);
            }
            return;
        }

        const saveFunction = props.saveFn || 'saveCaseStudyData';

        await db[saveFunction](props, props.saveKey, value, props.filters || null, false);
        setShowSave(false);
    };

    const onCancel = () => {
        setValue(props.value);
        setShowSave(false);
        setValid(true);
    };

    const onChange = (e) => {
        setValue(e.target.value);
        setShowSave(e.target.value != props.value);
        setValid(isValid(e.target.value));
    };

    return (
        <InputGroup className="mb-3">
            {props.prefix && <InputGroup.Text>{props.prefix}</InputGroup.Text>}
            {inputType.prefix && <InputGroup.Text>{inputType.prefix}</InputGroup.Text>}
            <Form.Control 
                type={inputType.type}
                value={value || ''}
                onChange={onChange} 
                className={(valid ? '' : 'invalid_input')}
                style={style}
                {...props.inputProps}
            />
            {inputType.suffix && <InputGroup.Text>{inputType.suffix}</InputGroup.Text>}
            {props.suffix && <InputGroup.Text>{props.suffix}</InputGroup.Text>}
            {showSave && <InputGroup.Text onClick={onSave}><Icon name="save" /></InputGroup.Text>}
            {showSave && <InputGroup.Text onClick={onCancel}><Icon name="cross" /></InputGroup.Text>}
        </InputGroup>
    );
};

export default AutoSaveInput;
