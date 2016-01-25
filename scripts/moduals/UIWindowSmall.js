(function () {  // windowSmall UI
    var create = function (name,settings,UI,owner) {
        var tempX,tempY,tempH,tempW;
        if(owner === undefined){
            owner = UI;
        }
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
            toolTip : settings.toolTip,            
            ready : false,
            sprites : UI.bitmaps.load("icons", "icons/WindowBorderSmall.png", "WindowBorderSmall", UI.bitmaps.onLoadCreateHSprites.bind(UI.bitmaps)),
            characters : UI.bitmaps.load("icons", "icons/CharacterSet10By10.png", "characterSet", UI.bitmaps.onLoadCreateSprites.bind(UI.bitmaps), charcterSetData),
            
            canvas : null,
            settings : settings,
            open : false,
            dragging : false,
            title : settings.title,
            dirty : true,   // flag that UI needs rerendering
            location : {
                set : function (x, y, w, h) {
                    tempX = x;
                    tempY = y;
                    tempH = h;
                    tempW = settings.width;
                }
            }, // stub till ready to set location
            setup : function () {
                var w = this.owner.render.measureSpriteText(this.characters.image,this.title,33);                
                w += this.sprites.image.sprites[0].w;
                w += 8;
                this.canvas = this.owner.createCanvas(w, this.sprites.image.height);
                this.location.set();
            },
            redraw : function() {
                
                this.dirty = false;
            },
            update : function () {
                if (this.ready) {
                    var m = this.mouse;
                    m.isMouseOver();
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