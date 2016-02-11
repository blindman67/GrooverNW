(function(){  // **MODUAL** code will have use strit prefixed
    // important do not add anything above this line. Modual loading adds (use strict) and accepts the returned value of this function
    var shapes,textRender;
    var create = function (name,settings,UI,owner) {
        if(owner === undefined){
            owner = UI;
        }
        if(settings.minWidth === undefined){
            settings.minWidth = 200;
        }
        if(settings.minHeight === undefined){
            settings.minHeight = 100;
        }
        var uiReady = function () {
            ui.ready = true;
            ui.viewName = name+"View"+ui.id;
            ui.location = ui.owner.createLocationInterface(ui, settings.group);
            ui.setup();
            if (settings.group !== undefined) {
                settings.group.addUI(ui.location);
            }
        }        
        var ui = {
            owner : owner,
            id : groover.utils.IDS.getID(),
            canvas : undefined,
            width : settings.width !== undefined?settings.width:settings.minWidth,
            height : settings.height !== undefined?settings.height:settings.minHeight,
            x : settings.x,
            y : settings.y,
            text : undefined,
            dirty : false,
            active : false,
            show : false,
            showTimer : 0,
            viewName :  undefined,
            created : false,
            style : groover.utils.namedStyles.UIDialogStyle,
            release : function(){
                if(this.canvas !== undefined){
                    this.owner.owner.view.removeNamedView(this.viewName);
                    if(this.canvas.ctx !== undefined){
                        this.canvas.ctx = undefined;
                    }
                    this.canvas = undefined;
                }

                this.style = undefined;
                this.mouse = undefined;
                this.location = undefined;
            },
            setup : function(){
                if(this.text !== undefined){
                    if(this.canvas === undefined || this.canvas.width !== this.width || this.canvas.height !== this.height){
                        this.canvas = this.owner.createCanvas(this.width,this.height);;                   
                    }
                    groover.utils.styles.assignFontToContext(this.canvas.ctx, this.style);
                    if(typeof this.text === "string"){
                        this.text = textRender.formatText(this.canvas.ctx,this.text);
                    }
                    this.width = Math.max(settings.minWidth,settings.width);
                    this.height = Math.max(settings.minHeight,settings.width);
                    if(this.canvas.width !== this.width || this.canvas.height !== this.height){
                        this.canvas = this.owner.createCanvas(this.width,this.height);;                   
                    }                    
                    var l = this.location;
                    l.set(this.x,this.y,this.width,this.height);
                    this.owner.owner.view.addNamedView(this.viewName,this.canvas,l.y,l.x);
                }else{
                    if(this.canvas === undefined || this.canvas.width !== this.width || this.canvas.height !== this.height){
                        this.canvas = this.owner.createCanvas(this.width,this.height);;                   
                    }
                    var l = this.location;
                    l.set(this.x,this.y,this.width,this.height);
                    this.owner.owner.view.addNamedView(this.viewName,this.canvas,l.y,l.x);
                }
            },
            redraw : function(){
                var ins = this.style.inset + this.style.lineWidth;
                shapes.drawRectangle(this.canvas, ins, ins, this.canvas.width - ins * 2, this.canvas.height - ins * 2, this.style);
                groover.utils.styles.assignFontToContext(this.canvas.ctx, this.style);
                if(this.text !== undefined){
                    textRender.fillText(this.canvas.ctx,this.text,this.width/2,0,"center");
                }
                this.dirty = false;
            },
            addUI : function(text){
                if(this.active){
                    return false;
                }
                this.x = "center";
                this.y = "center";
                if(text !== undefined){
                    this.text = text;
                }
                this.setup();
                if(this.group === undefined){
                    this.group = this.owner.createUI("UIGroup","Dialog"+this.id);
                    this.owner.owner.view.pushViewByName(this.viewName);
                    if(typeof settings.uiCreate === "function"){
                        
                        settings.uiCreate(this.group)                        

                    }
      
                    this.owner.owner.view.popView();
                    this.created = true;
                }
                //this.callback = callback;
                this.show = true;
                this.active = true;
                this.dirty = true;;
                this.group.mouseFunction("deactivate");
                this.group.recaculateBounds();
            },            
            update: function(){
                if(this.active){                    
                    this.group.mouse.isMouseOver();
                    this.group.update();             
                }
            },
            display : function(){
                if(this.active){                    
                    if(this.dirty){
                        this.redraw();
                    }
                    if(this.show && this.showTimer < 1){
                        this.showTimer += 0.08;
                        if(this.showTimer > 1){
                            this.showTimer = 1;
                            this.group.mouseFunction("activate");
                        }
                    }else
                    if(!this.show && this.showTimer > 0){
                        this.showTimer -= 0.08;
                        if(this.showTimer <= 0){
                            this.active = false;
                            this.group.mouseFunction("deactivate");
                            this.showTimer = 0;
                        }
                    }
                    var a = mMath.easeInOut(this.showTimer,2);
                    this.group.location.alpha = a;
                    var l = this.location;
                    this.owner.render.drawBitmapA(this.canvas,l.x,l.y,l.alpha*a);
                    this.group.display();
                }
            }
        };
        ui.mouse = UI.createMouseInterface(ui);
        uiReady();
        return ui;
    }
    var configure = function(){
        if(shapes === undefined){
            shapes = groover.code.load("shapes2D");
        }
        if(textRender === undefined){
            textRender = groover.code.load("textRender");
            
        }
        if(groover.utils.namedStyles.UIDialogStyle === undefined){
            groover.utils.styles.createFontStyle("UIDialogStyle","arial",20,"black","center","hanging");
            groover.utils.styles.createDrawStyle("UIDialogStyle","#DB8","black",3,16,0);
        }        
    }        
    return {
        create: create,
        configure : configure,
    };
})();

