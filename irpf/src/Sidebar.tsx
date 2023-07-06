import { IrpfParameters, CategoriaProfessional, ComunitatAutònoma, GrauDiscapacitat, Dependent } from './Irpf';

import React from 'react';

import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import { CalculatorFill, CurrencyEuro, Person, GeoAltFill, Tools } from 'react-bootstrap-icons';

enum IrpfFormFields {
    SalariBrut = 'SalariBrut',
    Edat = 'Edat',
    CategoriaProfessional = 'CategoriaProfessional',
    ComunitatAutònoma = 'ComunitatAutònoma',
    MovilitatGeogràfica = 'MovilitatGeogràfica',
}

class Sidebar extends React.Component<{onInput?: (params: IrpfParameters) => void}> {
    state = {
        values: new Map<string, any>()
    };
    FormTextRefs = new Map<string, any>();

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
        ['10', ComunitatAutònoma.PaísValencià],
        ['11', ComunitatAutònoma.Extremadura],
        ['12', ComunitatAutònoma.Galícia],
        ['13', ComunitatAutònoma.LaRioja],
        ['14', ComunitatAutònoma.Madrid],
        ['15', ComunitatAutònoma.Múrcia],
    ]);

    constructor(props: any) {
        super(props);

        let values = this.state.values;
        for (const field in IrpfFormFields) {
            values.set(field, "");
            this.FormTextRefs.set(field, React.createRef());
        }
        // Default values
        values.set(IrpfFormFields.CategoriaProfessional, this.SelectToCategoriaProfessional.keys().next().value);
        values.set(IrpfFormFields.ComunitatAutònoma, this.SelectToComunitatAutònoma.keys().next().value);
        values.set(IrpfFormFields.MovilitatGeogràfica, false);

        this.setState({values});
    }

    onChange = (event: any) => {
        const element = event.target;

        console.log(element);

        let values = this.state.values;
        switch (element.id) {
            case IrpfFormFields.SalariBrut:
            case IrpfFormFields.Edat:
            case IrpfFormFields.CategoriaProfessional:
            case IrpfFormFields.ComunitatAutònoma:
                values.set(element.id, element.value);
                break;
            case IrpfFormFields.MovilitatGeogràfica:
                values.set(element.id, element.checked);
                break;
        }
        this.setState({values});
    }

    onInput = (event: any) => {
        event.preventDefault();

        const values = this.state.values;
        const salariBrut = parseInt(values.get(IrpfFormFields.SalariBrut));
        const edat = parseInt(values.get(IrpfFormFields.Edat));
        const categoriaProfessional = this.SelectToCategoriaProfessional.get(values.get(IrpfFormFields.CategoriaProfessional));
        const comunitatAutònoma = this.SelectToComunitatAutònoma.get(values.get(IrpfFormFields.ComunitatAutònoma));
        const movilitatGeogràfica = values.get(IrpfFormFields.MovilitatGeogràfica);

        if (Number.isNaN(salariBrut)) {
            this.error('Salari brut invàlid');
            return;
        }

        if (Number.isNaN(edat)) {
            this.error('Edat invàlida');
            return;
        }

        if (categoriaProfessional === undefined) {
            this.error('Categoria professional invàlida');
            return;
        }

        if (comunitatAutònoma === undefined) {
            this.error('Comunitat autònoma invàlida');
            return;
        }

        // TODO:
        const contribuent: Dependent = {
            edat: 30,
            discapacitat: GrauDiscapacitat.CapOMenor33,
            assistència: false,
        };
        const descendentsExclusiva: boolean = false;
        const descendents: Dependent[] = [];
        const ascendents: Dependent[] = [];

        const params: IrpfParameters = {
            salariBrut,
            categoriaProfessional,
            comunitatAutònoma,
            movilitatGeogràfica,
            contribuent,
            descendentsExclusiva,
            descendents,
            ascendents,
        };

        if (this.props.onInput) {
            this.props.onInput(params);
        }
    };

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
                <Form onSubmit={this.onInput}>
                    <ul className="nav nav-pills flex-column mb-auto">
                        <li className="nav-item">
                            <Form.Label htmlFor={IrpfFormFields.SalariBrut}>
                                <CurrencyEuro size={20} color='white' />
                                Salari brut anual
                            </Form.Label>
                            <Form.Control id={IrpfFormFields.SalariBrut} onChange={this.onChange} />
                            <Form.Text id="passwordHelpBlock" className='text-warning d-none' >
                                El teu salari brut anual en €. Un número positiu, sense punts, comes, espais o altres símbols.
                            </Form.Text>
                        </li>
                        <li className="nav-item">
                            <Form.Label htmlFor={IrpfFormFields.Edat}>
                                <Person size={20} color='white' />
                                Edat
                            </Form.Label>
                            <Form.Control id={IrpfFormFields.Edat} onChange={this.onChange} />
                        </li>
                        <li className="nav-item">
                            <Form.Label htmlFor={IrpfFormFields.CategoriaProfessional}>
                                <Tools size={20} color='white' />
                                Categoria professional
                            </Form.Label>
                            <Form.Select id={IrpfFormFields.CategoriaProfessional} aria-label="Categoria professional" onChange={this.onChange}>
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
                            <Form.Label htmlFor={IrpfFormFields.ComunitatAutònoma}>
                                <GeoAltFill size={20} color='white' />
                                Comunitat autònoma
                            </Form.Label>
                            <Form.Select id={IrpfFormFields.ComunitatAutònoma} aria-label="Comunitat Autònoma" onChange={this.onChange}>
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
                            <Form.Check type='checkbox' id={IrpfFormFields.MovilitatGeogràfica} label='Movilitat geogràfica' className='mt-2' onChange={this.onChange} />
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
