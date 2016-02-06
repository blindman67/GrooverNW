(function(){  // **MODUAL** code will have use strit prefixed
    // important do not add anything above this line. Modual loading adds (use strict) and accepts the returned value of this function
    var shapes;
    var create = function (name,settings,UI,owner) {
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
        }        
        var ui = {
            owner : owner,
            group : undefined,
            canvas : undefined,
            width : 200,
            height : 100,
            text : undefined,
            okButton : undefined,
            style : undefined,
            dirty : false,
            active : false,
            show : false,
            showTimer : 0,
            view : undefined,
            created : false,
            style : groover.utils.namedStyles.UIAlertStyle,
            buttonStyle : groover.utils.namedStyles.UIAlertbutton,
            setStyles : function (buttonStyle,alertStyle){
                this.style = alertStyle;
                this.buttonStyle = buttonStyle;
            },
            setup : function(){
                if(this.canvas === undefined || this.canvas.width !== this.width || this.canvas.height !== this.height){
                    this.canvas = this.owner.createCanvas(this.width,this.height);
                    this.view = name+"View";
                    this.owner.owner.view.addNamedView(name+"View",this.canvas);
                }
            },
            redraw : function(){
                var ins = this.style.inset + this.style.lineWidth;
                shapes.drawRectangle(this.canvas, ins, ins, this.canvas.width - ins * 2, this.canvas.height - ins * 2, this.style);
                groover.utils.styles.assignFontToContext(this.canvas.ctx, this.style);
                var h = this.style.fontSize *0.9;
                for(var i = 0; i < this.text.length;i += 1){
                    this.canvas.ctx.fillText(this.text[i], this.width/2, h);            
                    h += this.style.fontSize * 1.2;
                }
                this.dirty = false;
                
            },
            alert : function(text){
                this.setup();
                this.text = text.split("\n");
                if(!this.created ){
                    this.owner.owner.view.setViewByName(this.view);
                     this.group = this.owner.createUI("UIGroup","AlertGroup");
                     this.okButton = this.owner.createUI(
                        "UIButton",
                        "alertOK",
                        {
                            x: -20,
                            y: -10,
                            height : 30,
                            text : "  OK  ",
                            toolTip :undefined,
                            onclick : (function(){
                                this.show = false;
                            }).bind(this),
                            group:this.group,
                            viewName : this.view,
                        }
                    );          
                    this.owner.owner.view.setDefault();
                    this.created = true;
                }
                this.show = true;
                this.active = true;
                this.dirty = true;
                this.okButton.mouse.activate();

            },
            update: function(){
                if(this.active){                    
                    this.group.mouse.isMouseOver();
                    this.okButton.update();                
                }
            },
            display : function(){
                if(this.active){                    
                    if(this.dirty){
                        this.redraw();
                    }
                    if(this.show && this.showTimer < 1){
                        this.showTimer += 0.02;
                        if(this.showTimer > 1){
                            this.showTimer = 1;
                        }
                    }else
                    if(!this.show && this.showTimer > 0){
                        this.showTimer -= 0.02;
                        if(this.showTimer <= 0){
                            this.active = false;
                            this.okButton.mouse.deactivate();
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
        if(groover.utils.namedStyles.UIAlertStyle === undefined){
            groover.utils.styles.createFontStyle("UIAlertStyle","arial",20,"black","center","hanging");
            groover.utils.styles.createDrawStyle("UIAlertStyle","#DB8","black",3,16,0);
        }        
    }        
    return {
        create: create,
        configure : configure,
    };
})();

