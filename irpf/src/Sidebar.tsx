import { calculateIrpf, CategoriaProfessional, ComunitatAutònoma } from './Irpf';

import React from 'react';

import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import { CalculatorFill, CurrencyEuro, Person, GeoAltFill, Tools } from 'react-bootstrap-icons';

class Sidebar extends React.Component {
    FormSalariBrut: any;
    FormEdat: any;
    FormCategoriaProfessional: any;
    FormComunitatAutònoma: any;
    FormMovilitatGeogràfica: any;

    SelectToCategoriaProfessional = new Map<string, CategoriaProfessional>([
        ['A', CategoriaProfessional.EnginyersILlicenciats],
        ['B', CategoriaProfessional.EnginyersTecnicsPèritsIAjudantsTitulats],
        ['C', CategoriaProfessional.CapsAdministratiusIDeTaller],
        ['D', CategoriaProfessional.AjudantsNoTitulats],
        ['E', CategoriaProfessional.OficialsAdministratius],
        ['F', CategoriaProfessional.Subalterns],
        ['G', CategoriaProfessional.AuxiliarsAdministratius],
        ['H', CategoriaProfessional.OficialsDePrimeraISegona],
        ['I', CategoriaProfessional.OficialsDeTerceraIEspecialistes],
        ['J', CategoriaProfessional.Peons],
        ['K', CategoriaProfessional.TreballadorsMenors18Anys],
    ]);

    SelectToComunitatAutònoma = new Map<string, ComunitatAutònoma>([
        ['E', ComunitatAutònoma.Espanya],
        ['1', ComunitatAutònoma.Andalusia],
        ['2', ComunitatAutònoma.Aragó],
        ['3', ComunitatAutònoma.Astúries],
        ['4', ComunitatAutònoma.Balears],
        ['5', ComunitatAutònoma.Canaries],
        ['6', ComunitatAutònoma.Cantàbria],
        ['7', ComunitatAutònoma.CastellaILleó],
        ['8', ComunitatAutònoma.CastellaLaManxa],
        ['9', ComunitatAutònoma.Catalunya],
        ['10', ComunitatAutònoma.ComunitatValenciana],
        ['11', ComunitatAutònoma.Extremadura],
        ['12', ComunitatAutònoma.Galícia],
        ['13', ComunitatAutònoma.LaRioja],
        ['14', ComunitatAutònoma.Madrid],
        ['15', ComunitatAutònoma.Múrcia],
    ])

    constructor(props: any) {
        super(props);
        this.FormSalariBrut = React.createRef();
        this.FormEdat = React.createRef();
        this.FormCategoriaProfessional = React.createRef();
        this.FormComunitatAutònoma = React.createRef();
        this.FormMovilitatGeogràfica = React.createRef();
    }

    calculate(event: any) {
        event.preventDefault();

        const salariBrut = parseInt(this.FormSalariBrut.current.value);
        const edat = parseInt(this.FormEdat.current.value);
        const categoriaProfessional = this.SelectToCategoriaProfessional.get(this.FormCategoriaProfessional.current.value);
        const comunitatAutònoma = this.SelectToComunitatAutònoma.get(this.FormComunitatAutònoma.current.value);
        const movilitatGeogràfica = this.FormMovilitatGeogràfica.current.checked;

        if (Number.isNaN(salariBrut)) {
            this.error('Salari brut invàlid');
            return;
        }

        if (Number.isNaN(edat)) {
            this.error('Edat invàlida');
            return;
        }

        if (categoriaProfessional == undefined) {
            this.error('Categoria professional invàlida');
            return;
        }

        if (comunitatAutònoma == undefined) {
            this.error('Comunitat autònoma invàlida');
            return;
        }

        const irpf = calculateIrpf(
            salariBrut,
            edat,
            categoriaProfessional,
            comunitatAutònoma,
            movilitatGeogràfica,
        );

        console.log(irpf);
    }

    error(msg: string) {
        console.error(msg);
    }
    
    render() {
        return (
            <Col md={3} xl={2} className='sidebar col-auto px-sm-2 px-0 bg-dark'>
            <a href="#" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                <CalculatorFill className="bi me-2" size={40} />
                <span className="fs-4">IRPF</span>
            </a>
            <hr />
            <Form onSubmit={this.calculate.bind(this)}>
                <ul className="nav nav-pills flex-column mb-auto">
                <li className="nav-item">
                    <Form.Label htmlFor='salari-brut'>
                    <CurrencyEuro size={20} color='white' />
                    Salari brut anual
                    </Form.Label>
                    <Form.Control id="salari-brut" ref={this.FormSalariBrut} />
                </li>
                <li className="nav-item">
                    <Form.Label htmlFor='edat'>
                    <Person size={20} color='white' />
                    Edat
                    </Form.Label>
                    <Form.Control id="edat" ref={this.FormEdat} />
                </li>
                <li className="nav-item">
                    <Form.Label htmlFor='categoria-professional'>
                    <Tools size={20} color='white' />
                    Categoria professional
                    </Form.Label>
                    <Form.Select id='categoria-professional' aria-label="Categoria professional" ref={this.FormCategoriaProfessional}>
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
                    <Form.Select id='comunitat-autonoma' aria-label="Categoria professional" ref={this.FormComunitatAutònoma}>
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
                    <Form.Check type='checkbox' id='movilitat-geografica' label='Movilitat geogràfica' className='mt-2' ref={this.FormMovilitatGeogràfica} />
                </li>
                <li className="nav-item">
                    <Button type='submit' variant="primary" className='w-100 mt-3'>Calcula</Button>
                </li>
                </ul>
            </Form>
            </Col>
        );
    }
}

export default Sidebar;
