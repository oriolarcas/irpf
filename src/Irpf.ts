import { ComunitatAutònoma, getDadesComunitatAutònoma, Dependent, GrauDiscapacitat, DadesComunitatAutònoma } from "./Dades";
import { formatCurrency } from "./Currency";

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

type DespesesDeduïbles = {
    rendimentsDelTreball: number;
    cotitzacióSS: number;
    discapacitatContribuent?: number;
    movilitatGeogràfica?: number;
};

export interface IrpfResult {
    valid: boolean;
    salariBrut: number;
    despesesDeduïbles: DespesesDeduïbles,
    baseImposable: number;
    baseLiquidable: number;
    mínimPersonalEstatal: number;
    mínimPersonalAutonòmic: number;
    quotaEstatal: number;
    quotaAutonòmica: number;
    // Resultat
    tipusRetenció: number;
    salariNet: number;
}

export const SmiAnual = 15120;

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
        return dependents.map((value: Dependent, index: number, array: Dependent[]) => { return dades.getMínimDiscapacitat(value); }).reduce(suma, 0);
    }

    const mínimPersonal = dades.getMínimContribuent(contribuent.edat);
    const mínimDiscapacitat = dades.getMínimDiscapacitat(contribuent) + sumaDiscapacitat(descendents) + sumaDiscapacitat(ascendents);
    const mínimDescendents = descendents.map((descendent, index) => dades.getMínimDescendent(descendentsExclusiva, descendent.edat, descendent.discapacitat, index)).reduce(suma, 0);
    const mínimAscendents = ascendents.map((ascendent) => dades.getMínimAscendent(ascendent.edat, ascendent.discapacitat)).reduce(suma, 0);

    return mínimPersonal + mínimDiscapacitat + mínimDescendents + mínimAscendents;
}

