/** charts-legend.js
 * Create a simple legend
 */

var CHLIB = CHLIB || {};

// Constructor
CHLIB.legend = function(){
    this.__color_array = ["lightskyblue","tomato","gold",
    			  "magenta","lightgreen","orange"];
    this.__color_index = 0;
    this.__colors = {};
    return this;
}

CHLIB.legend.prototype.colors = function(arr){
    if (typeof(arr) == "undefined") return this.__color_array;
    this.__color_array = arr;
    return this;
}

CHLIB.legend.prototype.next_color = function(){
    var ret = this.__color_array[this.__color_index
				 % this.__color_array.length];
    this.__color_index++;
    return ret;
}

CHLIB.legend.prototype.add_item = function(label){
    if (this.__colors.hasOwnProperty(label)) return this;
    this.__colors[label] = this.next_color();
    return this;
}

CHLIB.legend.prototype.item_color = function(label){
    return this.__colors[label];
}
    
CHLIB.legend.prototype.color = function(label, color){
    if (typeof(color) == "undefined") {
	return this.__colors[label];
    }

    if (this.__colors.hasOwnProperty(label)) return this;
    
    this.__colors[label] = color;

    return this;
}

CHLIB.legend.prototype.selection = function(sel){
    if (typeof(sel) == "undefined") return this.d3selection;
    this.d3selection = sel;
    return this;
}

CHLIB.legend.prototype.draw = function(){

    var selection = this.selection();
    if (typeof(selection) == "undefined") {
	throw "CHLIB.legend.prototype.draw(): no selection set.";
    }
    
    this.selection().html("");
    
    this.d3selection = selection.append("div")
	.classed("legend", true)

    for (var k in this.__colors){

	// Add a container for the color box and the label
	var item = this.d3selection.append("div")
	    .classed("legend-item", true)
	    .style("margin-right", "10px")
	    .style("float","right");

	// Add box
	item.append("div")
	    .classed("legend-colorbox", true)
	    .style("float", "left")
	    .style("margin-right","4px")
	    .style("width", "1em")
	    .style("height", "1em")
	    .style("background-color", this.__colors[k]);

	// Add text
	item.append("div")
	    .classed("legend-label", true)
	    .style("float", "left")
	    .text(k);
    }
    this.d3selection.append("div")
	.style("clear","both");

    return this;
}

CHLIB.col_chart = function(){
    return this;
}
