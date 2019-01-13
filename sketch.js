let bug; // Declare object
let bugs = [];

let a;
var automatas = [];

var abDistanceMap = [];
var running = true;

var ff;

function setup() {
    var canvas = createCanvas(1200, 800);
    canvas.parent('content-div');

    // Flow field setup
    ff = new FlowField();
    ff.setupFlowField();

    a = new Automaton(width / 2, height / 2);
    automatas.push(a);
    canvas.mousePressed(handleClicks);

}

function draw() {
    if (!running) return;

    ff.updateFlowField();

    // Redraw Background
    background(0, 0, 39);
    stroke(0);

    // Process Environment and entities
    updateEnvironment();

    // Process bugs
    for (i = 0; i < bugs.length; i++) {
        bugs[i].move();
        bugs[i].display()
    }

    // Process Automatas
    for (j = 0; j < automatas.length; j++) {
        if (automatas[j].alive) {
            automatas[j].actionSelection(bugs);
            automatas[j].update(automatas[j]);
            automatas[j].display();
        } else {
            automatas = automatas.filter(auto => {
                return auto != automatas[j];
            });
            console.log("Auto Died :(");
        }

    }

    let mouse = createVector(mouseX, mouseY);

    // Draw an ellipse at the mouse position
    fill(127);
    stroke(200);
    strokeWeight(2);
    ellipse(mouse.x, mouse.y, 12, 12);


}


function updateEnvironment(){
    // Matrix of all automatas and their positions to all bugs
    abDistanceMap =[];
    abDistanceMap = createMatrix(automatas,bugs);

    document.getElementById("population").innerHTML = "Population: " + automatas.length;


    // Create Matrix code
    function createMatrix(rowData,coldata){
        var rowData;

        var coldata;

        var matrixA = [];

        for(i=0;i<rowData.length;i++){

            var entries = [];
            var operation;
            for(j=0;j<coldata.length;j++){
                // Code for useful operations
                operation = p5.Vector.sub(rowData[i].pos,coldata[j].pos).mag();
                var bRef = {
                    "dist" : operation,
                    "bugRef"  : coldata[j]
                };
                entries.push(bRef);
            }
            matrixA.push(entries);
        }
        return matrixA;
    }

}


// JitterBugs
function Jitter(x, y) {
    //let growthRate = 3;
    // Attributes
    this.pos = createVector(x, y);
    this.diameter = random(10, 30);
    this.speed = 1;
    this.colorYoung = [238,232,170];
    this.colorOld = [0, 128, 51];

    // My index in bugs[]
    this.mi;

    // biophysics
    this.sizeNormalized = map(this.diameter,10,30,1,3);
    this.reproduceThreshold = 1.5; // energy req. to reproduce
    this.ripeLimit = 3; // number of seconds until ripe
    this.timer = 0;
    this.energy = null;
    this.epm = 1; // energy per mass unit (diameter normalized)

    this.setColor = function () {
        var r;
        var g;
        var b;

        // maps this.energy from a value ranging in this.starvationLimit to this.reproduce
        // to an rgb value based on colors
        r = map(this.timer, 0, this.ripeLimit, this.colorYoung[0], this.colorOld[0]);
        g = map(this.timer, 0, this.ripeLimit, this.colorYoung[1], this.colorOld[1]);
        b = map(this.timer, 0, this.ripeLimit, this.colorYoung[2], this.colorOld[2]);
        var c = color(r, g, b);
        return c;
    }

    // Methods
    this.move = function () {
        this.pos.x += random(-this.speed, this.speed);
        this.pos.y += random(-this.speed, this.speed);

        // get my index
        this.mi = bugs.indexOf(this)

        this.caluculations(); // caculate energy, reproduction, others.
    }

    this.display = function () {
        if (frameCount % (6) == 0 && this.timer < this.ripeLimit) {
            this.timer += 0.1;
        }
        noStroke();
        fill(this.setColor());
        ellipse(this.pos.x, this.pos.y, this.diameter, this.diameter);

    }

    // thermodynamics and metabolics
    this.caluculations = function(){
        this.energy = (this.epm*this.sizeNormalized*(this.timer / this.ripeLimit));
        if(this.energy*( ff.flowfield[floor(this.pos.x / ff.scl) + floor(this.pos.y /ff.scl) * ff.scl]) > this.reproduceThreshold){
            this.reproduce();
            this.energy = 0;
            this.timer = 0;
            console.log("Plankton Split!");
        }
    }

    // reproduction
    this.reproduce = function(){
        bug = new Jitter(this.pos.x + random(20,50), this.pos.y + random(20,50));
        bugs.push(bug);
    }

}

Jitter.growthRate = 3;


function handleClicks() {
    // Shift-Click adds food
    if(keyIsDown(SHIFT)){
        for (i = 0; i < 5; i++) {
            var offsetX = random(-40, 40);
            var offsetY = random(-40, 40);
            bug = new Jitter(mouseX + offsetX, mouseY + offsetY);
            bugs.push(bug);
            bug.diameter = 35;
            bug.timer = 10;
        }
    }

    // clicking on an auto shows info
    for (let i = 0; i < automatas.length; i++) {
        automatas[i].clicked();
    }

    //console.log("Flow Field index:", ff.flowfield[floor(mouseX / ff.scl) + floor(mouseY / ff.scl) * ff.scl]);


}

// Grow Bugs

setInterval(function () {
    // Spawn Plankton based on flowfield
    if(running){
        // Pick a random number z between random(width - 20), random(height - 20)
        // if the ff value is > 0.5, spawn a plankton
        let zx = random(width - 20);
        let zy = random(height - 20);
        if(ff.flowfield[floor(zx / ff.scl) + floor(zy /ff.scl) * ff.scl] > 0.65){
            bug = new Jitter(zx, zy);
            bugs.push(bug);
        }
    }
}, 50 , Jitter.growthRate);


function keyPressed(){
    if(key == 'p'){
        running = !running // flip the boolean
    }

}