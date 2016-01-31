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
            canvas : null,
            draggingSlider : false,
            dragStartPos : 0,
            mouseWheelStep : settings.wheelStep,
            digets : settings.digets,
            numWidth : settings.digets * 20 + 15,
            location : undefined, // stub till ready to set location
            setup : function () {

                this.location.set(this.settings.x, this.settings.y, this.settings.width, this.settings.height);
                this.canvas = this.owner.createCanvas(this.location.w,this.location.h);
                log("Location W:"+this.location.w);
                this.dirty = true;  // flag as dirty so it is redrawn
            },
            redraw : function(){
                var bar = this.bar.image;
                var hdl = this.handle.image;
                var numC = this.numContainer.image;
                var img = this.sprites.image;
                var w = this.canvas.width;
                var nw =  this.numWidth;
                var pos = Math.round(((this.value - this.min) / (this.max - this.min)) * (w-nw - 4) + 2);

                var rend = this.owner.render;
                this.canvas.ctx.clearRect(0,0,w,this.canvas.height);
                rend.pushCTX(this.canvas.ctx);
                rend.drawSpriteA(bar, 0, 0, 0, 1);
                rend.drawSpriteAW(bar,  1, 9, 0, w-nw-20, 1);
                rend.drawSpriteA(bar, 2, w-nw-10, 0, 1);

                rend.drawSpriteA(numC, 0, w-nw, 0, 1);
                rend.drawSpriteAW(numC, 1, w-nw + 10, 0, this.numWidth-20,1);
                rend.drawSpriteA(numC, 2, w - 10, 0, 1);
                var num = ""+mMath.padNumber(Math.round(this.value),this.digets);
                for(var i = 0 ; i < this.digets ; i++){
                    rend.drawSpriteA(img, num.charCodeAt(i)-48, w-nw + 5 + 20 * i,0,1)
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
                    var w = this.canvas.width - this.numWidth;
                    var img = this.sprites.image;
                    var pos = Math.round(((this.value - this.min) / (this.max - this.min)) * (w - 4) + 2);
                    if(m.mouse.mousePrivate === m.id){
                        if(this.draggingSlider){
                            
                            if(!m.mouse.B1){
                                this.draggingSlider = false;
                                m.releaseMouse();
                            }else{
                                var dist = (m.mouse.x-m.hx) ;
                                pos = (this.dragStartPos + dist);
                                this.value = ((pos -2) / (w-4)) * (this.max-this.min) + this.min;
                                this.value = Math.min(this.max,Math.max(this.min,this.value));
                                pos = Math.round(((this.value - this.min) / (this.max - this.min)) * (w - 4) + 2);
                                
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
                                    this.value = ((this.mouse.x-2) / (w-4)) * (this.max-this.min) + this.min;
                                    this.value = Math.min(this.max,Math.max(this.min,this.value));
                                    pos = Math.round(((this.value - this.min) / (this.max - this.min)) * (w - 4) + 2);
                                    this.dragStartPos = pos;
                                }
                            }
                            if(m.mouse.w !== 0){
                                if(m.mouse.w > 0){
                                    this.value += this.mouseWheelStep;
                                }else{
                                    this.value -= this.mouseWheelStep;
                                }
                                m.mouse.w = 0;
                                this.value = Math.min(this.max,Math.max(this.min,this.value));
                            }
                                
                        }
                    }
                    if(this.value !== this.oldValue){
                        pos = Math.round(((this.value - this.min) / (this.max - this.min)) * (w - 4) + 2);
                        this.dirty = true;
                    }
                    this.oldValue = this.value;
                    if(this.dirty){
                        this.redraw();
                    }
                }
            },
            display : function () {
                var m = this.mouse;
                var rend = this.owner.render;
                var l = this.location;
                rend.drawBitmapSize(this.canvas, l.x, l.y, l.w, l.h, l.alpha);
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