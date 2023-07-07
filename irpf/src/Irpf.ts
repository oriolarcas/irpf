import { ComunitatAutònoma, getDadesComunitatAutònoma, Dependent, GrauDiscapacitat, DadesComunitatAutònoma } from "./Dades";

export { ComunitatAutònoma, GrauDiscapacitat } from "./Dades";
export type { Dependent } from "./Dades";

export enum CategoriaProfessional {
    EnginyersILlicenciats,
    EnginyersTecnicsPèritsIAjudantsTitulats,
    CapsAdministratiusIDeTaller,
    AjudantsNoTitulats,
    OficialsAdministratius,
    Subalterns,
    AuxiliarsAdministratius,
    OficialsDePrimeraISegona,
    OficialsDeTerceraIEspecialistes,
    Peons,
    TreballadorsMenors18Anys,
}

export interface IrpfParameters {
    salariBrut: number;
    categoriaProfessional: CategoriaProfessional;
    comunitatAutònoma: ComunitatAutònoma;
    movilitatGeogràfica: boolean;
    contribuent: Dependent;
    descendentsExclusiva: boolean;
    descendents: Dependent[];
    ascendents: Dependent[];
}

interface IrpfResult {
    valid: boolean;
    quotaSS: number;
    tipusRetenció: number;
    salariNet: number;
}

function límitsCotitzacióPerCategoriaProfessional(categoriaProfessional: CategoriaProfessional): [min: number, max: number] {
    switch (categoriaProfessional) {
        case CategoriaProfessional.EnginyersILlicenciats:
            return [1629.30, 4139.40];
        case CategoriaProfessional.EnginyersTecnicsPèritsIAjudantsTitulats:
            return [1351.20, 4070.10];
        case CategoriaProfessional.CapsAdministratiusIDeTaller:
            return [1175.40, 4139.40];
        case CategoriaProfessional.AjudantsNoTitulats:
            return [1166.70, 4139.40];
        case CategoriaProfessional.OficialsAdministratius:
            return [1166.70, 4139.40];
        case CategoriaProfessional.Subalterns:
            return [1166.70, 4139.40];
        case CategoriaProfessional.AuxiliarsAdministratius:
            return [1166.70, 4139.40];
        case CategoriaProfessional.OficialsDePrimeraISegona:
            return [1166.70, 4139.40];
        case CategoriaProfessional.OficialsDeTerceraIEspecialistes:
            return [1166.70, 4139.40];
        case CategoriaProfessional.Peons:
            return [1166.70, 4139.40];
        case CategoriaProfessional.TreballadorsMenors18Anys:
            return [1166.70, 4139.40];
    }
}

const PercentatgeCotitzacióContingènciesComunes = 0.047;
const PercentatgeCotitzacióFormació = 0.001;
const PercentatgeCotitzacióAtur = 0.0155;
const PercentatgeCotitzacióSS = PercentatgeCotitzacióContingènciesComunes + PercentatgeCotitzacióFormació + PercentatgeCotitzacióAtur;

function getReduccióRendimentTreball(RendimentBrut: number): number {
    // https://sede.agenciatributaria.gob.es/Sede/ca_es/ayuda/manuales-videos-folletos/manuales-ayuda-presentacion/irpf-2022/7-cumplimentacion-irpf/7_1-rendimientos-trabajo-personal/7_1_6-reduccion-obtencion-rendimientos-trabajo.html
    if (RendimentBrut <= 13115) {
        return 5565;
    } else if (RendimentBrut < 16825) {
        return 5565 - (RendimentBrut - 13115) * 1.5;
    }
    return 0;
}

function getReduccióRendimentDiscapacitat(contribuent: Dependent) {
    // https://sede.agenciatributaria.gob.es/Sede/ca_es/ayuda/manuales-videos-folletos/manuales-ayuda-presentacion/irpf-2022/7-cumplimentacion-irpf/7_1-rendimientos-trabajo-personal/7_1_5-rendimiento-neto-trabajo-gastos-deducibles.html
    if (contribuent.assistència) {
        return 7750;
    }
    
    switch (contribuent.discapacitat) {
        case GrauDiscapacitat.Cap:
        case GrauDiscapacitat.Menor33:
            return 0;
        case GrauDiscapacitat.De33A65:
            return 3500;
        case GrauDiscapacitat.Major65:
            return 7750;
    }
}

