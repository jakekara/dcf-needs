// viz illustrating two ways of score DCF's ability to meet children's
// needs

var window_width = 0;

var init = function(){
    window_width == window.innerWidth;
    
    var container = d3.select("#container");
    container.html("");
    var max_rows = 20;
    var row_min = 1;
    var col_min = 0.85;
    var row_pass_pct = 0.8;

    d3.select(".header").text("Redefining success means different outcomes based on the same data");
    d3.select(".explainer").text("(Each row represents one child based on "
				 + max_rows
				 + " randomly selected records.)");
    d3.select(".sourceline").text("Source: SOURCE NEEDED");
    d3.select(".byline").text("Jake Kara / CT Mirror");


    var add_legend = function(){
	var legend = new CHLIB.legend()
	    .selection(d3.select("#legend"))
	    .colors(["tomato","palegreen","lightskyblue","gold"])
	    .add_item("Goal failure")
	    .add_item("Goal success")
	    .add_item("Need met")
	    .add_item("Need unmet")
	    .draw()
    };
    add_legend();
    
    
    var update_row_summary = function(txt){
	d3.select(".summary_1").html("<strong>Old way: </strong>" + txt);
    }
    var update_col_summary = function(txt){
	d3.select(".summary_2").html("<strong>New way: </strong>" + txt);
    }

    var row_passes = function(row){
	var min = 0.1;
	var total_fields = Object.keys(row).length;
	var ok_fields = 0;

	for (var k in row){
	    if (row[k] == true) ok_fields++;
	}
	
	return ok_fields / total_fields >= min;
    }
    
    var tally_rows = function(){

	var rows_passed = 0;
	var rows_failed = 0;
	
	for (var i = 0; i < data.length; i++){
	    var rects = d3.selectAll("rect.val-box[data-row='"+i+"']");
	    var pass = tally_nodes(rects, row_min);

	    var sel = "rect.pass-fail[data-row='"+i+"']";
	    d3.select(sel)
		.attr("data-passed",pass)

	    if (pass){
		rows_passed++;
	    }
	    else {
		rows_failed++;
	    }
	}

	var score = rows_passed / (rows_passed + rows_failed);
	var passed = score >= row_pass_pct 
	var pct = Math.round(score * 100);
	var did_did_not = "succeeded in meeting";
	if (!passed){
	    did_did_not = "failed to meet";
	}
	
	update_row_summary
	("Out of " + (rows_passed + rows_failed) + " cases,"
	 + " " + rows_passed + ", or " + pct + " % of children had 100%"
	 + " of their needs met."
	 + " DCF " + did_did_not + " its goal based on the current metric.");
    }

    var tally_cols = function(){

	var cols_passed = 0,
	    cols_failed = 0;
	var fails = [];
	
	for (var i in headers){
	    var rects = d3.selectAll("rect.val-box[data-col='"+i+"']");
	    var pass = tally_nodes(rects, col_min);

	    d3.select("rect.pass-fail[data-col='"+i+"']")
		.attr("data-passed",pass);

	    if (pass){
		cols_passed++;
	    }
	    else {
		cols_failed++;
		fails += headers[i];
	    }
	}

	if (cols_failed > 0){
	    update_col_summary("In " + cols_failed + " of the "
			       + (cols_passed + cols_failed) +  " categories,"
			       
			   + " less than 85% of children's needs were being met."
			       + " The problem categories include: "
			       + (headers.join(", ")) + ".");
	}
    }


    var overall_width = function(){
	return window.innerWidth;
    };
    
    var table_svg = container.append("svg")
	.attr("width", overall_width() + "px")
    // .attr("height", window.innerHeight + "px")
	.classed("needs-table", true)
    table_svg.html("");
    var table = table_svg
	.append("g").classed("toplevel", true);
    
    var header = table.append("g")
	.classed("header", true)
    var rows_g = table.append("g")
	.classed("row_container", true)

    var header_selection = null;
    var header_height = 0;
    var headers = [];
    var data = [];    

    var cell_width = function(){
	return  overall_width() / (headers.length + 1);
    }

    var row_height = function(){
	// return (window.innerHeight - header_height) / data.length;
	return 18;
    }
    
    var add_header = function(header_list){
	headers = header_list;
	
	headers.forEach(function(title, i){
	    
	    var x = (0.5 + i) * cell_width();
	    
	    var header_item = header.append("text")
		.classed("header-item", true)
		.attr("x", x)
		.attr("data-field",title)
		.text(" " + title);

	    var bbox = function(){ return header_item.node().getBBox()};

	    var y = bbox().height;
	    header_item.attr("y",y);

	    header_item.attr("transform",
			     "rotate(-45," + (x) + "," + y + ")");
	    // + " translate(0," + bbox().width + ")")
	    // "translate(" + x + "," + bbox().width + ")"
	    // + " rotate(-90)" )

	});

	var header_bbox = header.node().getBBox();
	header_height = header_bbox.height;
	header.attr("transform", "translate(0," + header_height + ")");
	header_selection = header;
    }

    // Translate text status description to true or false
    var met = function(desc){
	// return [true, false][Math.round(Math.random())];
	var ret = false;
	switch(desc.toUpperCase().trim()){
	case "OPTIMAL":
	case "N/A TO CASE TYPE":
	case "VERY GOOD":
	    return true;
	    break;
	case "MARGINAL":
	    return false
	    break
	}
	return ret;

    }

    var add_footer = function(){

	var footer = rows_g.append("g")
	
	var y = footer_y;
	
	for (var i in headers){
	    var header = headers[i];
	    footer.append("rect")
		.attr("data-col", i)
		.classed("pass-fail", true)
		.attr("y",y)
		.attr("x", i * cell_width())
		.attr("height", row_height())
		.attr("width", cell_width());
	}

	// Adjust y offset
	var header_bbox = d3.select("g.header").node().getBoundingClientRect();
	var y_offset = header_bbox.height; // + header_bbox.top;
	rows_g.attr("transform","translate(0," + y_offset + ")");
    }

    var add_row = function(obj, i){
	
	var row = rows_g.append("g")
	    .attr("data-row", i)
	    .classed("row", true);
	var header_bbox = header_selection.node().getBoundingClientRect();
	var y =  (i + 1) * row_height();
	var last_x = 0;
	var width = cell_width();
	headers.forEach(function(field, j){

	    if (obj.hasOwnProperty(field)){
		var status = met(obj[field]);
		row.append("rect")
		    .classed("val-box", true)
		    .attr("data-row",i)
		    .attr("data-col", j)
		    .attr("data-field", field)
		    .classed("met",status)
		    .classed("unmet",!status)
		    .attr("y", y)
		    .attr("x", width * j)
		    .attr("width", width)
		    .attr("height", row_height())
		    .on("click",function(){
			var met = d3.select(this).classed("met");
			d3.select(this).classed("met", !met);
			d3.select(this).classed("unmet", met);
			tally_rows();
			tally_cols();
		    });
		last_x = width * j + width;
	    }
	    else {
		throw "ERROR: obj missing field: '" + field + "'";
	    }
	});
	
	row.append("rect")
	    .classed("pass-fail", true)
	    .attr("data-row",i)
	    .attr("y",y)
	    .attr("x", last_x)
	    .attr("height", row_height())
	    .attr("width", width);

	footer_y = y + row_height();
    }


    var tally_nodes = function(node_arr, min){
	var good = 0;
	var bad = 0;
	var total = 0;
	
	for (var j in node_arr.nodes()){
	    var nd = node_arr.nodes()[j];
	    if (d3.select(nd).classed("met")){
		good++;
	    }
	    else {
		bad++;
	    }
	    total++;
	}

	
	var score = good / total;
	var pass = score >= min;
	return pass;
    }


    var resize = function(){

	
	var svg_height = table.node().getBoundingClientRect().height;
	var g_bbox = d3.select("g.toplevel").node().getBBox();
	var g_height = g_bbox.height + g_bbox.y

	table_svg.attr("height", g_height + "px");
	container.attr("height", g_height + "px");
    }

    var go = function(d){

	// get 10 random rows;
	data = [];
	for (var i = 0; i < max_rows; i++){
	    data.push(d[Math.floor(Math.random()* d.length)]);
	}
	const ignores = ["Area Office"];
	const headers = Object.keys(data[0]).filter(function(k){
	    return (ignores.indexOf(k) < 0);
	});
	add_header(headers);
	data.forEach(add_row);
	add_footer();
	
	resize();
	tally_rows();
	tally_cols();
    };
    
    d3.csv("data/needs.csv", function(data){
	go(data);
    });
}

init();

d3.select(window).on("resize", function(){
    if (window_width == window.innerWidth) return;
    init();
});
