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

const CaseStudiesList = (props) => {
    const [caseStudies, setCaseStudies] = useState([]);
    const [caseStudyName, setCaseStudyName] = useState('');
    const [selectedCaseStudy, setSelectedCaseStudy] = useState(null);
    const [error, setError] = useState('');
    const heading = props.heading || 'Case Studies';

    useEffect(() => {
        setError('');

        async function fetchData() {
            const data = await post('admin/case_study_list', props.user, null);
            if (data && data.rc) {
                setSelectedCaseStudy(null);
                return;
            }
            if (!data) {
                setSelectedCaseStudy(null);
                return;
            }
            setCaseStudies(data);
        }

        fetchData();
        setSelectedCaseStudy(sessionStorage.getItem('selected_case_study_key'));
    }, []);

    const inputChange = (e) => {
        setCaseStudyName(e.target.value);
    };

    const addItem = async () => {
        const name = caseStudyName.trim().replace(/[ ]+/g, ' ');
        if (!name.length) {
            setError('Please enter a case study name');
            return;
        }

        if (!/^[a-zA-Z0-9 \-\_]+$/i.test(name)) {
            setError('Please only enter alphanumeric string');
            return;
        }

        const data = await post('sadmin/case_study_add', props.user, {name: caseStudyName});
        if (data && data.rc) {
            setError(data.rc);
            return;
        }

        setCaseStudies(data);

        setError('');
        setCaseStudyName('');
    };

    const removeItem = async (key, name) => {
        Confirm({
            body: <span>Any games linked with this case study would also be deleted.</span>,
            callback: async () => {
                const data = await post('sadmin/case_study_remove', props.user, {key: key});
                if (data && data.rc) {
                    setError(data.rc);
                    return;
                }
        
                setCaseStudies(data);
            },
            title: <span>Do you want to delete case study {name}?</span>,
            buttonText: 'Delete ' + name
        });
    };

    const changeCaseStudy = async (key) => {
        setSelectedCaseStudy(key);
        sessionStorage.setItem('selected_case_study_key', key);
        await props.updateData();
    };

    const isValid = (value) => {
        return /^[a-zA-Z0-9 \-\_]+$/.test(value);
    };

    const changeCaseStudyName = async (key, value) => {
        if (!/^[a-zA-Z0-9 \-\_]+$/.test(value)) {
            ShowToast({icon: 'danger', heading: 'Error saving the text', small: props.name, message: 'Only alphanumeric characters allowed'});
            return false;
        }

        const data = await post('sadmin/change_case_study_name', props.user, {key: key, name: value});
        if (data && data.rc) {
            ShowToast({icon: 'danger', heading: 'Error saving the text', small: props.name, message: data.rc});
            return false;
        }

        return true;
    };

    return <Card className="container-card">
        <Card.Header>{heading}</Card.Header>
        <Card.Body>
            <Card>
            <Card.Header>Add Case Study</Card.Header>
            <Card.Body>
            <Form>
                <Form.Group className="mb-3" controlId="caseStudyName">
                    <Form.Label>Case Study Name</Form.Label>
                    <Form.Control type="text" placeholder="Case Study Name..." value={caseStudyName} onChange={inputChange} />
                    {error && <span className="errormsg">{error}</span>}
                </Form.Group>
                <Button onClick={addItem}>Add</Button>
            </Form>
            </Card.Body>
            </Card>
            <div style={{height: '15px'}}></div>
            <Card>
            <Card.Header>Case Study List</Card.Header>
            <Card.Body>
            
            <Table className="case_study_list">
                <thead>
                    <tr>
                        <th>Case Study Name</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                {caseStudies.map((caseStudy, idx) => (
                    <tr key={caseStudy.key + idx} className={(caseStudy.key == selectedCaseStudy ? 'active' : '')}>
                        <td>
                            <EditableText 
                                name={caseStudy.name}
                                editable={props.user.role == 'superadmin'} 
                                text={caseStudy.name}
                                onSave={async (text) => {return await changeCaseStudyName(caseStudy.key, text)}} 
                                isValid={isValid}
                            />
                        </td>
                        <td onClick={async () => {await changeCaseStudy(caseStudy.key)}}><Icon name="edit" /></td>
                        <td onClick={async () => {await removeItem(caseStudy.key, caseStudy.name)}}><Icon name="remove" /></td>
                    </tr>
                ))}
                </tbody>
            </Table>
            </Card.Body>
            </Card>
        </Card.Body>
    </Card>;
};

export default CaseStudiesList;
