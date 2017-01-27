var cols,rows;
var w = 50;
var grid = [];
var current;
var stack = [];
var running;
var startButton;
var saveButton;
var message;
var widthText;
var heightText;
var wText;
var widthSlide;
var heightSlide;
var wSlide;
var test;

function setup() {
	//frameRate(2);
	createCanvas();
	
	// start paused on page load
	running = false;
	
	// set up canvas and DOM Elements
	createControls();
	createNewGrid();
	updateText();
}

function draw() {
	// based on: https://en.wikipedia.org/wiki/Maze_generation_algorithm <-- recursive backtracker
	if(running){
		// show all cells
		//background(255);
		for (var i=0; i<grid.length; i++){
			if(grid[i].visited || grid[i].finished){
				if(grid[i].changed){
					grid[i].show();
				}
			}
		}
		
		// step 1: Choose random unvisited neighbour of current cell
		var next = current.checkNeighbours();
		if (next){ // "if there are any unvisited neighbours"
			// step 2: push current cell to stack
			stack.push(current);
			
			// step 3: remove wall between current cell and chosen cell
			removeWalls(current,next);
			current.changed = true;
			next.changed = true;
			
			// step 4: make chosen cell the current cell, and mark it as visited
			current = next;
			current.visited = true;
			current.highlight();
			
		}else if(stack.length>0){ // "if stack is not empty"
			// mark cells as "finished" to remove path highlighting
			current.finished = true;
			current.changed = true;
			current = stack.pop();	
			current.highlight();
		}else{
			// if stack is empty, then maze generation is complete
			running = false;
			message = createP('Maze Generated');
			current.highlight('white');
			startButton.html("Start/Restart");
			
			// allow for exporting maze as png image
			saveButton = createButton('Save');
			saveButton.mousePressed(saveMaze);
		}
	}
}

function createNewGrid(){
	// resize the maze when sliders are changed
	resizeCanvas(widthSlide.value(),heightSlide.value());
	
	// recalculate rows and cols
	w = wSlide.value();
	rows = floor(height/w);
	cols = floor(width/w);
	
	// create array of cell objects
	grid = [];
	for (var j = 0; j<rows; j++){
	  for(var i = 0; i<cols; i++){
		  // for each spot in each row, create a new cell object and push it to the grid[] array
		  var cell = new Cell(i,j);
		  grid.push(cell);
	  }
	}	
	
	// open up a wall for entrance and exit
	grid[0].walls[3] = false;
	grid[grid.length-1].walls[1] = false;
	
	// display grid on a white background
	background(255);
	for (var i=0; i<grid.length; i++){
			grid[i].show();
	}
}

function updateText(){
	// get rid of "finished" message and save button
	if(message){
		message.remove();
	}
	if(saveButton){
		saveButton.remove();
	}
	
	// stop maze generation
	running = false;
	startButton.html("Start/Restart");
	
	// update text by sliders
	widthText.html("width = "+widthSlide.value()+" pixels");
	heightText.html("height = "+heightSlide.value()+" pixels");
	wText.html("cell size = "+wSlide.value()+" pixels");
}

function createControls(){
	// start button to begin maze generation
	startButton = select("#startButton");//createButton('Start');
	startButton.mousePressed(start);
	
	// update width
	widthText = select("#widthText"); //createP('width in pixels');
	widthSlide = select("#widthSlide");//createSlider(201,801,501,25);
	widthSlide.mouseReleased(createNewGrid);
	widthSlide.input(updateText);
	
	// update height
	heightText = select("#heightText"); //createP('height in pixels');
	heightSlide = select("#heightSlide"); //createSlider(201,801,501,25);
	heightSlide.mouseReleased(createNewGrid);
	heightSlide.input(updateText);
	
	// update cell size
	wText = select("#wText"); //createP('cell size in pixels');
	wSlide = select("#wSlide"); //createSlider(10,50,25,5);
	wSlide.mouseReleased(createNewGrid);
	wSlide.input(updateText);
}

