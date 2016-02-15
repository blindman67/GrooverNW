"use strict";
groover.session = {
    ID:null,
    dateTime:new Date().valueOf(),
}
if(groover.utils === undefined){
    groover.utils = {};
}
groover.utils.IDS = {
    UID: (function(){
        if(localStorage !== undefined){
            if(localStorage.groover_UID !== undefined){
                return Number(localStorage.groover_UID);
            }
        }
        return 0;
    })(),
    ID:0,
    idChars : "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
    getID : function(){
            this.ID += 1;
            return this.ID - 1;
    },
    saveUID : (function(){
        if(localStorage !== undefined){
            return function(){
                localStorage.groover_UID = this.UID;
            };
        }
        return function(){};
    })(),
    getUID : function(){
        this.UID += 1;
        this.saveUID();
        return this.UID - 1;
    },
    getGUID : function(){
        var i,s,l;
        l = this.idChars.length;
        s = "_";
        for(i = 0; i < 15; i++){
            s += this.idChars[Math.floor(Math.random() * l)];
        }
        return s;
    },
}
groover.createCanvas = function(type){  // defaults to fullscreen no other types defined yet
    $R("canv");
    var canvas = $C("canvas"); 
    canvas.id = "canv";    
    if(type === undefined || type === null || type === "fullscreen"){
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight; 
        canvas.style.position = "absolute";
        canvas.style.top = "0px";
        canvas.style.left = "0px";
        canvas.style.zIndex = 1000;
    }
    canvas.ctx = canvas.getContext("2d"); 
    return canvas;
};
groover.author = {
    details: {
        author    : "Mark Sppronck",
        email     : "markspronck@gmail.com",
        copyright : "Copyright 2016.",
        notes     : "",
        URL       : "",
    },
    getDetails : function(asComments){
        if(asComments){
            var str = "";
            var eol = "\n";
            str += "//---------------------------------------------------------------------------------------------"+eol;
            str += "// Author     :"+this.details.author    +eol;
            str += "// AuthorEmail:"+this.details.email     +eol;
            str += "// Copyright  :"+this.details.copyright +eol;
            str += "// Notes      :"+this.details.notes     +eol;
            str += "// URL        :"+this.details.URL       +eol;
            str += "// SessionID  :"+groover.session.ID     +eol;
            str += "// DateSaved  :"+(new Date()).toDateString() +eol;      
            str += "//---------------------------------------------------------------------------------------------"+eol;
            return str;
        }
        return {
            author      :this.details.author,
            email       :this.details.email,
            copyright   :this.details.copyright,
            notes       :this.details.notes,
            URL         :this.details.URL,
            sessionID   :groover.session.ID,
            dateSaved   :(new Date()).toDateString(),
        };
    }
}
groover.code = {
    moduals : {  // contains named moduals...
        stub : function(){},
    },
    modualDir : process.cwd()+"\\scripts\\moduals",
    applicationDir : process.cwd() + "\\apps",
    presentError : function(e){
        console.log(e);
    },
    loadApplication : function(name){
        var filename;
        if(this.moduals[name] !== undefined){
            return this.moduals[name];
        }
        filename = this.applicationDir + "\\" +name+"\\"+ name + ".js";
        var appDescription = groover.utils.files.loadJson(this.applicationDir + "\\" +name+"\\description");
        if(appDescription === undefined){
            log("Error loading application '"+name+"'","red");
            log("Could not find or parse application file 'description.json'.","red");
            return undefined;
        }
        if(appDescription.JavaScript === undefined){
            appDescription.JavaScript = {scripts:[name+".js"]};
        }
        if(appDescription.JavaScript.scripts === undefined){
            appDescription.JavaScript.scripts = [name + ".js"];
        }
        if(groover.utils.namedStyles !== undefined){
            if(appDescription.styles !== undefined){
                for(var i = 0; i < appDescription.styles.length; i ++){
                    var style = groover.utils.files.loadJson(this.applicationDir + "\\" +name+"\\"+appDescription.styles[i]);
                    if(style !== undefined){
                        for(var j in style){
                            groover.utils.namedStyles[j] = style[j];
                        }
                    }else{
                        log("Could not locate or load the style file '"+appDescription.styles[i]+"'","red");
                    }
                }
            }
        }
                            
                            
        
        var error = false;
        var modual = "";
        var appDir = this.applicationDir;
        appDescription.directory = appDir + "\\" +name;
        appDescription.JavaScript.scripts.forEach(function(fName){
            filename = appDir + "\\" +name+"\\"+ fName;
            var code = groover.utils.files.loadText(filename);
            if(code === undefined){
                if(groover.utils.files.error.error){
                    log("Error loading application file '"+fname+"'","red");
                    log("See console details.","red");
                    console.log($JC(groover.utils.files.error));
                }
                error = false;
            }else{
                modual += code;
            }
        });
        if(error){
            log("Error loading application files.");
            return undefined;
        }
        modual += "\n\n";
        modual += "console.log('Application "+name+" for console referance.');\n";
        modual += "groover.code.parsed = true;\n";
        groover.code.parsed = false;
        try{  // add code to the web page and run 
            var script = $C('script');
            script.async = true;
            script.text = modual;
            $A($TN('head')[0],script);
            if(this.parsed){
                groover.appDescription = appDescription;
                return true;
            }
            log("Application '"+name+"' did not parse.", "red");
            if(!this.parsed){
                console.log("Application '"+name+"' did not parse.");             
            }else{
                console.log("Application '"+name+"' Failed to excecute.");
            }
            return undefined;
        }catch(e){
            log("Could not load Application '"+name+"' see console.", "red");
            console.log(e);
        }        
        return undefined;
    },
    load : function (name){
        var filename;
        if(this.moduals[name] !== undefined){
            return this.moduals[name];
        }
        filename = this.modualDir + "\\" + name + ".js";
        var code = groover.utils.files.loadText(filename);
        if(code === undefined){
            if(groover.utils.files.error.error){
                log("Error loading modual '"+name+"'","red");
                log("See console details.","red");
                console.log($JC(groover.utils.files.error));
            }
            return undefined;
        }
        var modual = "'use strict';\n";
        modual += "groover.code.moduals."+name+" = ";
        modual += code;
        modual += "\n\n";
        modual += "console.log('Modual "+name+" for console referance.');\n";
        modual += "groover.code.parsed = true;\n";
        groover.code.parsed = false;
        try{  // add code to the web page and run 
            var script = $C('script');
            script.async = true;
            script.text = modual;
            $A($TN('head')[0],script);
            if(this.parsed && this.moduals[name] !== undefined){
                if(this.moduals[name].configure !== undefined){
                    this.moduals[name].configure();
                }
                return this.moduals[name];
            }
            log("Modual '"+name+"' did not parse.", "red");
            if(!this.parsed){
                console.log("Modual '"+name+"' did not parse. Reparsing for debug only.");
                modual = "\n";
                modual += "console.log('Modual "+name+" pasrsed with debug' );\n";
                modual += "try{  // debugmode\n";
                modual += "groover.code.moduals."+name+" = ";
                modual += code;
                modual += "\n\n";
                modual += "groover.code.parsed = true;\n";
                modual +=  "console.log('Modual "+name+" parse when not in strict mode.' );\n";
                modual += "}catch(e){\n";
                modual += "console.log('Modual "+name+" threw error on parsing' );\n";
                modual += "groover.code.presentError(e);}";
                var script = $C('script');
                script.async = true;
                script.text = modual;
                $A($TN('head')[0],script);
                    
                groover.code.parsed = false;                
            }else{
                console.log("Modual '"+name+"' Failed to excecute.");
            }
            return undefined;
        }catch(e){
            log("Could not load Modual '"+name+"' see console.", "red");
            console.log(e);
        }        
    }
};
// bad name will move soon do not use.
groover.directories = {
    scratch : path.parse("D:\\temp\\Groover"),
    currentProject : {
        images : path.parse("D:\\Marks\\Groover\\TestProject\\Images"),
        sounds : path.parse("D:\\Marks\\Groover\\TestProject\\Sounds"),
        movies : path.parse("D:\\Marks\\Groover\\TestProject\\Movies"),
        scratch : path.parse("D:\\Marks\\Groover\\TestProject\\Temp"),
        animation : path.parse("D:\\Marks\\Groover\\TestProject\\Animation"),
    },
    home : path.parse("D:\\Marks\\Dev\\GrooverNW"),
};
// general file utilites
// load and save text
// load and save JSON
// doesFileExist returns true if the file can be found
// resolveFilename returns full path for a filename. This is not a relative resolve
groover.utils.files = {
    error : {
        error : false,
        message : "",
        filename : "",
    },
    imageSaveDirectory : "D:\\Marks\\JavaScript\\GameEngine\\July2015",
    OSDelimiter : "\\",
    currentDirectory : process.cwd(),
    saveText : function(filename,text,replace){
        var fileStats,dirStats;
        this.error.error = false;
        filename = path.parse(filename);
        if(filename.dir === ""){
            filename.dir = this.currentDirectory;
        }
        try{
            dirStats = fileSystem.statSync(filename.dir);
            if(!dirStats.isDirectory()){
                throw "No such directory";
            }
        }catch(e){
            this.error.message = "No such directory!";
            this.error.filename = filename;
            this.error.error = true;
            return false;
        }
        if(filename.ext === ""){
            filename.ext = ".txt";
        }
        filename = filename.dir + this.OSDelimiter + filename.name + filename.ext;
        if(replace !== undefined && !replace ){
            try{
                fileStats = fileSystem.statSync(filename);
                this.error.message = "File exists!";
                this.error.filename = filename;
                this.error.error = true;
                return false;
            }catch(e){
                // file does not exist so safe to write???
            }
        }
        try{
            text = fileSystem.writeFileSync(filename, text, "utf8");
        }catch(e){
            this.error.message = "Writting. Error saving file!";
            this.error.filename = filename;
            this.error.error = true;
            return false;
        }
        log("Saved file " + filename);  
        return true;        
    },
    loadText : function(filename){
        var fileStats,dirStats,text;
        this.error.error = false;
        filename = path.parse(filename);
        if(filename.dir === ""){
            filename.dir = this.currentDirectory;
        }
        try{
            dirStats = fileSystem.statSync(filename.dir);
            if(!dirStats.isDirectory()){
                throw "No such directory";
            }
        }catch(e){
            this.error.message = "Reading. No such directory!";
            this.error.filename = filename;
            this.error.error = true;
            return undefined;
        }
        if(filename.ext === ""){
            filename.ext = ".txt";
        }
        filename = filename.dir + this.OSDelimiter + filename.name + filename.ext;

        try{
            fileStats = fileSystem.statSync(filename);
        }catch(e){
            this.error.message = "Reading. File not found!";
            this.error.filename = filename;
            this.error.error = true;
            return undefined;
        }
 
        try{
            text = fileSystem.readFileSync(filename, "utf8");
        }catch(e){
            this.error.message = "Reading. Error reading file!";
            this.error.filename = filename;
            this.error.error = true;
            return undefined;
        }
        return text;        
        
    },
    resolveFilename : function (filename){
        var filePath;
        filePath = path.parse(filename);
        if(filePath.dir === ""){
            filePath.dir = this.currentDirectory;
        }
        filename = filePath.dir + this.OSDelimiter + filePath.name + filePath.ext;
    },
    getFilesOfTypeInDir :function (dir,types){
        if(typeof dir !== "string"){
            if(dir.path !== undefined){
                dir = dir.path;
            }
        }
        var filePath = path.parse(dir);
        if(filePath.dir === ""){
            filePath.dir = this.currentDirectory;
        }
        types = [].concat(types);
        return fileSystem.readdirSync(filePath.dir).filter(function(name){
            var result = false;
            name = path.parse(name);
            
            types.forEach(function(type){
                if(name.ext.indexOf(type) > -1){
                    result = true;
                }
            });
            return result;
        }).map(function(name){
            name = path.parse(name);
            return filePath.dir + groover.utils.files.OSDelimiter + name.name + name.ext;
        });
    },
    doesFileExist : function (filename){
        filename = path.parse(filename);
        if(filename.dir === ""){
            filename.dir = this.currentDirectory;
        }
        filename = filename.dir + this.OSDelimiter + filename.name + filename.ext;
        try{
            fileStats = fileSystem.statSync(filename);
        }catch(e){            
            return false;
        }
        return true;
    },
    loadJson : function (name){
        var filename;
        if(name.indexOf(".json") === -1){
            filename = name + ".json";
        }else{
            filename = name;
        }
        
        var text = this.loadText(filename);
        if(text !== undefined){
            try{
                text = JSON.parse(text);
            }catch(e){
                log("Error parsing json file :'"+filename+"'");
                log(e.message);
                text = undefined;
            }
        }
        return text;
    },
    saveJson : function (name,data){
        var filename;
        filename = name + ".json";
        try{
            var text = JSON.stringify(data);
        }catch(e){
            return false;
        }
        return this.saveText(filename,text);
    }
}
groover.utils.namedStyles = {
    DEFAULT : {
        fillStyle : "White",
        strokeStyle : "BLUE",
        lineWidth : 3,
        lineJoin : "round",
        lineCap : "round",
        font : "arial",
        textAlign : "left",
        textBaseline : "middle",
        miterLimit : 0,
        inset : 0,
        fontSize : 16,
        fontColour : "white",
        rounding : 4,
    },
        
}
// for creating styles.
groover.utils.styles = {    
    attributes : "inset,fontSize,fontColour,fillStyle,strokeStyle,lineWidth,lineJoin,lineCap,font,textAlign,textBaseline,miterLimit".split(","),
    DEFAULT : groover.utils.namedStyles.DEFAULT,
    // Some situations require text to be messure so that the correct sized
    // canvas can be created. As the text needs a canvas to messure this
    // work canvas is a canvas and context that can be used by any 
    // code to do things like measure text
    workCanvas : (function(){
        var workCanvas = document.createElement("canvas");
        workCanvas.width = 10;
        workCanvas.height = 10;
        workCanvas.ctx = workCanvas.getContext("2d");    
        return workCanvas;
    })(),
    measureText : function ( text, style ){
        this.assignFontToContext(this.workCanvas.ctx,style);
        return this.workCanvas.ctx.measureText(text);        
    },
    measureTextArr : function ( textArr, style ){ // text is an array
        var i, len,min,max,width;
        min = Infinity;
        max = -Infinity;
        len = textArr.length;
        this.assignFontToContext(this.workCanvas.ctx,style);
        for(i = 0; i < len ; i ++){
            width = this.workCanvas.ctx.measureText(text).width;
            min = Math.min(min,width);
            max = Math.max(max,width);
        }
        return {min:min,max:max};
    },
    setFontStyle : function ( style, font, fontSize, fontColour,textAlign, textBaseline ){
        style.font = font === null || font === undefined ? style.font : font;
        style.fontSize = fontSize === null || fontSize === undefined ? style.fontSize : fontSize;
        style.fontColour = fontColour === null || fontColour === undefined ? style.fontColour : fontColour;
        style.textAlign = textAlign === null || textAlign === undefined ? style.textAlign : textAlign;
        style.textBaseline = textBaseline === null || textBaseline === undefined ? style.textBaseline : textBaseline;
        return style;
    },
    setDrawStyle : function ( style, col, lineCol, lineWidth, rounding, inset){
        style.fillStyle     = col === null || col === undefined             ? style.fillStyle   : col;
        style.strokeStyle   = lineCol === null || lineCol === undefined     ? style.strokeStyle : lineCol;
        style.lineWidth     = lineWidth === null || lineWidth === undefined ? style.lineWidth   : lineWidth;
        style.rounding      = rounding === null || rounding === undefined   ? style.rounding    : rounding;
        style.inset         = inset === null || inset === undefined         ? style.inset       : inset;
        return style;
        
    },
    assignToContext : function ( ctx, style) {
        if(style === undefined){
            style = this.DEFAULT;
        }
        ctx.fillStyle    = style.fillStyle;
        ctx.strokeStyle  = style.strokeStyle;
        if(style.lineWidth === 0){
            ctx.lineWidth    = 0.01;
        }else{
            ctx.lineWidth    = style.lineWidth;
        }
        ctx.lineJoin     = style.lineJoin ;
        ctx.lineCap      = style.lineCap;
        ctx.font         = style.fontSize + "px "+style.font;
        ctx.textAlign    = style.textAlign;
        ctx.textBaseline = style.textBaseline;
        ctx.miterLimit   = style.miterLimit;
        // fontColour 
        // fontSize          
    },
    assignFontToContext : function ( ctx, style) {
        if(style === undefined){
            style = this.DEFAULT;
        }
        ctx.fillStyle    = style.fontColour;
        ctx.font         = style.fontSize + "px "+style.font;
        ctx.textAlign    = style.textAlign;
        ctx.textBaseline = style.textBaseline;
    },
    assignDrawToContext : function ( ctx, style) {
        if(style === undefined){
            style = this.DEFAULT;
        }
        ctx.fillStyle    = style.fillStyle;
        ctx.strokeStyle  = style.strokeStyle;
        if(style.lineWidth === 0){
            ctx.lineWidth    = 0.01;
        }else{
            ctx.lineWidth    = style.lineWidth;
        }
        ctx.lineJoin     = style.lineJoin ;
        ctx.lineCap      = style.lineCap;
        ctx.miterLimit   = style.miterLimit;

    },
    setDefultStyle : function ( style ) {
        groover.utils.namedStyles.DEFAULT = style;
        this.DEFAULT = style;
        return style;
    },
    validateStyle : function ( style ) {
        for (var i = 0; i < this.attributes.length; i++) {
            if(style[this.attributes[i]] === null || style[this.attributes[i]] === undefined){
                style[this.attributes[i]] = this.DEFAULT[this.attributes[i]];
            }
        }
        return style;        
    },
    copyStyle : function ( style ){
        var cStyle = {};
        for (var i = 0; i < this.attributes.length; i++) {
            if(style[this.attributes[i]] === null || style[this.attributes[i]] === undefined){
                cStyle[this.attributes[i]] = this.DEFAULT[this.attributes[i]];
            }else{
                cStyle[this.attributes[i]] = style[this.attributes[i]];
            }
        }
        return cStyle;
        
    },
    createDrawStyle : function (name, col, lineCol, lineWidth, rounding, inset) {
        var style;
        if(typeof name === "string"){
             style = groover.utils.namedStyles[name];
             if(style === undefined){
                  groover.utils.namedStyles[name] = style = {};
             }
        }else{
            style = {};
        }
        for (var i = 0; i < this.attributes.length; i++) {
            style[this.attributes[i]] = style[this.attributes[i]] === undefined ? groover.utils.namedStyles.DEFAULT[this.attributes[i]] : style[this.attributes[i]];
        }
        style.fillStyle     = col === null || col === undefined             ? style.fillStyle   : col;
        style.strokeStyle   = lineCol === null || lineCol === undefined     ? style.strokeStyle : lineCol;
        style.lineWidth     = lineWidth === null || lineWidth === undefined ? style.lineWidth   : lineWidth;
        style.rounding      = rounding === null || rounding === undefined   ? style.rounding    : rounding;
        style.inset         = inset === null || inset === undefined         ? style.inset       : inset;
        
        return style;
        
    },
    createFontStyle : function (name, font, fontSize, fontColour, textAlign, textBaseline ) {
        var style;
        if(typeof name === "string"){
             style = groover.utils.namedStyles[name];
             if(style === undefined){
                  groover.utils.namedStyles[name] = style = {};
             }
        }else{
            style = {};
        }
        for (var i = 0; i < this.attributes.length; i++) {
            style[this.attributes[i]] = style[this.attributes[i]] === undefined ? groover.utils.namedStyles.DEFAULT[this.attributes[i]] : style[this.attributes[i]];
        }
        style.font = font === null || font === undefined ? style.font : font;
        style.fontSize = fontSize === null || fontSize === undefined ? style.fontSize : fontSize;
        style.fontColour = fontColour === null || fontColour === undefined ? style.fontColour : fontColour;
        style.textAlign = textAlign === null || textAlign === undefined ? style.textAlign : textAlign;
        style.textBaseline = textBaseline === null || textBaseline === undefined ? style.textBaseline : textBaseline;

        return style;
        
    },    
    createNamedStylesFromList : function(list){
        var i, j, st;
        for(i = 0; i < list; i ++){
            st = list[i];
            j = 0;
            if(groover.utils.namedStyles[st[j+1]] === undefined){
                if(st[j++] === "font"){
                    this.createFontStyle(st[j++],st[j++],st[j++],st[j++]);
                }else{
                    this.createDrawStyle(st[j++], st[j++], st[j++], st[j++], st[j++], st[j++]);
                }
            }
        }
    }
        
        

}

groover.utils.language = {
    objectCopyCombine : function (obj,combineObj){
        var i ;
        var nobj = {};
        for(i in obj){
            nobj[i] = obj[i];
        }
        for(i in combineObj){
            nobj[i] = combineObj[i];
        }
        return nobj;        
    },
    objectCopy : function (obj){
        var i ;
        var nobj = {};
        for(i in obj){
            nobj[i] = obj[i];
        }
        return nobj;        
    },
    
}

