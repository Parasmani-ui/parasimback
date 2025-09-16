import React from "react";
import { useState, useEffect } from "react";
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Icon from './Icon';
import gameConfig from '../gameConfig';
import navbars from '../context/navbars';
import logo from '../images/logo.jpg';

const Sidebar = (props) => {
  const _navbar = navbars[props.user.role];
  var navbar = _navbar;

  if ((gameConfig.VERSION == 'game.aimabizlabedge.com' || gameConfig.VERSION == 'demo.aimabizlabedge.com' || gameConfig.VERSION == 'test.aimabizlabedge.com') && props.user.role == 'superadmin') {
    navbar = [];
    _navbar.forEach((nitem) => {
      if (nitem.pageName == 'case_studies_list') {
        return;
      }
      if (nitem.icon == 'edit_case_study') {
        return;
      }
      navbar.push(nitem);
    });
  }

  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [width, setWidth] = useState(window.innerWidth);
  const [hideItems, setHideItems] = useState(width < 900);
  const [showNav, setShowNav] = useState({});

  const updateWidth = () => {
    setWidth(window.innerWidth);
    if (window.innerWidth < 900) {
      setHideItems(true);
    }
    else {
      setHideItems(false);
    }
  };

  useEffect(() => {
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    var visible = sessionStorage.getItem('sidebar_visible');
    setSidebarVisible(visible === null || visible === 'true');
  }, []);

  useEffect(() => {
    sessionStorage.setItem('sidebar_visible', sidebarVisible);
  }, [sidebarVisible]);

  const handleComponentClick = (pageName) => {
    props.changePage(pageName);
  };

  const handleLogoutClick = () => {
    props.handleLogout();
  };

  const toggleMenu = () => {
    //setSidebarVisible(!sidebarVisible);
    //props.sideBarChanged();
    props.toggleSidebar();
  };

  const toggleParent = (text) => {
    const _showNav = { ...showNav };
    _showNav[text] = _showNav[text] == 'block' || !_showNav[text] ? 'none' : 'block';
    setShowNav(_showNav);
  };

  return (
    <div className={(sidebarVisible && !hideItems ? 'sidebar_wrapper' : 'hide_items sidebar_wrapper')}>
      <div name="toggle_toolbar" className="toggle_toolbar" onClick={() => toggleMenu()}><Icon name="menu" /></div>

      <Nav defaultActiveKey={props.active} className="flex-column" style={{textTransform: 'uppercase', fontSize: '0.9em'}}>
        <Nav.Item style={{height: '60px'}}>
          <Nav.Link className="brand_item" style={{height: '100%'}}>
            <img src={gameConfig.getImagePath(props.images['game_logo']) || logo} alt={gameConfig.brandName} style={{height: '100%'}} />
            {sidebarVisible && <span className="nav_text">{gameConfig.brandName}</span>}
          </Nav.Link>
        </Nav.Item>
        {props.user.role == 'user' &&
          <Nav.Item>
            <Nav.Link className="childnav" onClick={props.gotoHome}>
            <Icon className="main_icon" name="games" />
              {sidebarVisible && <span className="nav_text">Games</span>}
            </Nav.Link>
          </Nav.Item>
        }
        {
          navbar.map((item) => (
            item.children ?
              <div key={item.text} className="parent_wrapper">
                <Nav.Item className="parentnav">
                  <Nav.Link onClick={() => toggleParent(item.text)}>
                    <Icon className="main_icon" name={item.icon} />
                    {sidebarVisible && <span className="nav_text">{item.text}</span>}
                    {showNav[item.text] == 'none' && <Icon className="parent_icon" name="expand_children" />}
                    {(showNav[item.text] == 'block' || !showNav[item.text]) && <Icon className="parent_icon" name="collapse_children" />}
                  </Nav.Link>
                </Nav.Item>
                {
                  item.children.map((child) => (
                    <Nav.Item key={child.text} parent={item.text} className="childnav" style={{ display: showNav[item.text] }}>
                      <Nav.Link className={props.active === child.pageName ? 'active' : ''} onClick={() => handleComponentClick(child.pageName)}>
                        <Icon name="bullet_point" />
                        <Icon className="main_icon" name={child.icon} />
                        {sidebarVisible && <span className="nav_text">{child.text}</span>}
                      </Nav.Link>
                    </Nav.Item>
                  ))
                }
              </div>
              :
              <Nav.Item key={item.text}>
                <Nav.Link className={props.active === item.pageName ? 'active' : ''} onClick={() => handleComponentClick(item.pageName)}>
                  <Icon name={item.icon} />
                  {sidebarVisible && <span className="nav_text">{item.text}</span>}
                </Nav.Link>
              </Nav.Item>
          ))
        }

        <Nav.Item>
          <Nav.Link onClick={() => handleLogoutClick()}>
            <Icon name="logout" />
            {sidebarVisible && <span className="nav_text">Logout</span>}
          </Nav.Link>
        </Nav.Item>
      </Nav>
    </div>
  );
};

export default Sidebar;
