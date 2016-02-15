(function () {  // IconButton UI
    var create = function (name,settings,UI,owner) {
        var ui,i,j,icon,uiReady;
        if(owner === undefined){
            owner = UI;
        }
        uiReady = function () {
            UI.addUIDefaults.bind(ui)(UI,owner,name,settings)
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
                    icon.id = this.icons[i].id;
                    icon.position = this.location.add(icon.x,icon.y,icon.w,icon.h,icon.id,i);
                }
            },
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
                                        icon.onclick(icon);
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
                var l, m, icon, p, i, R;
                R = this.owner.render;
                l = this.location;
                m = this.mouse;
                if (l.alpha > 0) {
                    for (i = 0; i < this.icons.length; i++) {
                        icon = this.icons[i];
                        p = icon.position;
                        if (m.positionsIndex === i && (m.mouse.mousePrivate === 0 || m.mouse.mousePrivate === m.id)) {
                            R.drawBitmapSize(icon.images[0].image, p.x, p.y, p.w, p.h, icon.alpha * l.alpha);
                        } else {
                            R.drawBitmapSize(icon.images[1].image, p.x, p.y, p.w, p.h, icon.alpha * l.alpha);
                        }
                    }
                }
            }
        }
        return ui;
    }
    return {
        create : create,
    };
})();