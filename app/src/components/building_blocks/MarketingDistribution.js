import React from 'react';
import { useRef } from "react";

const MarketingDistribution = (props) => {
    const bar1 = useRef();
    const bar2 = useRef();
    const bar3 = useRef();

    const handleEvent = (event) => {
    };

    return (
        <div style={{ display: 'flex', width: '100%', height: '45px' }}>
            <div className="bar1" ref={bar1} style={{ backgroundColor: 'red', width: '33%', height: '100%' }}></div>
            <div className="border" style={{ cursor: 'ew-resize', height: '100%', width: '1px' }} onMouseDown={handleEvent} onMouseUp={handleEvent} ></div>
            <div className="bar1" ref={bar2} style={{ backgroundColor: 'blue', width: '33%', height: '100%' }}></div>
            <div className="border" style={{ cursor: 'ew-resize', height: '100%', width: '1px' }} onMouseDown={handleEvent} onMouseUp={handleEvent}></div>
            <div className="bar1" ref={bar3} style={{ backgroundColor: 'yellow', width: '33%', height: '100%' }}></div>
        </div>
    );
};

export default MarketingDistribution;
