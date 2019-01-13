class FlowField {
    constructor(){
        // Class for the noise field
        this.inc = 0.1;
        this.scl = 10;
        this.cols
        this.rows;

        this.zoff = 0; // changes the flow field with time

        this.flowfield;
    }

    // sets dimensions of flowfield array.
    setupFlowField(){
        // scaling to grid
        this.cols = floor(width / this.scl);
        this.rows = floor(height / this.scl);

        this.flowfield = new Array(this.cols * this.rows);
    }

    updateFlowField() {
        // Flow Field
        var yoff = 0;
        for (var y = 0; y < this.rows; y++) {
            var xoff = 0;
            for (var x = 0; x < this.cols; x++) {

                var index = x + y * this.cols; // way to get a 1d index from 2d?
                var fieldValue = noise(xoff, yoff, this.zoff); // get value of noise wave at x,y,z-off
                this.flowfield[index] = fieldValue;
                xoff += this.inc; // increment the noise values along the noise-wave
                //stroke(0, 50);
                // vector lines
                // push();
                // translate(x * scl, y * scl);
                // rotate(v.heading());
                // strokeWeight(1);
                // line(0, 0, scl, 0);
                // pop();

            }
            yoff += this.inc;

            this.zoff += 0.0003;
        }
    }

}