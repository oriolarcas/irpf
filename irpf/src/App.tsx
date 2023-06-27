import React from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import { CalculatorFill, CurrencyEuro, Person, GeoAltFill, Tools } from 'react-bootstrap-icons';

const App: React.FC = () => {
  return (
    <Container fluid className='h-100'>
      <Row className='h-100'>
        <Col md={3} xl={2} className='sidebar col-auto px-sm-2 px-0 bg-dark'>
          <a href="#" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
            <CalculatorFill className="bi me-2" size={40} />
            <span className="fs-4">IRPF</span>
          </a>
          <hr />
          <ul className="nav nav-pills flex-column mb-auto">
            <li className="nav-item">
              <Form.Label htmlFor='salari-brut'>
                <CurrencyEuro size={20} color='white' />
                Salari brut anual
              </Form.Label>
              <Form.Control id="salari-brut" />
            </li>
            <li className="nav-item">
              <Form.Label htmlFor='edat'>
                <Person size={20} color='white' />
                Edat
              </Form.Label>
              <Form.Control id="edat" />
            </li>
            <li className="nav-item">
              <Form.Label htmlFor='categoria-professional'>
                <Tools size={20} color='white' />
                Categoria professional
              </Form.Label>
              <Form.Select id='categoria-professional' aria-label="Categoria professional">
                <option value='A'>Enginyers i llicenciats</option>
                <option value='B'>Enginyers tècnics, pèrits i ajudants titulats</option>
                <option value='C'>Caps administratius i de taller</option>
                <option value='D'>Ajudants no titulats</option>
                <option value='E'>Oficials administratius</option>
                <option value='F'>Subalterns</option>
                <option value='G'>Auxiliars administratius</option>
                <option value='H'>Oficials de primera i segona</option>
                <option value='I'>Oficials de tercera i especialistes</option>
                <option value='J'>Peons</option>
                <option value='K'>Qualsevol treballador menor de 18 anys</option>
              </Form.Select>
            </li>
            <li className="nav-item">
              <Form.Label htmlFor='comunitat-autonoma'>
                <GeoAltFill size={20} color='white' />
                Comunitat autònoma
              </Form.Label>
              <Form.Select id='comunitat-autonoma' aria-label="Categoria professional">
                <option value='E'>Espanya</option>
                <option value='1'>Andalusia</option>
                <option value='2'>Aragó</option>
                <option value='3'>Astúries</option>
                <option value='4'>Balears</option>
                <option value='5'>Canaries</option>
                <option value='6'>Cantàbria</option>
                <option value='7'>Castella i Lleó</option>
                <option value='8'>Castella - la Manxa</option>
                <option value='9'>Catalunya</option>
                <option value='10'>Comunitat Valenciana</option>
                <option value='11'>Extremadura</option>
                <option value='12'>Galícia</option>
                <option value='13'>La Rioja</option>
                <option value='14'>Madrid</option>
                <option value='15'>Múrcia</option>
              </Form.Select>
              <Form.Check type='checkbox' id='movilitat-geografica' label='Movilitat geogràfica' className='mt-2' />
            </li>
            <li className="nav-item">
              <Button variant="primary" className='w-100 mt-3'>Calcula</Button>
            </li>
          </ul>
        </Col>

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
