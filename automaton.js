class Automaton{
    constructor(x,y){
        this.pos = createVector(x,y);
        this.vel = createVector(random(-3,3),random(-3,3));
        this.acc = createVector(0,0);
        this.r = 6;
        this.maxspeed = 4;
        this.maxF = 0.2;
        this.action = 0;
        this.mi; // my-index, the index of this automaton in the automatas[]

        this.target; // set in setTarget


        this.energy = 0;
        this.metabolicRate = 2; // number of seconds to count-down an energy unit
        this.starveLimit = -5;
        this.reproduceLimit = 4;
        this.alive = true;

        this.colorLowE = [102,0,0];
        this.colorHighE = [51,255,255];

        this.aggression = random(0,10); // to implement, more aggresive means
        //console.log("Auto born with aggression level:",this.aggression);
        // lower proximityComfort, higher maxSpeed, other stuff
        this.proximityComfort = 15 - this.aggression;

        this.desparation = true; // if flag set to true, starving will trigger adrenalineSurge.
        this.adrenalineSurge = false; // if true, override aggression with higher number

        // this.socialstatus TO IMPLEMENT, adding a graph-network of all automatons for social behaviors?

        this.disabled = false;
        this.bornOn = new Date();

        this.scaleFactor=1;

    }

    // Method to update location and other behaviors
    update(a) {
        // Update velocity
        this.vel.add(this.acc);
        // Limit speed
        this.vel.limit(this.maxspeed);
        this.pos.add(this.vel);
        // Reset acceleration to 0 each cycle
        this.acc.mult(0);

        // get my index
        this.mi = automatas.indexOf(this);

        // Action selection behaviors for our agents
        if(a.action == 0){
            a.idle();
        }
        if(a.action == 1){
            this.setTarget();
            // If a is set to seek, seek out closest bug.
            a.seek(this.target);
        }

        // Check Energy
        this.checkEnergy();

        // Stay away from other automatons
        if(automatas.length > 1){
            this.separate(automatas);
        }

        // Set scale
        this.setScale();

    }


    applyForce(force) {
        // We could add mass here if we want A = F / M
        this.acc.add(force);
    }

    // A method that determines which action to take, seek or idle
    actionSelection(bugs){
        if(this.disabled){
            this.vel.mult(0);
            let nowDate = new Date();
            if((nowDate - this.bornOn) > 3000){

                this.disabled = false;
            }
        } else {
            if(bugs.length == 0){
                this.action = 0;
            } else
            {
                this.action = 1;
            }
        }

    }



    // nothing yet
    idle(){
        return null;
    }

    checkEnergy(){
        // Check energy
        if(frameCount % (60*this.metabolicRate) == 0){
            this.energy-=0.5;
        }

        if(this.energy > this.reproduceLimit){
            this.reproduce();
            this.energy = 0;

        } else if(this.energy < this.starveLimit) {
            this.die();
        }
    }

    feed(target){
        // filters the bugs array to remove the target
        bugs = bugs.filter(b =>{
            return b != target;
        })

        // increments energy
        this.energy += target.energy;

    }

    // A method that calculates a steering force towards a target
    // STEER = DESIRED MINUS VELOCITY
    seek(target) {
        if(target != undefined){
            var desired = p5.Vector.sub(target.pos, this.pos); // A vector pointing from the location to the target

            var d = desired.mag();

            // Scale with arbitrary damping within 100 pixels
            if (d < 100) {
                var m = map(d, 0, 100, 0, this.maxspeed);
                desired.setMag(m);
            } else {
                desired.setMag(this.maxspeed);
            }
            // kill bug
            if (d < target.diameter){
                this.feed(target);
            }

            // Steering = Desired minus velocity
            var steer = p5.Vector.sub(desired, this.vel);
            steer.limit(this.maxF); // Limit to maximum steering force

            this.applyForce(steer);
        }

    }

    setTarget(){
        // New code, based on abDistanceMap[]

        // get the closest bug index by looking up the index of the
        // minimum of this automata's row
        //var closestBugIndex = abDistanceMap[this.mi].indexOf(Math.min(...abDistanceMap[this.mi]));


        // Prioritize bugs
        // sorting my row
        var myRowDistances = [];
        var sortedBugs = abDistanceMap[this.mi].sort(function(a,b){
            var priorityA = a.bugRef.energy / a.dist;
            var priorityB = b.bugRef.energy / b.dist;
            return priorityB - priorityA;
        });
        // output priority for testing
        //console.log("------")
        //for (let i = 0; i <sortedBugs.length; i++) {
        //    console.log("bug ",sortedBugs[i].bugRef.mi," priority:", 10000*(sortedBugs[i].bugRef.energy / sortedBugs[i].dist));
        //}


        // Add competition by looping through all automatas
        // in the abDistanceMap and finding any with a distance <
        // this automaton's distance
        var competition = [];

        function checkCompetition(n,me) {
            for (var q = 0; q < automatas.length; q++) {

                if(q == me.mi) {
                    continue;
                }

                // if another auto has the same target and is closer to it than me
                else if(automatas[q].target == sortedBugs[n].bugRef
                    && abDistanceMap[q][sortedBugs[n].bugRef.mi] < abDistanceMap[me.mi][sortedBugs[n].bugRef.mi]){
                    competition.push(automatas[q]);
                }
            }
            if(competition.length > 2 + me.aggression){
                console.log("Too much comp.");
                me.target = sortedBugs[n+1].bugRef;
            }
            else {
                me.target = sortedBugs[n].bugRef;
            }
        }
        checkCompetition(0,this);
        // If more than an arbitrary number of automatons
        // are closer, choose next closest target

        // Set swarm size
        /*
        if(competition.length > 15){
            console.log("Too much competition!");

            // next closest
            //targetIndex = targetIndex++;
            // using random
            targetIndex = Math.floor(Math.random()*targetMap.length);
        }
        */

    }



    reproduce(){
        a = new Automaton(this.pos.x + 10, this.pos.y + 10);
        automatas.push(a);
        // disabled at birth
        a.disabled = true;
    }

    // To sleep, perchance to dream...
    die(){

        console.log("Dead.");
        this.alive = false;

    }


    separate(v){
        let desiredseparation = this.r * this.proximityComfort;
        let sum = createVector();
        let count = 0;
        // For every automaton in the system, check if it's too close
        for (let i = 0; i < v.length; i++) {
            let d = p5.Vector.dist(this.pos, v[i].pos);
            // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
            if ((d > 0) && (d < desiredseparation)) {
                // Calculate vector pointing away from neighbor
                let diff = p5.Vector.sub(this.pos, v[i].pos);
                diff.normalize();
                diff.div(d); // Weight by distance
                sum.add(diff);
                count++; // Keep track of how many
            }
        }
        // Average -- divide by how many
        if (count > 0) {
            sum.div(count);
            // Our desired vector is the average scaled to maximum speed
            sum.normalize();
            sum.mult(this.maxspeed);
            // Implement Reynolds: Steering = Desired - Velocity
            let steer = p5.Vector.sub(sum, this.vel);
            steer.limit(this.maxF);
            this.applyForce(steer);
        }
    }

    clicked(){
        let d = dist(mouseX, mouseY, this.pos.x, this.pos.y);
        if(d < this.r * 2*this.scaleFactor){
            console.log("My Aggression : ", this.aggression);
            if(this.target != undefined){
                console.log("My Target : ", this.target.mi);
            }

        }

    }

    setScale(){
        if(this.energy>0){
            this.scaleFactor = 1+(0.2*this.energy);
        }
        else {
            this.scaleFactor = 1;
        }
    }


    setColor(){
        var r;
        var g;
        var b;

        // maps this.energy from a value ranging in this.starvationLimit to this.reproduce
        // to an rgb value based on colors
        r = map(this.energy, this.starveLimit, this.reproduceLimit, this.colorLowE[0],this.colorHighE[0]);
        g = map(this.energy, this.starveLimit, this.reproduceLimit, this.colorLowE[1],this.colorHighE[1]);
        b = map(this.energy, this.starveLimit, this.reproduceLimit, this.colorLowE[2],this.colorHighE[2]);
        var c = color(r, g, b);
        return c;
    }

    display() {


        // Draw a triangle rotated in the direction of velocity
        var theta = this.vel.heading() + PI / 2;
        fill(this.setColor());
        stroke(10);
        strokeWeight(1);
        push();
        translate(this.pos.x, this.pos.y);
        rotate(theta);
        scale(this.scaleFactor);
        beginShape();
        vertex(0, -this.r * 2);
        vertex(-this.r, this.r * 2);
        vertex(this.r, this.r * 2);
        endShape(CLOSE);
        pop();
    }
}