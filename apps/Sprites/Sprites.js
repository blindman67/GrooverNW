"use strict";
function Sprites(owner){
    this.owner = owner;
    this.name = "Sprites";
    this.ready = true;
    owner.bitmaps.startLoad("icons");
    this.images = {};
    this.images.background = owner.bitmaps.load("icons","icons/BlueGradBackground.png");
}

Sprites.prototype.display = function(){
    
    var w = this.render.ctx.canvas.width;
    var h = this.render.ctx.canvas.height;
    var bw = 100;
    var bh = 200;
    if(this.ready){
        if(this.images.background.ready){
            this.render.drawBackground(this.images.background.image);
            this.render.restoreDefaults();
            this.render.ctx.strokStyle = "black";
            this.render.ctx.beginPath();
            this.render.ctx.moveTo(w/2 - bw/2, h/2 - bh /2);
            this.render.ctx.lineTo(w/2 + bw/2, h/2 - bh /2);
            this.render.ctx.lineTo(w/2 + bw/2, h/2 + bh /2);
            this.render.ctx.lineTo(w/2 - bw/2, h/2 + bh /2);
            this.render.ctx.closePath();
            this.render.ctx.stroke();
        }
        
    }
 
}

groover.application = Sprites;


