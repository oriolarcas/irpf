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
    ComunitatValenciana,
    Extremadura,
    Galícia,
    LaRioja,
    Madrid,
    Múrcia,
}

interface IrpfResult {
    valid: boolean;
    quotaSS: number;
    tipusRetenció: number;
    salariNet: number;
}

export function calculateIrpf(
    salariBrut: number,
    edat: number,
    categoriaProfessional: CategoriaProfessional,
    comunitatAutònoma: ComunitatAutònoma,
    movilitatGeogràfica: boolean,
): IrpfResult {
    return {valid: true, quotaSS: 0.0, tipusRetenció: 0.0, salariNet: 0.0};
}