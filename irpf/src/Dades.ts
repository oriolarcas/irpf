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
    Extremadura,
    Galícia,
    LaRioja,
    Madrid,
    Múrcia,
    PaísValencià,
}

export enum GrauDiscapacitat {
    Cap,
    Menor33,
    De33A65,
    Major65,
}

export interface Dependent {
    edat: number;
    discapacitat: GrauDiscapacitat;
    assistència: boolean;
}

export interface DadesComunitatAutònoma {
    getMínimContribuent(edat: number): number;
    getMínimDescendent(exclusiva: boolean, edat: number, discapacitat: GrauDiscapacitat, index: number): number;
    getMínimAscendent(edat: number, discapacitat: GrauDiscapacitat): number;
    getMínimDiscapacitat(dependent: Dependent): number;
}

class DadesEspanya implements DadesComunitatAutònoma {
    
    // Protected methods overriden by the subclasses

    protected getDadesMínimContribuent(): {base: number, major65: number, major75: number} {
        return {base: 5550, major65: 6700, major75: 8100};
    }

    protected getDadesMínimDescendent(): {menor3: number, descendents: number[]} {
        return {menor3: 2800, descendents: [2400, 2700, 4000, 4500]};
    }

    protected getDadesMínimAscendent(): {major65: number, major75: number} {
        return {major65: 1150, major75: 2550};
    }

    protected getDadesMínimDiscapacitat(): {major33: number, major65: number, assistència: number} {
        return {major33: 3000, major65: 9000, assistència: 3000};
    }

    // Public methods

    getMínimContribuent(edat: number): number {
        // https://sede.agenciatributaria.gob.es/Sede/ca_es/ayuda/manuales-videos-folletos/manuales-ayuda-presentacion/irpf-2022/8-cumplimentacion-irpf/8_3-adecuacion-impuesto-circunstancias-personales-familiares/8_3_2-minimo-contribuyente.html
        const dadesMínimContribuent = this.getDadesMínimContribuent();
        return edat >= 75 ? dadesMínimContribuent.base : (edat >= 65 ? dadesMínimContribuent.major65 : dadesMínimContribuent.major75);
    }

    getMínimDescendent(exclusiva: boolean, edat: number, discapacitat: GrauDiscapacitat, index: number): number {
        // https://sede.agenciatributaria.gob.es/Sede/ca_es/ayuda/manuales-videos-folletos/manuales-ayuda-presentacion/irpf-2022/8-cumplimentacion-irpf/8_3-adecuacion-impuesto-circunstancias-personales-familiares/8_3_3-minimo-descendiente.html
        if (edat >= 25 && discapacitat == GrauDiscapacitat.Cap) {
            return 0;
        }
        const coeficient = exclusiva ? 1 : 0.5;
        const dadesMínimDescendent = this.getDadesMínimDescendent();
        const mínimDescendent = dadesMínimDescendent.descendents[Math.min(index, dadesMínimDescendent.descendents.length - 1)];
        const mínimMenor3 = (edat < 3 ? dadesMínimDescendent.menor3 : 0);
        return (mínimDescendent + mínimMenor3) * coeficient;
    }

    getMínimAscendent(edat: number, discapacitat: GrauDiscapacitat): number {
        // https://sede.agenciatributaria.gob.es/Sede/ca_es/ayuda/manuales-videos-folletos/manuales-ayuda-presentacion/irpf-2022/8-cumplimentacion-irpf/8_3-adecuacion-impuesto-circunstancias-personales-familiares/8_3_4-minimo-ascendiente.html
        const dadesMínimAscendent = this.getDadesMínimAscendent();
        if (edat >= 75) {
            return dadesMínimAscendent.major75;
        }
        if (edat >= 65 || discapacitat != GrauDiscapacitat.Cap) {
            return dadesMínimAscendent.major65;
        }
        return 0;
    }

    getMínimDiscapacitat(dependent: Dependent): number {
        // https://sede.agenciatributaria.gob.es/Sede/ca_es/ayuda/manuales-videos-folletos/manuales-ayuda-presentacion/irpf-2022/8-cumplimentacion-irpf/8_3-adecuacion-impuesto-circunstancias-personales-familiares/8_3_5-minimo-discapacidad.html
        const dadesMínimDiscapacitat = this.getDadesMínimDiscapacitat();
        switch (dependent.discapacitat) {
            case GrauDiscapacitat.Cap:
            case GrauDiscapacitat.Menor33:
                return 0;
            case GrauDiscapacitat.De33A65:
                return dadesMínimDiscapacitat.major33 + (dependent.assistència ? dadesMínimDiscapacitat.assistència : 0);
            case GrauDiscapacitat.Major65:
                return dadesMínimDiscapacitat.major65 + (dependent.assistència ? dadesMínimDiscapacitat.assistència : 0);
        }
    }
}

