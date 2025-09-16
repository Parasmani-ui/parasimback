import React, { useState, useEffect } from "react";
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Nav from 'react-bootstrap/Nav';
import FormatData from '../FormatData';
import AutoSaveText from '../utils/AutoSaveText';
import { post } from '../utils/ServerCall';
import Icon from "../Icon";

const LeaderBoard = (props) => {
  const [selectedTab, setSelectedTab] = useState('national');
  
  //const [records, setRecords] = useState(null);
  //const [page, setPage] = useState(1);
  //const [npages, setNpages] = useState(1);
  const pageSize = 10;

  /*
  useEffect(() => {
    fetchData(tabProps[selectedTab]);
  }, [selectedTab]);

  const fetchData = async (txn) => {
    const output = await post(txn, props.user, { page: page, page_size: pageSize });
    if (output && output.rc) {
      return;
    }
    if (!output) {
      return;
    }
    setRecords(output.recs);
    setNpages(output.npages);
  };
  */

  return (
    <Card>
      <Card.Header>
        Leaderboard
      </Card.Header>
      <Card.Body style={{ minHeight: '200px' }}>
        <Tabs
          defaultActiveKey="national"
          activeKey={selectedTab}
          name="leaderboard_tabs"
          className="leaderboard_tabs"
          onSelect={(k) => setSelectedTab(k)}
          fill
          style={{ backgroundColor: 'var(--subcard-background-color)', border: '1px solid lightgrey', boxShadow: 'var(--card-shadow)' }}
        >
          <Tab eventKey="institute" title="Institute">
            <CommonLeaderboard {...props} mode={selectedTab} />
          </Tab>
          <Tab eventKey="state" title="State">
            <CommonLeaderboard {...props} mode={selectedTab} />
          </Tab>
          <Tab eventKey="national" title="National">
            <CommonLeaderboard {...props} mode={selectedTab} />
          </Tab>
        </Tabs>
      </Card.Body>
    </Card>
  );
};

const CommonLeaderboard = (props) => {
  const [records, setRecords] = useState(null);
  const [page, setPage] = useState(1);
  const [npages, setNpages] = useState(1);
  const pageSize = 50;

  const txns = {
    national: 'guest/national_leaderboard',
    state: 'user/state_leaderboard',
    institute: 'user/institute_leaderboard'
  };

  const paginatorStyle = { margin: '2px', border: '1px solid black', width: '35px', height: '35px', backgroundColor: 'white', fontSize: '0.8rem', color: 'black' };
  const paginatorStyleActive = { ...paginatorStyle, fontWeight: 'bold', border: '2px solid black', backgroundColor: '#eeeeee' };

  useEffect(() => {
    const _fetch = async () => {
      const output = await post(txns[props.mode], props.user, { page: page, page_size: pageSize });
      if (output && output.rc) {
        return;
      }
      if (!output) {
        return;
      }
      setRecords(output.recs);
      setNpages(output.npages);
    };

    _fetch();
  }, [props.mode, page]);

  return (
    <>
      {props.mode == 'state' && <Card.Text style={{ padding: '10px 0', fontWeight: 'bold' }}>State: {props.user.institute.state}</Card.Text>}
      {props.mode == 'institute' && <Card.Text style={{ padding: '10px 0', fontWeight: 'bold' }}>Institute: {props.user.institute.name}</Card.Text>}
      <Table bordered hover style={{ fontSize: '0.8rem' }}>
      <thead>
        <tr>
          <th>Rank</th>
          <th style={{ textAlign: 'left' }}>Name</th>
          {props.mode != 'institute' && <th>Institute</th>}
          {props.mode == 'national' && <th>State</th>}
          <th>Case Study</th>
          <th>Qtrs</th>
          <th>Average Score</th>
          <th>Revenues (<Icon name="dollar" />)</th>
          <th>Profits (<Icon name="dollar" />)</th>
          <th>Market Share (Volume) ( % )</th>
        </tr>
      </thead>
      <tbody>
        {records && records.map((rec, idx) => (
          <tr key={idx}>
            <td>{rec.rank}</td>
            <td style={{ textAlign: 'left' }}>{rec.name}</td>
            {props.mode != 'institute' && <td style={{ textAlign: 'left' }}>{rec.institute}</td>}
            {props.mode == 'national' && <td style={{ textAlign: 'left' }}>{rec.state}</td>}
            <td style={{ textAlign: 'left' }}>{rec.case_study}</td>
            <td>{rec.qtrs}</td>
            <td>{Math.round(parseInt(rec.score || 0) * 100) / 100}</td>
            <td>
              <FormatData
                format="thousands_indicator_int"
                name="revenue"
                value={rec.revenue}
              />
            </td>
            <td>
              <FormatData
                format="thousands_indicator_int"
                name="profit"
                value={rec.profit}
              />
            </td>
            <td>{rec.marketShare}</td>
          </tr>
        ))}
      </tbody>
    </Table>
    {
      npages > 1 &&
      <div className="paginator" style={{ textAlign: 'center' }}>
        {Array.from(Array(npages).keys()).map((idx) => (
          <button key={idx} style={(idx + 1) == page ? paginatorStyleActive : paginatorStyle} onClick={() => { setPage(idx + 1) }}>{idx + 1}</button>
        ))}
      </div>
    }
    </>
  );
};

