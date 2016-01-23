"use strict";
var groover = {}; // public interface.
groover.win = gui.Window.get();
if(DEBUG){
    groover.win.showDevTools();
}
(function(){
    function Groover(){
        groover.session.ID = groover.utils.IDS.getGUID();
        log("Groover started. SID:"+groover.session.ID); 
        groover.main = this;
        var moduals = [];
        moduals.push(this.animFrame = new AnimFrame(this));  
        moduals.push(this.mouseKeyboard = new MouseKeyboard(this));
        moduals.push(this.bitmaps = new Bitmaps(this));
        moduals.push(this.display = new Display(this));
        moduals.push(this.render = new Render(this));
        moduals.push(this.ui = new UI(this));
        moduals.push(this.editor = new SpriteEditor(this));
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
        this.animFrame.addFrameStartFunction(this.editor.update.bind(this.editor));
        this.animFrame.addFrameEndFunction(this.editor.display.bind(this.editor));
        this.animFrame.addFrameEndFunction(this.ui.display.bind(this.ui));
        this.animFrame.addFrameEndFunction(this.mouseKeyboard.doCursor.bind(this.mouseKeyboard));
        groover.busy = true;
        groover.busyMessage = "just testing";
        setTimeout(function(){groover.busy = false},1000);
        
        groover.loader.clearSplash();
        setTimeout(this.resize.bind(this),100);
    }
    Groover.prototype.ready = function(){
        this.display.refresh();
        this.animFrame.addFrameEndStackFunction(this.display.refreshedDone.bind(this.display));
        this.animFrame.start();
        log("Loaded and frames grooving");
    }
    Groover.prototype.resize = function(){
        this.canvas = groover.createCanvas();
        this.ready();
    }
    Groover.prototype.fileDropped = function(file){
        console.log(file);
        if(file.type.indexOf("image/") > -1 || file.type.indexOf("video/") > -1){
            this.editor.imageToLoad(file);
        }
        //groover.dialogs.imageLoader(file);
    }
    window.addEventListener("load",function(){
        new Groover();
    });
})();