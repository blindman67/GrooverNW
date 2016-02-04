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
            settings.barStyle = groover.utils.namedStyles.UIButton;
        }        
        if(settings.hoverStyle === undefined){
            settings.hoverStyle = groover.utils.namedStyles.UIButtonHover;
        }        
        if(settings.cickStyle === undefined){
            settings.clickStyle = groover.utils.namedStyles.UIButtonClick;
        }        
   
        if(settings.fontStyle === undefined){
            settings.fontStyle = groover.utils.styles.copyStyle(groover.utils.namedStyles.UIFont);
        }        
        settings.height = settings.height===undefined?40:settings.height;        
        settings.fontStyle.fontSize = Math.max(12,settings.height-Math.floor(settings.height/3));
        settings.fontStyle.textAlign = "center";
        settings.fontStyle.textBaseline = "middle";


        var ui = {
            owner : owner,
            name : name,
            toolTip : settings.toolTip,
            text : settings.text,
            ready : false,
            dirty : true,    
            slideVal : 0,
            canvas : undefined,
            settings : settings,
            hoverVal : 1,
            hover : true,
            clicking : false,
            clickingVal : 1,
            holding : false,
            onclick :settings.onclick,
            location : undefined, 
            setup : function () {
                if(this.canvas !== undefined){
                        this.location.set(settings.x,settings.y,undefined,settings.height);
                }else{
                    if(settings.width === undefined || settings.width <= 0){
                        this.canvas = this.owner.createCanvas(10,settings.height);
                        this.canvas.ctx.font = settings.fontStyle.fontSize + "px "+ settings.fontStyle.font;                        
                        var w = this.canvas.ctx.measureText(this.text).width;
                        w += settings.height* 1.25;
                        this.canvas = this.owner.createCanvas(w,settings.height*3);
                        this.location.set(settings.x,settings.y,undefined,settings.height);
                        
                    }else{
                        this.canvas = this.owner.createCanvas(settings.width, this.sprites.image.height*3);
                        this.location.set(settings.x,settings.y,settings.width,settings.height);
                    }
                }

            },            
            redraw : function(){
                var ins,h,cw;
                cw = this.canvas.width;
                h = this.canvas.height / 3;
                this.canvas.ctx.setTransform(1, 0, 0, 1, 0, 0);
                this.canvas.ctx.clearRect(0, 0, cw, this.canvas.height);
                ins = settings.barStyle.inset + settings.barStyle.lineWidth;
                shapes.drawRectangle(this.canvas, ins, ins, cw - ins * 2, h - ins * 2, settings.barStyle);
                groover.utils.styles.assignFontToContext(this.canvas.ctx, settings.fontStyle);
                this.canvas.ctx.fillText(this.text, cw / 2, h * 0.5);

                ins = settings.hoverStyle.inset + settings.hoverStyle.lineWidth;
                shapes.drawRectangle(this.canvas, ins, ins + h, cw - ins * 2, h - ins * 2, settings.hoverStyle);
                groover.utils.styles.assignFontToContext(this.canvas.ctx, settings.fontStyle);
                this.canvas.ctx.fillText(this.text, cw / 2, h * 0.5 + h);

                ins = settings.clickStyle.inset + settings.clickStyle.lineWidth;
                shapes.drawRectangle(this.canvas, ins, ins + h * 2, cw - ins * 2, h - ins * 2, settings.clickStyle);
                groover.utils.styles.assignFontToContext(this.canvas.ctx, settings.fontStyle);
                this.canvas.ctx.fillText(this.text, cw / 2, h * 0.5 + h * 2);

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
                            this.clicking = true;
                            this.holding = true;
                        }
                        if(m.hold && m.mouse.oldB1 && !m.mouse.B1){
                            m.mouse.oldB1 = false;
                            m.releaseMouse();
                            if(m.over && this.holding){
                                if(typeof this.onclik === "function"){
                                    this.onclick(this);
                                }
                            }
                            this.holding = false;
                        }
                        if(!m.overReal){
                            this.clicking = false;      
                            this.holding = false;
                        }
                    }else{
                        this.hover = false;
                        this.clicking = false;

                    }
                    if(this.dirty){
                        this.redraw();
                    }
                }
            },
            display : function () {
                var e,c,w,l,h;
                l = this.location;
                w = this.canvas.width;
                h = this.canvas.height/3
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
                if(this.clicking){
                    if(this.clickingVal < 1){
                        this.clickingVal += 0.1;
                        if(this.clickingVal > 1){
                            this.clickingVal = 1;
                        }
                    }
                }else{
                    if(this.clickingVal > 0){
                        this.clickingVal -= 0.02;
                        if(this.clickingVal < 0){
                            this.clickingVal = 0;
                        }
                    }
                }
                if(e <= 0){
                    this.owner.render.drawBitmapPart(this.canvas,l.x,l.y, 0,0,w,h,l.alpha);
                }else
                if(e === 1){
                    this.owner.render.drawBitmapPart(this.canvas,l.x,l.y, 0,h,w,h,l.alpha);
                }else{
                    e = mMath.easeInOut(this.hoverVal,3);
                    this.owner.render.drawBitmapPart(this.canvas,l.x,l.y, 0,0,w,h,l.alpha);
                    this.owner.render.drawBitmapPart(this.canvas,l.x,l.y, 0,h,w,h,l.alpha * e);
                }
                c = mMath.easeInOut(this.clickingVal,3);
                if(c > 0 ){
                    this.owner.render.drawBitmapPart(this.canvas,l.x,l.y, 0,h*2,w,h,l.alpha * c);
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
            if(groover.utils.namedStyles.UIButton === undefined){
                groover.utils.styles.createDrawStyle("UIButton","Blue","white",2,6,1);
            }
            if(groover.utils.namedStyles.UIButtonHover === undefined){
                groover.utils.styles.createDrawStyle("UIButtonHover","green","white",2,6,0);
            }
            if(groover.utils.namedStyles.UIButtonClick === undefined){
                groover.utils.styles.createDrawStyle("UIButtonClick","RED","white",2,6,0);
            }            
        }        
    }    
    return {
        create : create,
        configure : configure,
    };
})();