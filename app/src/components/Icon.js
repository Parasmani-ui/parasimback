import React from "react";
import { useState, useEffect } from "react";
import gameConfig from "../gameConfig";

import { mergeClasses } from './utils/common';

const Icon = (props) => {
  const [code, setCode] = useState('');
  const containerClasses = mergeClasses(props.className, 'icon_wrapper', props.name);

  useEffect(() => {
    const fetchIcon = async () => {
      try {
        const response = await fetch(gameConfig.GET_URL + '/icons/' + props.name + '.svg');
        if (response.ok) {
          const _code = await response.text();
          setCode(_code);
        }
      } catch (error) {
      }
    };

    fetchIcon();
  }, []);

  return <span className={containerClasses} dangerouslySetInnerHTML={{ __html: code }} />;
  /*
const containerClasses = mergeClasses(props.className, 'icon_wrapper', props.name);

if (!icons[props.name])
{
  console.error('icon: "' + props.name + '" not found');
}
const style = {...props.style};
return <div style={{display: 'inline-block'}}><div className={containerClasses}><IconCode style={style} /></div></div>;
*/
};

export default Icon;
