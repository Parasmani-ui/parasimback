import React from 'react';
import { useState } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import { post } from './utils/ServerCall.js';
import ShowModal from './utils/ShowModal';
import gameConfig from '../gameConfig.js';
//import bgImage from '../images/pexels-fauxels-3183150.jpg';

const LoginForm = (props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || password.length <= 0) {
      setError('Password cannot be blank');
      return;
    }

    sessionStorage.clear();
    const user = await post('auth/login', null, {email: email, password: password});
    if (user && user.rc) {
      setError(user.rc);
      return;
    }

    if (!user) {
      return;
    }

    await props.handleLogin(user);
  };

  return (
    <div style={{position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'var(--loginpage_background_color)'}}>
    <div className="loginpage d-flex align-items-center" 
          style={{
            backgroundImage: 'url(' + props.backgroundImage + ')',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            //opacity: 0.5
          }}>
    </div>
    <Container className="loginform" 
            style={{margin: 0,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            borderRadius: '5px',
            color: 'var(--loginform_text_color)',
            border: '1px solid white'
        }}>
      <Row style={{borderBottom: '1px solid white', paddingBottom: '20px'}}>
        <Col md={4}>
          <img style={{ height: '70px' }} src={
              gameConfig.VERSION == 'game.aimabizlabedge.com' || gameConfig.VERSION == 'demo.aimabizlabedge.com' || gameConfig.VERSION == 'test.aimabizlabedge.com' || gameConfig.VERSION == 'bizlab.parasim.in' || gameConfig.VERSION == 'bizlab_demo.parasim.in' ?
                gameConfig.getImagePath('images/bizlab-edge-logo.png')
              :
                gameConfig.getImagePath('images/parasim-logo-small.png')
            } alt={gameConfig.brandName} />
        </Col>
        <Col style={{display: 'flex', paddingLeft: '30px', alignItems: 'center', justifyContent: 'flex-start', fontSize: '1.5rem'}}>
            Login Form
        </Col>
      </Row>
    <Form onSubmit={handleSubmit} style={{paddingTop: '20px'}}>
      <Form.Group className="mb-3">
        <Form.Label>Email</Form.Label>
        <Form.Control type="email" placeholder="Enter email" name="email" value={email} onChange={handleEmailChange} 
          style={{
            borderRadius: '12px',
            border: '1px solid #ffffff',
            background: '#060919',
            color: '#ffffff',
            fontFamily: 'Helvetica, Arial',
            padding: '12px'
          }}
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control type="password" placeholder="Password" name="password" autoComplete="current_password" value={password} onChange={handlePasswordChange} 
          style={{
            borderRadius: '12px',
            border: '1px solid #ffffff',
            background: '#060919',
            color: '#ffffff',
            fontFamily: 'Helvetica, Arial',
            padding: '12px'
          }}
        />
      </Form.Group>
      <div style={{textAlign: 'center'}}>
      <Button variant="primary" type="submit" 
        style={{
          borderRadius: '12px',
          background: 'radial-gradient(441.87% 148.66% at 31.82% -13.39%, #FF9B00 12.5%, #ED1C24 100%)',
          boxShadow: '0px 15px 36px 0px rgba(246, 87, 20, 0.30)',
          padding: '1.5rem 2rem',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#FFF',
          fontFamily: 'Helvetica, Arial',
          fontSize: '1rem',
          fontStyle: 'normal',
          fontWeight: '500',
          lineHeight: '1.5rem'
        }}
      >
        Login
      </Button>
      </div>
    </Form>
    <div className="errormsg">{error}</div>
  </Container>
  </div>
  );
};

export default LoginForm;

