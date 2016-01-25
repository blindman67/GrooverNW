(function(){  // Basic log display UI
    
    var create = function(name,settings,UI,owner){
        if(owner === undefined){
            owner = UI;
        }
        var ui = {
            owner : owner,
            name : name,
            ready : false,
            settings : settings,
            toolTip : settings.toolTip,
            canvas : UI.createCanvas(settings.width,settings.displayLines * (Number(settings.font.split("px")[0]) + 3)+ 8),  
            messages : [],
            alpha : 1,
            displayState : 1,
            displayTimer : 0,
            countDown : 0,
            dirty : true,
            setup : function(){
                var c = this.canvas.ctx;
                c.font = this.settings.font;
                c.fillStyle = "#0F0",
                c.strokeStyle = "Black",
                c.lineWidth = 3;
                c.lineJoin = "round";
                settings.lineHeight = Number(settings.font.split("px")[0]) + 3;
                this.addLog("Log started");
                this.location.set(settings.pos.x,settings.pos.y);
            },
            addLog : function(text,colour){
                var c = this.canvas.ctx;
                this.messages.push({
                    text:text,
                    colour : colour === undefined?"white":colour,
                });
                this.countDown = 160;
                this.displayState = 1;
                this.dirty = true;
            },
            redraw : function(){
                var dLen, len, h, i, lineHeight;
                lineHeight = settings.lineHeight;
                len = this.messages.length;
                dlen = len - settings.displayLines;
                h = Math.floor((settings.displayLines/len)*(this.canvas.height-2));
                c.clearRect(0,0,this.canvas.width,this.canvas.height);
                c.fillStyle = "rgba(128,128,128,0.63)";
                c.fillRect(this.canvas.width-8,0,8,this.canvas.height);
                c.fillStyle = "rgba(100,128,100,0.93)";
                c.fillRect(this.canvas.width-7,this.canvas.height-1-h,6,h);
                for(i = len - 1; i >= dlen && i > -1; i--){
                    c.fillStyle = this.messages[i].colour;
                    c.strokeText(this.messages[i].text,5,(i-dlen+1)*lineHeight);
                    c.fillText(this.messages[i].text,5,(i-dlen+1)*lineHeight-1);
                }
                this.dirty = false;
            },
            update : function(){
                if(this.dirty){
                    this.redraw();
                }
            },
            display : function(){
                var rend = this.owner.render;
                var l = this.location;
                var a = 1;//this.mouse.over?1:0.7;
                if(this.displayState > this.displayTimer){
                    this.displayTimer += 0.02;
                    if(this.displayState <= this.displayTimer){
                        this.displayTimer = this.displayState;
                    }
                }else
                if(this.displayState < this.displayTimer){
                    this.displayTimer -= 0.02;
                    if(this.displayState >= this.displayTimer){
                        this.displayTimer = this.displayState;
                    }
                }
                if(this.displayState === 1){
                    this.countDown -= 1;
                    if(this.countDown <= 0){
                        this.displayState = 0;
                    }
                }
                a = mMath.easeInOut(this.displayTimer,2);                    
                rend.drawBitmapSize(this.canvas,l.x,l.y,l.w*a,l.h*a,a);
            }        
        }
        ui.location= UI.createLocationInterface(ui);
        ui.setup();
        var count = 0;
        if(log){
            log = function(dat,colour){
                count += 1;
                if(typeof dat === "string"){
                    ui.addLog(count + ":"+dat,colour);
                }
                console.log(dat);
            }
        }
        return ui;
    }
    return {
        create : create,
    };
})();