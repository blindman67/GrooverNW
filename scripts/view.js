"use strict";
function View(owner){
    this.owner = owner;
    this.width;    
    this.height;    
    this.ctx;  // main display
    this.views = [];
    this.render;
    this.refreshed = true;
    this.ready = true;
    log("View manager ready");
}
View.prototype.refreshedDone = function(){
    this.refreshed = false;
    log("View refreshed");
}
View.prototype.refresh = function(){
    this.canvas = this.owner.canvas;
    this.ctx = this.owner.canvas.ctx;
    this.width = this.owner.canvas.width;
    this.height = this.owner.canvas.height;
    this.render = this.owner.render;
    this.refreshed = true;
    if(this.owner.mouseKeyboard !== undefined && this.owner.mouseKeyboard.viewUpdated !== undefined){
        this.owner.mouseKeyboard.viewUpdated();
    }
    this.render.viewUpdated();
    
}

View.prototype.create = function(width,height){
    var frame = {};
    frame.image = $C("canvas");
    frame.image.width = width;
    frame.image.height = height;
    frame.ctx = frame.image.getContext("2d");
    this.views.push(frame);
    return frame;
    
    
}