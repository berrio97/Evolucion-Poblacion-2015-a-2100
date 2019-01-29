//ALVARO BERRIO GALINDO

//definition and features of the svg object
var margin = {top: 70, right: 130, bottom: 70, left: 200},
width = 900 - margin.left - margin.right,
height = 585 - margin.top - margin.bottom;
var colour = d3.scaleOrdinal(d3.schemeCategory20);
var x = d3.scaleLinear().rangeRound([0, width]);
var y = d3.scaleBand().rangeRound([height,0]);
var xAxis = d3.axisBottom(x);
var yAxis = d3.axisLeft(y);

//radio buttons for the years and selector of continent
var year="2020";
var continent;
var button=document.querySelectorAll('input[type=radio][name="year"]');
button.forEach(function(d){
  if(d.id==year){
    d.checked=true;
  }
})
var select=document.getElementById('continent');
continent=select.value;

//creation of the svg object
var svg = d3.select("body")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

svg.append("text")
.attr("x",(width/2)-20)
.attr("y",height+50)
.attr("font-family","Helvetica")
.text("Population")

//label used to show the total population of a country
var tooltip = d3.select("body").append("div")
.attr("class", "tooltip")
.style("opacity",0);

d3.csv("total.csv", function(error, data) {
  if(error)throw error;

  button.forEach(function(d){
    d.addEventListener('change',change_year);
  })
  select.addEventListener('change',change_continent);

  //filter the data to get only the continent and year wanted
  var dataset=data;
  data=filter_data(dataset);

  //different levels of each bar
  var keys=data.columns.slice(1);
  draw_rect();

  //handlers of the radio buttons and selector
  function change_year(event){
    year=this.value;
    data=filter_data();
    svg.selectAll("g").remove();
    draw_rect();
  }
  function change_continent(event){
    continent=this.value;
    data=filter_data();
    svg.selectAll("g").remove();
    draw_rect();
  }

  function filter_data(){
    dataset.forEach(function(d){
      d.X0_19=Math.round(+d.X0_19,0);
      d.X20_44=Math.round(+d.X20_44,0);
      d.X45_64=Math.round(+d.X45_64,0);
      d.X65_100=Math.round(+d.X65_100,0);
      d.Total=Math.round(+d.Total,0);
    })
    var data=dataset.filter(function(entry){
      return entry.Continent==continent;
    })
    //get the new domain every time the year or the continent is changed
    y.domain(data.map(function(d) { return d.Country; }));
    x.domain([0, d3.max(data, function(d) { return d.Total; })]).nice();
    var data=data.filter(function(entry){
      return entry.Year==year;
    })
    data.columns=["Country", "X0_19","X20_44","X45_64","X65_100"];
    return data;
  }
  //represent the graph
  function draw_rect(){

    //legend of the graph
    var legend = svg.append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .attr("text-anchor", "end")
    .selectAll("g")
    .data(keys.slice(0,4).reverse())
    .enter().append("g")
    .attr("transform", function(d, i) { return "translate(-50," + (300 + i * 20) + ")"; });

    legend.append("rect")
    .attr("x", width+150)
    .attr("width", 19)
    .attr("height", 19)
    .attr("fill", colour);
    data_legend=["0 to 19 years old","20 to 44 years old","45 to 64 years old","65 to 100 years old"];

    legend.append("text")
    .data(data_legend.reverse())
    .style("font-family","Helvetica")
    .attr("x", width+145)
    .attr("y", 9.5)
    .attr("dy", "0.32em")
    .text(function(d) { return d; });

    //title of the graph, updated with evey change of year and continent
    var title = svg.append("g")
    .attr("class", "title");

    title.selectAll("text").remove();
    title.append("text")
    .attr("x", (width / 2))
    .attr("y", -30 )
    .attr("text-anchor", "middle")
    .style("font-size", "22px")
    .style("font-family","Helvetica")
    .text("POPULATION OF "+continent+" IN "+year);

    //draw the bars
    svg.append("g")
    .selectAll("g")
    .data(d3.stack().keys(keys)(data))
    .enter().append("g")
    .attr("fill",function(d){return colour(d.key);})
    .selectAll(".bar")
    .data(function(d){
      return d;})
    .enter().append("rect")
    .attr("class","bar")
    .attr("id",function(d,i){
      return "rect"+i
    })
    .attr("y",function(d){return y(d.data.Country)+1;})
    .attr("x",function(d){return x(d[0]);})
    .attr("height",19)
    .on("mouseover",mouseover)
    .on("mousemove", function(d){mousemove(d);})
    .on("mouseout", mouseout)
    .transition().duration(500)
    .attr("width",function(d){
      if(Math.abs(d[0]-d.data.Total)>2){
        return (x(d[1])-x(d[0]));}});

    //add the axis
    svg.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(0, 0)")
    .call(yAxis);

    svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0,"+height+")")
    .call(d3.axisBottom(x).ticks(null, "s"));
      }
      //handlers of the actions of the mouse on the graph
      function mouseover() {
        d3.selectAll(".bar").transition().duration(400).style("opacity",0.5);
        d3.selectAll("#"+d3.select(this).attr("id")).transition().duration(1)
        .style("opacity", 1)
        .attr("y",function(d){return y(d.data.Country);})
        .attr("height",21);

        tooltip.transition()
        .duration(300)
        .style("opacity", 0.8);
      }
      function mousemove(d) {
        tooltip.selectAll("text").remove();
        tooltip.selectAll("br").remove();
        tooltip.style("left", (d3.event.pageX ) + "px")
        .style("top", (d3.event.pageY) + "px")

        tooltip.append("text").text(d.data.Country).style("font-weight","bold");
        	tooltip.append("br");
        	tooltip.append("text").text("Total population: "+(d.data.Total));
      }
      function mouseout() {
        d3.selectAll(".bar").transition().duration(400).style("opacity",1);
        d3.selectAll("#"+d3.select(this).attr("id"))
        .attr("y",function(d){return y(d.data.Country)+1;})
        .attr("height",19);

        tooltip.transition()
        .duration(300)
        .style("opacity", 0);
      }

    });
