import React from "react";
import FormatData from './FormatData';
import {_functions} from '../context/hooks.js';

const CallFunction = (props) => {
    const user = props.user;
    const gameData = props.gameData;
    const caseStudy = props.caseStudy;
    const context = props.context;
    const fn = props.fn;
    const format = props.format;
    const name = props.name;
    const overrides = props.functionOverrides;

    if (!_functions) {
        _functions = defaultFunctions;

        for (var prop in overrides) {
            _functions[prop] = overrides[prop];
        }
    }

    const [type, exp] = fn.trim().split(':');

    var value;
    switch (type) {
        case 'fn':
            if (!_functions[exp]) {
                console.error('Function: ' + exp + ' not found');
                return <span className="function_not_found"></span>;
            }

            value = _functions[exp] ? _functions[exp](user, caseStudy, gameData, context) : '';
        break;
        case 'exp':
            value = '###'; //evaluateExpression(exp)
        break;
        default:
            console.error('function type: ' + type + ' not found');
    }
    
    return <FormatData
        caseStudy={caseStudy}
        format={format}
        name={name}
        value={value}
        formatOverrides={props.formatOverrides} />;

};

export default CallFunction;
