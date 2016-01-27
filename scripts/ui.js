"use strict";
function UI(owner){
    this.owner = owner;
    this.bitmaps = this.owner.bitmaps;
    this.render = this.owner.render;
    this.MK = this.owner.mouseKeyboard;
    this.view = this.owner.view;
    this.icons = {};
    this.loadMedia();
    this.ready = false;
    this.createCanvas = function(w,h){
        var can = document.createElement("canvas");
        can.width = w;
        can.height = h;
        can.ctx = can.getContext("2d");
        return can;
    }
    this.startLoad = function(ui){

    }
    
    this.setupToolTip();
    if(groover.settings.frameControls){
        this.createFrameControls();
    }
}

UI.prototype.viewUpdated = function(){
    
}
UI.prototype.update = function(){
}
UI.prototype.display = function(){
    if(this.toolTip !== undefined && this.toolTip.ready){
        if(!this.toolTip.owner.over || this.MK.BR !== 0 || this.MK.w !== 0){
            this.toolTip.free();

        }else{
            this.toolTip.display();
        }
    }
    if(groover.busy){
        this.render.drawImageSRA(this.icons.named.busy.image,this.view.width/2,this.view.height * 3/4,1,this.owner.animFrame.time.valueOf()/10,1);
        this.render.drawText(groover.busyMessage,this.view.width/2,this.view.height * 3/4 + 40);
    }  
    if(this.frameControl !== undefined){
        var fr = this.frameControl;
        if(fr.dragging){
            fr.update();
            fr.display();
        }else{
            if(this.MK.mousePrivate === 0 || this.MK.mousePrivate === fr.id){
                if(this.MK.y < fr.height){
                    this.MK.mousePrivate = fr.id;
                    fr.over = true;
                }else{
                    if(this.MK.mousePrivate === fr.id){
                        this.MK.releaseCursor(fr.id);
                        this.MK.mousePrivate = 0;
                    }
                    fr.over = false;
                }
            }
            if(fr.over || fr.timer > 0){
                fr.update();
                fr.display();
            }
        }
    }
}

