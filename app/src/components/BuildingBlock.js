import React from "react";
import {mergeObjects, mergeClasses} from './utils/common';

const BuildingBlock = (props) => {
    const name = props.blockName;
    var output = '';

    if (!name) {
        console.error('Error: Property name not set in BuildingBlock');
        output = <div className="error">Error: Property &quot;name&quot; not set in BuildingBlock</div>;
    }
    else if (!buildingBlocks[name]) {
        console.error('Error: BuildingBlock not found. Name: (' + name + ').');
        output = <div className="error">Error: BuildingBlock not found. Name: &quot;{name}&quot;.</div>;
    } 
    else {
        const block = buildingBlocks[name];
        if (!block)
        {
            console.error('Error: Block ' + name + ' not defined in BuildingBlock.js');
            output = <div className="error">Error: Block &quot;{name}&quot; not defined in BuildingBlock.js</div>;
        }
    
        const absolutePosition = {
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0          
        };

        const blockProps = mergeObjects(block.props, props.blockProps);
        const containerStyles = mergeObjects(block.containerStyles, props.blockContainerStyles, absolutePosition);
        const blockStyles = mergeObjects(block.blockStyles, props.blockStyles, absolutePosition);
        const blockClasses = mergeClasses(block.classes, props.blockClasses);
        const containerClasses = mergeClasses(block.containerClasses, props.blockContainerClasses, 'building_block_container', name);

        const Block = block.component;
        const blockData = props.blockData || {};

        output = <div name={name} className={containerClasses} style={containerStyles}>
            <Block 
                blockName={name}
                blockClasses={blockClasses}
                blockStyles={blockStyles}
                data={blockData}
                blockHeading={props.blockHeading || block.heading}
                {...blockProps}
                {...props}
            />
        </div>;
    }

    return output;
};

export default BuildingBlock;

