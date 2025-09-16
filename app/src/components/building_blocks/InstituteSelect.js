import React from "react";
import { useState, useEffect } from "react";
import Select from 'react-select';
import Card from 'react-bootstrap/Card';
import { post } from '../utils/ServerCall.js';
import ShowToast from '../utils/ShowToast';

const InstituteSelect = (props) => {
    const [instituteKey, setInstituteKey] = useState(sessionStorage.getItem('selected_institute'));
    const [institute, setInstitute] = useState();
    const [instituteList, setInstituteList] = useState(null);
    const [options, setOptions] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const heading = props.heading || 'Select Institute';

    useEffect(() => {
        async function fetchData() {
            const data = await post('sadmin/institute_list', props.user, null);
            if (data && data.rc) {
                ShowToast({ icon: 'danger', heading: 'Error running transaction', message: data.rc });
                return;
            }
            if (!data) {
                return;
            }
            setInstituteList(data);
            const _options = [];
            data.forEach((inst) => {
                const _opt = {
                    label: inst.name,
                    value: inst.key
                };

                _options.push(_opt);
            });
            setOptions(_options);

            const _key = sessionStorage.getItem('selected_institute');
            if (_key) {
                await changeInstitute(_options, _key);
            }
        }

        fetchData();
    }, []);


    const changeInstitute = async (_options, _key) => {
        setInstituteKey(_key);
        const data = await post('admin/select_institute', props.user, { key: _key });
        if (data && data.rc) {
            ShowToast({ icon: 'danger', heading: 'Error in institute', message: data.rc });
            return;
        }
        if (!data) {
            return;
        }
        setInstitute(data);
        _options.forEach((_opt) => {
            if (_opt.value == _key) {
                setSelectedOption(_opt);
            }
        });
        await props.updateInstitute({...data});
    };

    useEffect(() => {
        sessionStorage.setItem('selected_institute', instituteKey);
    }, [instituteKey]);

    const onSelectChange = async (option) => {
        await changeInstitute(options, option.value);
    };

    return (
        <>
        <Card>
            <Card.Header>{heading}</Card.Header>
            <Card.Body>
                {options && <Select
                    className="institutes_select"
                    name="institutes_select"
                    options={options}
                    value={selectedOption}
                    onChange={onSelectChange}
                />
                }
                {institute &&
                    <Card.Title>
                        Selected Institute {institute.name}
                    </Card.Title>
                }
            </Card.Body>
        </Card>
        </>
    );
};

export default InstituteSelect;
