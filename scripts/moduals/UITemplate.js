(function () {
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

        var ui = {
            owner : owner,
            name : name,
            toolTip : settings.toolTip,            
            ready : false,
            sprites : // undefined UI.bitmaps.load("icons", "icons/SliderSmall.png", "sliderSpritesSmall", UI.bitmaps.onLoadCreateHSprites.bind(UI.bitmaps)),
            canvas : null,
            settings : settings,
            dirty : true,
            location : {
                set : function (x, y, w, h) {
                    tempX = x;
                    tempY = y;
                    tempH = h;
                    tempW = data.width;
                }
            }, // stub till ready to set location
            setup : function () {
                this.canvas = this.owner.createCanvas(settings.width, settings.height);
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
                rend.drawBitmapSize(this.canvas, l.x, l.y, l.w, l.h, a);
            }
        }
        ui.mouse = UI.createMouseInterface(ui);
        return ui;
    }
    return {
        create : create,
    };
})();