function start(){
	if(running){
		// stop running
		running = false;
		
		// remove "finished" messages if shown
		if(message){
		message.remove();
		}
		if(saveButton){
			saveButton.remove();
		}
		
		// update button text
		startButton.html("Start/Restart")
	}else{
		// reset all cells
		createNewGrid();
		
		// mark current cell as visited
		current = grid[0];
		current.visited = true;
		current.changed = true;
		current.highlight();
		
		// clear the stack and start running on the first cell
		stack = [];
		running = true;

		// update button text
		startButton.html("Stop");
	}
    
	
	
}

function saveMaze(){
	saveCanvas('maze.png');
}

function index(i,j){
	// return index of a cell at a given row and col in the grid array
	if(i<0 || i>cols-1 || j<0 || j>rows-1){
		return -1; // invalid index
	}else{
		return i + j*cols;
	}
}

function removeWalls(a,b){
	// determine adjacency and remove appropriate walls from two neighbouring cells
	var x = a.i - b.i;
	var y = a.j - b.j;
	
	if (x == 1){
		a.walls[3] = false; // left
		b.walls[1] = false; // right
	}
	if (x == -1){
		a.walls[1] = false; // right
		b.walls[3] = false;	// left
	}
	if (y == 1){
		a.walls[0] = false; // top
		b.walls[2] = false; // bottom
	}
	if (y == -1){
		a.walls[2] = false; // bottom
		b.walls[0] = false; // top
	}
}

function Cell(i,j){
	this.i = i;
	this.j = j;
	
	// wall order: top, right, bottom, left
	this.walls = [true,true,true,true];
	this.visited = false; // indicates whether a cell has been checked yet (removes from neighbour list of adjacent cells)
	this.finished = false; // indicates backtracking has already happened and the path beyond has already been visited
	this.changed = true; // indicates need to be redrawn
	
	// show cell walls
	this.show = function(){
		var x = this.i*w;
		var y = this.j*w;
		
		// draw black line for any wall of the cell
		noStroke();
		fill(255);
		rect(x,y,w,w);
		
		stroke(0);
		if(this.walls[0]){
			line(x,y,x+w,y);      	// top
		}
		if(this.walls[1]){
			line(x+w,y,x+w,y+w);	// right
		}
		if(this.walls[2]){
			line(x,y+w,x+w,y+w);	// bottom	
		}
		if(this.walls[3]){
			line(x,y,x,y+w);		// left
		}
		
		// if visited, but unfinished, highlight red. If visited and finished, fill white
		if(this.visited){
			if(this.finished){
				fill(255);
			}else{
				fill(255,0,0,50);
			}
			noStroke();
			rect(x+1,y+1,w-1,w-1);
		}
		this.changed = false;
	}
	
	// method to highlight a cell a given colour
	this.highlight = function(c){
		noStroke();
		if(c == undefined)
			c = 'red';
		fill(c);
		
		var x = this.i*w;
		var y = this.j*w;
		
		rect(x+1,y+1,w-1,w-1);
	}
	
	// checks neighbouring cells and returns a random unvisited neighbour if it exists
	this.checkNeighbours = function(){
		var neighbours = [];
		
		// neighbouring cells
		var top = grid[index(i,j-1)];
		var right = grid[index(i+1,j)];
		var bottom = grid[index(i,j+1)];
		var left = grid[index(i-1,j)];
		
		// if it exists and has not yet been visited, add to the list
		if(top && !top.visited){
			neighbours.push(top);
		}
		if(right && !right.visited){
			neighbours.push(right);
		}
		if(bottom && !bottom.visited){
			neighbours.push(bottom);
		}
		if(left && !left.visited){
			neighbours.push(left);
		}
		
		// if there are unvisited neighbours in the list, pick one at random and return
		if (neighbours.length>0){
			var r = floor(random(0,neighbours.length));
			return neighbours[r];
		}else{
			return undefined;
		}
	}
}
