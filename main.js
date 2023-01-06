const state = {
  data: [],
  worldDataClass: "Lifters",
  data_comp: [],
  data_lifter: [],
  data_lifter_selected: [],
  selected_lifts: "SB",
};

//Width and height
const w = 500;
const h = 300;
const padding = 40;

duration = 500;

// 2 lifts out of 3 to display
let lift1;
let lift2;
// to store the scales and axes of two views
let xScales = [];
let yScales = [];
let xAxes = [];
let yAxes = [];
let g_xAxes = [];
let g_yAxes = [];
// object for brushing
let brushGroup;

let counter_of_update = 0;

function createScatter(svgId) {
  // Scales setup
  const xScale = d3.scaleLinear().range([padding - 5, w - padding]);
  const yScale = d3.scaleLinear().range([h - padding + 4, padding]);

  // Define X axis
  const xAxis = d3.axisBottom().scale(xScale).ticks(5);

  // Define Y axis
  const yAxis = d3.axisLeft().scale(yScale).ticks(4); // automatically fits to the closest number 4 -> 5

  xAxes.push(xAxis);
  yAxes.push(yAxis);

  // Create SVG element
  const svg = d3.select(svgId).attr("width", w).attr("height", h);

  const g = svg.append("g");
  const g_xaxis = g.append("g").attr("class", "x axis");
  const g_yaxis = g.append("g").attr("class", "y axis");

  const xLabel = svg
    .append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("transform", "translate(490,290) scale(0.6)")
    .text("squat")
    .style("fill", "white");

  const yLabel = svg
    .append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 15) // once rotated 90 degree, x coordinate becomes y?
    .attr("dy", "1.2em")
    .attr("transform", "rotate(-90) scale(0.6)")
    .text("bench")
    .style("fill", "white");

  function update(new_data) {
    // console.log(new_data);

    let xLabelName;
    let yLabelName;
    if (state.selected_lifts === "SB") {
      lift1 = "Best3SquatKg";
      lift2 = "Best3BenchKg";
      xLabelName = "squat";
      yLabelName = "bench";
    } else if (state.selected_lifts === "DB") {
      lift1 = "Best3DeadliftKg";
      lift2 = "Best3BenchKg";
      xLabelName = "deadlift";
      yLabelName = "bench";
    } else {
      lift1 = "Best3DeadliftKg";
      lift2 = "Best3SquatKg";
      xLabelName = "deadlift";
      yLabelName = "squat";
    }

    xLabel.text(xLabelName);
    yLabel.text(yLabelName);

    // update scale domain
    xScale.domain([0, d3.max(new_data, (d) => d[lift1]) * 1.1]);
    yScale.domain([0, d3.max(new_data, (d) => d[lift2]) * 1.1]);

    if (!xScales.includes(xScale)) {
      xScales.push(xScale);
    }
    if (!yScales.includes(yScale)) {
      yScales.push(yScale);
    }

    // Create X axis
    counter_of_update += 1;
    if (counter_of_update <= 2) {
      g_xaxis
        .attr("transform", "translate(0," + (h - padding + 5) + ")")
        .call(xAxis);
    } else {
      g_xaxis
        .transition()
        .duration(duration)
        .attr("transform", "translate(0," + (h - padding + 5) + ")")
        .call(xAxis);
    }

    // Create Y axis
    // g_yaxis
    //   .attr("transform", "translate(" + (padding - 5) + ",0)")
    //   .call(yAxis);
    if (counter_of_update <= 2) {
      g_yaxis
        .attr("transform", "translate(" + (padding - 5) + ",0)")
        .call(yAxis);
    } else {
      g_yaxis
        .transition()
        .duration(duration)
        .attr("transform", "translate(" + (padding - 5) + ",0)")
        .call(yAxis);
    }

    if (!g_xAxes.includes(g_xaxis)) {
      g_xAxes.push(g_xaxis);
    }
    if (!g_yAxes.includes(g_yaxis)) {
      g_yAxes.push(g_yaxis);
    }

    // Create circles
    const circle = g
      .selectAll("circle")
      .data(new_data)
      .join(
        (enter) => {
          // ENTER
          // new elements
          const circle_enter = enter
            .append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 0)
            .attr("fill", (d) => (d["Sex"] === "M" ? "red" : "orange"));
          circle_enter.append("title");
          return circle_enter;
        },
        // UPDATE
        // update existing elements
        (update) => update,
        // EXIT
        // elements that aren't associated with data
        (exit) => exit.remove()
      );

    circle
      .attr("fill", (d) => (d["Sex"] === "M" ? "red" : "orange"))
      .transition()
      .duration(duration)
      .attr("cx", (d) => xScale(d[lift1])) // turn domain value into position on axis
      .attr("cy", (d) => yScale(d[lift2]))
      .attr("r", 6);

    circle
      .select("title")
      .text(
        (d) =>
          `${d.Name}: ${d["Sex"]} : S-${d.Best3SquatKg} : B-${d.Best3BenchKg} : D-${d.Best3DeadliftKg}`
      );
  }

  return update;
}

