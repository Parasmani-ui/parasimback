import React from "react";
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import AutoSaveText from '../utils/AutoSaveText';
import AutoSaveInput from '../utils/AutoSaveInput';

const SystemSetup = (props) => {
    const pageData = props.siteData ? (props.siteData[props.pageName] || {}) : {};
    return (
        <Card>
            <Card.Header>
                <AutoSaveText
                    saveKey="system_setup_heading"
                    text={pageData.system_setup_heading || 'System Setup'}
                    saveFn="saveSiteData"
                    {...props}
                />
            </Card.Header>
            <Card.Body>
                <Card>
                    <Card.Header>
                        <AutoSaveText
                            saveKey="globals_heading"
                            text={pageData.globals_heading || 'Global Variables'}
                            saveFn="saveSiteData"
                            {...props}
                        />
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col>
                            <AutoSaveInput
                                type="date"
                                saveKey="academic_year_cutoff_date"
                                value={pageData.academic_year_cutoff_date}
                                saveFn="saveSiteData"
                                {...props}
                            />
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Card.Body>
        </Card>
    );
};

export default SystemSetup;
