"use strict";
createSprite = function(){
    var sprite = {
        name : "Sprite",
        UID  : groover.utils.IDS.getUID(),
    }
}

createTimeline = function(){
    var key = {
        value : 0,
        time : [],
        dirty : false,
        rangeIn : RANGE.flat,
        rangeOut : RANGE.flat,
        lastTimeIndex : null,
        quickIndex : [],
    }
    
}
var RANGE ={
    flat : 0,
    loop : 1,
    reflect : 2,
}
var CURVES = {
    linear : 0,
}
var createCurve(dir,type){
    if(dir !== undefined){
        if(typeof dir === "string"){
            dir = dir.toLowerCase();
            switch(dir){
                case "in":
                   dir = -1;
                   break;
                default:
                   dir = 1;
            }
        }else
        if(typeof dir !== "number"){
            dir = 1;
        }
    }else{
        dir = 1;
    }
        
    return {
        x:0.25 * dir,
        y:0,
    }
}
var cleanTime = function(key){
    
    var sortTime = function(a,b){
        return a.time-b.time;        
    }
    key.time.sort(sortTime);
    key.dirty = false;
    key.lastTimeIndex = key.time[key.time.length-1].time;
}    
var addTime = function(key,time,value){
    key.time.push({
        time : time,
        value : value,
        curveIn : CURVES.linear,
        curveOut : CURVES.linear,
    });
    key.dirty = true;
}
var removeTime = function(key,time){
    var len = key.time.length;
    var i = 0;
    while(i < len && key.time[i][0] !== time){
        i++;
    }
    if(i < len){
        key.time.splice(i,0);
    }
}

var getTime = function(key,time,result){
    if(result === undefined){
        result = {
            count:0,
            times:[],
        };
    }
    result.count = 0;
    if(time <= key.time[0].time){
        result.times[0] = key.time[0];
        result.count = 1;
    }else
    if(time >= key.lastTimeIndex){
        result.times[0] = key.time[key.time.length-1];
        result.count = 1;
    }else{
        var len = key.time.length;
        for(var i = 0; i < len-1; i++){
            if(time === key.time[i].time){
                result.times[0] = key.time[i];
                result.count = 1;
                break;
            }else
            if(time > key.time[i].time && time < ket.time[i+1].time){
                result.times[0] = key.time[i];
                result.times[1] = key.time[i+1];
                result.count = 2;
                break;
            }
        }
    }
    return result;
}
                
        
    
