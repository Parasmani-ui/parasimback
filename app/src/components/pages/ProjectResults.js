import React from "react";
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import gameConfig from "../../gameConfig";

const ProjectResults = (props) => {
    const gameData = props.gameData;
    const caseStudy = props.caseStudy;
    const projects = caseStudy.special_projects.sort((a, b) => { return a.idx - b.idx; });
    const news = gameData.news;

    const results = {};
    news.forEach((_msg) => {
        if (_msg.type != 'special_project') {
            return;
        }

        results[_msg.project_key] = _msg;
    });

    return (
        <Card className="container-card">
            <Card.Body>
                {projects && projects.map((project, idx) => (
                    <Card key={idx} style={{marginTop: idx ? '15px' : 0}}>
                        <Card.Header>
                            {project.name || 'Project Name'}
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={2}>
                                    <img style={{ height: '10em', width: '100%' }} src={gameConfig.getCaseStudyImagePath(caseStudy.key, project.image)} />
                                </Col>
                                <Col style={{display: 'flex', alignItems: 'center'}}>
                                    <div>{results[project.key] && <Card.Title>{results[project.key].title}</Card.Title>}</div>
                                    <div><Card.Text>{results[project.key] ? results[project.key].text : 'You have not invested in this project!'}</Card.Text></div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                ))}
            </Card.Body>
        </Card>
    );
};

export default ProjectResults;
