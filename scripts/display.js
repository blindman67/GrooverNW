"use strict";
function Display(owner){
    this.owner = owner;
    this.width;    
    this.height;    
    this.ctx;  // main display
    this.displayList = [];
    this.render;
    this.refreshed = true;
    this.ready = true;
    log("display manager ready");
}
Display.prototype.refreshedDone = function(){
    this.refreshed = false;
    log("Display refreshed");
}
Display.prototype.refresh = function(){
    this.canvas = this.owner.canvas;
    this.ctx = this.owner.canvas.ctx;
    this.width = this.owner.canvas.width;
    this.height = this.owner.canvas.height;
    this.render = this.owner.render;
    this.refreshed = true;
    this.owner.mouseKeyboard.displayUpdate();
    this.render.displayUpdate();
    
}

Display.prototype.createDisplay = function(width,height){
    var frame = {};
    frame.image = $C("canvas");
    frame.image.width = width;
    frame.image.height = height;
    frame.ctx = frame.image.getContext("2d");
    this.displayList.push(frame);
    return frame;
    
    
}