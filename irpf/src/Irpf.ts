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

export enum ComunitatAutònoma {
    Espanya,
    Andalusia,
    Aragó,
    Astúries,
    Balears,
    Canaries,
    Cantàbria,
    CastellaILleó,
    CastellaLaManxa,
    Catalunya,
    PaísValencià,
    Extremadura,
    Galícia,
    LaRioja,
    Madrid,
    Múrcia,
}

export interface IrpfParameters {
    salariBrut: number;
    edat: number;
    categoriaProfessional: CategoriaProfessional;
    comunitatAutònoma: ComunitatAutònoma;
    movilitatGeogràfica: boolean;
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

export function calculateIrpf({
    salariBrut,
    edat,
    categoriaProfessional,
    comunitatAutònoma,
    movilitatGeogràfica,
}: IrpfParameters): IrpfResult {
    const salariBrutMensual = salariBrut / 12;

    const [minCotitzacióSS, maxCotitzacióSS] = límitsCotitzacióPerCategoriaProfessional(categoriaProfessional);
    const CotitzacióSSMensual = Math.min(Math.max(salariBrutMensual, minCotitzacióSS), maxCotitzacióSS) * PercentatgeCotitzacióSS;
    const CotitzacióSSAnual = CotitzacióSSMensual * 12;

    return { valid: true, quotaSS: CotitzacióSSAnual, tipusRetenció: 0.0, salariNet: 0.0 };
}