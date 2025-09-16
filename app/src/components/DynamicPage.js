import React from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import Card from 'react-bootstrap/Card';
import BuildingBlock from './BuildingBlock';
import { useState, useEffect } from "react";
import pageList from '../context/pageList';

const ResponsiveGridLayout = WidthProvider(Responsive);

const DynamicPage = (props) => {
    var layouts = null;
    const [currentBreakpoint, setCurrentBreakpoint] = useState('lg');
    var errors = [];

    const pageName = props.pageName;
    const caseStudy = props.caseStudy;

    const onLayoutChange = (e) => {
        //setLayout(e);
    };

    const onBreakpointChange = (breakpoint) => {
        setCurrentBreakpoint(breakpoint);
    };

    const page = pageList[pageName];
    const blocks = page.blocks;

    const allLayouts = { lg: [], md: [], sm: [], xs: [], xxs: [] };
    blocks && blocks.forEach((_block, idx) => {
        var _layout = props.mode == 'edit' && _block.layout_edit ? _block.layout_edit : _block.layout;
        if (!_layout) {
            errors.push('Error: layout missing for block: (' + _block.blockName + ').');
        }

        if (!_layout.lg) {
            errors.push('Error: layout.lg missing for block: (' + _block.blockName + ').');
        }

        if (!_layout.md) {
            errors.push('Error: layout.md missing for block: (' + _block.blockName + ').');
        }

        if (!_layout.sm) {
            errors.push('Error: layout.sm missing for block: (' + _block.blockName + ').');
        }

        var lg = _layout.lg;
        var md = _layout.md;
        var sm = _layout.sm;
        var xs = _layout.xs || _layout.sm;
        var xxs = _layout.xxs || _layout.xs || _layout.sm;

        lg.i = _block.blockName + idx;
        md.i = _block.blockName + idx;
        sm.i = _block.blockName + idx;
        xs.i = _block.blockName + idx;
        xxs.i = _block.blockName + idx;

        allLayouts.lg.push(lg);
        allLayouts.md.push(md);
        allLayouts.sm.push(sm);
        allLayouts.xs.push(xs);
        allLayouts.xxs.push(xxs);
        
        // this validation is critical as the whole app hangs and stops responding completely if one of these items is missing
        for (var prop in allLayouts) {
            allLayouts[prop].forEach((_lay) => {
                if (!_lay.hasOwnProperty('i')) {
                    errors.push('Error: layout.' + prop + '.i missing for block: (' + _block.blockName + ').');
                }

                if (!_lay.hasOwnProperty('x')) {
                    errors.push('Error: layout.' + prop + '.x missing for block: (' + _block.blockName + ').');
                }
    
                if (!_lay.hasOwnProperty('y')) {
                    errors.push('Error: layout.' + prop + '.y missing for block: (' + _block.blockName + ').');
                }
    
                if (!_lay.hasOwnProperty('w')) {
                    errors.push('Error: layout.' + prop + '.w missing for block: (' + _block.blockName + ').');
                }
    
                if (!_lay.hasOwnProperty('h')) {
                    errors.push('Error: layout.' + prop + '.h missing for block: (' + _block.blockName + ').');
                }
            });
        }
    });

    layouts = allLayouts;
   
    if (errors.length) {
        errors.forEach((err) => {
            console.error(err);
        });
    }

    const widthChanged = () => {
        //console.log('width changed');
    };

    return (
            !errors.length && layouts && 
            <Card className="container-card">
        <ResponsiveGridLayout
            name={pageName}
            layouts={layouts}
            cols={page.cols}
            onResizeStop={onLayoutChange}
            onDragStop={onLayoutChange}
            rowHeight={20}
            onBreakpointChange={onBreakpointChange}
            breakpoints={page.breakpoints}
            onWidthChange={widthChanged}
            draggableCancel=".toolbar_button, .quill, .input-group, .nav-item"
        >
        {
            blocks && blocks.map((block, idx)=>(
                <div key={block.blockName + idx}>
                    <BuildingBlock
                        blockName={block.blockName}
                        currentBreakpoint={currentBreakpoint}
                        blockData={block.data}
                        {...props}
                    />
                </div>
            ))
        }
        </ResponsiveGridLayout>
        </Card>
    );
};

export default DynamicPage;
