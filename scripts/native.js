"use strict";

// NW support for native app 
const DEBUG = 1==0?true:false;
var groover = {}; // public interface.
var gui = require("nw.gui");
groover.win = gui.Window.get();
const QUIET_CONSOLE = false;
var fileSystem = require('fs');
var path = require('path');
nw.Screen.Init();
groover.screens = nw.Screen.screens;
if(groover.win.x < groover.screens[0].work_area.x){
    groover.win.x = groover.screens[0].work_area.x;
}
if(groover.win.x > groover.screens[0].work_area.x + groover.screens[0].work_area.width- 100){
    groover.win.x =groover.screens[0].work_area.x + groover.screens[0].work_area.width- 100
    groover.win.width = 100;
}
if(groover.win.y < groover.screens[0].work_area.y){
    groover.win.y = groover.screens[0].work_area.y;
}
if(groover.win.y > groover.screens[0].work_area.y + groover.screens[0].work_area.height- 100){
    groover.win.y =groover.screens[0].work_area.y + groover.screens[0].work_area.height- 100
    groover.win.height = 100;
}
var screenCB = {
  onDisplayBoundsChanged: function(screen) {
    groover.screens = nw.Screen.screens;
  },
  onDisplayAdded: function(screen) {
    groover.screens = nw.Screen.screens;
  },
  onDisplayRemoved: function(screen) {
    groover.screens = nw.Screen.screens;
  }
};

// listen to screen events
nw.Screen.on('displayBoundsChanged', screenCB.onDisplayBoundsChanged);
nw.Screen.on('displayAdded', screenCB.onDisplayAdded);
nw.Screen.on('displayRemoved', screenCB.onDisplayRemoved);

// extending Node.js Path 
// need to find out how to do this correctly
path.addFilename2Path = function(dest,filename){
    if(typeof dest === "string"){
        dest = path.parse(dest);
    }
    if(typeof filename === "string"){
        filename = path.parse(filename);
    }
    return {
        root : dest.root,
        dir : dest.dir,
        base : filename.base,
        ext : filename.ext,
        name : filename.name
    }
}
var log = function(data){  // some apps may redefine this function
    if(DEBUG){
        console.log(data);
    }else
    if(!QUIET_CONSOLE){
        console.log(data);
    }
}