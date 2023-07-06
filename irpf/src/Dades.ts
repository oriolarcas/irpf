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
    CapOMenor33,
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
    getMínimDescendent(exclusiva: boolean, edat: number, index: number): number;
    getMínimAscendent(edat: number): number;
    getMínimDiscapacitat(dependent: Dependent): number;
}

class DadesEspanya implements DadesComunitatAutònoma {
    
    // Protected methods overriden by the subclasses

    protected getDadesMínimContribuent(): {base: number, major65: number, major75: number} {
        return {base: 5550, major65: 6700, major75: 8100};
    }

    // Public methods

    getMínimContribuent(edat: number): number {
        const dadesMínimContribuent = this.getDadesMínimContribuent();
        return edat >= 75 ? dadesMínimContribuent.base : (edat >= 65 ? dadesMínimContribuent.major65 : dadesMínimContribuent.major75);
    }

    getMínimDescendent(exclusiva: boolean, edat: number, index: number): number {
        if (edat >= 25) {
            return 0;
        }
        const coeficient = exclusiva ? 1 : 0.5;
        switch (index) {
            case 0:
                return (edat < 3 ? 2800 : 2400) * coeficient;
            case 1:
                return 2700 * coeficient;
            case 2:
                return 4000 * coeficient;
            default:
                return 4500 * coeficient;
        }
    }

    getMínimAscendent(edat: number): number {
        if (edat >= 75) {
            return 2250;
        }
        if (edat >= 65) {
            return 1150;
        }
        return 0;
    }

    getMínimDiscapacitat(dependent: Dependent): number {
        switch (dependent.discapacitat) {
            case GrauDiscapacitat.CapOMenor33:
                return 0;
            case GrauDiscapacitat.De33A65:
                return 3000 + (dependent.assistència ? 3000 : 0);
            case GrauDiscapacitat.Major65:
                return 12000;
        }
    }
}

class DadesAndalusia extends DadesEspanya {
    protected getDadesMínimContribuent() {
        return {base: 5790, major65: 6990, major75: 8450};
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
}

class DadesLaRioja extends DadesEspanya {

}

class DadesMadrid extends DadesEspanya {
    protected getDadesMínimContribuent() {
        return {base: 5777.55, major65: 6974.70, major75: 8432.10};
    }
}

class DadesMúrcia extends DadesEspanya {

}

class DadesPaísValencià extends DadesEspanya {
    protected getDadesMínimContribuent() {
        return {base: 6105, major65: 7370, major75: 8910};
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