const scatter_comp = createScatter("#comp");
const scatter_lifter = createScatter("#lifter");

d3.csv("powerlifting_SBD.csv").then((parsed1) => {
  // if put code in this nested level, the next level is only done when the code is all executed. even if in reversed order.

  d3.csv("powerlifting_wilks_best.csv").then((parsed2) => {
    state.data_comp = parsed1.map((row) => {
      row.Best3SquatKg = parseFloat(row.Best3SquatKg); // works in chrome without this line
      row.Best3BenchKg = parseFloat(row.Best3BenchKg);
      row.Best3DeadliftKg = parseFloat(row.Best3DeadliftKg);
      return row;
    });

    // update comp figure, plot on the right
    scatter_comp(state.data_comp);

    state.data_lifter = parsed2.map((row) => {
      row.Best3SquatKg = parseFloat(row.Best3SquatKg); // works in chrome without this line
      row.Best3BenchKg = parseFloat(row.Best3BenchKg);
      row.Best3DeadliftKg = parseFloat(row.Best3DeadliftKg);
      return row;
    });

    // update lifter figure, plot on the left
    scatter_lifter(state.data_lifter);

    const svg_lifter = d3.select("#lifter");
    const circles_lifter = svg_lifter.select("g").selectAll("circle");
    const svg_comp = d3.select("#comp");
    const circles_comp = svg_comp.select("g").selectAll("circle");
    let selected;

    function highlight() {
      // TODO: change the color coding of circles when a lifter name is entered and the button is clicked
      d3.select("#lifter_name").on("change", function () {
        selected = d3.select(this).property("value");
        console.log(selected);
        if (selected === "") {
          circles_lifter
            .transition()
            .duration(duration)
            .attr("r", 6)
            .attr("fill", (d) => (d["Sex"] === "M" ? "red" : "orange"));
          circles_comp
            .transition()
            .duration(duration)
            .attr("r", 6)
            .attr("fill", (d) => (d["Sex"] === "M" ? "red" : "orange"));
          return;
        }
        circles_lifter
          .transition()
          .duration(duration)
          .attr("r", (d) =>
            d["Name"].toLowerCase().includes(selected.toLowerCase()) ? 10 : 6
          )
          .attr("fill", (d) =>
            d["Name"].toLowerCase().includes(selected.toLowerCase())
              ? "white"
              : d["Sex"] === "M"
              ? "red"
              : "orange"
          );
        circles_comp
          .attr("fill", (d) => (d["Sex"] === "M" ? "red" : "orange"))
          .transition()
          .duration(duration)
          .attr("r", (d) =>
            d["Name"].toLowerCase().includes(selected.toLowerCase()) ? 10 : 6
          )
          .attr("fill", (d) =>
            d["Name"].toLowerCase().includes(selected.toLowerCase())
              ? "white"
              : d["Sex"] === "M"
              ? "red"
              : "orange"
          );
      });
    }

    highlight();

    // Add brushing
    const brush = d3
      .brush() // Add the brush feature using the d3.brush function
      .extent([
        [0, 0],
        [w, h],
      ]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
      .on("end", updateChart); // Each time the brush selection changes, trigger the 'updateChart' function
    brushGroup = svg_lifter
      .append("g")
      .attr("class", "brush") // brushing must be included in a group! otherwise it will break something: here for example the axis labels.
      .call(brush);

    // A function that set idleTimeOut to null
    let idleTimeout;
    function idled() {
      idleTimeout = null;
    }

    function updateChart({ selection }) {
      // based on the selection area, check if the data points are inside of it. then update the circles.

      if (!selection) {
        if (!idleTimeout) return (idleTimeout = setTimeout(idled, 350));
        scatter_comp(state.data_comp);
        xScales[1].domain([
          0,
          d3.max(state.data_lifter, (d) => d[lift1]) * 1.1,
        ]);
        yScales[1].domain([
          0,
          d3.max(state.data_lifter, (d) => d[lift2]) * 1.1,
        ]);
        g_xAxes[1].transition().duration(duration).call(xAxes[1]); // altering domain without calling the axis will not change anything in the chart shown.
        g_yAxes[1].transition().duration(duration).call(yAxes[1]);

        // document.getElementById('#lifter_name').value = '';
        // selected = '';
        // circles_lifter.
        // transition().duration(duration)
        //         .attr("r", 6)
        //         .attr("fill", (d) => d['Sex'] === 'M' ? 'steelblue' : 'orange');
        scatter_lifter(state.data_lifter);
        xScales[0].domain([0, d3.max(state.data_comp, (d) => d[lift1]) * 1.1]);
        yScales[0].domain([0, d3.max(state.data_comp, (d) => d[lift2]) * 1.1]);
        g_xAxes[0].transition().duration(duration).call(xAxes[0]);
        g_yAxes[0].transition().duration(duration).call(yAxes[0]);
      } else {
        const [[x0, y0], [x1, y1]] = selection;
        state.data_lifter_selected = [];
        const lifter_names = [];

        state.data_lifter.forEach((value, index, array) => {
          if (
            xScales[1](value[lift1]) >= x0 &&
            xScales[1](value[lift1]) <= x1 &&
            yScales[1](value[lift2]) >= y0 &&
            yScales[1](value[lift2]) <= y1
          ) {
            lifter_names.push(value["Name"]);
          }
        });
        // console.log(lifter_names);
        state.data_comp.forEach((value, index, array) => {
          // console.log(value);
          //if ( xScales[1](value[lift1]) >= x0 && xScales[1](value[lift1]) <= x1 ) {state.data_lifter_selected.push(value);}
          if (lifter_names.includes(value["Name"])) {
            state.data_lifter_selected.push(value);
          }
        });
        console.log("selected:");
        console.log(state.data_lifter_selected);
        //console.log(state.data_comp);
        //scatter_comp([state.data_comp[0], state.data_comp[4]]);
        //scatter_comp([state.data_comp[2], state.data_comp[3], state.data_comp[4]]);
        //scatter_comp(state.data_comp.slice(2, 5));
        scatter_comp(state.data_lifter_selected);
        // TODO: find out the reason why calculating new domains in xScales[0] causes error using data: scatter_comp([state.data_comp[0], state.data_comp[4]]);
        const new_domain_l = Math.floor(xScales[1].invert(x0));
        const new_domain_r = Math.ceil(xScales[1].invert(x1));
        const new_domain_t = Math.floor(yScales[1].invert(y0));
        const new_domain_b = Math.ceil(yScales[1].invert(y1));
        xScales[1].domain([new_domain_l, new_domain_r]); // must be integers
        yScales[1].domain([new_domain_b, new_domain_t]);
        g_xAxes[1].transition().duration(duration).call(xAxes[1]);
        g_yAxes[1].transition().duration(duration).call(yAxes[1]);

        xScales[0].domain([
          d3.min(state.data_lifter_selected, (d) => d[lift1]) * 0.9,
          d3.max(state.data_lifter_selected, (d) => d[lift1]) * 1.1,
        ]); // must be integers
        yScales[0].domain([
          d3.min(state.data_lifter_selected, (d) => d[lift2]) * 0.9,
          d3.max(state.data_lifter_selected, (d) => d[lift2]) * 1.1,
        ]);
        g_xAxes[0].transition().duration(duration).call(xAxes[0]);
        g_yAxes[0].transition().duration(duration).call(yAxes[0]);

        brushGroup.call(brush.move, null);
      }

      circles_lifter
        .transition()
        .duration(duration)
        .attr("cx", (d) => xScales[1](d[lift1])) // turn domain value into position on axis
        .attr("cy", (d) => yScales[1](d[lift2]))
        .attr("r", 6);

      circles_comp
        .attr("fill", (d) => (d["Sex"] === "M" ? "red" : "orange")) // not sure why color is broken.
        .transition()
        .duration(duration)
        .attr("cx", (d) => xScales[0](d[lift1])) // turn domain value into position on axis
        .attr("cy", (d) => yScales[0](d[lift2]))
        .attr("r", 6);
    }
  });
});

const w2 = 420;
const plotlen = 230;
const h2 = 50;
const offset = 120;
const weightClassOptions = [
  { value: "all", text: "All Classes" },
  { value: "-44", text: "Under 44" },
  { value: "-48", text: "Under 48" },
  { value: "-52", text: "Under 52" },
  { value: "-56", text: "Under 56" },
  { value: "-60", text: "Under 60" },
  { value: "-67.5", text: "Under 67.5" },
  { value: "-75", text: "Under 75" },
  { value: "-82.5", text: "Under 82.5" },
  { value: "-90", text: "Under 90" },
  { value: "-100", text: "Under 100" },
  { value: "-110", text: "Under 110" },
  { value: "-125", text: "Under 125" },
  { value: "-140", text: "Under 140" },
  { value: "140+", text: "Over 140" },
];
// Initialize weight class dropdown
var weightClassSelector = d3.select("#division");
weightClassSelector
  .selectAll(".options")
  .data(weightClassOptions)
  .enter()
  .append("option")
  .attr("class", "options")
  .attr("value", function (d) {
    return d.value;
  })
  .text(function (d) {
    return d.text;
  });

const sexOptions = [
  { value: "all", text: "All" },
  { value: "M", text: "Male" },
  { value: "F", text: "Female" },
];
// Initialize sex dropdown
var sexSelector = d3.select("#sex");
sexSelector
  .selectAll(".options")
  .data(sexOptions)
  .enter()
  .append("option")
  .attr("class", "options")
  .attr("value", function (d) {
    return d.value;
  })
  .text(function (d) {
    return d.text;
  });

const equipmentOptions = [
  { value: "all", text: "Any" },
  { value: "Raw", text: "Raw" },
  { value: "Assisted", text: "Assisted" },
];
// Initialize equipment dropdown
var equipmentSelector = d3.select("#equipment");
equipmentSelector
  .selectAll(".options")
  .data(equipmentOptions)
  .enter()
  .append("option")
  .attr("class", "options")
  .attr("value", function (d) {
    return d.value;
  })
  .text(function (d) {
    return d.text;
  });

// Helper function to get key
function getKey(type) {
  if (type === "bench") return "Best3BenchKg";
  else if (type === "squat") return "Best3SquatKg";
  else if (type === "deadlift") return "Best3DeadliftKg";
  else if (type === "total") return "TotalKg";
  else return "Wilks";
}

function drawBox(svgID, data_source, label) {
  var svg = d3.select(svgID).attr("width", w2).attr("height", h2).append("g");

  d3.csv(data_source).then((data) => {
    // console.log(data);

    stat = svgID.slice(1, svgID.length - 4);
    key = getKey(stat);

    let values = data;

    values = values.map(function (d) {
      return +d[key];
    });

    var sorted = values.sort(d3.ascending);
    var statScale = d3
      .scaleLinear()
      .domain([sorted[0], sorted[sorted.length - 1]])
      .range([offset, offset + plotlen]);
    var q1 = d3.quantile(sorted, 0.25);
    var med = d3.quantile(sorted, 0.5);
    var q3 = d3.quantile(sorted, 0.75);
    var min = sorted[0];
    var max = sorted[sorted.length - 1];

    var center = 30;
    var width = 30;

    // Central line
    svg
      .append("line")
      .attr("x1", offset)
      .attr("x2", plotlen + offset)
      .attr("y1", center)
      .attr("y2", center)
      .attr("stroke", "white");

    // Whiskers
    svg
      .append("line")
      .attr("x1", offset)
      .attr("x2", offset)
      .attr("y1", center + 10)
      .attr("y2", center - 10)
      .attr("stroke", "white");
    svg
      .append("line")
      .attr("x1", plotlen + offset)
      .attr("x2", plotlen + offset)
      .attr("y1", center + 10)
      .attr("y2", center - 10)
      .attr("stroke", "white");

    // Label
    svg
      .append("text")
      .classed("plotStat", true)
      .attr("x", 0)
      .attr("y", center + 5)
      .text(label)
      .style("fill", "white");

    // Box
    svg
      .append("rect")
      .classed("bPlot", true)
      .attr("x", statScale(q1))
      .attr("y", center - width / 2)
      .attr("height", width)
      .attr("width", statScale(q3) - statScale(q1))
      .attr("stroke", "white")
      .attr("fill", "#bf262b")
      .attr("fill-opacity", 1);

    // median line
    svg
      .append("line")
      .classed("medianLine", true)
      .attr("x1", statScale(med))
      .attr("x2", statScale(med))
      .attr("y1", center + width / 2)
      .attr("y2", center - width / 2)
      .attr("stroke", "white");

    // Min and max text
    svg
      .append("text")
      .classed("minText", true)
      .attr("x", offset - 28)
      .attr("y", center + 5)
      .text(Math.round(min))
      .style("fill", "white");
    svg
      .append("text")
      .classed("maxText", true)
      .attr("x", plotlen + offset + 5)
      .attr("y", center + 5)
      .text(max)
      .style("fill", "white");

    svg
      .append("circle")
      .attr("id", stat + "-value")
      .attr("cx", statScale(1))
      .attr("cy", center)
      .attr("r", 0)
      .attr("fill", "orange")
      .append("title");
  });
}
drawBox("#bench-svg", "powerlifting_benchData.csv", "Bench(Kg)");
drawBox("#squat-svg", "powerlifting_squatData.csv", "Squat(Kg)");
drawBox("#deadlift-svg", "powerlifting_deadliftData.csv", "Deadlift(Kg)");
drawBox("#total-svg", "powerlifting_totalData.csv", "Total(Kg)");
drawBox("#wilks-svg", "powerlifting_wilksData.csv", "Wilks");

const boxFilters = {
  division: "all",
  sex: "all",
  equipment: "all",
};
// Initialize user entries
const entries = {
  bench: -1,
  squat: -1,
  deadlift: -1,
  total: -1,
  wilks: -1,
};

// Update boxplot after filtering
function updateBox(svgID, data_source) {
  var svg = d3.select(svgID);

  d3.csv(data_source).then((data) => {
    let values = data;
    stat = svgID.slice(1, svgID.length - 4);
    key = getKey(stat);
    if (boxFilters.division !== "all") {
      values = values.filter(function (d) {
        return d["division"] === boxFilters.division;
      });
    }
    if (boxFilters.sex !== "all") {
      values = values.filter(function (d) {
        return d["Sex"] === boxFilters.sex;
      });
    }
    if(boxFilters.equipment==="Raw"){
      values=values.filter(function(d){return d['Equipment']==="Raw";})
    }
    else if(boxFilters.equipment==="Assisted"){
      values=values.filter(function(d){return d['Equipment']!=="Raw";})
    }

    values = values.map(function (d) {
      return +d[key];
    });

    //console.log(values)
    var sorted = values.sort(d3.ascending);
    var statScale = d3
      .scaleLinear()
      .domain([sorted[0], sorted[sorted.length - 1]])
      .range([offset, plotlen + offset]);
    var q1 = d3.quantile(sorted, 0.25);
    var med = d3.quantile(sorted, 0.5);
    var q3 = d3.quantile(sorted, 0.75);
    var min = sorted[0];
    var max = sorted[sorted.length - 1];

    var center = 30;
    var width = 30;

    //Update box
    svg
      .selectAll(".bPlot")
      .transition()
      .duration(200)
      .attr("x", statScale(q1))
      .attr("y", center - width / 2)
      .attr("height", width)
      .attr("width", statScale(q3) - statScale(q1))
      .attr("stroke", "white");

    // Update median line
    svg
      .selectAll(".medianLine")
      .transition()
      .duration(200)
      .attr("x1", statScale(med))
      .attr("x2", statScale(med))
      .attr("y1", center + width / 2)
      .attr("y2", center - width / 2)
      .attr("stroke", "white");

    // Update Min and max text
    svg
      .selectAll(".minText")
      .attr("x", offset - 28)
      .attr("y", center + 5)
      .text(Math.round(min))
      .style("fill", "white");
    svg
      .selectAll(".maxText")
      .attr("x", plotlen + offset + 5)
      .attr("y", center + 5)
      .text(max)
      .style("fill", "white");

    entry = entries[stat];
    circle=svg.selectAll("circle")
    if (entry > 0) {
      var color = "orange";
      if (entry < min) color = "red";
      else if (entry > max) color = "green";
      percentile=parseFloat(d3.bisect(values,entry)/values.length*100).toFixed(3)
      circle
        .transition()
        .duration(200)
        .attr("cx", statScale(Math.max(min, Math.min(entry, max))))
        .attr("cy", center)
        .attr("r", 5)
        .attr("fill", color)
        .select("title").text(stat==="wilks"?"Your "+stat+" score is higher than "+percentile+"% of the population":
                    "Your "+stat+" PR is higher than "+percentile+"% of the population");
    }
  });
}

//define wait function
var wait = (ms) => new Promise((r, j) => setTimeout(r, ms));

//update based on dropdown
d3.selectAll(".dropdown").on("change", async function () {
  selected = d3.select(this).property("value");

  filterName = d3.select(this).property("id");

  boxFilters[filterName] = selected;

  updateBox("#bench-svg", "powerlifting_benchData.csv");
  await wait(1000);
  updateBox("#squat-svg", "powerlifting_squatData.csv");
  await wait(1000);
  updateBox("#deadlift-svg", "powerlifting_deadliftData.csv");
  await wait(1000);
  updateBox("#total-svg", "powerlifting_totalData.csv");
  await wait(1000);
  updateBox("#wilks-svg", "powerlifting_wilksData.csv");
  await wait(1000);
});

// mark user entries on boxplot
d3.selectAll(".entries").on("change", async function () {
  id = d3.select(this).property("id");
  val = d3.select(this).property("value");
  entry = id.slice(0, id.length - 6);
  entries[entry] = val;
  updateBox("#" + entry + "-svg", "powerlifting_" + entry + "Data.csv");
  if (entry!=="total" && entries.bench > 0 && entries.deadlift > 0 && entries.squat > 0) {
    entries.total =
      entries.bench * 1 + entries.deadlift * 1 + entries.squat * 1;
    await wait(750);
    updateBox("#total-svg", "powerlifting_totalData.csv");
    d3.select("#total-entry").property("value",entries.total);
  }
});

function createMap() {
  const margin = {
    top: 10,
    bottom: 10,
    left: 10,
    right: 10,
  };
  const width = 1140 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  const columnName = state.worldDataClass;

  d3.select("#map").selectAll("*").remove();

  var map = d3
    .choropleth()
    .geofile("/d3-geomap/dist/topojson/world/countries.json")
    .colors(d3.schemeReds[9])
    .column(columnName)
    .legend(true)
    .unitId("iso3");

  d3.csv("countries.csv").then((data) => {
    var selection = d3
      .select("#map")
      .datum(data)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);
    map.draw(selection);
  });
}

const map = createMap();

//interactivity
d3.select("#world-class").on("change", function () {
  console.log("Change");
  const selected = d3.select(this).property("value");
  state.worldDataClass = selected;
  createMap();
});

// interactivity
d3.select("#lifts-to-display").on("change", function () {
  const selected = d3.select(this).property("value");
  state.selected_lifts = selected;
  console.log(state.selected_lifts);
  scatter_comp(state.data_comp);
  scatter_lifter(state.data_lifter);
});
