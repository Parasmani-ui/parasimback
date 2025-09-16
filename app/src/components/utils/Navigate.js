import React from "react";
import {useState, useEffect} from "react";
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import navbars from '../../context/navbars';

const Navigate = (props) => {
    const pageList = {};
    const list = [];

    navbars.user.forEach((nitem) => {
        if (nitem.children) {
            nitem.children.forEach((child) => {
                list.push(child);
            });
        }
        else {
            list.push(nitem);
        }
    });

    for (var i = 0; i < list.length; i++) {
        const prev = i == 0 ? 'games' : list[i - 1].pageName;
        const next = i == (list.length - 1) ? 'games' : list[i + 1].pageName;
        const current = list[i].pageName;
        const title = list[i].text;
        pageList[current] = [title, prev, next];
    }

    const [title, prev, next] = props.pageName && pageList[props.pageName] ? pageList[props.pageName] : [null, null, null];
    const prevText = prev == 'games' ? 'Games' : prev && pageList[prev] ? pageList[prev][0] : null;
    const nextText = next == 'games' ? 'Games' : next && pageList[next] ? pageList[next][0] : null;

    const handlePrevClick = () => {
        if (!prev) {
            return;
        }

        if (prev == 'games') {
            props.gotoHome();
            return;
        }

        props.changePage(prev);
    };

    const handleNextClick = () => {
        if (!next) {
            return;
        }

        if (next == 'games') {
            props.gotoHome();
            return;
        }

        props.changePage(next);
    };



    return props.pageName && pageList[props.pageName] && props.mode != 'edit' && <Card>
        <div style={{ position: 'relative' }} className="navigate-bar" >
            <Row>
                {prevText &&
                    <Col style={{ position: 'relative', display: 'flex', justifyContent: 'left', alignItems: 'center' }}>
                        <Button name="prev" className="prev" onClick={() => handlePrevClick()} style={{height: '40px'}}>
                            <span style={{ display: 'inline-block', marginRight: props.placement == 'bottom' ? '15px' : 0, fontSize: '1.2em' }}>&lt;&lt;</span>
                            {props.placement == 'bottom' && <span>{prevText}</span>}
                        </Button>
                    </Col>
                }
                {props.placement != 'bottom' &&
                    <Col style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Card.Header style={{ display: 'inline-block', textTransform: 'uppercase', fontSize: '1.2em', fontWeight: 'bold' }}>{title}</Card.Header>
                    </Col>
                }
                {nextText &&
                    <Col style={{ position: 'relative', display: 'flex', justifyContent: 'right', alignItems: 'center' }}>
                        <Button name="next" className="next" onClick={() => handleNextClick()} style={{height: '40px'}}>
                            {props.placement == 'bottom' && <span>{nextText}</span>}
                            <span style={{ display: 'inline-block', marginLeft: props.placement == 'bottom' ? '15px' : 0, fontSize: '1.2em' }}>&gt;&gt;</span>
                        </Button>
                    </Col>
                }
            </Row>
        </div>
    </Card>
        ;
};

export default Navigate;
