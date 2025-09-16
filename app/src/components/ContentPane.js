import React from 'react';
import { useState, useEffect } from "react";

import pageConfig from '../context/pageConfig';
import pageList from '../context/pageList';
import Navigate from './utils/Navigate';

function ContentPane(props) {
  const pageName = props.pageName;
  var output = '';

  //const [pageName, setPageName] = useState(props.pageName);
  const caseStudy = props.caseStudy;
  if (!pageName) {
    //console.error('Error: pageName not set in ContentPane');
    output = <div className="error">Error: pageName not set in ContentPane</div>;
  }
  else {
    const page = pageList[pageName];
    if (!page) {
      console.error('Error: pageName not set in pageList. pageName: (' + pageName + ').');
      output = <div className="error">Error: pageName not set in pageList. pageName: {pageName}.</div>;
    } 
    else if (!page.component) {
      console.error('Error: component not set in pageList. pageName: (' + pageName + ').');
      output = <div className="error">Error: component not set in pageList. pageName: {pageName}.</div>;
    }
    else if (!pageConfig[page.component]) {
      console.error('Error: component not defined in context/pageConfig.js. component: (' + page.component + ').');
      output = <div className="error">Error: component not set in context/pageConfig.js. component: {page.component}.</div>;
    }
    else {
      const Page = pageConfig[page.component];
      output = <>
        <Navigate {...props} />
        <Page pageName={pageName} {...props} placement="top" />
        <Navigate {...props} placement="bottom" />
      </>
    }
  }

  return output;
}

export default ContentPane;