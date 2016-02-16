"use strict";
function Sprites(owner){
    this.owner = owner;
    this.time;
    this.view = this.owner.view;
    this.render = this.owner.render;
    this.bitmaps = this.owner.bitmaps;
    this.MK = this.owner.mouseKeyboard;
    this.name = "Sprites";
    this.ready = true;
    this.bitmaps.startLoad("icons");
    this.images = {};
    this.images.background = this.bitmaps.load("icons","icons/BlueGradBackground.png");
}

Sprites.prototype.display = function(){

    if(this.ready){
        if(this.images.background.ready){
            this.render.drawBackground(this.images.background.image)
        }
        
    }
 
}

groover.application = Sprites;


