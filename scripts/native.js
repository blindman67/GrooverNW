"use strict";
// NW support for native app 
const DEBUG = 1==0?true:false;
const QUIET_CONSOLE = false;
var gui = require("nw.gui");
var fileSystem = require('fs');
var path = require('path');


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