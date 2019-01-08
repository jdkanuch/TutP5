let bug; // Declare object
let bugs = [];

let a;
var automatas = [];

var mtxAutoBug = [];

function setup() {
    var canvas = createCanvas(1200, 800);
    canvas.parent('content-div');
    a = new Automaton(width / 2, height / 2);
    automatas.push(a);
}

function draw() {

    // Redraw Background
    background(40, 20, 0);
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
    console.log("Updating Environment");

    // Create matrix of bugs
    mtxAutoBug = createMatrix(automatas,bugs);
    console.log(mtxAutoBug);



    // Create Matrix code
    function createMatrix(rowData,coldata){
        var rowData;

        var coldata;

        var matrixA = [];

        // vector sub: p5.Vector.sub(this.pos,bugs[i].pos)

        for(i=0;i<rowData.length;i++){
            var entries = [];
            for(j=0;j<coldata.length;j++){
                var operation = p5.Vector.sub(rowData[i].pos,coldata[j].pos).mag();
                entries.push(operation);
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
    this.colorYoung = [204, 255, 153];
    this.colorOld = [0, 102, 51];

    this.ripeLimit = 10; // number of seconds until ripe
    this.timer = 0;

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
    }

    this.display = function () {
        if (frameCount % (6) == 0 && this.timer < this.ripeLimit) {
            this.timer += 0.1;
        }
        fill(this.setColor());
        ellipse(this.pos.x, this.pos.y, this.diameter, this.diameter);

    }
}

Jitter.growthRate = 1;


function mousePressed() {

    for (i = 0; i < 5; i++) {
        var offsetX = random(-40, 40);
        var offsetY = random(-40, 40);
        bug = new Jitter(mouseX + offsetX, mouseY + offsetY);
        bugs.push(bug);
    }

}


// Grow Bugs
setInterval(function () {
    bug = new Jitter(random(width - 20), random(height - 20));
    bugs.push(bug)

}, 1000 * Jitter.growthRate);