/*

const LeaderBoard = (props) => {
  const [selected, setSelected] = useState('institute');
  const [records, setRecords] = useState(null);
  const [page, setPage] = useState(1);
  const [npages, setNpages] = useState(1);
  const pageSize = 2;

  const paginatorStyle = { margin: '2px', border: '1px solid black', width: '35px', height: '35px', backgroundColor: 'white', fontSize: '0.8rem', color: 'black' };
  const paginatorStyleActive = { ...paginatorStyle, fontWeight: 'bold', border: '2px solid black', backgroundColor: '#eeeeee' };

  useEffect(() => {
    const _fetch = async () => {
      const output = await post('/guest/national_leaderboard', props.user, { page: page, page_size: pageSize });
      if (output && output.rc) {
        return;
      }
      if (!output) {
        return;
      }
      setRecords(output.recs);
      setNpages(output.npages);
    };

    _fetch();
  }, []);

  return <Card>
    <Card.Header>
      Leaderboard
    </Card.Header>
    <Card.Body style={{ minHeight: '200px' }}>
      <Tabs
        defaultActiveKey="national"
        name="leaderboard_tabs"
        className="leaderboard_tabs"
        fill
        style={{ backgroundColor: 'var(--subcard-background-color)', border: '1px solid lightgrey', boxShadow: 'var(--card-shadow)' }}
      >
        <Tab eventKey="institute" title="Institute">
          <InstituteLeaderboard {...props} mode="institute" txn="/user/institute_leaderboard" />
        </Tab>
        <Tab eventKey="state-level" title="State Level">
          <StateLeaderboard {...props} mode="state" txn="/user/state_leaderboard" />
        </Tab>
        <Tab eventKey="national" title="National">
          <NationalLeaderboard {...props} mode="national" txn="/guest/national_leaderboard" />
        </Tab>
      </Tabs>
    </Card.Body>
  </Card>;
};


const CommonLeaderboard = (props) => {
  const [records, setRecords] = useState(null);
  const [page, setPage] = useState(1);
  const [npages, setNpages] = useState(1);
  const [state, setState] = useState(null);
  const [institute, setInstitute] = useState(null);
  const pageSize = 50;

  const paginatorStyle = { margin: '2px', border: '1px solid black', width: '35px', height: '35px', backgroundColor: 'white', fontSize: '0.8rem', color: 'black' };
  const paginatorStyleActive = { ...paginatorStyle, fontWeight: 'bold', border: '2px solid black', backgroundColor: '#eeeeee' };

  useEffect(() => {
    const _fetch = async () => {
      const output = await post(props.txn, props.user, { page: page, page_size: pageSize });
      if (output && output.rc) {
        return;
      }
      if (!output) {
        return;
      }
      setRecords(output.recs);
      setNpages(output.npages);
      setState(output.state || null);
      setInstitute(output.institute || null);
    };

    _fetch();
  }, []);

  return <>
    {props.mode == 'state' && <Card.Text style={{ padding: '10px 0', fontWeight: 'bold' }}>State: {state}</Card.Text>}
    {props.mode == 'institute' && <Card.Text style={{ padding: '10px 0', fontWeight: 'bold' }}>Institute: {institute}</Card.Text>}
    <Table bordered hover style={{ fontSize: '0.8rem' }}>
      <thead>
        <tr>
          <th>Rank</th>
          <th style={{ textAlign: 'left' }}>Name</th>
          {props.mode != 'institute' && <th>Institute</th>}
          {props.mode == 'national' && <th>State</th>}
          <th>Case Study</th>
          <th>Qtrs</th>
          <th>Average Score</th>
          <th>Revenues (<Icon name="dollar" />)</th>
          <th>Profits (<Icon name="dollar" />)</th>
          <th>Market Share (Volume) ( % )</th>
        </tr>
      </thead>
      <tbody>
        {records && records.map((rec) => (
          <tr key={rec.rank + '-' + Math.round(Math.random() * 100000)}>
            <td>{rec.rank}</td>
            <td style={{ textAlign: 'left' }}>{rec.name}</td>
            {props.mode != 'institute' && <td style={{ textAlign: 'left' }}>{rec.institute}</td>}
            {props.mode == 'national' && <td style={{ textAlign: 'left' }}>{rec.state}</td>}
            <td style={{ textAlign: 'left' }}>{rec.case_study}</td>
            <td>{rec.qtrs}</td>
            <td>{Math.round(parseInt(rec.score || 0) * 100) / 100}</td>
            <td>
              <FormatData
                format="thousands_indicator_int"
                name="revenue"
                value={rec.revenue}
              />
            </td>
            <td>
              <FormatData
                format="thousands_indicator_int"
                name="profit"
                value={rec.profit}
              />
            </td>
            <td>{rec.marketShare}</td>
          </tr>
        ))}
      </tbody>
    </Table>
    {
      npages > 1 &&
      <div className="paginator" style={{ textAlign: 'center' }}>
        {Array.from(Array(npages).keys()).map((idx) => (
          <button style={(idx + 1) == page ? paginatorStyleActive : paginatorStyle} onClick={() => { setPage(idx + 1) }}>{idx + 1}</button>
        ))}
      </div>
    }
  </>;
};
*/

export default LeaderBoard;
