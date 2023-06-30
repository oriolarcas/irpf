import Sidebar from './Sidebar'
import { IrpfParameters, calculateIrpf } from './Irpf';

import React from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

class App extends React.Component {
  inputEvent = (params: IrpfParameters) => {
    console.log(params);

    const irpf = calculateIrpf(params);
    console.log(irpf);
  };

  render() {
    return (
      <Container fluid className='h-100'>
        <Row className='h-100'>
          <Sidebar onInput={this.inputEvent} />

          <Col fluid className="p-5">
            <h1 className="header">
              Welcome To React-Bootstrap TypeScript Example
            </h1>
            <h2>Buttons</h2>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default App;
