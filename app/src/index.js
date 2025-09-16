import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import React from 'react';
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { createRoot } from 'react-dom/client';

import GamePage from './website/GamePage';
import NotFound from './website/NotFound';
import { post } from './components/utils/ServerCall';
import gameConfig from './gameConfig';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './css/Global.css';

const App = () => {
  const [siteData, setSiteData] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);

  //sessionStorage.clear();

  const fetch = async () => {
    const data = await post('website/site_data', null, null);
    if (data && data.rc) {
      return;
    }
    if (!data) {
      return;
    }

    const indexed = {};
    data.forEach((_obj) => {
      indexed[_obj.key] = _obj;
    });

    setSiteData(indexed);
  };

  useEffect(() => {
    fetch();
  }, []);

  useEffect(() => {
  }, [siteData]);

  const updateSiteData = async () => {
    sessionStorage.removeItem('site_data');
    await fetch();
  };

  return (
    <>
      {dataLoading && <div><Spinner animation="border" /></div>}

      <BrowserRouter>
      <Routes>
        <Route exactpath="/" element={<GamePage siteData={siteData} updateSiteData={updateSiteData} />} />
        <Route index element={<GamePage siteData={siteData} updateSiteData={updateSiteData} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
    </>
  );
};

document.addEventListener("DOMContentLoaded", function() {
  const faviconPath = gameConfig.favicon;

  let faviconLink = document.querySelector("link[rel~='icon']");
  if (!faviconLink) {
    faviconLink = document.createElement("link");
    faviconLink.rel = "icon";
    document.head.appendChild(faviconLink);
  }

  faviconLink.href = faviconPath;

  let title = document.querySelector("title");
  if (!title) {
    title = document.createElement("title");
    
    title.innerText = gameConfig.title;
    document.head.appendChild(title);
  }
});

const domNode = document.getElementById('root');
const root = createRoot(domNode);
root.render(<App />);
