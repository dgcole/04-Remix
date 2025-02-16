import {Component, createRef} from "preact";
import * as d3 from "d3";

import {COVID_DATA} from "./Data";

const MARGIN = {LEFT: 50, RIGHT: 70, BOTTOM: 50, TOP: 10}
const WIDTH = 900 - MARGIN.LEFT - MARGIN.RIGHT;
const HEIGHT = 400 - MARGIN.TOP - MARGIN.BOTTOM;

class BarChart extends Component {
    constructor(props) {
        super(props);

        this.containerRef = createRef();
    }

    drawChart() {
        let xScale = d3.scaleBand()
            .range([0, WIDTH])
            .domain(COVID_DATA.map((d) => d.Date))
            .padding(0.5)

        let yScaleLeft = d3.scaleLinear()
            .range([HEIGHT, 0])
            .domain([0, COVID_DATA.sort((a, b) => a.Cases / b.Cases)[0].Cases * 2]); // TODO; max of vals

        let yScaleRight = d3.scaleLinear()
            .range([HEIGHT, 0])
            .domain([0, 3000]);

        let svg = d3.select(this.containerRef.current)
            .append("svg")
            .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
            .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM);

        let graph = svg.append("g")
            .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

        graph.append("g")
            .call(d3.axisLeft(yScaleLeft));

        graph.append("g")
            .call(d3.axisRight(yScaleRight))
            .attr("transform", `translate(${WIDTH}, 0)`)

        graph.append("g")
            .attr("transform", `translate(0, ${HEIGHT})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .attr("x", 10)
            .attr("y", 0)
            .attr("dy", ".35em")
            .attr("transform", "rotate(90)")
            .style("text-anchor", "start");

        graph.append("text")
            .attr("x",  -(HEIGHT / 2))
            .attr("y", -30)
            .attr("transform", "rotate(-90)")
            .attr("text-anchor", "middle")
            .text("Cases");

        graph.append("text")
            .attr("x", HEIGHT / 2)
            .attr("y", -WIDTH - 55)
            .attr("transform", "rotate(90)")
            .attr("text-anchor", "middle")
            .text("Test Results");

        graph.append("text")
            .attr("x", (WIDTH / 2))
            .attr("y", HEIGHT + MARGIN.BOTTOM)
            .attr("text-anchor", "middle")
            .text("Date");

        graph.append("g")
            .selectAll()
            .data(COVID_DATA)
            .enter()
            .append("rect")
            .attr("x", (d) => xScale(d.Date) + (xScale.bandwidth() / 4))
            .attr("y", (d) => yScaleRight(d["Test Results"]))
            .attr("height", (d) => HEIGHT - yScaleRight(d["Test Results"]))
            .attr("width", xScale.bandwidth() / 2)
            .attr("fill", "#A9B0B7");

        graph.append("g")
            .selectAll()
            .data(COVID_DATA)
            .enter()
            .append("rect")
            .attr("x", (d) => xScale(d.Date))
            .attr("y", (d) => yScaleLeft(d.Cases))
            .attr("height", (d) => HEIGHT - yScaleLeft(d.Cases))
            .attr("width", xScale.bandwidth)
            .style("fill", d => {
                if (this.props.selectedDate !== null) {
                    if (d.Date === this.props.selectedDate) {
                        return "#AC2B37";
                    } else {
                        return "#8F6468";
                    }
                } else {
                    return "#AC2B37";
                }
            })
            .style("cursor", "pointer")
            .on("mousedown", (e, d) => {
                this.props.callback(d.Date);
            })

        // 7 day rolling average of cases
        graph.append("path")
            .datum(COVID_DATA.slice(6))
            .attr("d", d3.line()
                .x(d => xScale(d.Date) + (xScale.bandwidth() / 2))
                .y(d => yScaleLeft(d.Cases7DAvg))
            )
            .style("fill", "none")
            .style("stroke", this.props.caseAvg ? "#AC2B37" : "none")
            .style("stroke-width", 3)
            .style("stroke-dasharray", "3, 3");

        // 7 day rolling average of test results
        graph.append("path")
            .datum(COVID_DATA.slice(6))
            .attr("d", d3.line()
                .x(d => xScale(d.Date) + (xScale.bandwidth() / 2))
                .y(d => yScaleRight(d.Results7DAvg))
            )
            .style("fill", "none")
            .style("stroke", this.props.resultAvg ? "#A9B0B7" : "none")
            .style("stroke-width", 3)
            .style("stroke-dasharray", "3, 3");

        // Legend
        svg.append("circle")
            .attr("cx",MARGIN.LEFT + 10)
            .attr("cy",MARGIN.TOP)
            .attr("r", 6)
            .style("fill", "#AC2B37");

        svg.append("circle")
            .attr("cx",MARGIN.LEFT + 10)
            .attr("cy",MARGIN.TOP + 20)
            .attr("r", 6)
            .style("fill", "#A9B0B7");

        svg.append("text")
            .attr("x", MARGIN.LEFT + 20)
            .attr("y", MARGIN.TOP + 1)
            .text("Cases (w/ 7-Day Rolling Average)")
            .style("font-size", "15px")
            .attr("alignment-baseline","middle");

        svg.append("text")
            .attr("x", MARGIN.LEFT + 20)
            .attr("y", MARGIN.TOP + 21)
            .text("Test Results (w/ 7-Day Rolling Average)")
            .style("font-size", "15px")
            .attr("alignment-baseline","middle");
    }

    componentDidUpdate(previousProps, previousState, snapshot) {
        this.containerRef.current.removeChild(this.containerRef.current.firstChild);
        this.drawChart();
    }

    componentDidMount() {
        this.drawChart();
    }

    render() {
        return (
            <div ref={this.containerRef}/>
        )
    }
}

export default BarChart;