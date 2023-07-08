import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";
import chroma from "chroma-js";

import React from 'react';

interface SankeyNodeProps {
    name: string | undefined;
    x0?: number | undefined;
    x1?: number | undefined;
    y0?: number | undefined;
    y1?: number | undefined;
    color: string;
}

const SankeyNode = ({name, x0, x1, y0, y1, color}: SankeyNodeProps): JSX.Element => {
    let width: number | undefined = undefined;
    let height: number | undefined = undefined;
    if (x0 !== undefined && x1 !== undefined) {
        width = x1 - x0;
    }
    if (y0 !== undefined && y1 !== undefined) {
        height = y1 - y0;
    }
    return (
        <rect x={x0} y={y0} width={width} height={height} fill={color}>
            <title>{name}</title>
        </rect>
    );
}

interface SankeyLinkProps {
    link: any;
    color: string | undefined;
}

function SankeyLink({link, color}: SankeyLinkProps) {
    let d = sankeyLinkHorizontal()(link);
    let dd: string | undefined = d == null ? undefined : d;
    return (
        <path
            d={dd}
            style={{
                fill: "none",
                strokeOpacity: ".3",
                stroke: color,
                strokeWidth: Math.max(1, link.width)
            }}
        />
    );
}

interface SankeyProps {
    data: any;
    width: number;
    height: number;
}

class Sankey extends React.Component<SankeyProps> {
    svgRef = React.createRef<SVGSVGElement>();

    render() {
        const { nodes, links } = sankey()
            .nodeWidth(15)
            .nodePadding(10)
            .extent([[1, 1], [this.props.width - 1, this.props.height - 5]])(this.props.data);
        const color = chroma.scale("Set3").classes(nodes.length);
        const colorScale = d3
            .scaleLinear()
            .domain([0, nodes.length])
            .range([0, 1]);

        return (
            <svg width="100%" height="600" ref={this.svgRef}>
                <g style={{ mixBlendMode: "multiply" }}>
                    {nodes.map((node, i) => {
                        console.log(node);
                        let nodeObj: any = node;
                        return (
                        <SankeyNode
                            {...node}
                            color={color(colorScale(i)).hex()}
                            name={nodeObj["name"]}
                        />
                    )})}
                    {links.map((link, i) => {
                        let linkColor: string | undefined = undefined;
                        if (typeof link.source == "object") {
                            if (link.source.index) {
                                linkColor = color(colorScale(link.source.index)).hex();
                            }
                        }
                        return (
                            <SankeyLink
                                link={link}
                                color={linkColor}
                            />
                        );
                    })}
                </g>
            </svg>
        );
    }
}

export default Sankey;