function getMínimPersonal(
    dades: DadesComunitatAutònoma,
    contribuent: Dependent,
    descendentsExclusiva: boolean,
    descendents: Dependent[],
    ascendents: Dependent[]
): number {
    // https://sede.agenciatributaria.gob.es/Sede/ca_es/ayuda/manuales-videos-folletos/manuales-ayuda-presentacion/irpf-2022/8-cumplimentacion-irpf/8_3-adecuacion-impuesto-circunstancias-personales-familiares/8_3_5-minimo-discapacidad.html
    const suma = (total: number, valor: number) => { return total + valor; };

    const sumaDiscapacitat = (dependents: Dependent[]) => {
        return dependents.map((value: Dependent, index: number, array: Dependent[]) => { return dades.getMínimDiscapacitat(value); }).reduce(suma);
    }

    const mínimPersonal = dades.getMínimContribuent(contribuent.edat);
    const mínimDiscapacitat = dades.getMínimDiscapacitat(contribuent) + sumaDiscapacitat(descendents) + sumaDiscapacitat(ascendents);
    const mínimDescendents = descendents.map((descendent, index) => dades.getMínimDescendent(descendentsExclusiva, descendent.edat, descendent.discapacitat, index)).reduce(suma);
    const mínimAscendents = ascendents.map((ascendent) => dades.getMínimAscendent(ascendent.edat, ascendent.discapacitat)).reduce(suma);

    return mínimPersonal + mínimDiscapacitat + mínimDescendents + mínimAscendents;
}

function getDespesesDeduïbles(
    rendimentDelTreball: number,
    cotitzacióSSAnual: number,
    contribuent: Dependent,
    movilitatGeogràfica: boolean,
): number {
    // https://sede.agenciatributaria.gob.es/Sede/ca_es/ayuda/manuales-videos-folletos/manuales-ayuda-presentacion/irpf-2022/7-cumplimentacion-irpf/7_1-rendimientos-trabajo-personal/7_1_5-rendimiento-neto-trabajo-gastos-deducibles.html
    const ReduccióRendimentMovilitatGeogràfica = movilitatGeogràfica ? 2000 : 0;
    return 2000
        + cotitzacióSSAnual
        + getReduccióRendimentTreball(rendimentDelTreball)
        + ReduccióRendimentMovilitatGeogràfica
        + getReduccióRendimentDiscapacitat(contribuent);
}

export function calculateIrpf({
    salariBrut,
    categoriaProfessional,
    comunitatAutònoma,
    movilitatGeogràfica,
    contribuent,
    descendentsExclusiva,
    descendents,
    ascendents,
}: IrpfParameters): IrpfResult {
    const dades = getDadesComunitatAutònoma(comunitatAutònoma);

    const salariBrutMensual = salariBrut / 12;

    // Seguretat Social
    const [minCotitzacióSS, maxCotitzacióSS] = límitsCotitzacióPerCategoriaProfessional(categoriaProfessional);
    const CotitzacióSSMensual = Math.min(Math.max(salariBrutMensual, minCotitzacióSS), maxCotitzacióSS) * PercentatgeCotitzacióSS;
    const CotitzacióSSAnual = CotitzacióSSMensual * 12;
    const RendimentDelTreball = salariBrut - CotitzacióSSAnual;

    const DespesesDeduïbles = getDespesesDeduïbles(RendimentDelTreball, CotitzacióSSAnual, contribuent, movilitatGeogràfica);
    
    const RendimentNetDelTreball = Math.max(RendimentDelTreball - DespesesDeduïbles, 0);
    const BaseImposable = RendimentNetDelTreball; // + rendiment net de l'estalvi
    const MínimPersonal = getMínimPersonal(dades, contribuent, descendentsExclusiva, descendents, ascendents);



    return { valid: true, quotaSS: CotitzacióSSAnual, tipusRetenció: 0.0, salariNet: 0.0 };
}
