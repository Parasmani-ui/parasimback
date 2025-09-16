import React from "react";
import {formats} from '../context/hooks.js';

const FormatData = (props) => {
  var overrides = props.formatOverrides;
  var list = props.className ? props.className.trim().split(/ +/) : [];
  list.push(props.name);
  list.push('formatted_text');

  if (!formats)
  {
    formats = _formats;
    for (var prop in overrides) {
        formats[prop] = overrides[prop];
    }
  }

  const format = props.format;
  if (!formats[format])
  {
    console.error('Format: ' + format + ' not found');
    return (
      <span className="format_not_found">{props.value}</span>
    );
  }
  
  const cn = list.join(' ');
  const val = formats[format](props.caseStudy, props.value);
  return <span className={cn}>{val}</span>
};

export default FormatData;
