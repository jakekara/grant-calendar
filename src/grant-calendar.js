// import dependencies
d3 = require("d3");
var numeral = require("numeraljs");

// set up some config globals
var CONTAINER = d3.select("#container");
const DATA_FILE = "data/calendar.csv";
const TOWN_RUNS = require("../data/town_runs.json");
const TOWNS = Object.keys(TOWN_RUNS);
const MONTHS = ["Jul","Aug","Sept","Oct","Nov","Dec",
		"Jan","Feb","Mar","Apr","May","Jun"];

// draw the graphic
var go = function(d)
{
    console.log("GOING WITH DATA", d);
    console.log("TOWN_RUNS", TOWN_RUNS);
    console.log("TOWNS", TOWNS);

    // filter by month
    var filter_month = function(m)
    {
	return d.filter(function(r){
	    return r[m].trim().length > 0;
	});
    }

    var total_month = function(m)
    {
	return filter_month(m).reduce(function(a, b){
	    console.log(a, b);
	    return a + numeral(b["FY 17 Net Appropriation"]);
	},0);
    }

    var this_month = function(m)
    {
	return (new Date(m + " 1 2017")).getMonth() == new Date().getMonth() + 1;
    }

    var month_str = function(m){
	var d = new Date(m + " 1 2017");

	var month = new Array();
	
	month[0] = "January";
	month[1] = "February";
	month[2] = "March";
	month[3] = "April";
	month[4] = "May";
	month[5] = "June";
	month[6] = "July";
	month[7] = "August";
	month[8] = "September";
	month[9] = "October";
	month[10] = "November";
	month[11] = "December";
	
	return month[d.getMonth()];
    }

    var monthly_data = MONTHS.map(function(m, i){
	return {
	    "grants":filter_month(m),
	    "total":total_month(m),
	    "month_full":month_str(m),
	    "month":m
	    
	}
    });

    var picker_area = CONTAINER.append("div").classed("picker_area", true);
    picker_area.append("div").classed("picker_label", true).text("Select your town:");
    var picker = picker_area.append("div").append("select");
    picker_area.append("div").classed("clear-both", true);

    picker.selectAll("option")
	.data(TOWNS).enter()
	.append("option")
	.attr("value", function(d){ return d; })
	.text(function(d){ return d; });


    var month_boxes = CONTAINER.selectAll(".month")
	.data(monthly_data)
	.enter()
	.append("div")
	.attr("data-month", function(d){ return d["month"]; })
	.classed("month", true)
	.classed("this-month", function(d){ return this_month(d["month"]); });

    month_heds = month_boxes
	.append("div")
    	.classed("month_hed", true)
	.append("h3")
	.text(function(d, i){
	    return d["month_full"]
	})

    // red-dot count
    month_heds.append("div")
    	.classed("red-dot", true)
    	.text(function(d){
    	    // + numeral(d["total"]).format("$0a").toUpperCase();
    	    return d["grants"].length;
    	});

    // month_heds.selectAll(".grant-dot")
    // 	.data(function(d){ return d3.range(d["grants"].length); })
    // 	.enter()
    // 	.append("div")
    // 	.classed("grant-dot", true)
    // month_heds.append("div").classed("clear-both", true);

    var grant_boxes = month_boxes.selectAll(".grant")
	.data(function(d){ return d["grants"]; })
	.enter()
	.append("div")    
	.attr("data-grant-name", function(d){
	    return d["Town Grant Name"] || d["Appropriation Name"]; })
    	.classed("billion", function(d){
	    console.log
	    return numeral(d["FY 17 Net Appropriation"])
		.value() > 100 * 1000 * 1000;
	})
    	.classed("million", function(d){
	    return (numeral(d["FY 17 Net Appropriation"])
		    .value() < 100 * 1000 * 1000)
		& (numeral(d["FY 17 Net Appropriation"])
		   .value() >= 1000 * 1000);
	})
	.classed("grant", true)

    grant_boxes.append("h5")
	.classed("grant_hed", true)
	.text(function(d){ return d["Appropriation Name"]; });

    grant_boxes.append("div")
    	.classed("detail", true)
    	.html(function(d){
    	    return "<strong>FY17 statewide:</strong> "
    		+  numeral(d["FY 17 Net Appropriation"])
		.format("$0a").toUpperCase()
    	    // +  d["FY 17 Net Appropriation"]	    
		+ "; ";
    	});

    grant_boxes.append("div")
    	.classed("detail", true)
    	.html(function(d){
    	    var m = d3.select(this.parentNode.parentNode).attr("data-month");
    	    // return "<strong>" + m + " portion:</strong> "
    	    // 	+ d[m];

	    //     return "<strong>FY17 total:</strong> "
	    // +  d["FY 17 Net Appropriation"]
	    return  "<strong>" + month_str(m) + " portion:</strong> " + d[m];

	    // return d[m];
    	});

    var town_details = grant_boxes.append("div")
	.attr("data-appropriation-name", function(d) { return d["Appropriation Name"]; })
	.attr("data-town-grant-name", function(d){ return d["Town Grant Name"]; })
	.classed("detail", true)
	.classed("town-detail", true)
	.classed("no-town-details", true)


    var disco_fever = function(){
	var colors = ["pink","lightgreen","lightskyblue"];
	colors = ["yellow"];
	d3.selectAll(".grant")
	    .transition()
	    .style("border-left",function(){
		var that = this

		d3.select(that).style("opacity",0);
		
		setTimeout(function(){
		    d3.select(that)
			.transition()
			.style("opacity",1)
			.style("border-left",null);
		}, Math.random() * 1000);

		
		return "9px solid " + colors[Math.round(Math.random() * colors.length)]
	    });
	
	// setTimeout(function(){
	//     d3.selectAll(".grant")
	// 	.transition()
	// 	.style("border-left",null);
	// }, 250);
    }
    
    var update_cards = function(){
	disco_fever();
	var recipient = picker.node().options[picker.node().selectedIndex].value;
	var town_data = TOWN_RUNS[recipient];

	grant_boxes.classed("loser", function(d){
		var amt_2018 = numeral(TOWN_RUNS[recipient][d["Town Grant Name"] + "_FY 2018"]).value()
		var amt_2017 = numeral(TOWN_RUNS[recipient][d["Town Grant Name"] + "_FY 2017"]).value()
		var diff =  amt_2018 - amt_2017;
		var diff_pct = diff / amt_2017;

		return diff < 0;

	    })

	
	town_details.html("")
	    .classed("no-town-details",function(d){
		return d["Town Grant Name"].length < 1;
	    })
	town_details
	    .classed("loser", function(d){
		var amt_2018 = numeral(TOWN_RUNS[recipient][d["Town Grant Name"] + "_FY 2018"]).value()
		var amt_2017 = numeral(TOWN_RUNS[recipient][d["Town Grant Name"] + "_FY 2017"]).value()
		var diff =  amt_2018 - amt_2017;
		var diff_pct = diff / amt_2017;

		return diff < 0;

	    })
	    .append("div")
	    .html(function(d){
		if (d["Town Grant Name"].length < 1) return "* Town-level data not available";
		// console.log([d["Town Grant Name"]],
		// 	    TOWN_RUNS[recipient]);

		var amt_2018 = numeral(TOWN_RUNS[recipient][d["Town Grant Name"] + "_FY 2018"]).value()
		var amt_2017 = numeral(TOWN_RUNS[recipient][d["Town Grant Name"] + "_FY 2017"]).value()
		var diff =  amt_2018 - amt_2017;
		var diff_pct = diff / amt_2017;

		var ret =  "<strong>" + recipient + ":</strong> "
		    + numeral(amt_2017).format("$0a").toUpperCase()
		    + "<i class=\"fa fa-arrow-right\" aria-hidden=\"true\"></i>"
		    + numeral(amt_2018).format("$0a").toUpperCase()

		var diff_pct_str = "";
		if (!isNaN(diff_pct)) {
		    diff_pct_str = " ("
			+ numeral(diff_pct).format("+0%")
			+ ")";

		}

		
		if (numeral(amt_2017).value() == 0 && numeral(amt_2018).value() == 0)
		{
		    return "<strong>" + recipient + ":</strong> "
			+ "Funding under this grant for " + recipient + "  would remain at $0";
		    // + numeral(amt_2017).format("$0a").toUpperCase()
		    // + " in FY 2017 to " 
		    // + numeral(amt_2018).format("$0a").toUpperCase()
		    // + diff_pct_str
		    // + " in FY 2018 under the governor's executive order.";
		    
		}


		return "<strong>" + recipient + ":</strong> "
		    + "Funding under this grant for " + recipient + "  would go from "
		    + numeral(amt_2017).format("$0a").toUpperCase()
		    + " in FY 2017 to " 
		    + numeral(amt_2018).format("$0a").toUpperCase()
		    + diff_pct_str
		    + " in FY 2018 under the governor's executive order.";


		return ret + diff_pct_str;
	    });
    }
    
    picker.on("change", update_cards);
    
    grant_boxes.append("div").classed("clear-both", true);

    grant_boxes.on("click", function(){

	if (d3.select(this).selectAll(".detail").style("display") != null){
	    d3.selectAll(".detail").style("display","none");
	    d3.select(this).selectAll(".detail").style("display",null);
	}
	else
	    d3.select(this).selectAll(".detail").style("display","none");
    });

    d3.selectAll(".detail").style("display","none");

    update_cards();    
}

// get the data and go
d3.csv(DATA_FILE, go);


// MONTHS.forEach(function(m){
//     console.log(m, new Date(), new Date().getMonth(), new Date(m + " 1 2017"));
// });
