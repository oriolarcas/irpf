import Sidebar from './Sidebar'

import React from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import { CalculatorFill, CurrencyEuro, Person, GeoAltFill, Tools } from 'react-bootstrap-icons';

const App: React.FC = () => {
  const calculate = (event: any) => {
    event.preventDefault();
    const form = event.currentTarget;
    // let calculator = calculateIrpf(form.);
  }

  return (
    <Container fluid className='h-100'>
      <Row className='h-100'>
        <Sidebar />

        <Col fluid className="p-5">
          <h1 className="header">
            Welcome To React-Bootstrap TypeScript Example
          </h1>
          <h2>Buttons</h2>
        </Col>
      </Row>
    </Container>
  );
};

export default App;
