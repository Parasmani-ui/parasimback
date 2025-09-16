import React from "react";
import { useState, useEffect } from "react";
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { post } from '../utils/ServerCall';
import EditableText from '../utils/EditableText';
import Icon from '../Icon.js';
import ShowToast from '../utils/ShowToast';
import Confirm from '../utils/Confirm';

const InstitutesList = (props) => {
    const [institutes, setInstitutes] = useState([]);
    const [instituteName, setInstituteName] = useState('');
    const [error, setError] = useState('');
    const heading = props.heading || 'Institutes';

    useEffect(() => {
        const fetchData = async () => {
            const data = await post('sadmin/institute_list', props.user, null);
            if (data && data.rc) {
                setInstitutes(null);
                return;
            }
            setInstitutes(data);
        };

        setError('');
        fetchData();
    }, []);

    const inputChange = (e) => {
        setInstituteName(e.target.value);
    };

    const addItem = async () => {
        const name = instituteName.trim().replace(/[ ]+/g, ' ');
        if (!name.length) {
            setError('Please enter an institute name');
            return;
        }

        if (!/^[a-zA-Z0-9 \-\_]+$/i.test(name)) {
            setError('Please only enter alphanumeric string');
            return;
        }

        const data = await post('sadmin/institute_add', props.user, { name: instituteName });
        if (data && data.rc) {
            setError(data.rc);
            return;
        }

        setInstitutes(data);

        setError('');
        setInstituteName('');
    };

    const removeItem = async (key, name) => {
        Confirm({
            body: <span>All games,  users and faculty linked to this user would also be deleted. </span>,
            callback: async () => {
                const data = await post('sadmin/institute_remove', props.user, { key: key });
                if (data && data.rc) {
                    setError(data.rc);
                    return;
                }
                setInstitutes(data);
            },
            title: <span>Do you want to delete institute {name}?</span>,
            buttonText: 'Delete ' + name
        });
    };

    const updateData = async (key) => {
        sessionStorage.setItem('selected_institute', key);
        props.changePage('edit_institute');
    };

    const isValid = (value) => {
        return /^[a-zA-Z0-9 \-\_]+$/.test(value);
    };

    const changeInstituteName = async (key, value) => {
        if (!/^[a-zA-Z0-9 \-\_\.]+$/.test(value)) {
            ShowToast({ icon: 'danger', heading: 'Error saving the text', small: props.name, message: 'Only alphanumeric characters allowed' });
            return false;
        }

        const data = await post('sadmin/change_institute_name', props.user, { key: key, name: value });
        if (data && data.rc) {
            ShowToast({ icon: 'danger', heading: 'Error saving the text', small: props.name, message: data.rc });
            return false;
        }

        return true;
    };

    return <Card className="container-card">
        <Card.Header>{heading}</Card.Header>
        <Card.Body>
            <Card>
                <Card.Header>Add Institute</Card.Header>
                <Card.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="instituteName">
                            <Form.Label>Institute Name</Form.Label>
                            <Form.Control type="text" placeholder="Institute Name..." value={instituteName} onChange={inputChange} />
                            {error && <span className="errormsg">{error}</span>}
                        </Form.Group>
                        <Button onClick={addItem}>Add</Button>
                    </Form>
                </Card.Body>
            </Card>
            <div style={{ height: '15px' }}></div>
            <Card>
                <Card.Header>Institute List</Card.Header>
                <Card.Body>

                    <Table className="institute_list">
                        <thead>
                            <tr>
                                <th>Institute Name</th>
                                <th></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {institutes.map((institute, idx) => (
                                <tr key={institute.key + idx}>
                                    <td>
                                        <EditableText
                                            name={institute.name}
                                            editable={props.user.role == 'superadmin'}
                                            text={institute.name}
                                            onSave={async (text) => { return await changeInstituteName(institute.key, text) }}
                                            isValid={isValid}
                                        />
                                    </td>
                                    <td onClick={async () => { await updateData(institute.key) }}><Icon name="edit" /></td>
                                    <td onClick={async () => { await removeItem(institute.key, institute.name) }}><Icon name="remove" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </Card.Body>
    </Card>;
};

export default InstitutesList;
