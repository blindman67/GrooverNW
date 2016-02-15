(function () {  // Slider Small UI
    var shapes;
    var create = function (name,settings,UI,owner) {
        var h,ww,id;
        var numContainer,numSprites,handle,bar;
        id = groover.utils.IDS.getID();      
        if(settings.styleID === undefined){
            settings.styleID = id;
        }
        if(owner === undefined){
            owner = UI;
        }
        UI.setupStyleDefaults(settings,[
            ["handle","UISliderHandle"],
            ["bar","UISlider"],
            ["numDisplay","UISliderDisplay"],
            ["font","UIFont","copy"],
        ]);

        // use styles to get sizes
        settings.height = settings.height===undefined?settings.style.bar.height:settings.height;
        h = settings.height;
        ww = Math.floor(h + 20);        
        settings.handleWidth = settings.handleWidth===undefined?30:settings.handleWidth;
        if(settings.handleWidth < (settings.style.handle.rounding + settings.style.handle.inset)*2 + 10){
            settings.handleWidth = (settings.style.handle.rounding + settings.style.handle.inset)*2 + 10;
        }
        if(settings.showValue){
            settings.style.font.fontSize = Math.max(12,settings.height-Math.floor(settings.height/4));
        }



        // if owner not supplied set the UI as the owner
        
        handle = UI.bitmaps.create("icons",(settings.style.handle.rounding + settings.style.handle.inset)*2+10,h, "handle"+settings.styleID)
        bar = UI.bitmaps.create("icons",(settings.style.bar.rounding + settings.style.bar.inset)*2 + 10,h, "bar"+settings.styleID)
        var lw = 3;
       
       
        // Draw handle if not drawn
        if(!handle.drawn){
            lw = settings.style.handle.lineWidth + settings.style.handle.inset ;
            ww = handle.image.width;
            shapes.drawRectangle(handle.image,lw,lw,ww-lw*2,h-lw*2,settings.style.handle );
            ww = (settings.style.handle.rounding + settings.style.handle.inset);
            handle.image.sprites = [];
            handle.image.sprites.push({x:0,y:0,w:ww,h:h});
            handle.image.sprites.push({x:ww,y:0,w:10,h:h});
            handle.image.sprites.push({x:handle.image.width-ww,y:0,w:ww,h:h});
            handle.drawn = true;            
        }
        settings.minHandleWidth = (settings.style.handle.rounding + settings.style.handle.inset)*2+5;
        
        
        if(!bar.drawn){
            lw = settings.style.bar.lineWidth + settings.style.bar.inset ;
            ww = (settings.style.bar.rounding + settings.style.bar.inset)*2+10;
            shapes.drawRectangle(bar.image,lw,lw,ww-lw*2,h-lw*2,settings.style.bar );
            ww = (settings.style.bar.rounding + settings.style.bar.inset);
            bar.image.sprites = [];
            bar.image.sprites.push({x:0,y:0,w:ww,h:h});
            bar.image.sprites.push({x:ww,y:0,w:bar.image.width-ww*2,h:h});
            bar.image.sprites.push({x:bar.image.width-ww,y:0,w:ww,h:h});
            bar.drawn = true;
        }
        if(settings.showValue === undefined || settings.showValue){
            numContainer = UI.bitmaps.create("icons",(settings.style.numDisplay.rounding + settings.style.numDisplay.inset)*2 + 10,h, "numContainer"+settings.styleID)
            if(!numContainer.drawn){
                lw = settings.style.numDisplay.lineWidth + settings.style.numDisplay.inset ;
                ww = (settings.style.numDisplay.rounding + settings.style.numDisplay.inset)*2+ 10;
                shapes.drawRectangle(numContainer.image,lw,lw,ww-lw*2,h-lw*2,settings.style.numDisplay);
                ww = (settings.style.numDisplay.rounding + settings.style.numDisplay.inset);
                numContainer.image.sprites = [];
                numContainer.image.sprites.push({x:0,y:0,w:ww,h:h});
                numContainer.image.sprites.push({x:ww,y:0,w:numContainer.image.width-ww*2,h:h});
                numContainer.image.sprites.push({x:numContainer.image.width-ww,y:0,w:ww,h:h});        
                numContainer.drawn = true;
            }
            if(settings.useSpriteNumbers === undefined || settings.useSpriteNumbers){
                numSprites = UI.bitmaps.create("icons",600,h, "customSlider"+settings.styleID);
                if(!numSprites.drawn){
                    numSprites.image.ctx.font = settings.style.font.fontSize+"px "+settings.style.font.font
                    numSprites.image.ctx.textBaseline = "middle";
                    numSprites.image.ctx.textAlign = "left";
                    numSprites.image.ctx.fillStyle = settings.style.font.fontColour;
                    numSprites.image.ctx.fillText("0 1 2 3 4 5 6 7 8 9 . + -",0,h/2);
                    UI.bitmaps.horizontalSpriteCutter(numSprites);
                    numSprites.drawn = true;
                }
                var maxWidth = 0;
                for(var i = 0; i < numSprites.image.sprites.length; i ++){
                    maxWidth = Math.max(maxWidth,numSprites.image.sprites[i].w);
                }
            }else{
                var maxWidth = settings.style.font.fontSize/2;
            }
            settings.fontWidth = maxWidth+2;        
        }
        
        var ui = {
            id : id,          
            min : settings.min,
            max : settings.max,
            handleSpan : settings.handleSpan !== undefined ? settings.handleSpan: 1,
            value : settings.value,
            oldValue : null,
            images : {
                sprites : numSprites,        // image
                handle : handle,             // image
                numContainer : numContainer, // image
                bar :  bar,                  // image
            },                
            sprites : numSprites,        // image
            handle : handle,             // image
            numContainer : numContainer, // image
            bar :  bar,                  // image
            draggingSlider : false,
            dragStartPos : 0,
            ondrag : typeof settings.ondrag === "function"?settings.ondrag:undefined,
            mouseWheelStep : settings.wheelStep,
            digits : settings.digits,
            decimalPlaces : settings.decimalPlaces, 
            numWidth : (settings.digits + 1) * settings.fontWidth,
            fontWidth : settings.fontWidth,
            handleWidth : settings.handleWidth,
            showValue : settings.showValue === undefined || settings.showValue ? true : false,
            useSpriteNumbers : settings.useSpriteNumbers === undefined || settings.useSpriteNumbers ? true : false,
            
            minHandleWidth : settings.minHandleWidth,
            setHandleWidth : function(value){
                this.handleSpan = value;
                value = Math.min(1,value/(this.max-this.min));
                this.handleWidth = Math.max(this.minHandleWidth,value * (this.canvas.width - this.numWidth));
                this.dirty = true;
            },
            setMinMax : function(min,max){
                this.min = min;
                this.max = max;
                this.setHandleWidth(this.handleSpan);
            }, 
            setValue : function(value){
                if(typeof value !== "number"){
                    if(isNaN(value)){
                        return;
                    }
                    value = Number(value);
                }
                this.value = Math.min(this.max,Math.max(this.min,value));
                this.dirty = true;
            },                
            setup : function () {
                if(this.showValue){
                    this.numWidth = (this.settings.digits + 1) * this.fontWidth;
                    if(this.settings.decimalPlaces > 0){
                        this.numWidth += this.settings.decimalPlaces * this.fontWidth + Math.floor(this.fontWidth*0.5);
                    }
                    //this.digits = this.settings.digits+this.settings.decimalPlaces
                }else{
                    this.numWidth = 0;
                }
                this.location.set(this.x, this.y, this.width, this.height);
                if(this.canvas === undefined || this.canvas.width !== this.location.w || this.canvas.height !== this.location.h){
                    this.canvas = this.owner.createCanvas(this.location.w,this.location.h);
                }
                this.setHandleWidth(this.handleSpan);
                this.dirty = true;  // flag as dirty so it is redrawn
            },
            redraw : function(){
                var num,extra,extraX,pw,r,i,w,nw,pos,imgs, barI, handleI,numContI,numI, handleW,fontWidth;
                fontWidth = this.fontWidth;
                handleW = this.handleWidth;
                imgs = this.images;
                barI = imgs.bar.image;
                handleI = imgs.handle.image;
                if (this.showValue) {
                    numContI = imgs.numContainer.image;
                    if (this.useSpriteNumbers) {
                        numI = imgs.sprites.image;
                    }
                }
                w = this.canvas.width;
                nw = this.numWidth;
                pos = Math.round(((this.value - this.min) / (this.max - this.min)) * (w - nw - this.handleWidth) + this.handleWidth / 2);
                r = this.owner.render;
                this.canvas.ctx.setTransform(1, 0, 0, 1, 0, 0);
                this.canvas.ctx.clearRect(0, 0, w, this.canvas.height);
                r.pushCTX(this.canvas.ctx);
                r.setGlobalAlpha(1);
                pw = barI.sprites[0].w;
                r.drawSpriteA(barI, 0, 0, 0, 1);
                r.drawSpriteAW(barI, 1, pw, 0, w - nw - pw * 2, 1);
                r.drawSpriteA(barI, 2, w - nw - pw, 0, 1);
                if (this.showValue) {
                    pw = numContI.sprites[0].w;
                    r.drawSpriteA(numContI, 0, w - nw, 0, 1);
                    r.drawSpriteAW(numContI, 1, w - nw + pw, 0, this.numWidth - pw * 2, 1);
                    r.drawSpriteA(numContI, 2, w - pw, 0, 1);
                    num = "" + mMath.padNumber(this.value.toFixed(this.decimalPlaces), this.digits);
                    if (this.useSpriteNumbers) {
                        extra = 0;
                        extraX = 0;
                        for (i = 0; i < this.digits; i++) {
                            if (i + extra > num.length) {
                                r.drawSpriteA(numI, 0, w - nw + 10 + fontWidth * i + extraX, 0, 1);
                            } else {
                                if (num[i + extra] === ".") {
                                    r.drawSpriteA(numI, 10, w - nw + 10 + fontWidth * i + extraX, 0, 1);
                                    extra += 1;
                                    extraX += 10;
                                }
                                r.drawSpriteA(numI, num.charCodeAt(i + extra) - 48, w - nw + 10 + fontWidth * i + extraX, 0, 1)
                            }
                        }
                    } else {
                        this.canvas.ctx.setTransform(1, 0, 0, 1, 0, 0);
                        this.canvas.ctx.font = this.style.font.fontSize + "px " + this.style.font.font;
                        this.canvas.ctx.textBaseline = "middle";
                        this.canvas.ctx.textAlign = "center";
                        this.canvas.ctx.fillStyle = this.style.font.fontColour;
                        this.canvas.ctx.fillText(num, w - nw / 2, numContI.sprites[0].h / 2);
                    }
                }
                pw = handleI.sprites[0].w;
                r.drawSpriteA(handleI, 0, pos - handleW / 2, 0, 1);
                r.drawSpriteAW(handleI, 1, pos - handleW / 2 + pw, 0, handleW - pw * 2, 1);
                r.drawSpriteA(handleI, 2, pos + handleW / 2 - pw, 0, 1);
                r.popCTX();
                this.dirty = false;
            },
            update : function () {
                if (this.ready) {
                    var m = this.mouse;
                    m.isMouseOver();
                    var w = this.canvas.width - (this.numWidth + this.handleWidth);
                    var pos = Math.round(((this.value - this.min) / (this.max - this.min)) * w  + this.handleWidth/2);
                    if(m.mouse.mousePrivate === m.id){
                        if(this.draggingSlider){
                            if(this.ondrag !== undefined){
                                this.ondrag(this);
                            }
                            if(!m.mouse.B1){
                                this.draggingSlider = false;
                                m.releaseMouse();
                            } else {
                                var dist = (m.mouse.x - m.hx);
                                pos = (this.dragStartPos + dist);
                                this.value = ((pos - this.handleWidth / 2) / w) * (this.max - this.min) + this.min;
                                this.value = Math.min(this.max, Math.max(this.min, this.value));
                                pos = Math.round(((this.value - this.min) / (this.max - this.min)) * w + this.handleWidth / 2);
                            }
                        } else {
                            if (m.x > pos - this.handleWidth / 2 && m.x <= pos + this.handleWidth / 2 ){
                                m.mouse.requestCursor("ew-resize", m.id);
                                if(m.mouse.B1){
                                    m.holdMouse();
                                    this.dragStartPos = pos;
                                    this.draggingSlider = true;
                                }
                            } else {
                                m.mouse.requestCursor("pointer", m.id);
                                if (m.mouse.B1) {
                                    m.holdMouse();
                                    m.mouse.requestCursor("ew-resize", m.id);
                                    this.draggingSlider = true;
                                    this.value = ((this.mouse.x - this.handleWidth / 2) / w) * (this.max - this.min) + this.min;
                                    this.value = Math.min(this.max, Math.max(this.min, this.value));
                                    pos = Math.round(((this.value - this.min) / (this.max - this.min)) * w + this.handleWidth / 2);
                                    this.dragStartPos = pos;
                                }
                            }
                            if (m.mouse.w !== 0) {
                                if (m.mouse.w > 0) {
                                    this.value += this.mouseWheelStep;
                                } else {
                                    this.value -= this.mouseWheelStep;
                                }
                                if (this.ondrag !== undefined) {
                                    this.ondrag(this);
                                }                                
                                m.mouse.w = 0;
                                this.value = Math.min(this.max, Math.max(this.min, this.value));
                            }
                        }
                    }
                    if(this.value !== this.oldValue){
                        pos = Math.round(((this.value - this.min) / (this.max - this.min)) * w + this.handleWidth / 2);
                        this.dirty = true;
                    }
                    this.oldValue = this.value;
                    // redraw if dirty and visible
                    if (this.dirty && this.location.alpha > 0) {
                        this.redraw();
                    }
                }
            },
            display : function () {
                var m = this.mouse;
                var rend = this.owner.render;
                var l = this.location;
                if(l.alpha > 0){
                    rend.drawBitmapSize(this.canvas, l.x, l.y, l.w, l.h, l.alpha);
                }
            }
        }
        UI.addUIDefaults.bind(ui)(UI,owner,name,settings);
        return ui;
    }
    var configure = function(){
        if(shapes === undefined){
            shapes = groover.code.load("shapes2D");
        }
        groover.utils.styles.createNamedStylesFromList ([
            ["font","UIFont", "arial", 20, "white"],
            ["draw","UISlider","rgba(128,128,128,0.25)","white",1,3,13],
            ["draw","UISliderHandle","#FC5","white",2,12,4],
            ["draw","UISliderDisplay","Green","white",2,16,0],
        ]);      
        
    }
    return {
        create : create,
        configure : configure,
    };
})();