UI.prototype.mediaReady = function(){
    if(this.frameControl !== undefined){
        this.frameControl.setup();
    }
    this.ready = true;
    log("UI ready"); 
}
UI.prototype.loadMedia = function(){
    this.icons = this.bitmaps.startLoad(this.mediaReady.bind(this),"icons");
    this.bitmaps.load("icons","icons/busy.png","busy");
}
UI.prototype.createFrameControls = function(){
    var frameSpriteDesc = {
        spriteCutter:{
            how:"grid",
            widthCount : 5,
            heightCount : 1,
            repackWidth : false,
        }
    };
    this.frameControl = {
        owner : this,
        sprites : this.bitmaps.load("icons","icons/frameIcons.png","frameIcons",this.bitmaps.onLoadCreateSprites.bind(this.bitmaps), frameSpriteDesc),
        id : this.MK.getHolderID(),
        over : false,
        timer : 0,
        h : 0,
        w : 0,
        dragging : false,
        dragStartX : 0,
        dragStartY : 0,
        isMax : false,
        isMin : false,
        lastScreenPos : {
            x : groover.win.x,
            y : groover.win.y,
            width : groover.win.width,
            height : groover.win.height,
        },
        
        cursors : ["pointer","pointer","pointer","pointer","move"],
        setup : function(){
            var w = this.sprites.image.sprites[0].w;
            var h = this.sprites.image.sprites[0].h;
            this.sprites.image.sprites[0].w -= 1; // hack to stop bleed from next sprite 
            this.spriteW = w;
            this.spriteH = h;
            this.height = h;
            h = Math.ceil(h *0.2);
            w += Math.ceil(w *0.2);
            this.w = w;
            this.h = h;
            this.height += h;
        },
        saveCurrentWindow : function(){
            this.lastScreenPos.x = groover.win.x;
            this.lastScreenPos.y = groover.win.y;
            this.lastScreenPos.width = groover.win.width;
            this.lastScreenPos.height = groover.win.height;
        },
        restoreSavedWindow : function(){
            groover.win.x = this.lastScreenPos.x;
            groover.win.y = this.lastScreenPos.y;
            groover.win.width = this.lastScreenPos.width;
            groover.win.height = this.lastScreenPos.height;                       
        },
        maxWindow : function(){
            groover.win.x = groover.screens[0].work_area.x;
            groover.win.y = groover.screens[0].work_area.y;
            groover.win.width = groover.screens[0].work_area.width;
            groover.win.height = groover.screens[0].work_area.height;
        },
            
        update : function(){
            if(this.over){
                if(this.dragging){
                    if(!this.owner.MK.B1){
                        this.dragging = false;
                    }
                    var mx = this.owner.MK.x-this.dragStartX
                    var my = this.owner.MK.y-this.dragStartY
                    var newPx = Math.max(0,groover.win.x + mx);
                    var newPy = Math.max(0,groover.win.y + my);
                    if(newPx + groover.win.width > groover.screens[0].work_area.x + groover.screens[0].work_area.width){
                        newPx = groover.screens[0].work_area.x + groover.screens[0].work_area.width - groover.win.width;
                    }
                    if(newPy + groover.win.height > groover.screens[0].work_area.y + groover.screens[0].work_area.height){
                        newPy = groover.screens[0].work_area.y + groover.screens[0].work_area.height - groover.win.height;
                    }
                    groover.win.x = newPx;
                    groover.win.y = newPy;
                      
                }else{ 
                    if(this.timer <1){
                        this.timer += 0.1;
                        if(this.timer >= 1){
                            this.timer = 1;
                        }
                    }
                    var w = this.w;
                    var x = this.owner.view.width-w;
                    this.mouseOverIcon = 4;
                    for(var i = 0; i < 4; i++){
                        if(this.owner.MK.x > x){
                            this.mouseOverIcon = i;
                            break;
                        }
                        x -= w;
                    }     
                    
                    this.owner.MK.requestCursor(this.cursors[this.mouseOverIcon],this.id);
                    if(this.mouseOverIcon === 0 && this.owner.MK.B1){
                        nw.App.quit();
                    }else
                    if(this.mouseOverIcon === 1 && this.owner.MK.B1){
                        this.owner.MK.B1 = false;
                        if(!groover.win.isFullscreen){
                            this.saveCurrentWindow();
                            this.isMax = true;
                        }
                        groover.win.toggleFullscreen();
                    }else
                    if(this.mouseOverIcon === 2 && this.owner.MK.B1){
                        this.owner.MK.B1 = false;
                        if(this.isMax){
                            this.isMax = false;
                            groover.win.restore();
                            this.restoreSavedWindow();
                        }else{
                            this.isMax = true;
                            this.saveCurrentWindow();
                            groover.win.maximize();
                            this.maxWindow();
                        }
                    }else
                    if(this.mouseOverIcon === 3 && this.owner.MK.B1){
                        this.owner.MK.B1 = false;
                        if(this.isMin){ // I know seems strange. But you never know ??? Dumb luck.
                            this.isMin = false;
                            groover.win.restore();
                        }else{
                            this.isMin = true;
                            groover.win.minimise();
                        }
                    }else
                    if(this.mouseOverIcon === 4 && this.owner.MK.B1){
                        if(!this.dragging){
                            this.dragging = true;
                            this.dragStartX = this.owner.MK.x;
                            this.dragStartY = this.owner.MK.y;
                        }
                    }
                }
            }else{
                if(this.timer > 0){
                    this.timer -= 0.02;
                    if(this.timer < 0){
                        this.timer = 0;
                    }
                }
            }
        },
        display : function(){
            var a = mMath.easeInOut(this.timer,2);
            var r = this.owner.render;
            var img = this.sprites.image;
            var w = this.w;
            var h = this.h;
            var x = this.owner.view.width - w;
            var i;
            for(var i = 0; i < 4; i++){
                if(this.mouseOverIcon === i){
                    r.drawSpriteAWH(img,4-i,x - h,0,this.spriteW+h * 2,this.spriteH + h * 2,a); // 
                    r.blendLighten();
                    r.drawSpriteAWH(img,4-i,x - h,0,this.spriteW+h * 2,this.spriteH + h * 2,a); // 
                    r.blendNormal();                    
                }else{
                    r.drawSpriteA(img,4-i,x,h,a); // 
                }
                x -= w;
            }
            if(this.mouseOverIcon === 4){
                r.drawSpriteAWH(img,0,0,0,x+w,this.height,a); // 
                r.blendLighten();
                r.drawSpriteAWH(img,0,0,0,x+w,this.height,a); // 
                r.blendNormal();                    
                
            }else{
                r.drawSpriteAWH(img,0,0,0,x+w,this.height,a); // 
            }
        }

    }
    
    
    
}
UI.prototype.setupToolTip = function(){
    this.toolTip = {
        render : this.render,
        view : this.view,
        mouse : this.MK,
        maxWidth : 256,
        maxHeight : 256,
        fontSize : 12,
        font : "Arial",
        background : "#DB6",
        colour: "black",
        ready : false,
        avalible : true,
        set : function(text,owner){
            var i, c, maxW, height;
            if(!this.avalible){
                return;
            }
            this.owner = owner;
            text = text.split("\n");
            c = this.canvas.ctx;
            c.font = this.fontSize + "px "+this.font;
            c.textBaseline = "hanging";
            c.fillStyle = this.background;
            c.strokeStyle = this.colour;
            c.clearRect(0,0,this.maxWidth,this.maxHeight);
            maxW = 0;
            for(i = 0; i < text.length; i ++){
                maxW = Math.max(maxW,c.measureText(text[i]).width);
            }
            height = text.length * (this.fontSize +2) + 4;
            c.fillRect(2,2,maxW + 8, height);
            c.strokeRect(2,2,maxW + 8, height);
            c.fillStyle = this.colour;
            for(i = 0; i < text.length; i ++){
                c.fillText(text[i],5,i*(this.fontSize +2) + 6);
            }
             this.width = maxW + 8 + 4;
             this.height = height + 8;
             this.ready = true;
             this.avalible = false;
             this.timer = 0;
        },
        free : function(){
            this.ready = false;
            this.avalible = true;
            this.owner.overCount = 0;
            this.owner = undefined;            
        },
        display : function(){
            var a,x,y;
            if(this.ready){
                a = 1;
                x = this.mouse.x + 5;
                y = this.mouse.y + 8;
                if(x + this.width > this.view.width){
                    x = this.mouse.x - 5 - this.width;
                }
                if(y + this.height > this.view.height){
                    y = this.mouse.y - 8 - this.height;
                }
                if(this.timer < 1){
                    this.timer += 0.05;
                    if(this.timer >= 1){
                        this.timer = 1;
                    }
                    a = mMath.easeInOut(this.timer,2);
                }
                this.render.drawBitmapPart(this.canvas,x,y,0,0,this.width,this.height,a);
            }
        }, 
    }
    this.toolTip.canvas = this.createCanvas(this.toolTip.maxWidth,this.toolTip.maxHeight);
}

