(function () {
    var create = function (name,data,UI,owner) {
        var tempX,tempY,tempH,tempW;
        if(owner === undefined){
            owner = UI;
        }
        var uiReady = function () {
            ui.ready = true;
            ui.setup();
            ui.location = ui.owner.createLocationInterface(ui, data.group);
            if (tempX !== undefined) {
                ui.location.set(tempX, tempY, tempW, tempH);
            }
            if (data.group !== undefined) {
                data.group.addUI(ui.location);
            }
            ui.update();

        }
        UI.icons = UI.bitmaps.startLoad(uiReady, "icons");

        var ui = {
            owner : owner,
            name : name,
            ready : false,
            toolTip : data.toolTip,
            min : data.min,
            max : data.max,
            value : data.min,
            oldValue : null,
            pixelValue : 0,
            dirty : true,
            sprites : UI.bitmaps.load("icons", "icons/SliderSmall.png", "sliderSpritesSmall", UI.bitmaps.onLoadCreateSprites.bind(UI.bitmaps)),
            canvas : null,
            draggingSlider : false,
            dragStartPos : 0,
            mouseWheelStep : data.wheelStep,
            digets : data.digets,
            numWidth : data.digets * 4 + 7,
            colour : data.colour * 6 + 4,
            location : {
                set : function (x, y, w, h) {
                    tempX = x;
                    tempY = y;
                    tempH = h;
                    tempW = data.width;
                }
            }, // stub till ready to set location
            setup : function () {
                this.canvas = this.owner.createCanvas(data.width, 12);
            },
            redraw : function(){
                var w = this.canvas.width;
                var wn = w - this.numWidth;
                var pos = Math.round(((this.value - this.min) / (this.max - this.min)) * (wn - 4) + 2);

                var rend = this.owner.render;
                this.canvas.ctx.clearRect(0,0,w,this.canvas.height);
                rend.pushCTX(this.canvas.ctx);
                rend.drawSpriteA(img, this.colour + 3, 0, 0, 1);
                rend.drawSpriteAW(img, this.colour + 4, 3, 0, pos, 1);
                rend.drawSpriteAW(img, this.colour + 1, pos, 0, w-pos, 1);
                rend.drawSpriteA(img, this.colour + 2, w, 0, 1);
                rend.drawSpriteA(img, 49, wn+1, 0, 1);
                rend.drawSpriteAW(img, 50, wn + 4, 0, this.numWidth-7,1);
                rend.drawSpriteA(img, 51, w -  3, 0, 1);
                var num = ""+mMath.padNumber(Math.round(this.value),this.digets);
                for(var i = 0 ; i < this.digets ; i++){
                    rend.drawSpriteA(img, num.charCodeAt(i)-48+29, wn + 5 + 4 * i,0,1)
                }                
                rend.drawSpriteA(img, 28, pos, 0, 1);
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
                            if(m.x > pos && m.x <= pos + img.sprites[28].w){
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
    return {
        create : create,
    };
})();