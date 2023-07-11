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
    getGravamen(baseLiquidable: number): number;
}

interface Tram {
    mínim: number;
    màxim: number;
    tipus: number;
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

    protected getTrams(): Tram[] {
        // https://sede.agenciatributaria.gob.es/Sede/ca_es/ayuda/manuales-videos-folletos/manuales-ayuda-presentacion/irpf-2022/8-cumplimentacion-irpf/8_4-cuota-integra/8_4_3-gravamen-base-liquidable-general/8_4_3_1-cuota-integra-estatal.html
        return [
            {mínim: 0,          màxim: 12450.00,    tipus: 9.50},
            {mínim: 12450.00,   màxim: 20200.00,    tipus: 12.00},
            {mínim: 20200.00,   màxim: 35200.00,    tipus: 15.00},
            {mínim: 35200.00,   màxim: 60000.00,    tipus: 18.50},
            {mínim: 60000.00,   màxim: 300000.00,   tipus: 22.50},
            {mínim: 300000.00,  màxim: Infinity,    tipus: 24.50}
        ];
    }

    // Public methods

    getMínimContribuent(edat: number): number {
        // https://sede.agenciatributaria.gob.es/Sede/ca_es/ayuda/manuales-videos-folletos/manuales-ayuda-presentacion/irpf-2022/8-cumplimentacion-irpf/8_3-adecuacion-impuesto-circunstancias-personales-familiares/8_3_2-minimo-contribuyente.html
        const dadesMínimContribuent = this.getDadesMínimContribuent();
        return edat >= 75 ? dadesMínimContribuent.major75 : (edat >= 65 ? dadesMínimContribuent.major65 : dadesMínimContribuent.base);
    }

