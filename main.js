const state = {
  data: [],
  worldDataClass: "bench_max",
  data_comp: [],
  data_lifter: [],
  data_lifter_selected: [],
  selected_lifts: "SB",
};

//Width and height
const w = 500;
const h = 300;
const padding = 40;

duration = 1500;

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
    .text("squat");

  const yLabel = svg
    .append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 15) // once rotated 90 degree, x coordinate becomes y?
    .attr("dy", "1.2em")
    .attr("transform", "rotate(-90) scale(0.6)")
    .text("bench");

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
            .attr("fill", (d) => (d["Sex"] === "M" ? "steelblue" : "orange"));
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
      .attr("fill", (d) => (d["Sex"] === "M" ? "steelblue" : "orange"))
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
            .attr("fill", (d) => (d["Sex"] === "M" ? "steelblue" : "orange"));
          circles_comp
            .transition()
            .duration(duration)
            .attr("r", 6)
            .attr("fill", (d) => (d["Sex"] === "M" ? "steelblue" : "orange"));
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
              ? "red"
              : d["Sex"] === "M"
              ? "steelblue"
              : "orange"
          );
        circles_comp
          .attr("fill", (d) => (d["Sex"] === "M" ? "steelblue" : "orange"))
          .transition()
          .duration(duration)
          .attr("r", (d) =>
            d["Name"].toLowerCase().includes(selected.toLowerCase()) ? 10 : 6
          )
          .attr("fill", (d) =>
            d["Name"].toLowerCase().includes(selected.toLowerCase())
              ? "red"
              : d["Sex"] === "M"
              ? "steelblue"
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
        .attr("fill", (d) => (d["Sex"] === "M" ? "steelblue" : "orange")) // not sure why color is broken.
        .transition()
        .duration(duration)
        .attr("cx", (d) => xScales[0](d[lift1])) // turn domain value into position on axis
        .attr("cy", (d) => yScales[0](d[lift2]))
        .attr("r", 6);
    }
  });
});

// function createMap() {
//   const margin = {
//     top: 10,
//     bottom: 10,
//     left: 10,
//     right: 10,
//   };
//   const width = 800 - margin.left - margin.right;
//   const height = 600 - margin.top - margin.bottom;

//   const columnName = state.worldDataClass;

//   // Creates sources <svg> element and inner g (for margins)
//   const svg = d3
//     .select("map")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//     .attr("transform", `translate(${margin.left}, ${margin.top})`);

//   var map = d3
//     .choropleth()
//     .geofile("/d3-geomap/dist/topojson/world/countries.json")
//     .colors(d3.schemeReds[9])
//     .column(columnName)
//     .legend(false)
//     .unitId("iso3");

//   d3.csv("countries.csv").then((data) => {
//     var selection = d3.select("#map").datum(data);
//     map.draw(selection);
//   });
// }

// const map = createMap();

// //interactivity
// d3.select("#worlddata-class").on("change", function () {
//   console.log("Change");
//   const selected = d3.select(this).property("value");
//   state.worldDataClass = selected;
//   createMap();
// });

// interactivity
d3.select("#lifts-to-display").on("change", function () {
  const selected = d3.select(this).property("value");
  state.selected_lifts = selected;
  console.log(state.selected_lifts);
  scatter_comp(state.data_comp);
  scatter_lifter(state.data_lifter);
});
