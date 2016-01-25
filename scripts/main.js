"use strict";
var groover = {}; // public interface.
groover.win = gui.Window.get();
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
            alert("Failed to load app");
            return;
            failedStartup = true;
        }else{
            if(groover.application === undefined){
                alert("Application parsed but did not register");
                return;
            }
            if(typeof groover.application !== "function"){
                alert("Loaded application is not a function???");
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
        new DropManager(document.body, this.fileDropped.bind(this), [DropManager.prototype.mimeTypes.all]);
        //groover.win.maximize();
        window.addEventListener("resize",this.resize.bind(this));
        var checkModuals = (function(){
            var i;
            for(i = 0; i < moduals.length; i++){
                if(moduals[i].ready){
                    moduals.splice(i,1);
                    i -= 1;
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
        new DropManager(document.body, this.fileDropped.bind(this), [DropManager.prototype.mimeTypes.all]);
        this.animFrame.addFrameStartFunction(this.ui.update.bind(this.ui));
        this.animFrame.addFrameStartFunction(this.app.update.bind(this.app));
        this.animFrame.addFrameEndFunction(this.app.display.bind(this.app));
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
        //groover.dialogs.imageLoader(file);
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