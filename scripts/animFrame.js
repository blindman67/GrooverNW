"use strict";
function AnimFrame(owner){
    this.owner = owner;
    this.manual = false;
    this.manualFrameRate = 10;
    this.paused = false;
    this.stopped = false;
    this.active = false;
    this.pauseMonitorRate = 10;
    this.pauseUpdate = this.pauseMonitor.bind(this);
    this.update = this.refresh.bind(this);
    this.frameStart = [];
    this.frameEnd = [];
    this.frameEndStack = [];
    this.time = new Date().valueOf();
    this.frameID = 0;
    this.timeData = {
        lastFrame :0,
        timeStamp :null,
        record : [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        pos : 0,
        total : 0,
        average : 0,
    };
    this.name = "AnimFrame";
    this.ready = true;
    log("Anim frame ready");
    
}
AnimFrame.prototype.addFrameStartFunction = function(func){
    this.frameStart.push(func);
}
AnimFrame.prototype.addFrameEndFunction = function(func){
    this.frameEnd.push(func);
}
AnimFrame.prototype.addFrameEndStackFunction = function(func){
    this.frameEndStack.push(func);
}
AnimFrame.prototype.stop = function(){
    this.paused = true;
    this.stopped = true;
}
AnimFrame.prototype.start = function(){
    if(!this.active){
        this.time = new Date().valueOf();
        this.active = true;
        this.stopped = false;
        this.update(this.time);
    }
}
AnimFrame.prototype.pause = function(){
    this.paused = true;
    this.stopped = true;
}
AnimFrame.prototype.unpause = function(){
    this.paused = false;    
}

AnimFrame.prototype.pauseMonitor = function(){
    this.time = new Date().valueOf();
    if(this.paused){
        if(!this.stopped){
            setTimeout(this.manualRefresh, Math.floor(1000 / this.pauseMonitorRate));        
        }else{
            this.active = false;
        }
    }else{
        this.update(this.time);
    }
}
AnimFrame.prototype.manualRefresh = function(){
    this.time = new Date().valueOf();
    this.update(this.time);
}

AnimFrame.prototype.refresh = function(time){
    var startF,endF,len,i,endS,td;
    this.frameID += 1;
    if(time !== undefined){
        td = this.timeData;
        if(td.timeStamp !== null){
            td.lastFrame = Math.floor(time-td.timeStamp);
            td.total -= td.record[td.pos%60];
            td.total += td.lastFrame;
            td.record[td.pos%60] = td.lastFrame;
            td.pos += 1;
            td.average = td.total / 60;
        }
        this.time = td.timeStamp = time;
    }else{
        this.time = new Date().valueOf();
    }
    if(this.paused){
        this.pauseUpdate();
    }else{
        if(this.manual){
            setTimeout(this.manualRefresh, Math.floor(1000 / this.manualFrameRate));
        }else{
            requestAnimationFrame(this.update);
        }
    }
    startF = this.frameStart;
    len = startF.length;
    for(i = 0; i < len; i+=1){
        startF[i](time);
    } 
    endF = this.frameEnd;
    len = endF.length;
    for(i = 0; i < len; i+=1){
        endF[i](time);
    }
    endS = this.frameEndStack;
    while(endS.length > 0){
        endS.shift()(time);
    }
}


