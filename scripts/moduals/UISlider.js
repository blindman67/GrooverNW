(function () {  // Slider Small UI
    var shapes;
    var create = function (name,settings,UI,owner) {
        var tempX,tempY,tempH,tempW;
        
        if(owner === undefined){
            owner = UI;
        }
        var handle = UI.bitmaps.imageTools.createImage(30,40);
        var bar = UI.bitmaps.imageTools.createImage(60,40);
        var numContainer = UI.bitmaps.imageTools.createImage(60,40);
        var numSprites = UI.bitmaps.imageTools.createImage(600,40);
        var lw = 3;
        var b1 = shapes.createStyle("#00F","White",lw,8);
        var b2 = shapes.createStyle("#0FF","White",lw,8);
        var b3 = shapes.createStyle("#888","White",lw,8);
        var b4 = shapes.createStyle("#FFF","Black",lw,8);
  
        shapes.drawRectangle(handle,lw,lw*2,30-lw*2,40-lw*4,b4);

        shapes.drawRectangle(bar,lw,lw*4,60-lw*2,40-lw*8,b1);
        shapes.drawRectangle(numContainer,lw,lw,60-lw*2,40-lw*2,b3);
        numSprites.ctx.font = "30px arial";
        numSprites.ctx.textBaseline = "middle";
        numSprites.ctx.textAlign = "left";
        numSprites.ctx.fillStyle = "white";
        numSprites.ctx.fillText("0123 4 56789.+-",0,20);
  
        
        
        
        

        var uiReady = function () {
            ui.ready = true;
             ui.setup();
            ui.location = ui.owner.createLocationInterface(ui, settings.group);
            if (tempX !== undefined) {
                ui.location.set(tempX, tempY, tempW, tempH);
            }
            if (settings.group !== undefined) {
                settings.group.addUI(ui.location);
            }

            ui.update();

        }
        UI.icons = UI.bitmaps.startLoad(uiReady, "icons");

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
            sprites : UI.bitmaps.load("icons", numSprites, "customSlider", UI.bitmaps.onLoadCreateSprites.bind(UI.bitmaps)),
            handle : UI.bitmaps.load("icons", handle, "handle"),
            numContainer : UI.bitmaps.load("icons", numContainer, "numContainer"),
            bar : UI.bitmaps.load("icons", bar, "bar"),
            canvas : null,
            draggingSlider : false,
            dragStartPos : 0,
            mouseWheelStep : settings.wheelStep,
            digets : settings.digets,
            numWidth : settings.digets * 20 + 15,
            colour : settings.colour * 6 + 4,
            location : {
                set : function (x, y, w, h) {
                    tempX = x;
                    tempY = y;
                    tempH = h;
                    tempW = settings.width;
                }
            }, // stub till ready to set location
            setup : function () {
                this.canvas = this.owner.createCanvas(settings.width,40);
                this.dirty = true;
                this.bar.image.sprites = [];
                this.bar.image.sprites.push({x:0,y:0,w:10,h:40});
                this.bar.image.sprites.push({x:10,y:0,w:40,h:40});
                this.bar.image.sprites.push({x:50,y:0,w:10,h:40});
                this.numContainer.image.sprites = [];
                this.numContainer.image.sprites.push({x:0,y:0,w:10,h:40});
                this.numContainer.image.sprites.push({x:10,y:0,w:40,h:40});
                this.numContainer.image.sprites.push({x:50,y:0,w:10,h:40});
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