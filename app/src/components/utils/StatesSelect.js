import React from "react";
import { useState, useEffect } from "react";
import Select from 'react-select';
import states from '../../context/states';

const StatesSelect = (props) => {
    const options = [];
    var state = props.state;

        states.forEach((_state) => {
            const _opt = _state;
            _opt.value = _state.name;
            _opt.label = _state.name;
            options.push(_opt);
            if (_opt.name == props.state) {
                state = _opt;
            }
        });    

    const onChange = (option) => {
        props.onSelect(option.value);
    };

    return (
        props.editableState ?
            <Select
                className="states_select"
                name="states_select"
                options={options}
                value={state}
                onChange={onChange}
            />
        :
            <span>{props.state}</span>
    );
};

export default StatesSelect;
