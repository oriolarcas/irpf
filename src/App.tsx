import Sidebar from './Sidebar'
import { Sankey, SankeyData } from './Sankey';
import { IrpfParameters, calculateIrpf } from './Irpf';

import React from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

enum IrpfNodes {
    RendimentsDelTreball,
    DeduccióRendimentsTreball,
    DeduccióCotitzacióSS,
    DeduccióMovilitatGeogràfica,
    DeduccióDiscapacitatContribuent,
    DespesesDeduïbles,
    Deduccions,
    BaseImposable,
    BaseLiquidable,
    QuotaEstatal,
    QuotaEstatalMínimPersonal,
    QuotaAutonòmica,
    QuotaAutonòmicaMínimPersonal,
    Retencions,
    SalariNet,
}

function getIrpfNodeName(node: IrpfNodes): string {
    switch (node) {
        case IrpfNodes.RendimentsDelTreball:
            return "Rendiments del treball";
        case IrpfNodes.DeduccióRendimentsTreball:
            return "Rendiments del treball";
        case IrpfNodes.DeduccióCotitzacióSS:
            return "Cotització a la Seguretat Social";
        case IrpfNodes.DeduccióMovilitatGeogràfica:
            return "Movilitat geogràfica";
        case IrpfNodes.DeduccióDiscapacitatContribuent:
            return "Discapacitat";
        case IrpfNodes.DespesesDeduïbles:
            return "Despeses deduïbles";
        case IrpfNodes.Deduccions:
            return "";
        case IrpfNodes.BaseImposable:
            return "Base imposable";
        case IrpfNodes.BaseLiquidable:
            return "Base liquidable";
        case IrpfNodes.QuotaEstatal:
            return "Quota estatal";
        case IrpfNodes.QuotaEstatalMínimPersonal:
            return "Quota estatal del mínim personal";
        case IrpfNodes.QuotaAutonòmica:
            return "Quota autonòmica";
        case IrpfNodes.QuotaAutonòmicaMínimPersonal:
            return "Quota autonòmica del mínim personal";
        case IrpfNodes.Retencions:
            return "Retencions";
        case IrpfNodes.SalariNet:
            return "Salari net";
    }
}

class App extends React.Component {
    state: { data: SankeyData } = {
        data: {
        nodes: [],
        links: [],
    }};

