(function () {  // CheckBox UI
    var shapes;
    var create = function (name,settings,UI,owner) {
        var tempX,tempY,tempH,tempW;
        if(owner === undefined){
            owner = UI;
        }
        var uiReady = function () {
            ui.ready = true;
            ui.location = ui.owner.createLocationInterface(ui, settings.group);
            ui.setup();
            if (settings.group !== undefined) {
                settings.group.addUI(ui.location);
            }
            ui.update();

        }
     
        if(settings.barStyle === undefined){
            settings.barStyle = groover.utils.namedStyles.UICheckBox;
        }        
        if(settings.checkStyle === undefined){
            settings.checkStyle = groover.utils.namedStyles.UICheckBoxChecked;
        }        
        if(settings.uncheckStyle === undefined){
            settings.uncheckStyle = groover.utils.namedStyles.UICheckBoxUnchecked;
        }        
        if(settings.fontStyle === undefined){
            settings.fontStyle = groover.utils.styles.copyStyle(groover.utils.namedStyles.UIFont);
        }        
        settings.height = settings.height===undefined?settings.barStyle.height:settings.height;        
        settings.fontStyle.fontSize = Math.max(12,settings.height-Math.floor(settings.height/2));
        settings.fontStyle.textAlign = "left";
        settings.fontStyle.textBaseline = "middle";

        // if not loading sprites then call uiReady manualy

        var ui = {
            owner : owner,
            name : name,
            checked : settings.checked,
            setChecked : function (value){
                if(this.checked !== value){
                    this.checked = value;
                    this.dirty = true;
                    if(this.checked && this.onchecked){
                        this.onchecked(this);
                    }else
                    if(!this.checked && this.onunchecked){
                        this.onunchecked(this);
                    }                    
                }
            },
            check : function(){this.setChecked(true);},
            uncheck : function(){this.setChecked(false);},
            toolTip : settings.toolTip,
            text : settings.text,
            ready : false,
            dirty : true,    
            hoverVal : 0,
            hover : true,
            holding : false,
            canvas : undefined,
            settings : settings,
            onchecked :settings.onchecked,
            onunchecked :settings.onunchecked,
            location : undefined, 
            setup : function () {
                if(this.canvas !== undefined){
                        this.location.set(settings.x,settings.y);
                }else{
                    if(settings.width === undefined || settings.width <= 0){
                        this.canvas = this.owner.createCanvas(10,settings.height);
                        this.canvas.ctx.font = settings.fontStyle.fontSize + "px "+ settings.fontStyle.font;
                        var w = this.canvas.ctx.measureText(this.text).width;
                        w += settings.height* 1.25;
                        this.canvas = this.owner.createCanvas(w,settings.height);
                        this.location.set(settings.x,settings.y);
                        
                    }else{
                        this.canvas = this.owner.createCanvas(settings.width, this.sprites.image.height);
                        this.location.set(settings.x,settings.y);
                    }
                }

            },            
            redraw : function(){
                var cw,ins,h;
                cw = this.canvas.width;
                h = this.canvas.height;
                this.canvas.ctx.setTransform(1,0,0,1,0,0);
                this.canvas.ctx.clearRect(0,0,cw,this.canvas.height);
                ins = settings.barStyle.lineWidth + settings.barStyle.inset;
                shapes.drawRectangle(this.canvas, ins, ins, cw - ins * 2, h - ins * 2, settings.barStyle);
                if (this.checked) {
                    ins = settings.checkStyle.lineWidth + settings.checkStyle.inset;
                    shapes.drawRectangle(this.canvas, ins, ins, h - ins * 2, h - ins * 2, settings.checkStyle);
                } else {
                    ins = settings.uncheckStyle.lineWidth + settings.uncheckStyle.inset;
                    shapes.drawRectangle(this.canvas, ins, ins, h - ins * 2, h - ins * 2, settings.uncheckStyle);
                }
                groover.utils.styles.assignFontToContext(this.canvas.ctx, settings.fontStyle);
                this.canvas.ctx.fillText(this.text,this.location.h * 1,this.location.h * 0.5);
                this.dirty = false;
            },
            update : function () {
                if (this.ready) {
                    var m = this.mouse;
                    m.isMouseOver();
                    if(m.mouse.mousePrivate === m.id){
                        this.hover = true;
                        m.mouse.requestCursor("pointer", m.id);
                        if(m.mouse.B1 && ! m.hold){
                            m.holdMouse();
                            this.holding = true;
                        }
                        if(m.hold && m.mouse.oldB1 && !m.mouse.B1){
                            m.mouse.oldB1 = false;
                            m.releaseMouse();
                            if(m.over && this.holding){
                                this.setChecked(! this.checked);
                            }
                            this.holding = false;
                        }
                        if(!m.overReal && m.hold){
                            this.holding = false;
                        }
                        
                    }else{
                        this.hover = false;
                    }

                    if(this.dirty){
                        this.redraw();
                    }
                }
            },
            display : function () {
                var l = this.location;
                var e,w;
                if(this.hover){
                    if(this.hoverVal < 1){
                        this.hoverVal += 0.1;
                        if(this.hoverVal > 1){
                            this.hoverVal = 1;
                        }
                    }
                }else{
                    if(this.hoverVal > 0){
                        this.hoverVal -= 0.02;
                        if(this.hoverVal < 0){
                            this.hoverVal = 0;
                        }
                    }
                }
                e = mMath.easeInOut(this.hoverVal,3);
                var r = settings.barStyle.rounding;
                var tw = l.h-settings.checkStyle.lineWidth * 2;
                if(e <= 0){
                    this.owner.render.drawBitmapPart(this.canvas,l.x,l.y,0,0,tw,l.h,l.alpha);
                    this.owner.render.drawBitmapPart(this.canvas,l.x+tw,l.y,l.w-r,0,r,l.h,l.alpha);
                }else
                if(e === 1){
                    this.owner.render.drawBitmapSize(this.canvas, l.x, l.y, l.w, l.h, l.alpha);
                }else{
                    
                    this.owner.render.drawBitmapPart(this.canvas,l.x,l.y,0,0,tw,l.h,l.alpha);
                    w = (l.w-tw-r)*e + r;
                    this.owner.render.drawBitmapPart(this.canvas,l.x+tw,l.y, l.w-w,0,w,l.h,l.alpha);
                }
                //this.owner.render.drawBitmapSize(this.canvas, l.x, l.y, l.w, l.h, l.alpha);
            }
        }
        ui.mouse = UI.createMouseInterface(ui);
        uiReady();
        return ui;
    }
    
    var configure = function(){
        if(shapes === undefined){
            shapes = groover.code.load("shapes2D");
        }
        if(typeof groover !== "undefined" && groover.utils !== undefined && groover.utils.namedStyles !== undefined){
            if(groover.utils.namedStyles.UIFont === undefined){
                groover.utils.styles.createFontStyle("UIFont","arial",20,"white");
            }
            if(groover.utils.namedStyles.UICheckBox === undefined){
                
                groover.utils.styles.createDrawStyle("UICheckBox","Blue","white",2,6,0);
                groover.utils.namedStyles.UICheckBox.height = 30;
            }
            if(groover.utils.namedStyles.UICheckBoxChecked === undefined){
                groover.utils.styles.createDrawStyle("UICheckBoxChecked","RED","white",2,6,3);
            }
            if(groover.utils.namedStyles.UICheckBoxUnchecked === undefined){
                groover.utils.styles.createDrawStyle("UICheckBoxUnchecked","Green","white",2,6,5);
            }            
        }
    }    
    return {
        create : create,
        configure : configure,
    };
})();