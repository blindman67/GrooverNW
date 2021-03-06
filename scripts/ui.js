"use strict";
function UI(owner){
    this.owner = owner;
    this.bitmaps = this.owner.bitmaps;
    this.render = this.owner.render;
    this.view = this.owner.view;
    this.MK = this.owner.mouseKeyboard;
    this.view = this.owner.view;
    this.icons = {};
    this.loadMedia();
    this.name = "UI";
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
// does nothing but requiered by groover
UI.prototype.viewUpdated = function(){
    
}
// does nothing for the time being but requiered by groover
UI.prototype.update = function(){
}
// display displays the tooltops, frame controls (drag window, min max etc) and the busy indicator.
UI.prototype.display = function(){
    if(this.toolTip !== undefined && this.toolTip.ready){
        if(!this.toolTip.owner.over || this.MK.BR !== 0 || this.MK.w !== 0 || this.toolTip.owner.owner.location.alpha === 0){
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
// when UI requiered media has loaded creates the frame control and flags its self as ready.
UI.prototype.mediaReady = function(){
    if(this.frameControl !== undefined){
        this.frameControl.setup();
    }
    this.ready = true;
    log("UI ready"); 
}
// loads the busy icon.
UI.prototype.loadMedia = function(){
    this.icons = this.bitmaps.startLoad("icons",this.mediaReady.bind(this));
    this.bitmaps.load("icons","icons/busy.png","busy");
}
// creates frame controls.
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
            var mx,my,newPy,newPx,w,x,i
            if(this.over){
                if(this.dragging){
                    if(!this.owner.MK.B1){
                        this.dragging = false;
                    }
                    mx = this.owner.MK.x-this.dragStartX
                    my = this.owner.MK.y-this.dragStartY
                    newPx = Math.max(0,groover.win.x + mx);
                    newPy = Math.max(0,groover.win.y + my);
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
                    w = this.w;
                    x = this.owner.view.width-w;
                    this.mouseOverIcon = 4;
                    for( i = 0; i < 4; i++){
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
            var a,r,img,w,h,x,i;
            a = mMath.easeInOut(this.timer,2);
            r = this.owner.render;
            img = this.sprites.image;
            w = this.w;
            h = this.h;
            x = this.owner.view.width - w;
            i;
            for(i = 0; i < 4; i++){
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
            c = this.canvas.ctx;
            c.font = this.fontSize + "px "+this.font;
            c.textBaseline = "hanging";
            c.fillStyle = this.background;
            c.strokeStyle = this.colour;
            c.clearRect(0,0,this.maxWidth,this.maxHeight);
            if( text.text === undefined ){
                text = text.split("\n");
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
            }else{
                groover.code.moduals.textRender.fillText(c,text,4,4,"left");
                this.width = text.width;
                this.height = text.height;                
            }
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
                x = this.mouse.x + 8;
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
                a = a * this.owner.owner.location.alpha;
                this.render.drawBitmapPart(this.canvas,x,y,0,0,this.width,this.height,a);
            }
        }, 
    }
    this.toolTip.canvas = this.createCanvas(this.toolTip.maxWidth,this.toolTip.maxHeight);
}
// Creates a loaction abstraction for a control.
// Locations are relative to a view. See view.js
// Locations do not hold the view object but just the name of the associated view.
// to set the view call set(x,y,w,h);
// all the arguments are optional and the location will do its best to place the location with
// the current known data.
// x >= 0 sets the left position
// x < 0 sets the right position from the right edge of the view
// x = "center" centers the control on the view.
// x = undefined will set the next avalible position for thr control. NOT YET IMPLEMENTED
// y same as x
// w for width
// w >= 0 sets the width to w
// w < 0 set the width to make the right of the control w pixels from the right of the view
// w = undefined sets the width to the controls canvas.width.
// h is height and same aas w
UI.prototype.createLocationInterface = function(owner,group){
    return {
        owner : owner,
        group : group,
        view : this.view,
        viewName : this.view.currentViewName,
        add: function(x,y,w,h,id,index){  // must provide full coordinates. Having x,y,w,h as undefined or null will create unexpected results
            var position;
            if(this.list === undefined){
                this.list = [];
            }
            if(index !== undefined && this.list[index] !== undefined){
                position = this.list[index];
            }
            this.set(x,y,w,h);
            if(position === undefined){
                this.list.push(position = {
                    x : this.x,
                    y : this.y,
                    w : this.w,
                    h : this.h,
                    id : id,
                });
            }else{
                position.x = this.x;
                position.y = this.y;
                position.w = this.w;
                position.h = this.h;                
            }
            if(this.group !== undefined){
                this.group.recaculateBounds();
            }
            return position;
        },
        set: function(x,y,w,h){
            this.view.pushViewByName(this.viewName);
            this.abstracted.x = x;
            this.abstracted.y = y;
            this.abstracted.w = w;
            this.abstracted.h = h;
            if(w === undefined){
                if(this.owner.canvas !== undefined){
                    w = this.owner.canvas.width;
                }
            }
            if(h === undefined){
                if(this.owner.canvas !== undefined){
                    h = this.owner.canvas.height;
                }
            }
            if(w !== undefined){
                if(w < 0){
                    if(x === "center"){
                        x = -w;
                        w = this.view.width + (w * 2);                        
                    }else
                    if(x !== undefined && x >= 0){
                        w = (this.view.width - x) + w;
                    }
                }else{
                    if(x === "center"){
                        x = (this.view.width-w)/2;
                    }
                }
                this.w = w;
            }
            if(h !== undefined){
                if(h < 0){
                    if(y === "center"){
                        y = -h;
                        h = this.view.height + (h * 2);
                    }else
                    if(y !== undefined && y >= 0){
                        h = (this.view.height - y) + h;
                    }
                }else{
                    if(y === "center"){
                        y = (this.view.height-h)/2;
                    }
                }
                this.h = h;
            }
            if(x !== undefined){
                if(x === "center"){
                    if(this.w !== undefined){
                        if(this.w < 0){
                            x = - this.w;                            
                            this.w = this.view.width  + this.w * 2; 
                        }else{
                            x = (this.view.width - this.w)/2;
                        }
                    }else{
                        x = this.view.width /2;
                    }
                }else
                if(x < 0){
                    if(this.w !== undefined){
                        if(this.w < 0){
                            this.w = (this.view.width + x) + this.w;                            
                            x = this.view.width - (-x + this.w);
                        }else{
                            x = this.view.width - (-x + this.w);
                        }
                    }else{
                        x = this.view.width + x;
                    }
                }
                this.x = x;
            }
            if(y !== undefined){
                if(y === "center"){
                    if(this.h !== undefined){
                        if(this.h < 0){
                            y = - this.h; 
                            this.h = this.view.height  + this.h * 2; 
                        }else{
                            y = (this.view.height - this.h)/2;
                        }
                    }else{
                        y = this.view.height /2;
                    }                    
                }else
                if(y < 0){
                    if(this.h !== undefined){
                        if(this.h < 0){
                            this.h = (this.view.height + y) + this.h;  
                            y = this.view.height - (-y + this.h);
                        }else{
                            y = this.view.height - (-y + this.h);
                        }
                    }else{
                        y = this.view.height + y;
                    }
                }
                this.y = y;
            }
            this.x += this.view.left;
            this.y += this.view.top;
            if(this.group !== undefined){
                this.group.recaculateBounds();
            }
            this.view.popView();
        },
        x : 0,
        y : 0,
        w : 0,
        h : 0,
        abstracted : {  // set and addFunctions provide abstracted coordinates so must be stored as well
            x:0,y:0,w:0,h:0
        },
        alpha : 1,
        list : undefined,
    };    
}
// General mouse interface for a UI control
// Each uicontrol will get a App unique ID when the mouse moves over a control the mouse will request 
// that it has private access to the mouse. If no other control has the private access the control is 
// granted private access. When the mouse moves off the control the mouse will release the private acess.
// Use holdMouse and releaseMouse to hold and release the mouse. While the private access is held no other
// UI controls can get access to the mouse. This is to allow  for controls where the mouse will move off the 
// control yet still have active access to imput. 

// Methods
// deactivate and activate turn off and on the mouse interface for the UI control
// holdMouse locks the mouse to the UI control.
// releaseMouse unlocks the mouse and rechecks if the mouse is over the controllers
// isMouseOver checks if mouse if over. IF control is part of a group the mouse must be over the group as well
//             Having a control outside the group will make it invisible to the mouse
//             Not checking groups by call isMouseOver will also make the controls invisible to the mouse.
UI.prototype.createMouseInterface = function(owner,canHoldMouse){
    return {
        owner : owner,
        id : this.MK.getHolderID(),
        mouse : this.MK,    
        x : 0,
        y : 0,       
        positionsId : 0,   // if icons are seperated location are use this tracks which location is over    
        positionsIndex : -1, // the index of the seperated icon/location
        over : false,
        overReal : false,   // like over but ignores hold flag
        canHoldMouse : canHoldMouse || canHoldMouse === undefined ? true : false,
        hold : false,
        inactive : false,
        overCount : 0,
        deactivate : function(){
            if(this.mouse.mousePrivate === this.id){
                this.mouse.mousePrivate = 0
            }
            this.inactive = true;
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
            var mx,my,over,len,il;
            mx = this.mouse.x;
            my = this.mouse.y;
            this.hold = false;
            var l = this.owner.location;
            over = false;
            if(l.list === undefined){
                if(mx >= l.x && mx < l.x + l.w && my >= l.y && my < l.y + l.h){
                    over = true;
                }
            }else{
                if(this.positionsIndex > -1){
                    il = l.list[this.positionsIndex];
                    if(mx >= il.x && mx < il.x + il.w && my >= il.y && my < il.y + il.h){
                        over = true;
                        this.positionsIndex = -1;
                    }                    
                }else{
                    /*  this could have a use later
                    len = l.list.length;
                    for(var i = 0 ; i < len; i++){
                        il = l.list[i];
                        if(mx >= il.x && mx < il.x + il.w && my >= il.y && my < il.y + il.h){
                            over = true;
                            break
                        }
                    }
                    */
                }
            }
            if(over){
                this.over = true;
                this.overReal = true;
            }else{
                this.over = false;
                this.overReal = false;
                this.overCount = 0;
            }            
        },
        isMouseOver : function(){
            var mx,my,i,len,il,over;
            mx = this.mouse.x;
            my = this.mouse.y;
            var l = this.owner.location;
            if(this.inactive){
                return;
            }
            if(this.hold && l.group !== undefined && !l.group.mouse.over){
                over = false
                if(l.list === undefined){
                    if(mx >= l.x && mx < l.x + l.w && my >= l.y && my < l.y + l.h){
                        over = true;
                    }
                    this.overReal = over;
                    this.x = mx - l.x;
                    this.y = my - l.y;
                }else{
                    if(this.positionsIndex > -1){
                        il = l.list[this.positionsIndex];
                        if(mx >= il.x && mx < il.x + il.w && my >= il.y && my < il.y + il.h){
                            over = true;
                        }                           
                        this.x = mx - l.x;
                        this.y = my - l.y;
                    }
                    this.overReal = over;
                }
            }else
            if(l.group === undefined || l.group.mouse.over){
                over = false;
                if(l.list === undefined){
                    if(mx >= l.x && mx < l.x + l.w && my >= l.y && my < l.y + l.h){
                        over = true;
                        this.x = mx - l.x;
                        this.y = my - l.y;
                        this.overReal = true;
                    }
                    if(this.hold && !over){
                        over = true;
                        this.overReal = false;
                        this.x = mx - l.x;
                        this.y = my - l.y;
                    }                     
                }else{
                    if(!this.hold){
                        len = l.list.length;
                        for(var i = 0 ; i < len; i++){
                            il = l.list[i];
                            if(mx >= il.x && mx < il.x + il.w && my >= il.y && my < il.y + il.h){
                                over = true
                                this.x = mx - il.x;
                                this.y = my - il.y;
                                if(this.positionsId !== il.id){
                                    this.overCount = 0;                                                    
                                }
                                this.positionsId = il.id;
                                this.positionsIndex = i;
                                break;
                            }
                        }
                    }else{
                        if(this.positionsIndex > -1){
                            il = l.list[this.positionsIndex];
                            if(mx >= il.x && mx < il.x + il.w && my >= il.y && my < il.y + il.h){
                                over = true;
                            }                           
                            this.x = mx - l.x;
                            this.y = my - l.y;
                        }
                        this.overReal = over;
                        over = true;
                    }                     
                    if(!over){
                        this.positionsIndex = -1;
                    }
                }
               
                if(over){
                    this.over = true;
                    this.overCount += 1;                    
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
// Creates a UI group.
// use group = UI.createUI("UIGroup","name") to create a group
// to add a UI to a group add {group:group} to the settings obj
// eg var button = UI.createUI("UIButton","myButton",{group : group};
// you can then update, display, setup and call mouse functions from the group
// eg group.display() // displays all UI controls in the group.
// eg group.mouseFunction("deactivate"); // calls the mouse function deactivate on all controls in the group.
// Call recaculateBounds if you move UI controls.
// getNamedUI(name) returns the control with the name name. or undefined if not found;
UI.prototype.UIGroup = function(name,settings,owner){
    var UI = this;
    if(settings === undefined){
        settings = {};
    }
    var ui = {
        owner:owner,
        name:name,
        settings:settings,
        canvas : undefined,
        dirty : true,
        focusedOn : undefined,
        items : [],
        updateList : [],
        displayList : [],
        setupList : [],
        addUI : function(UILocation){
            this.items.push(UILocation);
            this.recaculateBounds();
            if(UILocation.owner.display !== undefined){
                this.displayList[this.displayList.length] = UILocation.owner;
            }
            if(UILocation.owner.update !== undefined){
                this.updateList[this.updateList.length] = UILocation.owner;
            }
            if(UILocation.owner.setup !== undefined){
                this.setupList[this.setupList.length] = UILocation.owner;
            }
        },
        release : function(id){
            var i,len;
            len = this.items.length;
            for(i = 0; i < len; i ++){
                if(this.items[i].owner.id === id){
                    this.items.splice(i,1);
                    break;
                }
            }
            len = this.updateList.length;
            for(i = 0; i < len; i ++){
                if(this.updateList[i].owner.id === id){
                    this.updateList.splice(i,1);
                    break;
                }
            }
            len = this.displayList.length;
            for(i = 0; i < len; i ++){
                if(this.displayList[i].owner.id === id){
                    this.displayList.splice(i,1);
                    break;
                }
            }
            len = this.setupList.length;
            for(i = 0; i < len; i ++){
                if(this.setupList[i].owner.id === id){
                    this.setupList.splice(i,1);
                    break;
                }
            }
            recalculateBounds();
        },
        getNamedUI : function(name){
            var i, len;
            len = this.items.length;
            for(i = 0; i < len; i++){
                if(this.items[i].owner.name === name){
                    return this.items[i].owner;
                }
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
            this.dirty = true;
        },
        mouseFunction : function(funcName){
            var item,i,len;
            len = this.items.length;
            for(i = 0; i < len; i++){
                item = this.items[i];
                if(item.owner.mouse !== undefined && typeof item.owner.mouse[funcName] === "function"){
                    item.owner.mouse[funcName]();
                }
            }                
        },
        setup : function(){  
            var i, len;
            if(this.settings.ownCanvas){
                 this.canvas = UI.createCanvas(this.location.w,this.location.h)
                 this.dirty = true;
            }
            len = this.setupList.length;
            for(i = 0; i < len; i++){
                this.setupList[i].setup();
            }                
            
        },
        redraw : function(){
            this.setup();
            this.dirty = false;
        },
        update : function(){            
            var i, len;
            if(this.dirty){
                this.redraw();
            }
            len = this.updateList.length;
            for(i = 0; i < len; i++){
                this.updateList[i].update();
            }
        },
        display : function(){
            var i, len;
            len = this.displayList.length;
            if(this.canvas !== undefined){
                var rend = UI.render;
                rend.pushCTX(this.canvas.ctx);
                for(i = 0; i < len; i++){
                    this.displayList[i].display();
                }                
                rend.popCTX();
                rend.drawBitmapSize(this.canvas,l.x,l.y,l.w,l.h,1);                
                
            }else{
                if(this.focusedOn !== undefined){
                    for(i = 0; i < len; i++){
                        if(this.focusedOn.id !== this.displayList[i].id){
                            this.displayList[i].location.alpha = this.location.alpha;
                            this.displayList[i].display();
                        }
                    }
                    this.focusedOn.location.alpha = this.location.alpha;
                    this.focusedOn.display();
                }else{
                    for(i = 0; i < len; i++){
                        this.displayList[i].location.alpha = this.location.alpha;
                        this.displayList[i].display();
                    }
                }
            }
        },
            
        
    };
    ui.mouse = this.createMouseInterface(ui,false);
    ui.location = this.createLocationInterface(ui);
    return ui;
}
UI.prototype.defaultUpdate = function(){
    var mouse;
    if (this.ready) {
        mouse = this.mouse;
        mouse.isMouseOver();
        if(mouse.mouse.mousePrivate === mouse.id){
            this.hover = true;
            mouse.mouse.requestCursor("pointer", mouse.id);
            if(mouse.mouse.B1 && ! mouse.hold){
                mouse.holdMouse();
                this.clicking = true;                            
                this.holding = true;
            }
            if(mouse.hold && mouse.mouse.oldB1 && !mouse.mouse.B1){
                mouse.mouse.oldB1 = false;
                mouse.releaseMouse();
                if(mouse.over && this.holding){
                    this.clicking = false;
                    this.clicked();
                    if(typeof this.onclick === "function"){
                        this.onclick(this);
                    }                                
                }
                this.holding = false;
            }
            if(!mouse.overReal && mouse.hold){
                this.holding = false;
                this.clicking = false;                        
            }            
        }else{
            this.hover = false;
            this.clicking = false;                        
        }
        if(this.dirty){
            this.redraw();
        }
    }
}
UI.prototype.addUIDefaults = function(UI,owner,name,settings){
    this.owner = owner;
    this.name = name;
    this.id = this.id === undefined ? groover.utils.IDS.getID() : this.id;
    this.toolTip = settings.toolTip;
    this.text = settings.text;
    this.dirty = true;
    this.canvas = undefined;
    this.settings = settings;
    this.style = this.style === undefined?settings.style:this.style;
    this.minWidth = settings.minWidth  = settings.minWidth !== undefined ? settings.minWidth : 200
    this.minHeight = settings.minHeight = settings.minHeight !== undefined ? settings.minHeight : 200
    this.width = settings.width !== undefined ? settings.width : settings.minWidth;
    this.height = settings.height !== undefined ? settings.height : settings.minHeight;
    this.x = settings.x;
    this.y = settings.y;    
    if(this.update === undefined){
        this.clicking = false;
        this.holding = false;
        this.hover = false;
        this.clickingVal = 0;
        this.hoverVal = 0;
        if(this.clicked === undefined){
            this.clicked = function(){};
        }
        this.update = UI.defaultUpdate.bind(this);
    }
    this.group = settings.group;
    this.mouse = UI.createMouseInterface(this);            
    this.location = UI.createLocationInterface(this, settings.group);
    this.setup();
    if (settings.group !== undefined) {
        settings.group.addUI(this.location);
    }
    this.update();
    this.ready = true;
}
UI.prototype.setupStyleDefaults = function(who,defs){
    var i,st;
    if(who.style === undefined){
        who.style = {};
    }
    for(i = 0; i < defs.length; i ++){
        st = defs[i];
        if(who.style[st[0]] === undefined){
            if(st[2] === "copy"){
                who.style[st[0]] = groover.utils.styles.copyStyle(groover.utils.namedStyles[st[1]]);
            }else{
                who.style[st[0]] = groover.utils.namedStyles[st[1]];
            }
        }
    }
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
// creates a new UI control.
// Will load the modual if needed and create the control
// Returns the control. If the modual can not be found a UIStub is returned. This is for develmopment 
UI.prototype.createUI = function(UIType,name,settings,owner){
    if(owner === undefined){
        owner = this;
    }
    if(this[UIType] !== undefined){
        return this[UIType](name,settings,owner);
    }
    var UI = groover.code.load(UIType);
    if(UI !== undefined){
        if(UI.create !== undefined){
            return UI.create(name,settings,this,owner);
        }
        return UI;
    }
    return this.UIStub(name,settings,owner);
}

