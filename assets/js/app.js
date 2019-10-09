// @TODO: YOUR CODE HERE!
// chart dimensions
var svgWidth = 800;
var svgHeight = 600;

var margin = {
    top: 50,
    right: 50,
    bottom: 100,
    left: 00
};

// fit chart
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// svg wrapper, append SVG group with data, shift data according to margins
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// append svg group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

var chosenXAxis = "poverty" || "income" || "age";
var chosenYAxis = "obesity" || "smokes" || "healthcare";

function xScale(data, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
        .domain(
        [d3.min(data, d => d[chosenXAxis]) * 0.75, d3.max(data, d => d[chosenXAxis]) * 1.05]
        )
        .range([5, chartWidth]);
    return xLinearScale;
}

function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}

function yScale(data, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d =>
                d[chosenYAxis]) * 0.75,
            d3.max(data, d => d[chosenYAxis]) * 1.05])
        .range([chartHeight, 5]);
    return yLinearScale;
}

function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;
}

function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));
    return circlesGroup;
}

function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    textGroup.transition()
        .duration(1000)
        .attr("dx", d => newXScale(d[chosenXAxis]) - d.income / 8000)
        .attr("dy", d => newYScale(d[chosenYAxis]) + d.income / 8000);
    return textGroup;
}

function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    if (chosenXAxis === "poverty") {
        var xlabel = "Percentage (%) In Poverty";
    } else if (chosenXAxis === "age") {
        var xlabel = "Median Age (yrs)";
    } else if (chosenXAxis === "income") {
        var xlabel = "Median Household Income ($)";
    }

    if (chosenYAxis === "obesity") {
        var ylabel = "Percentage (%) Obesity";
    } else if (chosenYAxis === "smokes") {
        var ylabel = "Percentage (%) Smokes";
    } else if (chosenYAxis === "healthcare") {
        var ylabel = "Percentage (%) Lacking Healthcare";
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([-6, 5])
        .html(function (d) {
            return (`${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
        });

    circlesGroup.call(toolTip);
    circlesGroup.on('mouseover', function (d) {
            toolTip.show(d, this);
        })
        .on("mouseout", function (d) {
            toolTip.hide(d, this);
        });
    return circlesGroup;
}

var csv = "./assets/data/data.csv"
d3.csv(csv)
    .then(function (data) {
        console.log(data);
        data.forEach(function (d) {
            d.poverty = +d.poverty;
            d.age = +d.age;
            d.income = +d.income;
            d.obesity = +d.obesity;
            d.smokes = +d.smokes;
            d.healthcare = +d.healthcare;
        });

        var xLinearScale = xScale(data, chosenXAxis);
        var yLinearScale = yScale(data, chosenYAxis);

        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        var xAxis = chartGroup.append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0, ${chartHeight})`)
            .call(bottomAxis);

        var yAxis = chartGroup.append("g")
            .classed("y-axis", true)
            .call(leftAxis);

        // var chart = chartGroup.append("g").data(data).enter();
        var circlesGroup = chartGroup.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .attr("r", function (d) {
                return d.income / 4000;
            })
            .style("opacity", 0.5)
            .style("fill", function (d) {
                if ((d.poverty) >= d3.mean(data, d => d.poverty)) {
                    return "red";
                }
                if ((d.poverty) < d3.mean(data, d => d.poverty)) {
                    return "green";
                }
            })
            .style("stroke", "grey");
        var textGroup = chartGroup.selectAll('text')
            .data(data, function (d, i) {
                return d + i;
            })
            .enter()
            .append("text")
            .text(function (d) {
                return d.abbr;
            })
            .attr("dx", d => xLinearScale(d[chosenXAxis]) - d.income / 8000)
            .attr("dy", d => yLinearScale(d[chosenYAxis]) + d.income / 8000)
            .attr("font-family", "sans-serif")
            .attr("font-size", "12px")
            .attr("fill", "black");

        var xlabelsGroup = chartGroup.append("g");
        var ylabelsGroup = chartGroup.append("g");

        var povertyLabel = xlabelsGroup.append("text")
            .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + margin.top +10})`)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("fill", "black")
            .attr("value", "poverty")
            .classed("active", true)
            .text("In Poverty (%)");

        var ageLabel = xlabelsGroup.append("text")
            .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + margin.top +30})`)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("fill", "black")
            .attr("value", "age")
            .classed("active", true)
            .text("Age (Median)");

        var incomeLabel = xlabelsGroup.append("text")
            .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + margin.top +50})`)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("fill", "black")
            .attr("value", "income")
            .classed("active", true)
            .text("Household Income (Median)");

        var healthcareLabel = ylabelsGroup.append("text")
            .text("Lacks Healthcare (%)")
            .attr("y", 0 - margin.left + 40)
            .attr("x", 0 - (chartHeight / 2))
            .attr("dy", "1em")
            .attr("class", "axisText")
            .attr("transform", "rotate(-90)")
            .attr("value", "healthcare")
            .classed("active", true)
            .style("text-anchor", "middle");

        var smokesLabel = ylabelsGroup.append("text")
            .text("Smokes (%)")
            .attr("y", 0 - margin.left + 20)
            .attr("x", 0 - (chartHeight / 2))
            .attr("dy", "1em")
            .attr("class", "axisText")
            .attr("transform", "rotate(-90)")
            .attr("value", "smokes")
            .classed("active", true)
            .style("text-anchor", "middle");

        var obesityLabel = ylabelsGroup.append("text")
            .text("Obesity (%)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (chartHeight / 2))
            .attr("dy", "1em")
            .attr("class", "axisText")
            .attr("transform", "rotate(-90)")
            .attr("value", "obesity")
            .classed("active", true)
            .style("text-anchor", "middle");

        var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        xlabelsGroup.selectAll("text")
            .on("click", function () {
                var xValue = d3.select(this).attr("value");
                console.log("xVal:", xValue);
                chosenXAxis = xValue;
                console.log("chosenX:", chosenXAxis);
                xLinearScale = xScale(data, chosenXAxis);
                xAxis = renderXAxes(xLinearScale, xAxis);
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (chosenXAxis === "age") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            });

        ylabelsGroup.selectAll("text")
            .on("click", function () {
                var yValue = d3.select(this).attr("value");
                console.log("yVal:", yValue);
                chosenYAxis = yValue;
                console.log("chosenY:", chosenYAxis);
                yLinearScale = yScale(data, chosenYAxis);
                yAxis = renderYAxes(yLinearScale, yAxis);
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
                if (chosenYAxis === "obesity") {
                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (chosenYAxis === "smokes") {
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else {
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            });

    });
