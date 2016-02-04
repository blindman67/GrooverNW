(function () {  // IconButton UI
    var create = function (name,settings,UI,owner) {
        var ui,i,j,icon;
        if(owner === undefined){
            owner = UI;
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
        
        UI.buttons = UI.bitmaps.startLoad("buttons",uiReady);
        for(i = 0; i < settings.icons.length; i++){
            icon = settings.icons[i];
            if(icon.images === undefined){
                icon.images = [];
            }
            for(j = 0; j < icon.filenames.length; j++){
                icon.images[j] = UI.bitmaps.load("buttons", icon.filenames[j]);
            }
            icon.id = UI.MK.getHolderID();
        }
        
        ui = {
            owner : owner,
            name : name,
            toolTip : "",
            ready : false,
            dirty : true,
            holding : false,            
            icons : settings.icons,  
            mouseDownOnIcon : 0, // holds the icon id of the icon on which the mouse went down
                                 // So that the mouse can be dragged of to cancel the click
            setup : function () {
                var i, icon, len;
                len = this.icons.length;
                for(var i = 0; i < len; i++){
                    icon = this.icons[i];
                    icon.alpha = 1;
                    if(icon.w === undefined){
                        icon.w = icon.images[0].image.width;
                    }
                    if(icon.h === undefined){
                        icon.h = icon.images[0].image.height;
                    }
                    icon.id = settings.icons[i].id;
                    icon.position = this.location.add(icon.x,icon.y,icon.w,icon.h,icon.id,i);
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
                            if(icon.toolTip){
                                this.toolTip = icon.toolTip;
                            }else{
                                this.toolTip = undefined;
                            }
                            if(icon.cursor){
                                m.mouse.requestCursor(icon.cursor, m.id);
                            }
                            if(m.mouse.B1 && ! m.hold){
                                m.holdMouse();
                                if(m.hold){
                                    this.mouseDownOnIcon = icon.id;
                                    this.holding = true;
                                }
                            }
                            if(m.hold && m.mouse.oldB1 && !m.mouse.B1){
                                m.mouse.oldB1 = false;
                                m.releaseMouse();
                                if(m.over && this.holding){
                                    if(typeof icon.onclick === "function"){
                                        icon.onclick(this);
                                    }
                                }
                                this.holding = false;
                            }  
                            if(m.hold && !m.overReal){
                                this.holding = false;                               
                            }
                            
                        }
                    }
                }
            },
            display : function () {
                var l = this.location;
                var m = this.mouse;
                if(l.alpha > 0){
                    for(var i = 0 ; i < this.icons.length; i++){
                        var icon = this.icons[i];
                        var p = icon.position;
                        if(m.positionsIndex === i && (m.mouse.mousePrivate === 0 || m.mouse.mousePrivate === m.id) ){
                            this.owner.render.drawBitmapSize(icon.images[0].image,p.x,p.y,p.w,p.h,icon.alpha * l.alpha);
                        }else{
                            this.owner.render.drawBitmapSize(icon.images[1].image,p.x,p.y,p.w,p.h,icon.alpha * l.alpha);
                            
                        }
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