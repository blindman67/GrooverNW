(function () {  // CheckBox UI
    var create = function (name,settings,UI,owner) {
        var tempX,tempY,tempH,tempW;
        if(owner === undefined){
            owner = UI;
        }
        var uiReady = function () {
            ui.ready = true;
            ui.location = ui.owner.createLocationInterface(ui, settings.group);
            ui.setup();
            if (tempX !== undefined) {
                ui.location.set(tempX, tempY);
            }
            if (settings.group !== undefined) {
                settings.group.addUI(ui.location);
            }
            ui.update();

        }
        // if not loading sprites then call uiReady manualy
        UI.icons = UI.bitmaps.startLoad(uiReady, "icons");
        var charcterSetData = {
            spriteCutter:{
                how:"grid",
                pixelWidth : 10,
                pixelHeight : 10,
                repackWidth : true,
            }
        };
        var ui = {
            owner : owner,
            name : name,
            checked : settings.checked,
            toolTip : settings.toolTip,
            text : settings.text,
            ready : false,
            dirty : true,
            currentType : (function(){
                var types = {
                    greenRed : { off : 6, on : 7 },
                    defaultSet : { off : 8, on : 9 },
                    tick : { off : 8, on : 9 },
                    tickCross : { off : 12, on : 9 },
                    yesNo : { off : 16, on : 15 },
                    onOff : { off : 14, on : 13 },
                    blackWhite : { off : 11, on : 10 },
                };
                if(types[settings.type] !== undefined){
                    return types[settings.type];
                }
                return types.defaultSet;
            })(),
                
            sprites : UI.bitmaps.load("icons", "icons/SmallText.png", "smallText", UI.bitmaps.onLoadCreateSprites.bind(UI.bitmaps)),
            characters : UI.bitmaps.load("icons", "icons/CharacterSet10By10.png", "characterSet", UI.bitmaps.onLoadCreateSprites.bind(UI.bitmaps), charcterSetData),
            canvas : null,
            settings : settings,
            onchecked :settings.onchecked,
            onunchecked :settings.onunchecked,
            location : {
                set : function (x, y, w, h) {
                    tempX = x;
                    tempY = y;
                    tempH = h;
                    tempW = settings.width;
                }
            }, // stub till ready to set location
            setup : function () {
                if(settings.width === undefined || settings.width <= 0){
                    var w = this.owner.render.measureSpriteText(this.characters.image,this.text,33);
                    w += Math.max(this.sprites.image.sprites[this.currentType.on].w,this.sprites.image.sprites[this.currentType.off].w);
                    w += 8;
                    this.canvas = this.owner.createCanvas(w, this.sprites.image.height);
                    this.location.set();
                    
                }else{
                    this.canvas = this.owner.createCanvas(settings.width, this.sprites.image.height);
                    this.location.set();
                }
            },
            redraw : function(){
                var rend = this.owner.render;
                var img = this.sprites.image;
                var w = 0;
                var cw = this.canvas.width;
                this.canvas.ctx.setTransform(1,0,0,1,0,0);
                this.canvas.ctx.clearRect(0,0,cw,this.canvas.height);
                rend.pushCTX(this.canvas.ctx);
                rend.drawSpriteA(img, 0, 0, 0, 1);
                rend.drawSpriteAW(img,1, 3, 0, cw-6, 1);
                rend.drawSpriteA(img,2, cw-4, 0, 1);
                if(this.checked){
                    rend.drawSpriteA(img, this.currentType.on, 3, 0, 1);
                }else{
                    rend.drawSpriteA(img, this.currentType.off, 3, 0, 1);
                }
                w = Math.max(img.sprites[this.currentType.on].w,img.sprites[this.currentType.off].w);
                rend.drawSpriteText(this.characters.image,w + 6,4,this.text,33);
                rend.popCTX();
                this.dirty = false;
            },
            update : function () {
                if (this.ready) {
                    var m = this.mouse;
                    m.isMouseOver();
                    if(m.mouse.mousePrivate === m.id){
                        m.mouse.requestCursor("pointer", m.id);
                        if(m.mouse.B1 && ! m.hold){
                            m.holdMouse();
                        }
                        if(m.hold && m.mouse.oldB1 && !m.mouse.B1){
                            m.mouse.oldB1 = false;
                            m.releaseMouse();
                            if(m.over){
                                this.checked = ! this.checked;
                                this.dirty = true;
                                if(this.checked && this.onchecked){
                                    this.onchecked(this);
                                }else
                                if(!this.checked && this.onunchecked){
                                    this.onunchecked(this);
                                }
                            }
                        }
                    }
                    if(this.dirty){
                        this.redraw();
                       
                    }
                }
            },
            display : function () {
                var l = this.location;
                this.owner.render.drawBitmapSize(this.canvas, l.x, l.y, l.w, l.h, l.alpha);
            }
        }
        ui.mouse = UI.createMouseInterface(ui);
        return ui;
    }
    return {
        create : create,
    };
})();