class DadesAndalusia extends DadesEspanya {
    protected getDadesMínimContribuent() {
        return {base: 5790, major65: 6990, major75: 8450};
    }

    protected getDadesMínimDescendent() {
        return {menor3: 2920, descendents: [2510, 2820, 4170, 4700]};
    }

    protected getDadesMínimDiscapacitat() {
        return {major33: 3130, major65: 9390, assistència: 3130};
    }
}

class DadesAragó extends DadesEspanya {

}

class DadesAstúries extends DadesEspanya {

}

class DadesBalears extends DadesEspanya {
    protected getDadesMínimContribuent() {
        return {base: super.getDadesMínimContribuent().base, major65: 7370, major75: 8450};
    }

    protected getDadesMínimDescendent() {
        let estatal = super.getDadesMínimDescendent();
        estatal.descendents[2] = 4400;
        estatal.descendents[3] = 4950;
        return estatal;
    }

    protected getDadesMínimDiscapacitat() {
        return {major33: 3300, major65: 9900, assistència: 3300};
    }
}

class DadesCanaries extends DadesEspanya {

}

class DadesCantàbria extends DadesEspanya {

}

class DadesCastellaILleó extends DadesEspanya {

}

class DadesCastellaLaManxa extends DadesEspanya {

}

class DadesCatalunya extends DadesEspanya {

}

class DadesExtremadura extends DadesEspanya {

}

class DadesGalícia extends DadesEspanya {
    protected getDadesMínimContribuent() {
        return {base: 5789, major65: 6988, major75: 8448};
    }

    protected getDadesMínimDescendent() {
        return {menor3: 2920, descendents: [2503, 2816, 4172, 4694]};
    }

    protected getDadesMínimDiscapacitat() {
        return {major33: 3129, major65: 9387, assistència: 3129};
    }
}

class DadesLaRioja extends DadesEspanya {
    protected getDadesMínimDiscapacitat() {
        return {major33: 3300, major65: 9900, assistència: 3000};
    }
}

class DadesMadrid extends DadesEspanya {
    protected getDadesMínimContribuent() {
        return {base: 5777.55, major65: 6974.70, major75: 8432.10};
    }

    protected getDadesMínimDescendent() {
        return {menor3: 2914.80, descendents: [2498.40, 2810.70, 4400, 4950]};
    }

    protected getDadesMínimDiscapacitat() {
        return {major33: 3123, major65: 9369, assistència: 3123};
    }
}

class DadesMúrcia extends DadesEspanya {

}

class DadesPaísValencià extends DadesEspanya {
    protected getDadesMínimContribuent() {
        return {base: 6105, major65: 7370, major75: 8910};
    }

    protected getDadesMínimDescendent() {
        return {menor3: 3080, descendents: [2640, 2970, 4400, 4950]};
    }

    protected getDadesMínimDiscapacitat() {
        return {major33: 3300, major65: 9900, assistència: 3300};
    }
}

export function getDadesComunitatAutònoma(comunitatAutònoma: ComunitatAutònoma): DadesComunitatAutònoma {
    switch (comunitatAutònoma) {
        case ComunitatAutònoma.Espanya:
            return new DadesEspanya();
        case ComunitatAutònoma.Andalusia:
            return new DadesAndalusia();
        case ComunitatAutònoma.Aragó:
            return new DadesAragó();
        case ComunitatAutònoma.Astúries:
            return new DadesAstúries();
        case ComunitatAutònoma.Balears:
            return new DadesBalears();
        case ComunitatAutònoma.Canaries:
            return new DadesCanaries();
        case ComunitatAutònoma.Cantàbria:
            return new DadesCantàbria();
        case ComunitatAutònoma.CastellaILleó:
            return new DadesCastellaILleó();
        case ComunitatAutònoma.CastellaLaManxa:
            return new DadesCastellaLaManxa();
        case ComunitatAutònoma.Catalunya:
            return new DadesCatalunya();
        case ComunitatAutònoma.Extremadura:
            return new DadesExtremadura();
        case ComunitatAutònoma.Galícia:
            return new DadesGalícia();
        case ComunitatAutònoma.LaRioja:
            return new DadesLaRioja();
        case ComunitatAutònoma.Madrid:
            return new DadesMadrid();
        case ComunitatAutònoma.Múrcia:
            return new DadesMúrcia();
        case ComunitatAutònoma.PaísValencià:
            return new DadesPaísValencià();
    }
}
