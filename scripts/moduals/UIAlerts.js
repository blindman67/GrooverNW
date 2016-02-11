(function(){  // **MODUAL** code will have use strit prefixed
    // important do not add anything above this line. Modual loading adds (use strict) and accepts the returned value of this function
    var shapes,textRender;
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
            id : groover.utils.IDS.getID(),
            groupAlert : undefined,
            groupPrompt : undefined,
            canvas : undefined,
            width : settings.width !== undefined?settings.width:200,
            height : settings.height !== undefined?settings.height:100,
            x : settings.x,
            y : settings.y,
            text : undefined,
            okButton : undefined,
            dirty : false,
            active : false,
            show : false,
            showTimer : 0,
            viewName :  name+"View",
            created : false,
            style : groover.utils.namedStyles.UIAlertStyle,
            buttonStyles : settings.buttonStyles,
            setStyles : function (buttonStyle,alertStyle){
                this.style = alertStyle;
                this.buttonStyles = buttonStyles;
            },
            release : function(){
                if(this.canvas !== undefined){
                    this.owner.owner.view.removeNamedView(this.viewName);
                    if(this.canvas.ctx !== undefined){
                        this.canvas.ctx = undefined;
                    }
                    this.canvas = undefined;
                }
                if(this.groupAlert !== undefined){
                    this.okButton.release();
                    this.okButton = undefined;
                    this.groupAlert = undefined;
                }
                if(this.groupPrompt !== undefined){
                    this.okPButton.release();
                    this.cancelPButton.release();
                    this.cancelPButton = undefined;
                    this.okPButton = undefined;
                    this.groupPrompt = undefined;
                }
                this.style = undefined;
                this.buttonStyles = undefined;
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
                    this.width = Math.max(200,this.text.width +  this.style.fontSize * 2);
                    this.height = Math.max(100,this.text.height + this.style.fontSize * 3);
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
            alert : function(text,callback){
                if(this.active){
                    return false;
                }
                this.x = "center";
                this.y = "center";
                this.text = text;
                this.setup();
                if(this.groupAlert === undefined){
                     this.groupAlert = this.owner.createUI("UIGroup","AlertGroup");
                     this.owner.owner.view.pushViewByName(this.viewName);
                     this.okButton = this.owner.createUI(
                        "UIButton",
                        "alertOK",
                        {
                            x: "center",
                            y: -10,
                            height : 30,
                            minWidth : 80,
                            fontStyle : this.buttonStyles.button,
                            style : this.buttonStyles.button,
                            hoverStyle : this.buttonStyles.hover,
                            clickStyle : this.buttonStyles.click,
                            text : "  OK  ",
                            toolTip :undefined,
                            onclick : (function(){
                                this.show = false;
                                if(typeof this.callback === "function"){
                                    callback("OK");
                                }
                                this.callback = undefined;
                            }).bind(this),
                            group:this.groupAlert,
                        }
                    );          
                    this.owner.owner.view.popView();
                    this.created = true;
                }
                this.callback = callback;
                this.show = true;
                this.active = true;
                this.dirty = true;
                this.group = this.groupAlert;
                this.group.mouseFunction("deactivate");
                this.group.recaculateBounds();
            },
            prompt : function(text,callback){
                if(this.active){
                    return false;
                }
                this.x = "center";
                this.y = "center";
                this.text = text;
                this.setup();
                if(this.groupPrompt === undefined){
                     this.groupPrompt = this.owner.createUI("UIGroup","PromptGroup");
                     this.owner.owner.view.pushViewByName(this.viewName);
                     this.okPButton = this.owner.createUI(
                        "UIButton",
                        "PromptOK",
                        {
                            x: 20,
                            y: -10,
                            height : 30,
                            text : "  OK  ",
                            minWidth : 80,
                            fontStyle : this.buttonStyles.button,
                            style : this.buttonStyles.button,
                            hoverStyle : this.buttonStyles.hover,
                            clickStyle : this.buttonStyles.click,
                            toolTip :undefined,
                            onclick : (function(){
                                this.show = false;
                                if(typeof this.callback === "function"){
                                    callback("OK");
                                }
                                this.callback = undefined;
                            }).bind(this),
                            group:this.groupPrompt,
                        }
                    );          
                     this.cancelPButton = this.owner.createUI(
                        "UIButton",
                        "PromptCancel",
                        {
                            x: -20,
                            y: -10,
                            height : 30,
                            text : "Cancel",
                            minWidth : 80,
                            fontStyle : this.buttonStyles.button,
                            style : this.buttonStyles.button,
                            hoverStyle : this.buttonStyles.hover,
                            clickStyle : this.buttonStyles.click,
                            toolTip :undefined,
                            onclick : (function(){
                                this.show = false;
                                if(typeof this.callback === "function"){
                                    callback("cancel");
                                }
                                this.callback = undefined;
                            }).bind(this),
                            group:this.groupPrompt,
                        }
                    );          
                    this.owner.owner.view.popView();
                    this.created = true;
                }
                this.callback = callback;
                this.show = true;
                this.active = true;
                this.dirty = true;
                this.group = this.groupPrompt;
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