UI.prototype.createLocationInterface = function(owner,group){
    return {
        owner : owner,
        group : group,

        set: function(x,y,w,h){
  
            if(x !== null && x !== undefined){
                this.x = x;
            }
            if(y !== null && y !== undefined){
                this.y = y;
            }
            if(w === null || w === undefined){
                if(this.owner.canvas !== undefined){
                    w = this.owner.canvas.width;
                }
            }
            if(h === null || h === undefined){
                if(this.owner.canvas !== undefined){
                    h = this.owner.canvas.height;
                }
            }
            if(w !== null && w !== undefined){
                this.w = w;
            }
            if(h !== null && h !== undefined){
                this.h = h;
            }
            if(this.group !== undefined){
                this.group.recaculateBounds();
            }
        },
        sx : 1,
        sy : 1,
        x:0,
        y:0,
        w:0,
        h:0,
        alpha : 1,

            
    };    
}
UI.prototype.createMouseInterface = function(owner,canHoldMouse){
    return {
        owner : owner,
        id : this.MK.getHolderID(),
        mouse : this.MK,    
        x : 0,
        y : 0,        
        over : false,
        canHoldMouse : canHoldMouse || canHoldMouse === undefined ? true : false,
        hold : false,
        inactive : false,
        overCount : 0,
        deactivate : function(){
            if(this.mouse.mousePrivate !== this.id){
                this.inactive = true;
                if(this.owner.location !== undefined){
                    this.owner.location.alpha = 0.5;
                }
            }
        },
        activate : function(){
            this.inactive = false;
            if(this.owner.location !== undefined){
                this.owner.location.alpha = 1;
            }
        },
        holdMouse : function(){
            if(this.mouse.mousePrivate === this.id){
                this.hold = true;
                this.hx = this.mouse.x;
                this.hy = this.mouse.y;
            }
        },
        releaseMouse : function(){
            this.hold = false;
            var l = this.owner.location;
            if(this.mouse.x >= l.x && this.mouse.x < l.x + l.w && this.mouse.y >= l.y && this.mouse.y < l.y + l.h){
                this.over = true;
            }else{
                this.over = false;
                this.overCount = 0;
            }            
        },
        isMouseOver : function(){
            var l = this.owner.location;
            if(this.inactive){
                return;
            }
            if(this.hold){
                this.over = true;
                this.overCount += 1;
                this.x = this.mouse.x - l.x;
                this.y = this.mouse.y - l.y;
            }else
            if(l.group === undefined || l.group.mouse.over){

                if(this.mouse.x >= l.x && this.mouse.x < l.x + l.w && this.mouse.y >= l.y && this.mouse.y < l.y + l.h){
                    this.over = true;
                    this.overCount += 1;
                    this.x = this.mouse.x - l.x;
                    this.y = this.mouse.y - l.y;
                }else{
                    this.over = false;
                    this.overCount = 0;

                }
                if((this.canHoldMouse  && (this.mouse.mousePrivate === this.id || this.mouse.mousePrivate === 0)) || this.mouse.mousePrivate === this.id){
                    if(this.over){
                        this.mouse.mousePrivate = this.id;
                    }else{
                        if(this.mouse.mousePrivate !== 0){
                            this.mouse.releaseCursor(this.id);
                            this.mouse.mousePrivate = 0;
                        }
                    }
                }
                if(this.over && this.overCount > 60 && this.owner.toolTip !== undefined){
                    if(this.owner.owner.toolTip !== undefined && this.owner.owner.toolTip.avalible){
                        this.owner.owner.toolTip.set(this.owner.toolTip,this);
                        
                    }                    
                }
            }else{
                this.over = false;
                this.overCount = 0;

                if(this.mouse.mousePrivate === this.id && this.hold === false){
                    this.mouse.releaseCursor(this.id);
                    this.mouse.mousePrivate = 0;
                }
            }
                
        },      
    }
}
UI.prototype.createUI = function(){
}

