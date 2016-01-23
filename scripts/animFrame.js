"use strict";
function AnimFrame(owner){
    this.owner = owner;
    this.manual = false;
    this.manualFrameRate = 10;
    this.pause = false;
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
    this.pause = true;
    this.stopped = true;
}
AnimFrame.prototype.start = function(){
    if(!this.active){
        this.active = true;
        this.stopped = false;
        this.update();
    }
}
AnimFrame.prototype.pauseMonitor = function(){
    this.time = new Date().valueOf();
    if(this.pause){
        if(!this.stopped){
            setTimeout(this.update, Math.floor(1000 / this.pauseMonitorRate));        
        }else{
            this.active = false;
        }
    }else{
        this.update();
    }
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
    if(this.pause){
        this.pauseUpdate();
    }else{
        if(this.manual){
            setTimeout(this.update, Math.floor(1000 / this.manualFrameRate));
        }else{
            requestAnimationFrame(this.update);
        }
    }
    startF = this.frameStart;
    len = startF.length;
    for(i = 0; i < len; i+=1){
        startF[i]();
    } 
    endF = this.frameEnd;
    len = endF.length;
    for(i = 0; i < len; i+=1){
        endF[i]();
    }
    endS = this.frameEndStack;
    while(endS.length > 0){
        endS.shift()();
    }
}


