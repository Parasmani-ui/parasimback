import React from "react";
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ImageUpload from '../utils/ImageUpload';
import Icon from '../Icon.js';
import { post } from '../utils/ServerCall';
import gameConfig from '../../gameConfig';

const ChangeSystemImages = (props) => {
    const gameData = props.gameData;
    const caseStudy = props.caseStudy;
    const heading = props.heading || 'Change System Images';
    const images = {};

    for (var prop in props.images) {
        if (!prop.endsWith('_thumbnail')) {
            images[prop] = props.images[prop];
        }
    }

    const removeOverride = async (name) => {
        await post('sadmin/remove_image_override', props.user, { name: name });
        await props.updateImages();
    };

    return (
        <Card className="container-card">
            <Card.Header>{heading}</Card.Header>
            <Card.Body style={{ overflowY: 'scroll' }}>
                {Object.keys(images).map((name, idx) => (
                    <Card key={idx} style={{ marginTop: idx ? '15px' : 0 }}>
                        <Card.Header>{name}</Card.Header>
                        <Card.Body>
                            <Row>
                                <Col lg={4} md={4} sm={12}>
                                    <Card>
                                        <Card.Header>Default Image</Card.Header>
                                        <Card.Body>
                                            <img style={{ height: '200px' }} src={gameConfig.getImagePath(gameConfig.defaultImages[name])} />
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col lg={4} md={4} sm={12}>
                                    <Card style={{ height: '100%' }}>
                                        <Card.Header>Override Image</Card.Header>
                                        <Card.Body>
                                            {images[name] != gameConfig.defaultImages[name] &&
                                                <div style={{ position: 'relative' }}>
                                                    <img style={{ height: '200px' }} src={gameConfig.getImagePath(images[name])} />
                                                    <div
                                                        onClick={async () => { await removeOverride(name) }}
                                                        style={{
                                                            position: 'absolute',
                                                            top: 0, right: 0,
                                                            backgroundColor: 'var(--toolbar_background_color)',
                                                            border: '1px solid darkgrey'
                                                        }}
                                                    >
                                                        <Icon name="remove" />
                                                    </div>
                                                </div>
                                            }
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col lg={4} md={4} sm={12}>
                                    <Card>
                                        <Card.Header>Upload Image</Card.Header>
                                        <Card.Body>
                                            <ImageUpload user={props.user} style={{ height: '200px' }} src={images[name]} name={name} updateImages={props.updateImages} />
                                        </Card.Body>
                                    </Card>

                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                ))}
            </Card.Body>
        </Card>
    );
};

export default ChangeSystemImages;
