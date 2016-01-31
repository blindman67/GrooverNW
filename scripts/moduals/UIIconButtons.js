(function () {  // IconButton UI
    var create = function (name,settings,UI,owner) {
        var ui;
        if(owner === undefined){
            owner = UI;
        }
        var uiReady = function () {
            ui.ready = true;
            ui.location = ui.owner.createLocationInterface(ui, settings.group);            
            ui.setup();
            ui.update();

        }
        
        UI.buttons = UI.bitmaps.startLoad("buttons",uiReady);
        for(var i = 0; i < settings.icons.length; i++){
            settings.icons[i].image1 = UI.bitmaps.load("buttons", settings.icons[i].filename1);
            settings.icons[i].image2 = UI.bitmaps.load("buttons", settings.icons[i].filename2);
        }
        
        ui = {
            owner : owner,
            name : name,
            toolTip : "",
            ready : false,
            dirty : true,
            icons : settings.icons,  
            setup : function () {
                var i, icon, len;
                len = this.icons.length;
                for(var i = 0; i < len; i++){
                    icon = this.icons[i];
                    icon.alpha = 1;
                    if(icon.w === undefined){
                        icon.w = icon.image1.image.width;
                    }
                    if(icon.h === undefined){
                        icon.h = icon.image1.image.height;
                    }
                    icon.id = this.owner.MK.getHolderID();
                    icon.position = this.location.add(icon.x,icon.y,icon.w,icon.h,icon.id);
                }

            },
            location : null, 
            update : function () {
                if (this.ready) {
                    var m = this.mouse;
                    m.isMouseOver();
                    if(m.over){
                        if(m.id === m.mouse.mousePrivate){
                            var icon = this.icons[m.positionsIndex];
                            if(icon.cursor){
                                m.mouse.requestCursor(icon.cursor, m.id);
                            }
                        }
                    }
                }
            },
            display : function () {
                var l = this.location;
                var m = this.mouse;
                
                for(var i = 0 ; i < this.icons.length; i++){
                    var icon = this.icons[i];
                    var p = icon.position;
                    if(m.positionsIndex === i){
                        this.owner.render.drawBitmapSize(icon.image1.image,p.x,p.y,p.w,p.h,icon.alpha);
                    }else{
                        this.owner.render.drawBitmapSize(icon.image2.image,p.x,p.y,p.w,p.h,icon.alpha);
                        
                    }
                }
            }
        }
        ui.mouse = UI.createMouseInterface(ui);
        return ui;
    }
    return {
        create : create,
    };
})();