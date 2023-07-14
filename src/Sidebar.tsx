import {
    IrpfParameters,
    CategoriaProfessional,
    ComunitatAutònoma,
    GrauDiscapacitat,
    Dependent,
    SmiAnual,
} from './Irpf';
import { formatCurrency } from './Currency';

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
        values: new Map<string, any>(),
        is_error: new Map<string, boolean>()
    };
    changeTimer: ReturnType<typeof setTimeout> | undefined = undefined;

    SelectToCategoriaProfessional = new Map<string, {categoriaProfessional: CategoriaProfessional, name: string}>([
        ['A', {categoriaProfessional: CategoriaProfessional.EnginyersILlicenciats, name: "Enginyers i llicenciats"}],
        ['B', {categoriaProfessional: CategoriaProfessional.EnginyersTecnicsPèritsIAjudantsTitulats, name: "Enginyers tècnics, pèrits i ajudants titulats"}],
        ['C', {categoriaProfessional: CategoriaProfessional.CapsAdministratiusIDeTaller, name: "Caps administratius i de taller"}],
        ['D', {categoriaProfessional: CategoriaProfessional.AjudantsNoTitulats, name: "Ajudants no titulats"}],
        ['E', {categoriaProfessional: CategoriaProfessional.OficialsAdministratius, name: "Oficials administratius"}],
        ['F', {categoriaProfessional: CategoriaProfessional.Subalterns, name: "Subalterns"}],
        ['G', {categoriaProfessional: CategoriaProfessional.AuxiliarsAdministratius, name: "Auxiliars administratius"}],
        ['H', {categoriaProfessional: CategoriaProfessional.OficialsDePrimeraISegona, name: "Oficials de primera i segona"}],
        ['I', {categoriaProfessional: CategoriaProfessional.OficialsDeTerceraIEspecialistes, name: "Oficials de tercera i especialistes"}],
        ['J', {categoriaProfessional: CategoriaProfessional.Peons, name: "Peons"}],
        ['K', {categoriaProfessional: CategoriaProfessional.TreballadorsMenors18Anys, name: "Qualsevol treballador menor de 18 anys"}],
    ]);

    SelectToComunitatAutònoma = new Map<string, {comunitatAutònoma: ComunitatAutònoma, name: string}>([
        ['1', {comunitatAutònoma: ComunitatAutònoma.Andalusia, name: "Andalusia"}],
        ['2', {comunitatAutònoma: ComunitatAutònoma.Aragó, name: "Aragó"}],
        ['3', {comunitatAutònoma: ComunitatAutònoma.Astúries, name: "Astúries"}],
        ['4', {comunitatAutònoma: ComunitatAutònoma.Balears, name: "Balears"}],
        ['5', {comunitatAutònoma: ComunitatAutònoma.Canaries, name: "Canaries"}],
        ['6', {comunitatAutònoma: ComunitatAutònoma.Cantàbria, name: "Cantàbria"}],
        ['7', {comunitatAutònoma: ComunitatAutònoma.CastellaILleó, name: "Castella i Lleó"}],
        ['8', {comunitatAutònoma: ComunitatAutònoma.CastellaLaManxa, name: "Castella - la Manxa"}],
        ['9', {comunitatAutònoma: ComunitatAutònoma.Catalunya, name: "Catalunya"}],
        ['10', {comunitatAutònoma: ComunitatAutònoma.Extremadura, name: "Extremadura"}],
        ['11', {comunitatAutònoma: ComunitatAutònoma.Galícia, name: "Galícia"}],
        ['12', {comunitatAutònoma: ComunitatAutònoma.LaRioja, name: "La Rioja"}],
        ['13', {comunitatAutònoma: ComunitatAutònoma.Madrid, name: "Madrid"}],
        ['14', {comunitatAutònoma: ComunitatAutònoma.Múrcia, name: "Múrcia"}],
        ['15', {comunitatAutònoma: ComunitatAutònoma.PaísValencià, name: "País Valencià"}],
    ]);

    constructor(props: any) {
        super(props);

        let values = this.state.values;
        let is_error = this.state.is_error;
        for (const field in IrpfFormFields) {
            values.set(field, "");
            is_error.set(field, false);
        }
        // Default values
        values.set(IrpfFormFields.SalariBrut, "28000"); // https://www.idescat.cat/indicadors/?id=anuals&n=10400
        values.set(IrpfFormFields.Edat, "42"); // https://www.idescat.cat/treball/epa?tc=4&id=xc1152&dt=2022&dt=2022
        values.set(IrpfFormFields.CategoriaProfessional, this.SelectToCategoriaProfessional.keys().next().value);
        values.set(IrpfFormFields.ComunitatAutònoma, Array.from(this.SelectToComunitatAutònoma.entries()).filter(([value, props]) => (props.comunitatAutònoma === ComunitatAutònoma.Catalunya))[0][0]);
        values.set(IrpfFormFields.MovilitatGeogràfica, false);

        this.setState({values, is_error});
    }

    setError(field: IrpfFormFields, error: boolean) {
        let is_error = this.state.is_error;
        is_error.set(field, error);
        this.setState(is_error);
    }

    onChangeText = (event: any) => {
        this.onChange(event, false);
    }

    onChangeControl = (event: any) => {
        this.onChange(event, true);
    }

    onChange(event: any, immediate: boolean) {
        const element = event.target;
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

        if (immediate) {
            this.onInput();
        } else {
            clearTimeout(this.changeTimer);
            this.changeTimer = setTimeout(this.onInput, 500);
        }
    }

    onInput = (event?: any) => {
        if (event !== undefined) {
            event.preventDefault();
        }

        const parsePositiveInt = (num: string) => {
            num = num.trim();
            if (!/^\+?(0|[1-9]\d*)$/.test(num)) {
                return NaN;
            }
            return parseInt(num, 10);
        }

        const values = this.state.values;
        const salariBrut = parsePositiveInt(values.get(IrpfFormFields.SalariBrut));
        const edat = parsePositiveInt(values.get(IrpfFormFields.Edat));
        const categoriaProfessional = this.SelectToCategoriaProfessional.get(values.get(IrpfFormFields.CategoriaProfessional))?.categoriaProfessional ?? CategoriaProfessional.EnginyersILlicenciats;
        const comunitatAutònoma = this.SelectToComunitatAutònoma.get(values.get(IrpfFormFields.ComunitatAutònoma))?.comunitatAutònoma ?? ComunitatAutònoma.Andalusia;
        const movilitatGeogràfica = values.get(IrpfFormFields.MovilitatGeogràfica);

        this.setError(IrpfFormFields.SalariBrut, Number.isNaN(salariBrut) || salariBrut < SmiAnual);
        this.setError(IrpfFormFields.Edat, Number.isNaN(edat));
        this.setError(IrpfFormFields.CategoriaProfessional, categoriaProfessional === undefined);
        this.setError(IrpfFormFields.ComunitatAutònoma, comunitatAutònoma === undefined);

        if (Array.from(this.state.is_error.values()).reduce((all, current) => all || current)) {
            this.setState(this.state);
            return;
        }

        // TODO:
        const contribuent: Dependent = {
            edat: edat,
            discapacitat: GrauDiscapacitat.Cap,
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

    componentDidMount(): void {
        this.onInput();
    }

    render() {
        return (
            <Col md={3} xl={2} className='sidebar col-auto px-sm-2 px-0 bg-dark'>
                <div className="d-flex align-items-center m-3 mb-md-0 me-md-auto text-white text-decoration-none">
                    <CalculatorFill className="bi me-2" size={40} />
                    <span className="fs-4">IRPF</span>
                </div>
                <Form onSubmit={this.onInput}>
                    <ul className="nav nav-pills flex-column mb-auto">
                        <li className="nav-item">
                            <Form.Label htmlFor={IrpfFormFields.SalariBrut}>
                                <CurrencyEuro className='me-1' size={20} color='white' />
                                Salari brut anual
                            </Form.Label>
                            <Form.Control id={IrpfFormFields.SalariBrut} onChange={this.onChangeText} value={this.state.values.get(IrpfFormFields.SalariBrut)} />
                            {this.state.is_error.get(IrpfFormFields.SalariBrut) === true &&
                                <Form.Text className='help text-warning'>
                                    Valor invàlid. Introdueix un salari brut anual en €, major que el SMI de {formatCurrency(SmiAnual)}, sense punts, comes, espais o altres símbols.
                                </Form.Text>
                            }
                        </li>
                        <li className="nav-item">
                            <Form.Label htmlFor={IrpfFormFields.Edat}>
                                <Person className='me-1' size={20} color='white' />
                                Edat
                            </Form.Label>
                            <Form.Control id={IrpfFormFields.Edat} onChange={this.onChangeText} value={this.state.values.get(IrpfFormFields.Edat)} />
                            {this.state.is_error.get(IrpfFormFields.Edat) === true &&
                                <Form.Text className='help text-warning'>
                                    Valor invàlid. Introdueix la teva edat, en anys.
                                </Form.Text>
                            }
                        </li>
                        <li className="nav-item">
                            <Form.Label htmlFor={IrpfFormFields.CategoriaProfessional}>
                                <Tools className='me-1' size={20} color='white' />
                                Categoria professional
                            </Form.Label>
                            <Form.Select id={IrpfFormFields.CategoriaProfessional} aria-label="Categoria professional" onChange={this.onChangeControl}>
                                {
                                    Array.from(this.SelectToCategoriaProfessional.entries()).map((value) => {
                                        return <option value={value[0]}>
                                            {value[1].name}
                                        </option>
                                    })
                                }
                            </Form.Select>
                        </li>
                        <li className="nav-item">
                            <Form.Label htmlFor={IrpfFormFields.ComunitatAutònoma}>
                                <GeoAltFill className='me-1' size={20} color='white' />
                                Comunitat autònoma
                            </Form.Label>
                            <Form.Select id={IrpfFormFields.ComunitatAutònoma} aria-label="Comunitat Autònoma" onChange={this.onChangeControl}>
                                {
                                    Array.from(this.SelectToComunitatAutònoma.entries()).map((value) => {
                                        return <option
                                            value={value[0]}
                                            selected={this.state.values.get(IrpfFormFields.ComunitatAutònoma) === value[0] ? true : undefined}>
                                                {value[1].name}
                                            </option>
                                    })
                                }
                            </Form.Select>
                            <Form.Check type='checkbox' id={IrpfFormFields.MovilitatGeogràfica} label='Movilitat geogràfica' className='mt-2' onChange={this.onChangeControl} />
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
