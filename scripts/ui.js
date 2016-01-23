"use strict";
function UI(owner){
    this.owner = owner;
    this.bitmaps = this.owner.bitmaps;
    this.render = this.owner.render;
    this.MK = this.owner.mouseKeyboard;
    this.view = this.owner.display;
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
        
}


UI.prototype.update = function(){
}
UI.prototype.display = function(){
    if(groover.busy){
        this.render.drawImageSRA(this.icons.named.busy.image,this.view.width/2,this.view.height * 3/4,1,this.owner.animFrame.time.valueOf()/10,1);
        this.render.drawText(groover.busyMessage,this.view.width/2,this.view.height * 3/4 + 40);
    }        
}

UI.prototype.mediaReady = function(){
    this.ready = true;
    log("UI ready");
    
}
UI.prototype.loadMedia = function(){
    this.icons = this.bitmaps.startLoad(this.mediaReady.bind(this),"icons");
    this.bitmaps.load("icons","icons/busy.png","busy");
}
UI.prototype.createLocationInterface = function(owner,group){
    return {
        owner : owner,
        group : group,
        set: function(x,y,w,h){
            this.x = x;
            this.y = y;
            if(w === undefined){
                w = this.owner.canvas.width;
            }
            if(h === undefined){
                h = this.owner.canvas.height;
            }
            this.w = w;
            this.h = h;
            if(this.group !== undefined){
                this.group.recaculateBounds();
            }
        },
        x:0,
        y:0,
        w:0,
        h:0,
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
        holdMouse : function(){
            if(this.mouse.mousePrivate === this.id){
                this.hold = true;
                this.hx = this.mouse.x;
                this.hy = this.mouse.y;
            }
        },
        releaseMouse : function(){
            this.hold = false;
        },
        isMouseOver : function(){
            var l = this.owner.location;
            if(this.hold){
                this.over = true;
                this.x = this.mouse.x - l.x;
                this.y = this.mouse.y - l.y;
            }else
            if(l.group === undefined || l.group.mouse.over){

                if(this.mouse.x >= l.x && this.mouse.x < l.x + l.w && this.mouse.y >= l.y && this.mouse.y < l.y + l.h){
                    this.over = true;
                    this.x = this.mouse.x - l.x;
                    this.y = this.mouse.y - l.y;
                }else{
                    this.over = false;
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
            }else{
                this.over = false;
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


UI.prototype.createDayView = function(){
    var uiReady = function(){
       ui.ready = true;
    }
    this.icons = this.bitmaps.startLoad(uiReady,"icons");    
    var ui = {
        owner : this,
        ready : false,
        nightDay : this.bitmaps.load("icons","icons/NightEveningDay.png","nightDay"),
        day24 : this.bitmaps.load("icons","icons/Day24.png","day24"),
        timeMark : this.bitmaps.load("icons","icons/TimeMarker.png","timeMarker"),
        canvas : this.createCanvas(256 * 7, 32),  
        mouse:null,
        location:null,
        time : new Date().valueOf(),
        duration: 60 * 60 * 1000,
        now : Math.ceil(new Date().valueOf() / (24*60*60*1000))*(24*60*60*1000),
        totalTime : 7 * (24*60*60*1000), // in days
        sliderNx : 0,  // normalised pos
        sliderNw : 0,  // normalised width
        doInterface : function(time,dur){
            this.mouse.isMouseOver();
            this.now = new Date().valueOf();
            this.now = Math.ceil(this.now / (24*60*60*1000))*(24*60*60*1000);
            this.duration = dur;
            this.time = time;
            this.sliderNx = (time-(this.now - this.totalTime))/this.totalTime;
            this.sliderNw = dur/this.totalTime;
            if(this.mouse.over){
                if(this.mouse.mouse.mousePrivate === this.mouse.id){
                    this.mouse.mouse.requestCursor("pointer",this.mouse.id);
                }
            }            
        
        },
        update : function(time,duration){            
            if(ui.ready){

               this.doInterface();

                var rend = this.owner.render;
                var nd = this.nightDay.image;
                var nd24 = this.day24.image;
                var tm = this.timeMark.image;
                rend.pushCTX(this.canvas.ctx);                
                for(var i = 0; i < 7; i += 1){
                    rend.drawBitmapAbs(nd,i*256,0,i*256+128,32,1);
                    rend.drawBitmapAbs(nd,i*256+255,0,i*256+128,32,1);
                    rend.drawBitmapAbs(nd24,i*256,0,i*256+256,32,1);
                }
                rend.drawBitmapAbs(tm,this.sliderNx*256*7,2,(this.sliderNx+this.sliderNw)*256*7,29,0.4);
                rend.popCTX();
            }
        },
        display : function(){
            var rend = this.owner.render;
            var l = this.location;
            var a = this.mouse.over?1:0.7;
            rend.drawBitmapSize(this.canvas,l.x,l.y,l.w,l.h,a);
        }
            
    }
    ui.mouse= this.createMouseInterface(ui);
    ui.location= this.createLocationInterface(ui);
    return ui;
}
    


UI.prototype.createSlider = function(min,max,width,group){
    var tempX,tempY,tempH,tempW;
    var uiReady = function(){
       ui.ready = true;
       ui.setup();
       ui.location= ui.owner.createLocationInterface(ui,group);
       if(tempX !== undefined){
        ui.location.set(tempX,tempY,tempW,tempH);
       }
       if(group !== undefined){
           group.addUI(ui.location);
       }
       ui.update();

    }
    this.icons = this.bitmaps.startLoad(uiReady,"icons");    
    //this.startLoad(ui);
    var ui = {
        owner : this,
        ready : false,
        min : min,
        max : max,
        value : min,
        sprites : this.bitmaps.load("icons","icons/SliderSmall.png","sliderSpritesSmall",this.bitmaps.onLoadCreateHSprites.bind(this.bitmaps)),
        canvas : null,  
        location :{
            set : function(x,y,w,h){
                tempX = x;
                tempY = y;
                tempH = h;
                tempW = w;
            }
        }, // stub till ready to set location
        setup : function(){
            this.canvas = this.owner.createCanvas(width,12);
        },
        update : function(){
            
            if(this.ready){
                this.mouse.isMouseOver();
                var rend =this.owner.render;
                rend.pushCTX(this.canvas.ctx); 
                var c = this.canvas.ctx;
                var w = this.canvas.width-17;
                var pos = Math.round(((this.value-this.min)/(this.max-this.min))*(w-4)+2);
                var img = this.sprites.image;
                rend.drawSpriteA(img,4,0,0,1);
                rend.drawSpriteAW(img,5,3,0,w,1);
                rend.drawSpriteA(img,6,3+w,0,1);
                rend.drawSpriteA(img,49,6+w,0,1);
                rend.drawSpriteA(img,50,9+w,0,1);
                rend.drawSpriteA(img,45,10+w,0,1);
                rend.drawSpriteA(img,28,pos,0,1);
                rend.popCTX();
            }
        },
        display : function(){
            this.mouse.isMouseOver();
            if(this.mouse.over){
                if(this.mouse.mouse.mousePrivate === this.mouse.id){
                    this.mouse.mouse.requestCursor("pointer",this.mouse.id);
                }
            }              
            var rend = this.owner.render;
            var l = this.location;
            var a = 1;//this.mouse.over?1:0.7;
            rend.drawBitmapSize(this.canvas,l.x,l.y,l.w,l.h,a);
        }        
    }
    
    ui.mouse=this.createMouseInterface(ui);
    return ui;
    
}    

var Item = {
    x : 0,
    y : 0,
    w : 0,
    h : 0,
    sx : 1,  // scale
    sy : 1,
    r : 0,  // rotation
    a : 0,  // alpha
}