    inputEvent = (params: IrpfParameters) => {
        console.log(params);

        const irpf = calculateIrpf(params);
        console.log(irpf);

        let links = new Array<{source: IrpfNodes, target: IrpfNodes, value: number}>();

        links.push({
            source: IrpfNodes.RendimentsDelTreball,
            target: IrpfNodes.BaseImposable,
            value: irpf.baseImposable,
        });

        const SumaDespesesDeduïbles = Object.values(irpf.despesesDeduïbles).reduce((sum, value) => (sum + value));

        links.push({
            source: IrpfNodes.RendimentsDelTreball,
            target: IrpfNodes.DespesesDeduïbles,
            value: SumaDespesesDeduïbles,
        });

        links.push({
            source: IrpfNodes.DespesesDeduïbles,
            target: IrpfNodes.DeduccióRendimentsTreball,
            value: irpf.despesesDeduïbles.rendimentsDelTreball,
        });

        links.push({
            source: IrpfNodes.DespesesDeduïbles,
            target: IrpfNodes.DeduccióCotitzacióSS,
            value: irpf.despesesDeduïbles.cotitzacióSS,
        });

        links.push({
            source: IrpfNodes.DeduccióRendimentsTreball,
            target: IrpfNodes.Deduccions,
            value: irpf.despesesDeduïbles.rendimentsDelTreball,
        });

        if (irpf.despesesDeduïbles.movilitatGeogràfica) {
            links.push({
                source: IrpfNodes.DespesesDeduïbles,
                target: IrpfNodes.DeduccióMovilitatGeogràfica,
                value: irpf.despesesDeduïbles.movilitatGeogràfica,
            });

            links.push({
                source: IrpfNodes.DeduccióMovilitatGeogràfica,
                target: IrpfNodes.Deduccions,
                value: irpf.despesesDeduïbles.movilitatGeogràfica,
            });
        }

        if (irpf.despesesDeduïbles.discapacitatContribuent) {
            links.push({
                source: IrpfNodes.DespesesDeduïbles,
                target: IrpfNodes.DeduccióDiscapacitatContribuent,
                value: irpf.despesesDeduïbles.discapacitatContribuent,
            });

            links.push({
                source: IrpfNodes.DeduccióDiscapacitatContribuent,
                target: IrpfNodes.Deduccions,
                value: irpf.despesesDeduïbles.discapacitatContribuent,
            });
        }

        const QuotaEstatalÍntegra = irpf.quotaEstatal - irpf.mínimPersonalEstatal;
        const QuotaAutonòmicaÍntegra = irpf.quotaAutonòmica - irpf.mínimPersonalAutonòmic;
        const Retencions = QuotaEstatalÍntegra + QuotaAutonòmicaÍntegra;
        const BaseLiquidableNeta = irpf.baseLiquidable - Retencions;

        links.push({
            source: IrpfNodes.Deduccions,
            target: IrpfNodes.SalariNet,
            value: Math.min(SumaDespesesDeduïbles - irpf.despesesDeduïbles.cotitzacióSS, irpf.salariNet - BaseLiquidableNeta),
        });

        links.push({
            source: IrpfNodes.BaseImposable,
            target: IrpfNodes.BaseLiquidable,
            value: irpf.baseLiquidable,
        });

        links.push({
            source: IrpfNodes.BaseLiquidable,
            target: IrpfNodes.SalariNet,
            value: BaseLiquidableNeta,
        });

        links.push({
            source: IrpfNodes.BaseLiquidable,
            target: IrpfNodes.QuotaEstatal,
            value: QuotaEstatalÍntegra,
        });

        links.push({
            source: IrpfNodes.BaseLiquidable,
            target: IrpfNodes.QuotaAutonòmica,
            value: QuotaAutonòmicaÍntegra,
        });

        links.push({
            source: IrpfNodes.QuotaEstatal,
            target: IrpfNodes.Retencions,
            value: QuotaEstatalÍntegra,
        });

        links.push({
            source: IrpfNodes.QuotaAutonòmica,
            target: IrpfNodes.Retencions,
            value: QuotaAutonòmicaÍntegra,
        });

        links.push({
            source: IrpfNodes.QuotaEstatal,
            target: IrpfNodes.QuotaEstatalMínimPersonal,
            value: irpf.mínimPersonalEstatal,
        });

        links.push({
            source: IrpfNodes.QuotaAutonòmica,
            target: IrpfNodes.QuotaAutonòmicaMínimPersonal,
            value: irpf.mínimPersonalAutonòmic,
        });

        // Generate final data object

        let nodeSet = new Set<IrpfNodes>();

        for (const link of links) {
            nodeSet.add(link.source);
            nodeSet.add(link.target);
        }

        const nodeList = Array.from(nodeSet);
        let nodeMap = new Map<IrpfNodes, number>();

        nodeList.forEach((node, index) => {
            nodeMap.set(node, index);
        });

        let data: SankeyData = {
            nodes: nodeList.map((node) => ({
                name: getIrpfNodeName(node)
            })),
            links: links.map((link) => ({
                source: nodeMap.get(link.source) ?? 0,
                target: nodeMap.get(link.target) ?? 0,
                value: link.value,
            })),
        };

        this.setState({data});
    };

    renderSankey(): JSX.Element | null {
        if (this.state.data.nodes.length > 0) {
            return (
                <Sankey width={600} height={600} data={this.state.data} />
            );
        }
        return null;
    }

  render() {
        return (
        <Container fluid className='h-100'>
            <Row className='h-100'>
            <Sidebar onInput={this.inputEvent} />

            <Col fluid className="p-5">
                { this.renderSankey() }
            </Col>
            </Row>
        </Container>
        );
    }
}

export default App;
