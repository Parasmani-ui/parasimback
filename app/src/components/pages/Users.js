import React from "react";
import { useState, useEffect, useRef } from "react";
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { post, upload } from '../utils/ServerCall';
import InstituteSelect from '../building_blocks/InstituteSelect';
import Icon from '../Icon.js';
import ShowToast from '../utils/ShowToast';
import Confirm from '../utils/Confirm';
import gameConfig from '../../gameConfig';

const UsersList = (props) => {
    const [users, setUsers] = useState([]);
    const [userKey, setUserKey] = useState(null);
    const [userName, setUserName] = useState('');
    const [rollNo, setRollNo] = useState('');
    const [collegeEmail, setCollegeEmail] = useState('');
    const [personalEmail, setPersonalEmail] = useState('');
    const [phoneNo, setPhoneNo] = useState('');
    const [program, setProgram] = useState('');
    const [password, setPassword] = useState('');
    const [instituteKey, setInstituteKey] = useState(props.user.role == 'admin' ? props.user.institute_key : null);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [npages, setNpages] = useState(1);
    const [uploadErrors, setUploadErrors] = useState(null);
    const heading = props.heading || 'Users';
    const uploadInput = useRef();
    const pageSize = 100;

    const paginatorStyle = { margin: '2px', border: '1px solid black', width: '35px', height: '35px', backgroundColor: 'white', fontSize: '0.8rem', color: 'black' };
    const paginatorStyleActive = { ...paginatorStyle, fontWeight: 'bold', border: '2px solid black', backgroundColor: '#eeeeee' };

    const fetchData = async (instKey) => {
        const data = await post('admin/user_list', props.user, { institute_key: instKey || instituteKey, page: page, page_size: pageSize });
        if (data && data.rc) {
            return;
        }
        if (!data) {
            return;
        }
        if (data.npages < data.page) {
            setPage(data.npages);
        }
        setNpages(data.npages);
        setUsers(data.users);
    };

    useEffect(() => {
        setError('');
        fetchData();
    }, []);

    useEffect(() => {
        fetchData();
    }, [page]);

    const updateInstitute = async (inst) => {
        if (!inst) {
            return;
        }
        if (props.user.role == 'superadmin') {
            setInstituteKey(inst.key);
            await fetchData(inst.key);
            //fetch(inst.key);
        }
    };

    const userNameChange = (e) => {
        setUserName(e.target.value);
    };

    const rollNoChange = (e) => {
        setRollNo(e.target.value);
    };

    const collegeEmailChange = (e) => {
        setCollegeEmail(e.target.value);
    };

    const personalEmailChange = (e) => {
        setPersonalEmail(e.target.value);
    };

    const phoneNoChange = (e) => {
        setPhoneNo(e.target.value);
    };

    const programChange = (e) => {
        setProgram(e.target.value);
    };

    const passwordChange = (e) => {
        setPassword(e.target.value);
    };

    const saveUser = async () => {
        const name = userName.trim().replace(/[ ]+/g, ' ');
        if (!name.length) {
            setError('Please enter a user name');
            return;
        }

        if (!/^[a-zA-Z \.\-\_0-9]+$/i.test(name)) {
            setError('Please only enter alphabetic string');
            return;
        }

        const _user = {
            roll_no: rollNo,
            name: userName,
            email: collegeEmail,
            personal_email: personalEmail,
            phone: phoneNo,
            program: program,
            role: 'user'
        };

        const data = await post('admin/user_save', props.user, { key: userKey, institute_key: instituteKey, user: _user, page: page, page_size: pageSize });
        if (data && data.rc) {
            ShowToast({ icon: 'danger', heading: 'Error saving user', message: data.rc });
            return;
        }

        if (data.npages < data.page) {
            setPage(data.npages);
        }
        setNpages(data.npages);
        setUsers(data.users);
        setError('');

        setUserKey(null);
        setUserName('');
        setRollNo('');
        setCollegeEmail('');
        setPersonalEmail('');
        setPhoneNo('');
        setProgram('');
        setPassword('');
    };

    const savePassword = async () => {
        if (!userKey) {
            ShowToast({ icon: 'danger', heading: 'No User Selected', message: 'Please select a user to change password' });
            return;
        }

        const data = await post('admin/user_save_password', props.user, { key: userKey, password: password });
        if (data && data.rc) {
            setError(data.rc);
            return;
        }

        setError('');

        setUserKey(null);
        setUserName('');
        setRollNo('');
        setCollegeEmail('');
        setPersonalEmail('');
        setPhoneNo('');
        setProgram('');
        setPassword('');
        ShowToast({ icon: 'success', heading: 'Success', message: 'Password changed successfully' });
    };

    const resetPassword = async () => {
        if (!userKey) {
            ShowToast({ icon: 'danger', heading: 'No User Selected', message: 'Please select a user to reset password' });
            return;
        }

        const data = await post('admin/user_reset_password', props.user, { key: userKey, password: password });
        if (data && data.rc) {
            setError(data.rc);
            return;
        }

        setError('');

        setUserKey(null);
        setUserName('');
        setRollNo('');
        setCollegeEmail('');
        setPersonalEmail('');
        setPhoneNo('');
        setProgram('');
        setPassword('');
        ShowToast({ icon: 'success', heading: 'Success', message: 'Password reset successfully' });
    };
    
    const removeItem = async (key, name) => {
        Confirm({
            body: <span>Do you want to delete user {name}?</span>,
            callback: async () => {
                const data = await post('admin/user_remove', props.user, { key: key, institute_key: instituteKey, page: page, page_size: pageSize });
                if (data && data.rc) {
                    ShowToast({ icon: 'danger', heading: 'Cannot delete user', message: data.rc });
                    return;
                }
                if (!data) {
                    return;
                }

                if (data.npages < data.page) {
                    setPage(data.npages);
                }
                setNpages(data.npages);
                setUsers(data.users);
                setError('');
            },
            title: 'Are you sure?',
            buttonText: 'Delete ' + name
        });
    };

    const updateData = async (_user) => {
        setUserKey(_user.key);
        setUserName(_user.name);
        setRollNo(_user.roll_no);
        setCollegeEmail(_user.email);
        setPersonalEmail(_user.personal_email);
        setPhoneNo(_user.phone);
        setProgram(_user.program);

    };

    const fileUpload = async (e) => {
        setUploadErrors(null);
        if (!e.target.files) {
            return;
        }
        const file = e.target.files[0];
        e.target.value = null;
        const result = await upload('admin/upload_student_list', props.user, { institute_key: instituteKey }, file);
        if (result && result.rc) {
            ShowToast({ icon: 'danger', heading: 'Error in uploading', message: result.rc });
            return;
        }
        if (result.errors) {
            setUploadErrors(result.errors);
            ShowToast({
                icon: 'warning', heading: 'Errors in the file',
                message: <>
                    <div style={{ color: 'red', fontWeight: 'bold' }}>Errors in  {result.errors.length} records.</div>
                    <div>Inserted {result.inserted} records.</div>
                    <div>Updated {result.updated} records.</div>
                </>
            });
        }
        else {
            ShowToast({
                icon: 'success', heading: 'File Uploaded Successfully',
                message: <>
                    <div>Inserted {result.inserted} records.</div>
                    <div>Updated {result.updated} records.</div>
                </>
            });
        }
        await fetchData(instituteKey);
    };

    const uploadClicked = (e) => {
        uploadInput.current.click();
    };

    return (
        <Card className="container-card">
            <Card.Header>{heading}</Card.Header>
            <Card.Body>
                {props.user.role == 'superadmin' &&
                    <InstituteSelect
                        {...props}
                        updateInstitute={updateInstitute}
                    />
                }
                {instituteKey &&
                    <>
                        <div style={{ height: '15px' }}></div>
                        <Card>
                            <Card.Header>Add User</Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={2}>
                                        <div>Roll Number</div>
                                        <Form.Control 
                                            type="number" 
                                            name="rollNo" 
                                            placeholder="Roll Number..." 
                                            value={rollNo || ''} 
                                            onChange={rollNoChange} 
                                        />
                                    </Col>
                                    <Col>
                                        <div>User Name *</div>
                                        <Form.Control type="text" name="userName" placeholder="User Name..." value={userName || ''} onChange={userNameChange} />
                                    </Col>
                                    <Col md={4}>
                                        <div>Program</div>
                                        <Form.Control type="text" name="program" placeholder="Program..." value={program} onChange={programChange} />
                                    </Col>
                                </Row>
                                <Row style={{ marginTop: '15px' }}>
                                    <Col>
                                        <div>User Email ID *</div>
                                        <Form.Control type="email" name="collegeEmail" placeholder="User Email..." value={collegeEmail || ''} onChange={collegeEmailChange} />
                                    </Col>
                                    <Col>
                                        <div>Personal Email</div>
                                        <Form.Control type="email" name="personalEmail" placeholder="Personal Email..." value={personalEmail || ''} onChange={personalEmailChange} />
                                    </Col>
                                    <Col>
                                        <div>Phone Number</div>
                                        <Form.Control type="phone" name="phoneNo" placeholder="Phone Number..." value={phoneNo || ''} onChange={phoneNoChange} />
                                    </Col>
                                </Row>
                                <Container style={{ padding: '20px 0 0 0', textAlign: 'center' }}>
                                    <Button onClick={saveUser}>Save User</Button>
                                </Container>
                                {error &&
                                    <Container style={{ padding: '20px 0 0 0', textAlign: 'center', fontWeight: 'bold' }}>
                                        <span className="errormsg">{error}</span>
                                    </Container>
                                }
                            </Card.Body>
                        </Card>
                        <div style={{ height: '15px' }}></div>
                        <Card>
                            <Card.Header>Change Password</Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col>
                                        <div>Password *</div>
                                        <Form.Control type="text" name="password" placeholder="Password..." value={password || ''} onChange={passwordChange} />
                                    </Col>
                                    <Col style={{ position: 'relative' }}>
                                        <Button style={{ position: 'absolute', bottom: 0 }} onClick={savePassword}>Change Password</Button>
                                    </Col>
                                    <Col style={{ position: 'relative' }}>
                                        <Button style={{ position: 'absolute', bottom: 0 }} onClick={resetPassword}>Reset Password</Button>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                        <div style={{ height: '15px' }}></div>
                        <Card>
                            <Card.Header>
                                Student Data Upload
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col style={{ textAlign: 'center' }}>
                                        <DownloadButton />
                                    </Col>
                                    {instituteKey &&
                                        <Col style={{ textAlign: 'center' }}>
                                            <Button onClick={uploadClicked}>Upload User File</Button>
                                            <input ref={uploadInput} style={{ display: 'none' }} accept=".xls, .xlsx" type="file" onChange={fileUpload} />
                                        </Col>
                                    }
                                </Row>
                            </Card.Body>
                        </Card>
                        <div style={{ height: '15px' }}></div>
                        <Card>
                            <Card.Header>User List *</Card.Header>
                            <Card.Body>
                                {npages > 1 &&
                                    <div className="paginator" style={{ textAlign: 'center' }}>
                                        {Array.from(Array(npages).keys()).map((idx) => (
                                            <button style={(idx + 1) == page ? paginatorStyleActive : paginatorStyle} onClick={() => { setPage(idx + 1) }}>{idx + 1}</button>
                                        ))}
                                    </div>
                                }
                                <Table className="user_list">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Roll No</th>
                                            <th>User Name</th>
                                            <th>User Email</th>
                                            <th>Personal Email</th>
                                            <th>Phone No</th>
                                            <th>Program</th>
                                            <th></th>
                                            {props.user.role == 'superadmin' && <th></th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users && users.map((_user, idx) => (
                                            <tr key={_user.key + idx}>
                                                <td>{idx + 1}</td>
                                                <td>{_user.roll_no}</td>
                                                <td>{_user.name}</td>
                                                <td>{_user.email}</td>
                                                <td>{_user.personal_email}</td>
                                                <td>{_user.phone}</td>
                                                <td>{_user.program}</td>
                                                <td onClick={async () => { await updateData(_user) }}><Icon name="edit" /></td>
                                                {props.user.role == 'superadmin' &&
                                                    <td onClick={async () => { await removeItem(_user.key, _user.name) }}><Icon name="remove" /></td>
                                                }
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                        {uploadErrors &&
                            <>
                                <div style={{ height: '15px' }}></div>
                                <Card>
                                    <Card.Header>Error Records</Card.Header>
                                    <Card.Body>
                                        <Table className="user_list">
                                            <thead>
                                                <tr>
                                                    <th>Row</th>
                                                    <th>Roll No</th>
                                                    <th>User Name</th>
                                                    <th>User Email</th>
                                                    <th>Error Message</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {uploadErrors.map((_error, idx) => (
                                                    <tr key={idx}>
                                                        <td>{_error.row}</td>
                                                        <td>{_error.record.roll_no}</td>
                                                        <td>{_error.record.name}</td>
                                                        <td>{_error.record.email}</td>
                                                        <td style={{ color: 'red' }}>{_error.message}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                </Card>
                            </>
                        }
                    </>
                }
            </Card.Body>
        </Card>
    );
};

export default UsersList;

const DownloadButton = () => {
    const handleDownload = async () => {
        await fetch(`${gameConfig.GET_URL}/download_users`, {
            method: 'GET',
        })
        .then(async (response) => {
            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(errorMessage || `HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'student_template.xlsx');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        })
        .catch((error) => {
            console.error(error);
            ShowToast({
                icon: 'danger',
                heading: 'Download Failed',
                message: 'An error occurred while downloading the file. Please try again.',
            });
        });
    };

    return <Button onClick={handleDownload}>Download Template</Button>;
};