function getDespesesDeduïbles(
    rendimentDelTreball: number,
    cotitzacióSSAnual: number,
    contribuent: Dependent,
    movilitatGeogràfica: boolean,
): DespesesDeduïbles {
    // https://sede.agenciatributaria.gob.es/Sede/ca_es/ayuda/manuales-videos-folletos/manuales-ayuda-presentacion/irpf-2022/7-cumplimentacion-irpf/7_1-rendimientos-trabajo-personal/7_1_5-rendimiento-neto-trabajo-gastos-deducibles.html
    const ReduccióRendimentMovilitatGeogràfica = movilitatGeogràfica ? 2000 : 0;
    return {rendimentsDelTreball: 2000 + getReduccióRendimentTreball(rendimentDelTreball),
        cotitzacióSS: cotitzacióSSAnual,
        movilitatGeogràfica: ReduccióRendimentMovilitatGeogràfica,
        discapacitatContribuent: getReduccióRendimentDiscapacitat(contribuent),
    };
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
    const dadesEstatals = getDadesComunitatAutònoma(ComunitatAutònoma.Espanya);
    const dadesAutonòmiques = getDadesComunitatAutònoma(comunitatAutònoma);

    console.log("Salari brut: " + formatCurrency(salariBrut));

    const RendimentDelTreball = salariBrut; // + altres rendiments del treball personal
    console.log("Rendiments del treball: " + formatCurrency(RendimentDelTreball));

    const salariBrutMensual = salariBrut / 12;

    // Seguretat Social
    const [minCotitzacióSS, maxCotitzacióSS] = límitsCotitzacióPerCategoriaProfessional(categoriaProfessional);
    const CotitzacióSSMensual = Math.min(Math.max(salariBrutMensual, minCotitzacióSS), maxCotitzacióSS) * PercentatgeCotitzacióSS;
    const CotitzacióSSAnual = CotitzacióSSMensual * 12;

    const DespesesDeduïbles = getDespesesDeduïbles(RendimentDelTreball, CotitzacióSSAnual, contribuent, movilitatGeogràfica);
    const SumaDespesesDeduïbles = Object.values(DespesesDeduïbles).reduce((accumulator, value) => accumulator + value);

    const RendimentNetDelTreball = Math.max(RendimentDelTreball - SumaDespesesDeduïbles, 0);
    const BaseImposable = RendimentNetDelTreball; // + rendiment net de l'estalvi
    const BaseLiquidable = BaseImposable; // - reduccions (declaració conjunta, etc.)

    console.log("Base imposable: " + formatCurrency(BaseImposable));
    console.log("Base liquidable: " + formatCurrency(BaseLiquidable));

    // Quota íntegra estatal
    // https://sede.agenciatributaria.gob.es/Sede/ca_es/ayuda/manuales-videos-folletos/manuales-ayuda-presentacion/irpf-2022/8-cumplimentacion-irpf/8_4-cuota-integra/8_4_3-gravamen-base-liquidable-general/8_4_3_1-cuota-integra-estatal.html
    const MínimPersonalEstatal = getMínimPersonal(dadesEstatals, contribuent, descendentsExclusiva, descendents, ascendents);
    const QuotaBaseLiquidableEstatal = dadesEstatals.getGravamen(BaseLiquidable);
    const QuotaMínimPersonalEstatal = dadesEstatals.getGravamen(MínimPersonalEstatal);
    const QuotaÍntegraEstatal = Math.max(QuotaBaseLiquidableEstatal - QuotaMínimPersonalEstatal, 0);
    console.log("Mínim personal estatal: " + formatCurrency(MínimPersonalEstatal));
    console.log("Quota estatal de la base liquidable: " + formatCurrency(QuotaBaseLiquidableEstatal));
    console.log("Quota estatal del mínim personal i familiar: " + formatCurrency(QuotaMínimPersonalEstatal));
    console.log("Quota íntegra estatal: " + formatCurrency(QuotaÍntegraEstatal));

    // Quota íntegra autonòmica
    // https://sede.agenciatributaria.gob.es/Sede/ca_es/ayuda/manuales-videos-folletos/manuales-ayuda-presentacion/irpf-2022/8-cumplimentacion-irpf/8_4-cuota-integra/8_4_3-gravamen-base-liquidable-general/8_4_3_2-cuota-integra-autonomica.html
    const MínimPersonalAutonòmic = getMínimPersonal(dadesAutonòmiques, contribuent, descendentsExclusiva, descendents, ascendents);
    const QuotaBaseLiquidableAutonòmica = dadesAutonòmiques.getGravamen(BaseLiquidable);
    const QuotaMínimPersonalAutonòmica = dadesAutonòmiques.getGravamen(MínimPersonalAutonòmic);
    const QuotaÍntegraAutonòmica = Math.max(QuotaBaseLiquidableAutonòmica - QuotaMínimPersonalAutonòmica, 0);
    console.log("Mínim personal autonòmic: " + formatCurrency(MínimPersonalAutonòmic));
    console.log("Quota autonòmica de la base liquidable: " + formatCurrency(QuotaBaseLiquidableAutonòmica));
    console.log("Quota autonòmica del mínim personal i familiar: " + formatCurrency(QuotaMínimPersonalAutonòmica));
    console.log("Quota íntegra autonòmica: " + formatCurrency(QuotaÍntegraAutonòmica));

    const QuotaÍntegra = QuotaÍntegraEstatal + QuotaÍntegraAutonòmica;
    console.log("Quota íntegra: " + formatCurrency(QuotaÍntegra));

    const TipusRetenció = QuotaÍntegra / salariBrut;
    const SalariNet = RendimentDelTreball - CotitzacióSSAnual - QuotaÍntegra;

    console.log("Tipus de retenció: " + formatCurrency(TipusRetenció));
    console.log("Salari net: " + formatCurrency(SalariNet));

    return {
        valid: true,
        salariBrut: salariBrut,
        despesesDeduïbles: DespesesDeduïbles,
        baseImposable: BaseImposable,
        baseLiquidable: BaseLiquidable,
        mínimPersonalEstatal: QuotaMínimPersonalEstatal,
        mínimPersonalAutonòmic: QuotaMínimPersonalAutonòmica,
        quotaEstatal: QuotaBaseLiquidableEstatal,
        quotaAutonòmica: QuotaBaseLiquidableAutonòmica,
        tipusRetenció: TipusRetenció,
        salariNet: SalariNet
    };
}
