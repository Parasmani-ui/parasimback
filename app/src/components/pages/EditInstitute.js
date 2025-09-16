import React from "react";
import { useState, useEffect } from "react";
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import gameConfig from '../../gameConfig';
import { post } from '../utils/ServerCall';
import ShowModal from '../utils/ShowModal';
import AutoSaveText from '../utils/AutoSaveText';
import EditableImage from '../utils/EditableImage';
import InstituteSelect from '../building_blocks/InstituteSelect';
import InstituteGeneralInfo from '../building_blocks/InstituteGeneralInfo';
import Icon from '../Icon';
import ShowToast from '../utils/ShowToast';
import db from '../utils/db';
import Confirm from '../utils/Confirm';

const EditInstitute = (props) => {
    const [institute, setInstitute] = useState(null);
    const [instituteAdmins, setInstituteAdmins] = useState(null);
    const [caseStudies, setCaseStudies] = useState(null);
    //const [licenses, setLicenses] = useState(null);
    const [expired, setExpired] = useState(null);
    const [current, setCurrent] = useState(null);
    const [upcoming, setUpcoming] = useState(null);

    const fetchData = async () => {
        var key = null;
        if (props.user.role == 'superadmin') {
            key = institute ? institute.key : null;
        } else {
            key = props.user.institute_key;
        }

        if (!key) {
            return;
        }

        const data = await post('admin/select_institute', props.user, { key: key });
        if (data && data.rc) {
            return;
        }
        if (!data) {
            return;
        }
        setInstitute(data);
        //setLicenses(data.licenses);
    };

    const addLicense = (status) => {
        if (!institute.session_start_month) {
            ShowToast({icon: 'danger', heading: 'Cannot add license', message: 'Please select session start month first'})
            return;
        }

        if (props.user.role != 'superadmin') {
            return;
        }

        if (!institute.session_start_month) {
            ShowToast({ icon: 'info', heading: 'Cannot add license', message: 'Set the session start date for the institute first' });
        }

        const license = status == 'current' ? current : upcoming;
        var academicYear = status == 'current' ? getCurrentAcademicYear(institute.session_start_month) : getNextAcademicYear(institute.session_start_month);
        
        const action = license ? 'add' : 'update';
        const title = status == 'current' ? 'Update Current License' : 'Update Next License';

        const today = new Date((new Date()).toISOString().substring(0, 10));
        const sessionStart = new Date(academicYear.start_date);
        const licenseStart = (sessionStart < today ? today : sessionStart).toISOString().substring(0, 10);
        
        ShowModal({
            title: title,
            closeButtonText: 'Close',
            body: <Container style={{ minWidth: '300px' }}>
                <Form>
                    <Form.Control type="hidden" name="license_key" defaultValue={license ? license.key : ''}></Form.Control>
                    <Row>
                        <Col>Academic Year</Col>
                        <Col style={{fontWeight: 'bold'}}>{academicYear.year || ''}</Col>
                    </Row>
                    <Row>
                        <Col>Start Date</Col>
                        <Col>
                            <Form.Control type="date" name="start_date" defaultValue={license ? license.start_date : licenseStart} ></Form.Control>
                        </Col>
                    </Row>
                    <Row>
                        <Col>Validity Date</Col>
                        <Col>
                            <Form.Control type="date" name="validity_date" defaultValue={license ? license.validity_date : academicYear.end_date} ></Form.Control>
                        </Col>
                    </Row>

                    <div style={{height: '15px'}}></div>
                
                    <Row>
                        <Col className="d-flex align-items-center"><Form.Label>Licenses</Form.Label></Col>
                        <Col>
                            <Form.Control type="number" name="no_of_licenses" defaultValue={license ? license.no_of_licenses : ''}></Form.Control>
                        </Col>
                    </Row>
                    
                    <div className="error" style={{ color: 'red', marginTop: '15px', fontWeight: 'bold' }}></div>
                </Form>
            </Container>,
            buttons: [
                {
                    text: license ? 'Save' : 'Add',
                    onClick: async (element) => {
                        const form = element.closest('.modal-content').getElementsByTagName('form')[0];

                        if (!form.elements.no_of_licenses.value) {
                            form.getElementsByClassName('error')[0].innerText = 'Please fill in the number of licenses';
                            return false;
                        }

                        if (!form.elements.start_date.value) {
                            form.getElementsByClassName('error')[0].innerText = 'Please fill in the start date';
                            return false;
                        }

                        if (!form.elements.validity_date.value) {
                            form.getElementsByClassName('error')[0].innerText = 'Please fill in the end date';
                            return false;
                        }

                        const startDate = new Date(form.elements.start_date.value);
                        const endDate = new Date(form.elements.validity_date.value);

                        const sessionEnd = new Date(academicYear.end_date);

                        if (startDate < today) {
                            form.getElementsByClassName('error')[0].innerText = 'Start date cannot be in the past';
                            return false;
                        }

                        if (endDate < today) {
                            form.getElementsByClassName('error')[0].innerText = 'Validity date cannot be in the past';
                            return false;
                        }

                        if (endDate <= startDate) {
                            form.getElementsByClassName('error')[0].innerText = 'Validity date must be after Start Date';
                            return false;
                        }

                        if (endDate > sessionEnd) {
                            form.getElementsByClassName('error')[0].innerText = 'Validity date cannot be after the session end';
                            return false;
                        }

                        if (parseInt(form.elements.no_of_licenses.value) < (license ? (license.used || 0) : 0)) {
                            form.getElementsByClassName('error')[0].innerText = 'Licenses value cannot be less than the used licenses';
                            return false;
                        }

                        const data = {
                            key: form.elements.license_key.value,
                            academic_year: academicYear.year || '',
                            no_of_licenses: form.elements.no_of_licenses.value,
                            start_date: form.elements.start_date.value || '',
                            validity_date: form.elements.validity_date.value || '',
                            purchase_date: today.toISOString().substring(0, 10),
                            used: license ? (license.used || 0) : 0
                        };

                        const licenses = await post('sadmin/add_license', props.user, { institute_key: institute.key, license: data, status: status });
                        if (licenses && licenses.rc) {
                            return false;
                        }

                        const _institute = { ...institute };
                        _institute.licenses = licenses;
                        setInstitute(_institute);
                        //setLicenses(licenses);
                        return true;
                    }
                }
            ]
        });
    };

    const addFaculty = async () => {
        const faculty = await post('admin/add_faculty', props.user, { institute_key: institute.key });
        if (faculty && faculty.rc) {
            return;
        }
        institute.faculty = faculty;
        setInstitute({ ...institute });
    };

    const deleteFaculty = async (idx) => {
        const faculty = await post('admin/delete_faculty', props.user, { institute_key: institute.key, idx: idx });
        if (faculty && faculty.rc) {
            return;
        }
        institute.faculty = faculty;
        setInstitute({ ...institute });
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        /*
        if (props.user.role == 'admin') {
            sessionStorage.setItem('institute', JSON.stringify(institute));
        }
        */
        if (!institute) {
            return;
        }
        const fetchData = async (key) => {
            const users = await post('admin/institute_admins', props.user, { institute_key: key });
            if (users && users.rc) {
                return;
            }
            setInstituteAdmins(users);
            const caseStudies = await post('admin/case_study_list', props.user, null);
            if (caseStudies && caseStudies.rc) {
                return;
            }
            setCaseStudies(caseStudies);

            const _licenses = institute.licenses;
            if (_licenses && _licenses.length) {
                const _expired = [];
                for (var i = 0; i < _licenses.length; i++) {
                    if (new Date(_licenses[i].validity_date) < new Date()) {
                        _licenses[i].status = 'expired';
                        _expired.push(_licenses[i]);
                        continue;
                    }
    
                    if (new Date(_licenses[i].start_date) <= new Date()) {
                        _licenses[i].status = 'current';
                        setCurrent(_licenses[i]);
                        continue;
                    }
    
                    _licenses[i].status = 'upcoming';
                    setUpcoming(_licenses[i]);
                }
                institute.licenses = _licenses;
            }
            else
            {
                setCurrent(null);
                setUpcoming(null);
                setExpired(null);
            }

            //setLicenses(_licenses);
        };
        fetchData(institute.key);
    }, [institute]);

    const updateInstitute = (inst) => {
        const _institute = inst ? {...inst} : {...institute};

        setInstitute(_institute);
    };

    const dataUpdated = async () => {
        await fetchData();
    }

    const checkBoxChanged = async (e, ridx, fidx) => {
        const { checked } = e.target;
        const _props = {};
        _props.institute = institute;
        _props.updateParent = dataUpdated;
        _props.user = props.user;
        await db.saveInstituteData(_props, 'faculty.$[i].showOnWebsite', checked, [{ "i.idx": fidx }], false);
        await dataUpdated();
        institute.faculty[ridx].showOnWebsite = checked;
        setInstitute({ ...institute });
    };

    const deleteLicense = async (license) => {
        if (props.user.role != 'superadmin') {
            return;
        }

        Confirm({
            body: <span>Do you want to delete the license?</span>,
            callback: async () => {
                const data = await post('sadmin/delete_license', props.user, { institute_key: institute.key, license_key: license.key });
                if (data && data.rc) {
                    setError(data.rc);
                    return;
                }
                const _institute = { ...institute };
                _institute.licenses = data && data.length ? data : null;
                const _licenses = _institute.licenses;
                var _current = null;
                var _upcoming = null;
                if (_licenses && _licenses.length) {
                    const _expired = [];
                    for (var i = 0; i < _licenses.length; i++) {
                        if (new Date(_licenses[i].validity_date) < new Date()) {
                            _licenses[i].status = 'expired';
                            _expired.push(_licenses[i]);
                            continue;
                        }

                        if (new Date(_licenses[i].start_date) <= new Date()) {
                            _licenses[i].status = 'current';
                            _current = _licenses[i];
                            continue;
                        }

                        _licenses[i].status = 'upcoming';
                        _upcoming = _licenses[i];
                    }
                    _institute.licenses = _licenses;
                    setCurrent(_current);
                    setUpcoming(_upcoming);
                }
                setInstitute(_institute);
            },
            title: 'Are you sure?',
            buttonText: 'Delete License'
        });
    };

    const addAdmin = async (admin) => {
        ShowModal({
            title: admin ? 'Edit Admin User' : 'Add Admin User',
            closeButtonText: 'Close',
            body: <Container style={{ minWidth: '300px' }}>
                <Form>
                    <Form.Control type="hidden" name="user_key" defaultValue={admin ? admin.key : ''}></Form.Control>
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" name="email" placeholder="email..." defaultValue={admin ? admin.email : ''}></Form.Control>
                    <Form.Label>Name</Form.Label>
                    <Form.Control type="text" name="name" placeholder="name..." defaultValue={admin ? admin.name : ''}></Form.Control>
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="text" name="password" placeholder="password..."></Form.Control>
                    <span className="error" style={{ color: 'red' }}></span>
                </Form>
            </Container>,
            buttons: [
                {
                    text: admin ? 'Save' : 'Add',
                    onClick: async (element) => {
                        const form = element.closest('.modal-content').getElementsByTagName('form')[0];
                        if (!form.elements.email.value || !form.elements.name.value) {
                            form.getElementsByClassName('error')[0].innerText = 'Please fill in the required values';
                            return false;
                        }

                        const data = {
                            key: form.elements.user_key.value,
                            email: form.elements.email.value,
                            name: form.elements.name.value,
                            password: form.elements.password.value
                        };

                        const admins = await post('admin/institute_admin_add', props.user, { institute_key: institute.key, admin: data });
                        if (admins && admins.rc) {
                            ShowToast({ icon: 'danger', heading: 'Cannot add user', message: admins.rc });
                            return;
                        }
                        setInstituteAdmins(admins);
                        return true;
                    }
                }
            ]
        });
    };

    const editAdmin = async (admin) => {
        await addAdmin(admin);
    };

    const deleteAdmin = async (admin) => {
        if (instituteAdmins.length <= 1) {
            ShowToast({ icon: 'info', message: 'Cannot delete last admin user.' });
            return;
        }

        Confirm({
            body: <span>Do you want to delete the admin user {admin.name}?</span>,
            callback: async () => {
                const admins = await post('admin/delete_admin_user', props.user, { institute_key: institute.key, user_key: admin.key });
                if (admins && admins.rc) {
                    setInstituteAdmins(null);
                    return;
                }
                setInstituteAdmins(admins);
            },
            title: 'Are you sure?',
            buttonText: 'Delete Admin User'
        });
    };

    const caseStudyCheckBoxChanged = async (e, cs) => {
        const { checked } = e.target;
        const list = institute.case_studies || [];
        if (checked) {
            list.push(cs.key);
        }
        else {
            const index = list.indexOf(cs.key);
            if (index > -1) {
                list.splice(index, 1);
            }
        }

        const _props = { ...props };
        _props.institute = institute;
        await db.saveInstituteData(_props, 'case_studies', list);
        institute.case_studies = list;
        setInstitute({ ...institute });
    };

    return (
        <Card className="container-card">
            <Card.Body>
                {props.user.role == 'superadmin' && <InstituteSelect {...props} updateInstitute={updateInstitute} />}
                {(institute && !!Object.keys(institute).length) &&
                    <>
                        <div style={{ height: '15px' }}></div>
                        <Card>
                            <Card.Header>
                                General Info
                            </Card.Header>
                            <InstituteGeneralInfo institute={institute} updateInstitute={updateInstitute} {...props} />
                        </Card>
                        <div style={{ height: '15px' }}></div>
                        <Card>
                            <Card.Header style={{ position: 'relative' }}>
                                <span>Expired Licenses</span>
                            </Card.Header>
                            <Card.Body>
                                <Table>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Academic Year/Session</th>
                                            <th>Licenses Purchased</th>
                                            <th>Purchase Date</th>
                                            <th>Start Date</th>
                                            <th>Validity Date</th>
                                            <th>Licenses Used</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {expired && !!expired.length && expired.map((license, idx) => (
                                            <tr key={idx} >
                                                <td>{idx + 1}</td>
                                                <td>{license.academic_year}</td>
                                                <td>{license.no_of_licenses || 0}</td>
                                                <td>{formatDate(license.purchase_date)}</td>
                                                <td>{formatDate(license.start_date)}</td>
                                                <td>{formatDate(license.validity_date)}</td>
                                                <td>{license.used || 0}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                        <div style={{ height: '15px' }}></div>
                        <Card>
                            <Card.Header style={{ position: 'relative' }}>
                                <span>Current License</span>
                            </Card.Header>
                            <Card.Body>
                                <Table>
                                    <thead>
                                        <tr>
                                            <th>Academic Year/Session</th>
                                            <th>Licenses Purchased</th>
                                            <th>Purchase Date</th>
                                            <th>Start Date</th>
                                            <th>Validity Date</th>
                                            <th>Licenses Used</th>
                                            {props.user.role == 'superadmin' &&
                                                <th onClick={() => { addLicense('current') }}><Icon name="edit" /></th>
                                            }
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {current &&
                                            <tr>
                                                <td>{current.academic_year}</td>
                                                <td>{current.no_of_licenses || 0}</td>
                                                <td>{formatDate(current.purchase_date)}</td>
                                                <td>{formatDate(current.start_date)}</td>
                                                <td>{formatDate(current.validity_date)}</td>
                                                <td>{current.used || 0}</td>
                                                {props.user.role == 'superadmin' &&
                                                    <td onClick={async () => { await deleteLicense(current) }}><Icon name="remove" /></td>
                                                }
                                            </tr>
                                        }
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                        <div style={{ height: '15px' }}></div>
                        <Card>
                            <Card.Header style={{ position: 'relative' }}>
                                <span>Next License</span>
                            </Card.Header>
                            <Card.Body>
                                <Table>
                                    <thead>
                                        <tr>
                                            <th>Academic Year/Session</th>
                                            <th>Licenses Purchased</th>
                                            <th>Purchase Date</th>
                                            <th>Start Date</th>
                                            <th>Validity Date</th>
                                            {props.user.role == 'superadmin' &&
                                                <th onClick={() => { addLicense('upcoming') }}><Icon name="edit" /></th>
                                            }
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {upcoming && 
                                            <tr>
                                                <td>{upcoming.academic_year}</td>
                                                <td>{upcoming.no_of_licenses || 0}</td>
                                                <td>{formatDate(upcoming.purchase_date)}</td>
                                                <td>{formatDate(upcoming.start_date)}</td>
                                                <td>{formatDate(upcoming.validity_date)}</td>
                                                {props.user.role == 'superadmin' &&
                                                    <td onClick={async () => { await deleteLicense(upcoming) }}><Icon name="remove" /></td>
                                                }
                                            </tr>
                                        }
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                        <div style={{ height: '15px' }}></div>
                        <Card>
                            <Card.Header style={{ position: 'relative' }}>
                                <span>Admin Users *</span>
                                {institute && <AddToolbar addClicked={addAdmin} editable={true}  {...props} />}
                            </Card.Header>
                            <Card.Body>
                                <Table>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Email</th>
                                            <th>Name</th>
                                            {props.user.role == 'superadmin' && <th></th>}
                                            {props.user.role == 'superadmin' && <th></th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {institute && instituteAdmins && instituteAdmins.map((admin, idx) => (
                                            <tr key={idx} >
                                                <td>{idx + 1}</td>
                                                <td>{admin.email}</td>
                                                <td>{admin.name}</td>
                                                {props.user.role == 'superadmin' && <td onClick={async () => { await editAdmin(admin) }}><Icon name="edit" /></td>}
                                                {props.user.role == 'superadmin' && <td onClick={async () => { await deleteAdmin(admin) }}><Icon name="remove" /></td>}
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                        <div style={{ height: '15px' }}></div>
                        <Card>
                            <Card.Header style={{ position: 'relative' }}>
                                Allocated Case Studies *
                            </Card.Header>
                            <Card.Body>
                                {props.user.role == 'superadmin' && institute && caseStudies && caseStudies.map((cs, idx) => (
                                    <Row key={idx}>
                                        <Col md={1}>
                                            <Form.Check checked={institute && institute.case_studies && institute.case_studies.indexOf(cs.key) > -1 || false} onChange={async (e) => await caseStudyCheckBoxChanged(e, cs)} />
                                        </Col>
                                        <Col>
                                            <Form.Label>{cs.name}</Form.Label>
                                        </Col>
                                    </Row>
                                ))}
                                {props.user.role != 'superadmin' && institute && caseStudies && caseStudies.map((cs, idx) => (
                                    <div key={idx} style={{ paddingBottom: '10px' }}>
                                        {institute && institute.case_studies && institute.case_studies.indexOf(cs.key) > -1 ? cs.name : ''}
                                    </div>
                                ))}
                            </Card.Body>
                        </Card>
                        <div style={{ height: '15px' }}></div>
                        <Card>
                            <Card.Header>
                                Faculty *
                                {institute && <AddToolbar addClicked={addFaculty} editable={true} {...props} />}
                            </Card.Header>
                            <Card.Body>
                                {institute.faculty && institute.faculty.sort((a, b) => { return b.idx - a.idx; }).map((row, idx) => (
                                    <Card key={idx} style={{ position: 'relative' }}>
                                        <Card.Body>
                                            <div style={{ position: 'absolute', top: '7px', right: '7px' }} onClick={async () => { await deleteFaculty(row.idx) }}><Icon name="remove" /></div>
                                            <Row>
                                                <Col md={3}>
                                                    <EditableImage
                                                        src={gameConfig.getImagePath(row.image)}
                                                        style={{ display: 'block', width: '100%' }}
                                                        saveKey="faculty.$[i].image"
                                                        filters={[{ "i.idx": row.idx }]}
                                                        saveFn="saveInstituteImage"
                                                        editable={props.user.role == 'superadmin' || (props.user.role == 'admin' && props.user.institute_key == institute.key)}
                                                        updateParent={dataUpdated}
                                                        owner={institute.key + '||' + row.idx}
                                                        institute={institute}
                                                        {...props}
                                                    />
                                                </Col>
                                                <Col>
                                                    <Row style={{ padding: '10px 0', width: '80%' }}>
                                                        <Card.Title>
                                                            <AutoSaveText
                                                                saveKey="faculty.$[i].name"
                                                                filters={[{ "i.idx": row.idx }]}
                                                                text={row.name || 'Faculty name *'}
                                                                saveFn="saveInstituteData"
                                                                editable={props.user.role == 'superadmin' || (props.user.role == 'admin' && props.user.institute_key == institute.key)}
                                                                updateParent={dataUpdated}
                                                                institute={institute}
                                                                {...props}
                                                            />
                                                        </Card.Title>
                                                    </Row>
                                                    <Row style={{ padding: '10px 0', width: '80%' }}>
                                                        <Card.Subtitle>
                                                            <AutoSaveText
                                                                saveKey="faculty.$[i].title"
                                                                filters={[{ "i.idx": row.idx }]}
                                                                text={row.title || 'Faculty title *'}
                                                                saveFn="saveInstituteData"
                                                                editable={props.user.role == 'superadmin' || (props.user.role == 'admin' && props.user.institute_key == institute.key)}
                                                                updateParent={dataUpdated}
                                                                institute={institute}
                                                                {...props}
                                                            />
                                                        </Card.Subtitle>
                                                    </Row>
                                                    <Row style={{ padding: '10px 0', width: '80%', minHeight: '150px' }}>
                                                        <AutoSaveText
                                                            saveKey="faculty.$[i].description"
                                                            filters={[{ "i.idx": row.idx }]}
                                                            text={row.description || 'Faculty profile description'}
                                                            saveFn="saveInstituteData"
                                                            editable={props.user.role == 'superadmin' || (props.user.role == 'admin' && props.user.institute_key == institute.key)}
                                                            updateParent={dataUpdated}
                                                            institute={institute}
                                                            {...props}
                                                        />
                                                    </Row>
                                                    {props.user.role == 'superadmin' &&
                                                        <Row style={{ padding: '10px 0' }}>
                                                            <Col md={1}>
                                                                <Form.Check checked={row.showOnWebsite || false} onChange={async (e) => { await checkBoxChanged(e, idx, row.idx) }} />
                                                            </Col>
                                                            <Col>
                                                                <Form.Label>Show On Website</Form.Label>
                                                            </Col>
                                                        </Row>
                                                    }
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                ))}
                            </Card.Body>
                        </Card>
                    </>
                }
                {(!institute || !Object.keys(institute).length) &&
                    <>
                        <div style={{ height: '15px' }}></div>
                        <Card style={{ minHeight: '80vh' }}>
                            <Card.Body>
                                Please select an institute to edit
                            </Card.Body>
                        </Card>
                    </>
                }
            </Card.Body>
        </Card>
    );
};

export default EditInstitute;

const AddToolbar = (props) => {
    const toolbarStyle = {
        display: 'flex',
        position: 'absolute',
        right: 0,
        top: '-25px',
        textAlign: 'right',
        zIndex: 1
    };

    return (props.editable &&
        <span className='editable_wrapper list_row_toolbar' style={{ position: 'relative', display: 'block' }} >
            <span className="toolbar" style={toolbarStyle}>
                <span className="toolbar_button list_add_button" onClick={props.addClicked} ><Icon name="add" /></span>
            </span>
        </span>
    );
};

const formatDate = (date) => {
    if (!date) {
        return '';
    }

    const givenDate = new Date(date);
    const year = givenDate.getFullYear();
    const month = String(givenDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
    const day = String(givenDate.getDate()).padStart(2, '0'); // Pad with leading zero if needed

    return `${day}-${month}-${year}`;
};

const getCurrentAcademicYear = (startMonth) => {
    if (!startMonth) {
        return null;
    }
    
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    const sessionStartYear = month < startMonth ? year - 1 : year;

    const sessionStartDate = new Date(sessionStartYear + '-' + String(startMonth).padStart(2, '0') + '-' + '01');
    const sessionEndDate = new Date(sessionStartDate);
    sessionEndDate.setFullYear(sessionEndDate.getFullYear() + 1);
    sessionEndDate.setDate(sessionEndDate.getDate() - 1);

    const currentAcademicYear = sessionStartDate.getFullYear() + '-' + sessionEndDate.getFullYear();
    return {year: currentAcademicYear, start_date: sessionStartDate.toISOString().substring(0, 10), end_date: sessionEndDate.toISOString().substring(0, 10)};
};

const getNextAcademicYear = (startMonth) => {
    if (!startMonth) {
        return null;
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    const sessionStartYear = month < startMonth ? year : year + 1;

    const sessionStartDate = new Date(sessionStartYear + '-' + String(startMonth).padStart(2, '0') + '-' + '01');
    const sessionEndDate = new Date(sessionStartDate);
    sessionEndDate.setFullYear(sessionEndDate.getFullYear() + 1);
    sessionEndDate.setDate(sessionEndDate.getDate() - 1);

    const nextAcademicYear = sessionStartDate.getFullYear() + '-' + sessionEndDate.getFullYear();
    return {year: nextAcademicYear, start_date: sessionStartDate.toISOString().substring(0, 10), end_date: sessionEndDate.toISOString().substring(0, 10)};
};
