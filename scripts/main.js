"use strict";
// This is the main entry point to all that needs to happen.

// To start the requiered application add the app directory name relative to the starting directory
// in the starting arguments. 
// eg
// C:\nw\nw.exe D:\Marks\DEV\GrooverNW app=GifViewer
// second argument is the groover directory, and application is GifViewer
// See the development directory for detials.



if(DEBUG){
    groover.win.showDevTools();
}
(function(){
    function Groover(app){
        var failedStartup = false;
        groover.session.ID = groover.utils.IDS.getGUID();
        log("Groover started. SID:"+groover.session.ID); 
        groover.main = this;

        if(!groover.code.loadApplication(app)){
            groover.loader.showInfo("<h1>Failed to load application.</h1>Groover could not find, load or there was a parsing error for the application named '<b>"+app+"</b>'<br>Check you have entered the correct command line arguments and that the application directory exists\nRight click to inspect the console for more details on this error.");
            return;
            failedStartup = true;
        }else{
            if(groover.application === undefined){
                groover.loader.showInfo("<h1>Application parsed but did not register its self.</h1>Groover found and loaded the applicarion named '<b>"+app+"</b>'<br>but the app did not register its self as the named variable '<b>groover.application</b>'</br>I can not run what I do not know..<br>");
                return;
            }
            if(typeof groover.application !== "function"){
                groover.loader.showInfo("<h1>Loaded application is not a function???</h1>Groover found and loaded the applicarion named '<b>"+app+"</b>'<br>but the reqistered application function is not a function. </br>I can to makr you run if you have no legs.");
                return;
            }
            if(groover.application.prototype.update === undefined || typeof groover.application.prototype.update !== "function"){
                groover.application.prototype.update = function(){};
            }
            if(groover.application.prototype.display === undefined || typeof groover.application.prototype.display !== "function"){
                groover.application.prototype.display = function(){};
            }
        }      
        if(failedStartup){
            nw.App.quit();
        }
        var moduals = [];
        moduals.push(this.animFrame = new AnimFrame(this));  
        moduals.push(this.mouseKeyboard = new MouseKeyboard(this));
        moduals.push(this.bitmaps = new Bitmaps(this));
        moduals.push(this.view = new View(this));
        moduals.push(this.render = new Render(this));
        moduals.push(this.ui = new UI(this));
        moduals.push(this.app = new groover.application(this));
        // add frame work compnents to app.
        this.app.animFrame      = this.app.animFrame    === undefined ? this.animFrame : this.app.animaFrame;
        this.app.mouseKeyboard  = this.app.mouseKeyboard=== undefined ? this.mouseKeyboard : this.app.mouseKeyboard;
        this.app.bitmaps        = this.app.bitmaps      === undefined ? this.bitmaps : this.app.bitmaps;
        this.app.view           = this.app.view         === undefined ? this.view : this.app.view ;
        this.app.render         = this.app.render       === undefined ? this.render : this.app.render;
        this.app.ui             = this.app.ui           === undefined ? this.ui : this.app.ui;
        window.addEventListener("resize",this.resize.bind(this));
        var checkModuals = (function(){
            var i;
            for(i = 0; i < moduals.length; i++){
                if(moduals[i].ready){
                    moduals.splice(i,1);
                    i -= 1;
                }else{
                    console.log("Waiting for modual :"+moduals[i].name);
                }
            }
            if(moduals.length === 0){
                setTimeout(this.readyToStart.bind(this),10);                
            }else{
                setTimeout(checkModuals,300);                                
            }
        }).bind(this);
        setTimeout(checkModuals,100);
    }
    Groover.prototype.readyToStart = function(){
        groover.loader.progress(1);
        new DropManager(document.body, this.fileDropped.bind(this), [DropManager.prototype.mimeTypes.all],"first");
        this.animFrame.addFrameStartFunction(this.ui.update.bind(this.ui));
        if(this.app.update !== undefined){
            this.animFrame.addFrameStartFunction(this.app.update.bind(this.app));
        }
        if(this.app.display !== undefined){
            this.animFrame.addFrameEndFunction(this.app.display.bind(this.app));
        }
        this.animFrame.addFrameEndFunction(this.ui.display.bind(this.ui));
        this.animFrame.addFrameEndFunction(this.mouseKeyboard.doCursor.bind(this.mouseKeyboard));
        groover.busy = true;
        groover.busyMessage = "just testing";
        setTimeout(function(){groover.busy = false},1000);
        groover.loader.clearSplash();
        setTimeout(this.resize.bind(this),100);
    }
    Groover.prototype.ready = function(){
        this.view.refresh();
        this.animFrame.addFrameEndStackFunction(this.view.refreshedDone.bind(this.view));
        this.animFrame.start();
        log("Loaded and frames grooving");
    }
    Groover.prototype.resize = function(){
        this.canvas = groover.createCanvas();
        $A(this.canvas);
        this.ready();
    }
    Groover.prototype.fileDropped = function(file){
        console.log(file);
        if(file.type.indexOf("image/") > -1 || file.type.indexOf("video/") > -1){
            if(typeof this.app.imageDropped === "function"){
                this.app.imageDropped(file);
            }
        }
    }
    window.addEventListener("load",function(){
        var app;
        groover.settings = groover.utils.files.loadJson("settings");
        log(groover.settings.version);
        groover.code.modualDir = process.cwd() + groover.settings.modualsDirectory;
        groover.code.applicationDir = process.cwd() + groover.settings.applicationDirectory;
        nw.App.argv.forEach(function(arg){
            if(arg.indexOf("app=") > -1){
                app = arg.split("=")[1];
            }
        });
        new Groover(app);
    });
})();