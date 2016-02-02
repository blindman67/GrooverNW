(function () {  // Slider Small UI
    var shapes;
    var create = function (name,settings,UI,owner) {
        var h;
        if(settings.height === undefined){
            settings.height = 40;
        }
        h = settings.height;
        if(owner === undefined){
            owner = UI;
        }
        
        var handle = UI.bitmaps.create("icons",30,h, "handle")
        var bar = UI.bitmaps.create("icons",60,h, "bar")
        var numContainer = UI.bitmaps.create("icons",60,h, "numContainer")
        var numSprites = UI.bitmaps.create("icons",600,h, "customSlider")

        var lw = 3;
       
        if(!handle.drawn){
            var b4 = shapes.createStyle("#FFF","Black",lw,8);
            shapes.drawRectangle(handle.image,lw,lw*2,30-lw*2,h-lw*4,b4);
            handle.drawn = true;
        }
        if(!bar.drawn){
            var b1 = shapes.createStyle("#00F","White",lw,8);
            shapes.drawRectangle(bar.image,lw,lw*4,60-lw*2,h-lw*8,b1);
            bar.image.sprites = [];
            bar.image.sprites.push({x:0,y:0,w:10,h:h});
            bar.image.sprites.push({x:10,y:0,w:40,h:h});
            bar.image.sprites.push({x:50,y:0,w:10,h:h});
            bar.drawn = true;
        }
        if(!numContainer.drawn){
            var b3 = shapes.createStyle("#00F","White",lw,8);
            shapes.drawRectangle(numContainer.image,lw,lw,60-lw*2,h-lw*2,b3);
            numContainer.image.sprites = [];
            numContainer.image.sprites.push({x:0,y:0,w:10,h:h});
            numContainer.image.sprites.push({x:10,y:0,w:40,h:h});
            numContainer.image.sprites.push({x:50,y:0,w:10,h:h});        
            numContainer.drawn = true;
        }
        if(!numSprites.drawn){
            numSprites.image.ctx.font = Math.max(12,h-10)+"px arial";
            numSprites.image.ctx.textBaseline = "middle";
            numSprites.image.ctx.textAlign = "left";
            numSprites.image.ctx.fillStyle = "white";
            numSprites.image.ctx.fillText("0 1 2 3 4 5 6 7 8 9 . + -",0,h/2);
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
            numWidth : settings.digets * 20 + 15,
            handleWidth : undefined,
            location : undefined, // stub till ready to set location
            setup : function () {
                this.numWidth = settings.digets * 20 + 15;
                if(settings.decimalPlaces > 0){
                    this.numWidth += settings.decimalPlaces * 20 + 10;
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
                rend.drawSpriteA(bar, 0, 0, 0, 1);
                rend.drawSpriteAW(bar,  1, 10, 0, w-nw-20, 1);
                rend.drawSpriteA(bar, 2, w-nw-10, 0, 1);

                rend.drawSpriteA(numC, 0, w-nw, 0, 1);
                rend.drawSpriteAW(numC, 1, w-nw + 10, 0, this.numWidth-20,1);
                rend.drawSpriteA(numC, 2, w - 10, 0, 1);
                var num = ""+mMath.padNumber(this.value.toFixed(settings.decimalPlaces),settings.digets);
                //log(""+num,"red");
                var extra = 0;
                var extraX = 0;
                for(var i = 0 ; i < this.digets ; i++){
                    if(i+extra > num.length){
                        rend.drawSpriteA(img, 0, w-nw + 10 + 20 * i+extraX,0,1)
                        
                    }else{
                        if(num[i+extra] === "."){
                            rend.drawSpriteA(img, 10, w-nw + 10 + 20 * i+extraX,0,1)
                            extra += 1;
                            extraX += 10;
                        }
                            
                        rend.drawSpriteA(img, num.charCodeAt(i+extra)-48, w-nw + 10 + 20 * i + extraX,0,1)
                    }
                }                
                rend.drawBitmapA(hdl, pos-15, 0, 1);
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
    }
    return {
        create : create,
        configure : configure,
    };
})();