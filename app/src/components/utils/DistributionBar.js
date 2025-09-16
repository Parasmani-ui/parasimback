import React from 'react';
import { useState, useRef } from "react";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import StandardToolbar from '../utils/StandardToolbar';
import AutoSaveInput from '../utils/AutoSaveInput';
import ShowModal from '../utils/ShowModal';

const DistributionBar = (props) => {
    const bar1 = useRef();
    const bar2 = useRef();
    const bar3 = useRef();
    const container = useRef();
    const border1 = useRef();
    const border2 = useRef();
    const dist = props.dist;
    const names = Object.keys(dist);
    const values = Object.values(dist);
    const [dist1, setDist1] = useState(parseFloat(values[0] || '33.33'));
    const [dist2, setDist2] = useState(parseFloat(values[1] || '33.33'));
    const [dist3, setDist3] = useState(parseFloat(values[2] || '33.33'));
    const name = props.name;
    const color = props.color;
    const backgroundColors = props.backgroundColors;

    const mouseDown = (event, border) => {
        var startPosition = event.pageX;
        var leftBar = null;
        var rightBar = null;
        var limitLeft;
        var limitRight;

        if (border == 'border1') {
            leftBar = bar1;
            rightBar = bar2;
            limitLeft = container.current.getBoundingClientRect().left;
            limitRight = border2.current.getBoundingClientRect().left;
        }
        else {
            leftBar = bar2;
            rightBar = bar3;
            limitLeft = border1.current.getBoundingClientRect().right;
            limitRight = container.current.getBoundingClientRect().right;
        }

        var leftBarWidth = leftBar.current.offsetWidth;
        var rightBarWidth = rightBar.current.offsetWidth;
        var containerPosition = container.current.getBoundingClientRect();

        const mouseMove = async (event) => {
            const currentPosition = event.pageX;
            if (currentPosition < limitLeft) {
                return;
            }

            if (currentPosition > limitRight) {
                return;
            }

            const change = startPosition - currentPosition;
            leftBarWidth -= change;
            rightBarWidth += change;
            if (leftBarWidth && rightBarWidth) {
                leftBar.current.style.width = leftBarWidth + 'px';
                rightBar.current.style.width = rightBarWidth + 'px';
                startPosition = currentPosition;
            }

            const bar1W = bar1.current.offsetWidth;
            const bar2W = bar2.current.offsetWidth;
            const bar3W = bar3.current.offsetWidth;
            const dist1 = (bar1W * 100 / (bar1W + bar2W + bar3W)).toFixed(0);
            const dist3 = (bar3W * 100 / (bar1W + bar2W + bar3W)).toFixed(0);
            const dist2 = 100 - dist1 - dist3;

            setDist1(dist1);
            setDist2(dist2);
            setDist3(dist3);

            const output = {};
            output[names[0]] = dist1;
            output[names[1]] = dist2;
            output[names[2]] = dist3;

            props.distributionChanged && await props.distributionChanged(name, output);
        };

        const mouseUp = (event) => {
            document.body.removeEventListener("mousemove", mouseMove);
            document.body.removeEventListener("mouseup", mouseUp);
        };

        if (props.editable) {
            document.body.addEventListener("mousemove", mouseMove);
            document.body.addEventListener("mouseup", mouseUp, { once: true });
        }
    };

    const cursor = props.editable ? 'ew-resize' : 'auto';
    return (
        <div style={{ display: 'flex', width: '100%', height: '45px' }} ref={container} className={props.editable ? 'distribution_bar_editable' : 'distribution_bar_not_editable'}>
            <div className="bar1" ref={bar1} style={{ backgroundColor: backgroundColors[0], color: color, fontWeight: 'bold', width: dist1 + '%', height: '100%', position: 'relative' }}>
                <span style={{ display: 'block', position: 'absolute', margin: '0', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{dist1 + '%'}</span>
            </div>
            <div
                className="border"
                style={{
                    cursor: cursor,
                    height: '100%', width: '5px'
                }}
                onMouseDown={(event) => { mouseDown(event, 'border1') }}
                ref={border1}
            ></div>
            <div className="bar2" ref={bar2} style={{ backgroundColor: backgroundColors[1], color: color, fontWeight: 'bold', width: dist2 + '%', height: '100%', position: 'relative' }}>
                <span style={{ display: 'block', position: 'absolute', margin: '0', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{dist2 + '%'}</span>
            </div>
            <div
                className="border"
                style={{
                    cursor: cursor,
                    height: '100%', width: '5px'
                }}
                onMouseDown={(event) => { mouseDown(event, 'border2') }}
                ref={border2}
            ></div>
            <div className="bar3" ref={bar3} style={{ backgroundColor: backgroundColors[2], color: color, fontWeight: 'bold', width: dist3 + '%', height: '100%', position: 'relative' }}>
                <span style={{ display: 'block', position: 'absolute', margin: '0', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{dist3 + '%'}</span>
            </div>
            <Toolbar {...props} />
        </div>
    );
};

const Toolbar = (props) => {
    const buttons = [
        {
            name: 'edit_colors',
            icon: 'colors',
            click: () => {
                ShowModal({
                    title: 'Edit Product Colors',
                    closeButtonText: 'Close',
                    body: <Container style={{ minWidth: '300px' }}>
                        <Row style={{ fontWeight: 'bold', marginBottom: '20px' }}>
                            <Col></Col>
                            <Col>Bar Color</Col>
                        </Row>
                        <Row >
                            <Col>Font Color</Col>
                            <Col>
                                <AutoSaveInput
                                    type="color"
                                    value={props.color}
                                    onSave={async (color) => await props.saveColor(color)}
                                    {...props}
                                />
                            </Col>
                        </Row>
                        <Row >
                            <Col>Left Background</Col>
                            <Col>
                                <AutoSaveInput
                                    type="color"
                                    value={props.backgroundColors[0]}
                                    onSave={async (color) => {return await props.saveBGColor(0, color)}}
                                    {...props}
                                />
                            </Col>
                        </Row>
                        <Row >
                            <Col>Middle Background</Col>
                            <Col>
                                <AutoSaveInput
                                    type="color"
                                    value={props.backgroundColors[1]}
                                    onSave={async (color) => {return await props.saveBGColor(1, color)}}
                                    {...props}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col>Right Background</Col>
                            <Col>
                                <AutoSaveInput
                                    type="color"
                                    value={props.backgroundColors[2]}
                                    onSave={async (color) => {return await props.saveBGColor(2, color)}}
                                    {...props}
                                />
                            </Col>
                        </Row>
                    </Container>
                });
            }

        }
    ];

    return (
        <StandardToolbar toolbarStyle={props.toolbarStyle} show={true} buttons={buttons} {...props} />
    );
};

export default DistributionBar;
