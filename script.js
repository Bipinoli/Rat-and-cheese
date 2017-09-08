function Node(x, y) {
	this.x = x;
	this.y = y;
	this.pixelx = x*nodeSize;
	this.pixely = y*nodeSize;
	this.g = 100000000;
	this.f = 0;
	this.color;
	this.obstacle = false;
	this.visited = false;
	this.parentx = 0;
	this.parenty = 0;
}

var srcColor = [222,50,10];
var sinkColor = [10,50,222];
var blockColor = [10,222,50];
var exploredColor = [225,225,0];
var scoutColor = [255,255,100];
var unchartedColor = [122,122,122];
var nodeSize = 20;
var cols = 480;
var rows = 480;
var alreadyRun = false;

var sinkx;
var sinky;
var srcx;
var srcy;

var mouseClickCount = 2;

var c = cols/nodeSize;
var r = rows/nodeSize;

var graph = new Array(r);
for (var i=0; i<c; i++)
	graph[i] = new Array(c);

for (var i=0; i<r; i++)
	for (var j=0; j<c; j++) 
		graph[i][j] = new Node(i,j);


function setup() {
	createCanvas(cols,rows);
	background(0);
	for (var i=0; i<r; i++)
		for (var j=0; j<c; j++) {
			var node = graph[i][j];
			var color = unchartedColor;
			node.color = color;
		}
}

function draw() {
	if (!alreadyRun && mouseIsPressed) 
		createBlocks();
	// for (var i=0; i<r; i++)
	// 	for (var j=0; j<c; j++) {
	// 		var node = graph[i][j];
	// 		stroke(node.color);
	// 		fill(node.color);
	// 		rect(node.pixelx, node.pixely, nodeSize, nodeSize);
	// 	}
}

function mouseClicked() {
	if (mouseClickCount > 0 &&
		mouseX < cols && mouseX >= 0 &&
		mouseY >= 0 && mouseY < rows )
	{
		var x = Math.floor((mouseX / cols) * c);
		var y = Math.floor((mouseY / rows) * r);
		var node = graph[x][y];
		var color;
		switch (mouseClickCount) {
			case 2: 
				color = srcColor;
				srcx = x;
				srcy = y;
				node.g = 0;
				break;
			case 1: 
				color = sinkColor;
				sinkx = x;
				sinky = y;
		}
		stroke(color);
		fill(color);
		node.color = color;
		rect(node.pixelx, node.pixely, nodeSize, nodeSize);
		mouseClickCount -= 1;
	}
	return false; // to disable the default behaviour
}

function createBlocks() {
	if (mouseClickCount <= 0 &&
		mouseX < cols && mouseX >= 0 &&
		mouseY >= 0 && mouseY < rows ) 
	{
		var x = Math.floor((mouseX / cols) * c);
		var y = Math.floor((mouseY / rows) * r);
		var node = graph[x][y];
		node.obstacle = true;
		var color = blockColor;
		node.color = color;
		stroke(color);
		fill(color);
		rect(node.pixelx, node.pixely, nodeSize, nodeSize);
	}
}

function run() {
	if (alreadyRun) return;
	alreadyRun = true;
	noLoop();
	aStar();
	// var node = graph[sinkx][sinky];
	// while (node.x != srcx || node.y != srcy) {
	// 	redraw();
	// 	var parent  = graph[node.parentx][node.parenty];
	// 	stroke(srcColor);
	// 	fill(srcColor);
	// 	rect(node.pixelx, node.pixely, nodeSize, nodeSize);
	// 	node = parent;
	// }
	loop();
}


/////////////////////////////////////////////////////////////////
////////////////// A* Pathfinding Algorithm /////////////////////
/////////////////////////////////////////////////////////////////

function aStar() {
	var pq = new priority_queue(); // priority queue of nodes
	pq.push(graph[srcx][srcy]);
	graph[srcx][srcy].visited = true;

	while (!pq.empty()) {
		var root = pq.pop();
		//graph[root.x][root.y].color = exploredColor;

		stroke(exploredColor);
		fill(exploredColor);
		rect(root.pixelx, root.pixely, nodeSize, nodeSize);

		redraw();


		if (root.x == sinkx && root.y == sinky) 
			return;

		for (var i=-1; i<=1; i++)
			for (var j=-1; j<=1; j++) {
				var childx = root.x+i;
				var childy = root.y+j;
				if (childx >= 0 && childx < r &&
					childy >= 0 && childy < c)
				{
					var child = graph[childx][childy];
					if (!child.obstacle) {
						var childh = (Math.abs(child.x - sinkx) + Math.abs(childy - sinky))*10;
						var dist = Math.floor( Math.sqrt(Math.abs(i) + Math.abs(j)) * 10 );
						if (child.g > root.g + dist) {
							child.g = root.g + dist;
							child.parentx = root.x;
							child.parenty = root.y;
						}

						child.f = child.g + childh;
						if (!child.visited) {
							child.visited = true;
							child.parentx = root.x;
							child.parenty = root.y;
							graph[child.x][child.y].color = scoutColor;
							pq.push(child);
						} else pq.update(child);
					}
				}
			}
	}
}


// priority_queue of nodes
function priority_queue() {
	this.arr = new Array();
	this.size = 0;
	this.push = function(nd) {
		// duplicate is not allowed in a priority_queue
		for (var i=0; i<this.arr.length; i++) {
			if (this.arr[i].x == nd.x && this.arr[i].y == nd.y)
				return;
		}

		this.arr.push(nd);
		console.log("inside priority_queue");
		console.log(nd);
		console.log(this.arr);
		this.size += 1;
		// sorted in descending order
		// doing insertion sort as all the previous items are already sorted 
		// it will just O(n) operation
		for (var i=this.size-2; i>=0; i--) {
			if (this.arr[i].f < this.arr[i+1].f) {
				var temp = this.arr[i];
				this.arr[i] = this.arr[i+1];
				this.arr[i+1] = temp;
			} 
			else break;
		}
	}
	this.empty = function() {
		return this.size <= 0;
	}
	this.pop = function() {
		this.size -= 1;
		return this.arr.pop();
	}
	this.update = function(node) {
		// search for that node
		// if found delete that 
		// and again insert from graph[i][j] pos so that 
		// there will be updated node in priority_queue
		for (var i=0; i<this.size; i++) {
			if (this.arr[i].x == node.x && this.arr[i].y == node.y) {
				for (var j=i; j<this.size-1; j++) 
					this.arr[j] = this.arr[j+1];
				this.pop();
				this.push(node);
				return;
			}
		}
	}	
}