(function () {  // Slider Small UI
    var shapes;
    var create = function (name,settings,UI,owner) {
        var h,ww;
        


                
        if(settings.handleStyle === undefined){
            settings.handleStyle = groover.utils.namedStyles.UISliderHandle;            
        }
        if(settings.barStyle === undefined){
            settings.barStyle = groover.utils.namedStyles.UISlider;            
        }
        if(settings.numDisplayStyle === undefined){
            settings.numDisplayStyle = groover.utils.namedStyles.UISliderDisplay;            
        }
        if(settings.fontStyle === undefined){
            settings.fontStyle = groover.utils.styles.copyStyle(groover.utils.namedStyles.UIFont);
        }         
        settings.height = settings.height===undefined?40:settings.height;
        h = settings.height;
        ww = Math.floor(h + 20);        
        settings.handleWidth = settings.handleWidth===undefined?30:settings.handleWidth;
        if(settings.handleWidth < (settings.handleStyle.rounding + settings.handleStyle.inset)*2 + 10){
            settings.handleWidth = (settings.handleStyle.rounding + settings.handleStyle.inset)*2 + 10;
        }
        settings.fontStyle.fontSize = Math.max(12,settings.height-Math.floor(settings.height/4));



        
        if(owner === undefined){
            owner = UI;
        }
        
        var handle = UI.bitmaps.create("icons",settings.handleWidth,h, "handle")
        var bar = UI.bitmaps.create("icons",(settings.barStyle.rounding + settings.barStyle.inset)*2 + 10,h, "bar")
        var numContainer = UI.bitmaps.create("icons",(settings.numDisplayStyle.rounding + settings.numDisplayStyle.inset)*2 + 10,h, "numContainer")
        var numSprites = UI.bitmaps.create("icons",600,h, "customSlider")

        var lw = 3;
       
        if(!handle.drawn){
            lw = settings.handleStyle.lineWidth + settings.handleStyle.inset ;
            shapes.drawRectangle(handle.image,lw,lw,settings.handleWidth-lw*2,h-lw*2,settings.handleStyle);
            handle.drawn = true;
        }
        if(!bar.drawn){
            lw = settings.barStyle.lineWidth + settings.barStyle.inset ;
            ww = (settings.barStyle.rounding + settings.barStyle.inset)*2+10;
            shapes.drawRectangle(bar.image,lw,lw,ww-lw*2,h-lw*2,settings.barStyle );
            ww = (settings.barStyle.rounding + settings.barStyle.inset);
            bar.image.sprites = [];
            bar.image.sprites.push({x:0,y:0,w:ww,h:h});
            bar.image.sprites.push({x:ww,y:0,w:bar.image.width-ww*2,h:h});
            bar.image.sprites.push({x:bar.image.width-ww,y:0,w:ww,h:h});
            bar.drawn = true;
        }
        if(!numContainer.drawn){
            lw = settings.numDisplayStyle.lineWidth + settings.numDisplayStyle.inset ;
            ww = (settings.numDisplayStyle.rounding + settings.numDisplayStyle.inset)*2+ 10;
            shapes.drawRectangle(numContainer.image,lw,lw,ww-lw*2,h-lw*2,settings.numDisplayStyle);
            ww = (settings.numDisplayStyle.rounding + settings.numDisplayStyle.inset);
            numContainer.image.sprites = [];
            numContainer.image.sprites.push({x:0,y:0,w:ww,h:h});
            numContainer.image.sprites.push({x:ww,y:0,w:numContainer.image.width-ww*2,h:h});
            numContainer.image.sprites.push({x:numContainer.image.width-ww,y:0,w:ww,h:h});        
            numContainer.drawn = true;
        }
        if(!numSprites.drawn){
            numSprites.image.ctx.font = settings.fontStyle.fontSize+"px "+settings.fontStyle.font
            numSprites.image.ctx.textBaseline = "middle";
            numSprites.image.ctx.textAlign = "left";
            numSprites.image.ctx.fillStyle = settings.fontStyle.fontColour;
            numSprites.image.ctx.fillText("0 1 2 3 4 5 6 7 8 9 . + -",0,h/2);
            var chars = "0123456789.+-";
            var maxWidth = 0;
            for(var i = 0; i < chars.length; i ++){
                maxWidth = Math.max(maxWidth,numSprites.image.ctx.measureText(chars[i]).width);
            }
            settings.fontWidth = maxWidth+2;
            UI.bitmaps.horizontalSpriteCutter(numSprites);
            numSprites.drawn = true;
        }
        
        
        
        

        var uiReady = function () {
            ui.ready = true;
            ui.location = ui.owner.createLocationInterface(ui, settings.group);
            if (settings.group !== undefined) {
                settings.group.addUI(ui.location);
            }
            ui.setup();
            ui.update();

        }
        UI.icons = UI.bitmaps.startLoad("icons",uiReady);

        var ui = {
            owner : owner,
            name : name,
            ready : false,
            toolTip : settings.toolTip,
            settings : settings,
            min : settings.min,
            max : settings.max,
            value : settings.value,
            oldValue : null,
            dirty : true,
            sprites : numSprites,        // image
            handle : handle,             // image
            numContainer : numContainer, // image
            bar :  bar,                  // image
            canvas : undefined,
            draggingSlider : false,
            dragStartPos : 0,
            ondrag : typeof settings.ondrag === "function"?settings.ondrag:undefined,
            mouseWheelStep : settings.wheelStep,
            digets : settings.digets,
            numWidth : (settings.digets + 1) * settings.fontWidth,
            handleWidth : settings.handleWidth,
            location : undefined, // stub till ready to set location
            setup : function () {
                this.numWidth = (settings.digets + 1) * settings.fontWidth;
                if(settings.decimalPlaces > 0){
                    this.numWidth += settings.decimalPlaces * settings.fontWidth + Math.floor(settings.fontWidth*0.5);
                }
                this.digets = settings.digets+settings.decimalPlaces
                this.location.set(this.settings.x, this.settings.y, this.settings.width, this.settings.height);
                if(this.canvas === undefined || this.canvas.width !== this.location.w || this.canvas.height !== this.location.h){
                    this.canvas = this.owner.createCanvas(this.location.w,this.location.h);
                }
                this.handleWidth = this.handle.image.width;
                this.dirty = true;  // flag as dirty so it is redrawn
            },
            redraw : function(){
                var bar = this.bar.image;
                var hdl = this.handle.image;
                var numC = this.numContainer.image;
                var img = this.sprites.image;
                var w = this.canvas.width;
                var nw =  this.numWidth;
                var pos = Math.round(((this.value - this.min) / (this.max - this.min)) * (w-nw-this.handleWidth) + this.handleWidth/2);

                var rend = this.owner.render;
                this.canvas.ctx.clearRect(0,0,w,this.canvas.height);
                rend.pushCTX(this.canvas.ctx);
                var pw = bar.sprites[0].w;
                rend.drawSpriteA(bar, 0, 0, 0, 1);
                rend.drawSpriteAW(bar,  1, pw, 0, w-nw-pw*2, 1);
                rend.drawSpriteA(bar, 2, w-nw-pw, 0, 1);

                var pw = numC.sprites[0].w;
                rend.drawSpriteA(numC, 0, w-nw, 0, 1);
                rend.drawSpriteAW(numC, 1, w-nw + pw, 0, this.numWidth-pw*2,1);
                rend.drawSpriteA(numC, 2, w - pw, 0, 1);
                var num = ""+mMath.padNumber(this.value.toFixed(settings.decimalPlaces),settings.digets);
                //log(""+num,"red");
                var extra = 0;
                var extraX = 0;
                for(var i = 0 ; i < this.digets ; i++){
                    if(i+extra > num.length){
                        rend.drawSpriteA(img, 0, w-nw + 10 + settings.fontWidth * i+extraX,0,1)
                        
                    }else{
                        if(num[i+extra] === "."){
                            rend.drawSpriteA(img, 10, w-nw + 10 + settings.fontWidth * i+extraX,0,1)
                            extra += 1;
                            extraX += 10;
                        }
                            
                        rend.drawSpriteA(img, num.charCodeAt(i+extra)-48, w-nw + 10 + settings.fontWidth * i + extraX,0,1)
                    }
                }                
                rend.drawBitmapA(hdl, pos-hdl.width/2, 0, 1);
                rend.popCTX();
              
                this.dirty = false;
            },
            update : function () {
                if (this.ready) {
                    var m = this.mouse;
                    m.isMouseOver();
                    var rend = this.owner.render;
                    
                    var c = this.canvas.ctx;
                    var w = this.canvas.width - (this.numWidth + this.handleWidth);
                    var img = this.sprites.image;
                    var pos = Math.round(((this.value - this.min) / (this.max - this.min)) * w  + this.handleWidth/2);
                    if(m.mouse.mousePrivate === m.id){
                        if(this.draggingSlider){
                            if(this.ondrag !== undefined){
                                this.ondrag(this);
                            }
                            if(!m.mouse.B1){
                                this.draggingSlider = false;
                                m.releaseMouse();
                            }else{
                                var dist = (m.mouse.x-m.hx) ;
                                pos = (this.dragStartPos + dist);
                                this.value = ((pos -this.handleWidth/2) /w) * (this.max-this.min) + this.min;
                                this.value = Math.min(this.max,Math.max(this.min,this.value));
                                pos = Math.round(((this.value - this.min) / (this.max - this.min)) * w  + this.handleWidth/2);
                                
                            }
                        }else{
                            if(m.x > pos- this.handle.image.width/2 && m.x <= pos + this.handle.image.width/2){
                                m.mouse.requestCursor("ew-resize", m.id);
                                if(m.mouse.B1){
                                    m.holdMouse();
                                    this.dragStartPos = pos;
                                    this.draggingSlider = true;
                                }
                            }else{
                                m.mouse.requestCursor("pointer", m.id);
                                if(m.mouse.B1){
                                    m.holdMouse();
                                    m.mouse.requestCursor("ew-resize", m.id);
                                    this.draggingSlider = true;
                                    this.value = ((this.mouse.x-this.handleWidth/2) / w) * (this.max-this.min) + this.min;
                                    this.value = Math.min(this.max,Math.max(this.min,this.value));
                                    pos = Math.round(((this.value - this.min) / (this.max - this.min)) * w  + this.handleWidth/2);
                                    this.dragStartPos = pos;
                                }
                            }
                            if(m.mouse.w !== 0){
                                if(m.mouse.w > 0){
                                    this.value += this.mouseWheelStep;
                                }else{
                                    this.value -= this.mouseWheelStep;
                                }
                                if(this.ondrag !== undefined){
                                    this.ondrag(this);
                                }                                
                                m.mouse.w = 0;
                                this.value = Math.min(this.max,Math.max(this.min,this.value));
                            }
                                
                        }
                    }
                    if(this.value !== this.oldValue){
                        pos = Math.round(((this.value - this.min) / (this.max - this.min)) * w + this.handleWidth/2);
                        this.dirty = true;
                    }
                    this.oldValue = this.value;
                    // redraw if dirty and visible
                    if(this.dirty && this.location.alpha > 0){
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
        ui.mouse = UI.createMouseInterface(ui);
        return ui;
    }
    var configure = function(){
        if(shapes === undefined){
            shapes = groover.code.load("shapes2D");
        }
        if(typeof groover !== "undefined" && groover.utils !== undefined && groover.utils.namedStyles !== undefined){
            if(groover.utils.namedStyles.UIFont === undefined){
                groover.utils.styles.createFontStyle("UIFont","arial",20,"white");
            }
            if(groover.utils.namedStyles.UISlider === undefined){
                groover.utils.styles.createDrawStyle("UISlider","Blue","white",2,16,0);
            }
            if(groover.utils.namedStyles.UISliderHandle === undefined){
                groover.utils.styles.createDrawStyle("UISliderHandle","#FC5","white",2,12,4);
            }
            if(groover.utils.namedStyles.UISliderDisplay === undefined){
                groover.utils.styles.createDrawStyle("UISliderDisplay","Green","white",2,16,0);
            }            
        }          
    }
    return {
        create : create,
        configure : configure,
    };
})();