    getMínimDescendent(exclusiva: boolean, edat: number, discapacitat: GrauDiscapacitat, index: number): number {
        // https://sede.agenciatributaria.gob.es/Sede/ca_es/ayuda/manuales-videos-folletos/manuales-ayuda-presentacion/irpf-2022/8-cumplimentacion-irpf/8_3-adecuacion-impuesto-circunstancias-personales-familiares/8_3_3-minimo-descendiente.html
        if (edat >= 25 && discapacitat === GrauDiscapacitat.Cap) {
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
        if (edat >= 65 || discapacitat !== GrauDiscapacitat.Cap) {
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

    getGravamen(baseLiquidable: number): number {
        const trams = this.getTrams();

        let quota: number = 0;
        for (const tram of trams) {
            if (baseLiquidable >= tram.mínim) {
                quota += (Math.min(baseLiquidable, tram.màxim) - tram.mínim) * (tram.tipus / 100.);
            } else {
                break;
            }
        }
        return quota;
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

    protected getTrams() {
        return [
            {mínim: 0, màxim: 12450.00, tipus: 9.50},
            {mínim: 12450.00, màxim: 20200.00, tipus: 12.00},
            {mínim: 20200.00, màxim: 35200.00, tipus: 15.00},
            {mínim: 35200.00, màxim: 60000.00, tipus: 18.00},
            {mínim: 60000.00, màxim: Infinity, tipus: 22.50}
        ];
    }
}

class DadesAragó extends DadesEspanya {
    protected getTrams() {
        return [
            {mínim: 0, màxim: 12450.00, tipus: 10.00},
            {mínim: 12450.00, màxim: 20200.00, tipus: 12.50},
            {mínim: 20200.00, màxim: 34000.00, tipus: 15.50},
            {mínim: 34000.00, màxim: 50000.00, tipus: 19.00},
            {mínim: 50000.00, màxim: 60000.00, tipus: 21.00},
            {mínim: 60000.00, màxim: 70000.00, tipus: 22.00},
            {mínim: 70000.00, màxim: 90000.00, tipus: 22.50},
            {mínim: 90000.00, màxim: 130000.00, tipus: 23.50},
            {mínim: 130000.00, màxim: 150000.00, tipus: 24.50},
            {mínim: 150000.00, màxim: Infinity, tipus: 25.00}
        ];
    }
}

class DadesAstúries extends DadesEspanya {
    protected getTrams() {
        return [
            {mínim: 0, màxim: 12450.00, tipus: 10.00},
            {mínim: 12450.00, màxim: 17707.20, tipus: 12.00},
            {mínim: 17707.20, màxim: 33007.20, tipus: 14.00},
            {mínim: 33007.20, màxim: 53407.20, tipus: 18.50},
            {mínim: 53407.20, màxim: 70000.00, tipus: 21.50},
            {mínim: 70000.00, màxim: 90000.00, tipus: 22.50},
            {mínim: 90000.00, màxim: 175000.00, tipus: 25.00},
            {mínim: 175000.00, màxim: Infinity, tipus: 25.50}
        ];
    }
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

    protected getTrams() {
        return [
            {mínim: 0, màxim: 10000.00, tipus: 9.50},
            {mínim: 10000.00, màxim: 18000.00, tipus: 11.75},
            {mínim: 18000.00, màxim: 30000.00, tipus: 14.75},
            {mínim: 30000.00, màxim: 48000.00, tipus: 17.75},
            {mínim: 48000.00, màxim: 70000.00, tipus: 19.25},
            {mínim: 70000.00, màxim: 90000.00, tipus: 22.00},
            {mínim: 90000.00, màxim: 120000.00, tipus: 23.00},
            {mínim: 120000.00, màxim: 175000.00, tipus: 24.00},
            {mínim: 175000.00, màxim: Infinity, tipus: 25.00}
        ];
    }
}

class DadesCanaries extends DadesEspanya {
    protected getTrams() {
        return [
            {mínim: 0, màxim: 12450.01, tipus: 9.00},
            {mínim: 12450.01, màxim: 17707.21, tipus: 11.50},
            {mínim: 17707.21, màxim: 33007.21, tipus: 14.00},
            {mínim: 33007.21, màxim: 53407.21, tipus: 18.50},
            {mínim: 53407.21, màxim: 90000.01, tipus: 23.50},
            {mínim: 90000.01, màxim: 120000.00, tipus: 25.00},
            {mínim: 120000.01, màxim: Infinity, tipus: 26.00}
        ];
    }
}

class DadesCantàbria extends DadesEspanya {
    protected getTrams() {
        return [
            {mínim: 0, màxim: 12450.00, tipus: 9.50},
            {mínim: 12450.00, màxim: 20200.00, tipus: 12.00},
            {mínim: 20200.00, màxim: 34000.00, tipus: 15.00},
            {mínim: 34000.00, màxim: 46000.00, tipus: 18.50},
            {mínim: 46000.00, màxim: 60000.00, tipus: 19.50},
            {mínim: 60000.00, màxim: 90000.00, tipus: 24.50},
            {mínim: 90000.00, màxim: Infinity, tipus: 25.50}
        ];
    }
}

class DadesCastellaILleó extends DadesEspanya {
    protected getTrams() {
        return [
            {mínim: 0, màxim: 12450.00, tipus: 9.50},
            {mínim: 12450.00, màxim: 20200.00, tipus: 12.00},
            {mínim: 20200.00, màxim: 35200.00, tipus: 14.00},
            {mínim: 35200.00, màxim: 53407.20, tipus: 18.50},
            {mínim: 53407.20, màxim: Infinity, tipus: 21.50}
        ];
    }
}

class DadesCastellaLaManxa extends DadesEspanya {
    protected getTrams() {
        return [
            {mínim: 0, màxim: 12450.00, tipus: 9.50},
            {mínim: 12450.00, màxim: 20200.00, tipus: 12.00},
            {mínim: 20200.00, màxim: 35200.00, tipus: 15.00},
            {mínim: 35200.00, màxim: 60000.00, tipus: 18.50},
            {mínim: 60000.00, màxim: Infinity, tipus: 22.50}
        ];
    }
}

class DadesCatalunya extends DadesEspanya {
    protected getTrams() {
        return [
            {mínim: 0, màxim: 12450.00, tipus: 10.50},
            {mínim: 12450.00, màxim: 17707.20, tipus: 12.00},
            {mínim: 17707.20, màxim: 21000.00, tipus: 14.00},
            {mínim: 21000.00, màxim: 33007.20, tipus: 15.00},
            {mínim: 33007.20, màxim: 53407.20, tipus: 18.80},
            {mínim: 53407.20, màxim: 90000.00, tipus: 21.50},
            {mínim: 90000.00, màxim: 120000.00, tipus: 23.50},
            {mínim: 120000.00, màxim: 175000.00, tipus: 24.50},
            {mínim: 175000.00, màxim: Infinity, tipus: 25.50}
        ];
    }
}

class DadesExtremadura extends DadesEspanya {
    protected getTrams() {
        return [
            {mínim: 0, màxim: 12450.00, tipus: 9.50},
            {mínim: 12450.00, màxim: 20200.00, tipus: 12.50},
            {mínim: 20200.00, màxim: 24200.00, tipus: 15.50},
            {mínim: 24200.00, màxim: 35200.00, tipus: 16.50},
            {mínim: 35200.00, màxim: 60000.00, tipus: 20.50},
            {mínim: 60000.00, màxim: 80200.00, tipus: 23.50},
            {mínim: 80200.00, màxim: 99200.00, tipus: 24.00},
            {mínim: 99200.00, màxim: 120200.00, tipus: 24.50},
            {mínim: 120200.00, màxim: Infinity, tipus: 25.00}
        ];
    }
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

    protected getTrams() {
        return [
            {mínim: 0, màxim: 12450.00, tipus: 9.40},
            {mínim: 12450.00, màxim: 20200.00, tipus: 11.65},
            {mínim: 20200.00, màxim: 35200.00, tipus: 14.90},
            {mínim: 35200.00, màxim: 60000.00, tipus: 18.40},
            {mínim: 60000.00, màxim: Infinity, tipus: 22.50}
        ];
    }
}

class DadesLaRioja extends DadesEspanya {
    protected getDadesMínimDiscapacitat() {
        return {major33: 3300, major65: 9900, assistència: 3000};
    }
    protected getTrams() {
        return [
            {mínim: 0, màxim: 12450.00, tipus: 9.00},
            {mínim: 12450.00, màxim: 20200.00, tipus: 11.60},
            {mínim: 20200.00, màxim: 35200.00, tipus: 14.60},
            {mínim: 35200.00, màxim: 50000.00, tipus: 18.80},
            {mínim: 50000.00, màxim: 60000.00, tipus: 19.50},
            {mínim: 60000.00, màxim: 120000.00, tipus: 25.00},
            {mínim: 120000.00, màxim: Infinity, tipus: 27.00}
        ];
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
    protected getTrams() {
        return [
            {mínim: 0, màxim: 12450.00, tipus: 8.50},
            {mínim: 12450.00, màxim: 17707.20, tipus: 10.70},
            {mínim: 17707.20, màxim: 33007.20, tipus: 12.80},
            {mínim: 33007.20, màxim: 53407.20, tipus: 17.40},
            {mínim: 53407.20, màxim: Infinity, tipus: 20.50}
        ];
    }
}

class DadesMúrcia extends DadesEspanya {
    protected getTrams() {
        return [
            {mínim: 0, màxim: 12450.00, tipus: 9.60},
            {mínim: 12450.00, màxim: 20200.00, tipus: 11.46},
            {mínim: 20200.00, màxim: 34000.00, tipus: 13.74},
            {mínim: 34000.00, màxim: 60000.00, tipus: 18.22},
            {mínim: 60000.00, màxim: Infinity, tipus: 22.70}
        ];
    }
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

    protected getTrams() {
        return [
            {mínim: 0, màxim: 12450.00, tipus: 10.00},
            {mínim: 12450.00, màxim: 17000.00, tipus: 11.00},
            {mínim: 17000.00, màxim: 30000.00, tipus: 13.90},
            {mínim: 30000.00, màxim: 50000.00, tipus: 18.00},
            {mínim: 50000.00, màxim: 65000.00, tipus: 23.50},
            {mínim: 65000.00, màxim: 80000.00, tipus: 24.50},
            {mínim: 80000.00, màxim: 120000.00, tipus: 25.00},
            {mínim: 120000.00, màxim: 140000.00, tipus: 25.50},
            {mínim: 140000.00, màxim: 175000.00, tipus: 27.50},
            {mínim: 175000.00, màxim: Infinity, tipus: 29.50}
        ];
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
