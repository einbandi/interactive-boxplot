// var execute = function () {
//   var rects = d3.selectAll("rect");
//   rects.attr("x", 0);
// }

function execute (myData) {
  myData = !myData ? [127, 61, 256, 71, 15, 23] : myData;
  let barHeight = 30;
  let svg = d3.select("svg");

  let barGroups = svg.selectAll(".barGroup")
      .data(myData);

  // append new g elements for each data point
  let enterBarGroups = barGroups.enter()
      .append("g")
      .classed("barGroup", true); // assigning the class

  // append a rect to the g element
  enterBarGroups.append("rect")
      .attr("width", d => d)
      .attr("height", 20)
      .style("fill", "steelblue");

  // add a label to the group
  enterBarGroups.append("text")
      .attr("transform", function (d) {
          // move it five pixel right of the bar
          return "translate(" + (d + 5) + ", 0)";
      })
      .text(d => d)
      .attr("dy", barHeight / 2);

  barGroups.exit().remove();

  barGroups = barGroups.merge(enterBarGroups);

  barGroups.attr("transform", function (d, i) {
      // positioning the group in y
      return "translate(0," + i * barHeight + ")";
  });
};

// a button setting another dataset
d3.select("#next").on("click", function () {
  execute([500, 100, 120]);
});

var button = d3.select("body").append("button");
button.text("Run!");
button.on("click", execute);