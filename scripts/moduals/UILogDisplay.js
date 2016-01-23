(function(){
    
    var create = function(name,settings,UI,owner){
        if(owner === undefined){
            owner = UI;
        }
        var ui = {
            owner : owner,
            name : "logDisplay",
            ready : false,
            settings : settings,
            canvas : UI.createCanvas(settings.width,settings.displayLines * (Number(settings.font.split("px")[0]) + 3)+ 8),  
            messages : [],
            alpha : 1,
            displayState : 1,
            displayTimer : 0,
            countDown : 0,
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
                c.clearRect(0,0,this.canvas.width,this.canvas.height);
                var len = this.messages.length;
                c.fillStyle = "rgba(128,128,128,0.63)";
                c.fillRect(this.canvas.width-8,0,8,this.canvas.height);
                var h = Math.floor((settings.displayLines/len)*(this.canvas.height-2));
                c.fillStyle = "rgba(100,128,100,0.93)";
                c.fillRect(this.canvas.width-7,this.canvas.height-1-h,6,h);
                
                var lineHeight = settings.lineHeight;
                for(var i = len - 1; i >= len - settings.displayLines && i > -1; i--){
                    c.fillStyle = this.messages[i].colour;
                    c.strokeText(this.messages[i].text,5,(i-(len-settings.displayLines)+1)*lineHeight);
                    c.fillText(this.messages[i].text,5,(i-(len-settings.displayLines)+1)*lineHeight-1);
                }
            },
            update: function(){},
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