UI.prototype.UIGroup = function(name,data,owner){
    var ui = {
        owner:owner,
        name:name,
        items : [],
        updateList : [],
        displayList : [],
        addUI : function(UILocation){
            this.items.push(UILocation);
            this.recaculateBounds();
            if(UILocation.owner.display !== undefined){
                this.displayList[this.displayList.length] = UILocation.owner;
            }
            if(UILocation.owner.update !== undefined){
                this.updateList[this.updateList.length] = UILocation.owner;
            }
        },

        recaculateBounds : function(){
            var i, len, xm, xM, ym, yM,item;
            len = this.items.length;
            xm = Infinity;
            ym = Infinity;
            xM = -Infinity;
            yM = -Infinity;
            for(i = 0; i < len; i++){
                item = this.items[i];
                xm = Math.min(item.x, xm);
                ym = Math.min(item.y, ym);
                xM = Math.max(item.x + item.w, xM);
                yM = Math.max(item.y + item.h, yM);
            }
            this.location.set(xm, ym, xM - xm, yM - ym);
        },
        update : function(){
            var i, len;
            len = this.updateList.length;
            for(i = 0; i < len; i++){
                this.updateList[i].update();
            }
        },
        display : function(){
            var i, len;
            len = this.displayList.length;
            for(i = 0; i < len; i++){
                this.displayList[i].display();
            }
        },
            
        
    };
    ui.mouse= this.createMouseInterface(ui,false);
    ui.location= this.createLocationInterface(ui);
    return ui;
}
// stub function is used to fill missing UI moduals and stop the system crashing 
// the stub does nothing
UI.prototype.UIStub = function(name,data,owner){
    if(data === undefined){
        data = {};
    }
    var ui = {
        owner:owner,
        name:name,
        update:groover.code.moduals.stub,
        display:groover.code.moduals.stub,
    };
    ui.mouse= this.createMouseInterface(ui,false);
    ui.mouse.isMouseOver = groover.code.moduals.stub;
    ui.location= this.createLocationInterface(ui,data.group);
    ui.location.set = groover.code.moduals.stub;
    return ui;
}
UI.prototype.createUI = function(UIType,name,data,owner){
    if(owner === undefined){
        owner = this;
    }
    if(this[UIType] !== undefined){
        return this[UIType](name,data,owner);
    }
    var UI = groover.code.load(UIType);
    if(UI !== undefined){
        if(UI.create !== undefined){
            return UI.create(name,data,this,owner);
        }
        return UI;
    }
    return this.UIStub(name,data,owner);
}

