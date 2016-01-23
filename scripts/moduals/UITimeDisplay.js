(function(){
    var create = function(name,settings,UI,owner){
        if(owner === undefined){
            owner = UI;
        }
        var uiReady = function(){
           ui.ready = true;
        }
        UI.icons = UI.bitmaps.startLoad(uiReady,"icons");    
        var ui = {
            owner : owner,
            name : name,
            ready : false,
            nightDay : UI.bitmaps.load("icons","icons/NightEveningDay.png","nightDay"),
            day24 : UI.bitmaps.load("icons","icons/Day24.png","day24"),
            timeMark : UI.bitmaps.load("icons","icons/TimeMarker.png","timeMarker"),
            canvas : UI.createCanvas(256 * 7, 32),  
            mouse:null,
            location:null,
            time : new Date().valueOf(),
            duration: 60 * 60 * 1000,
            now : Math.ceil(new Date().valueOf() / (24*60*60*1000))*(24*60*60*1000),
            totalTime : 7 * (24*60*60*1000), // in days
            sliderNx : 0,  // normalised pos
            sliderNw : 0,  // normalised width
            doInterface : function(time,dur){
                this.mouse.isMouseOver();
                this.now = new Date().valueOf();
                this.now = Math.ceil(this.now / (24*60*60*1000))*(24*60*60*1000);
                this.duration = dur;
                this.time = time;
                this.sliderNx = (time-(this.now - this.totalTime))/this.totalTime;
                this.sliderNw = dur/this.totalTime;
                if(this.mouse.over){
                    if(this.mouse.mouse.mousePrivate === this.mouse.id){
                        this.mouse.mouse.requestCursor("pointer",this.mouse.id);
                    }
                }            
            
            },
            update : function(time,duration){            
                if(ui.ready){

                   this.doInterface(time,duration);

                    var rend = this.owner.render;
                    var nd = this.nightDay.image;
                    var nd24 = this.day24.image;
                    var tm = this.timeMark.image;
                    rend.pushCTX(this.canvas.ctx);                
                    for(var i = 0; i < 7; i += 1){
                        rend.drawBitmapAbs(nd,i*256,0,i*256+128,32,1);
                        rend.drawBitmapAbs(nd,i*256+255,0,i*256+128,32,1);
                        rend.drawBitmapAbs(nd24,i*256,0,i*256+256,32,1);
                    }
                    rend.drawBitmapAbs(tm,this.sliderNx*256*7,2,(this.sliderNx+this.sliderNw)*256*7,29,0.4);
                    
                    rend.popCTX();
                }
            },
            display : function(){
                var rend = this.owner.render;
                var l = this.location;
                var a = this.mouse.over?1:0.7;
                rend.drawBitmapSize(this.canvas,l.x,l.y,l.w,l.h,a);
            }
                
        }
        ui.mouse= UI.createMouseInterface(ui);
        ui.location= UI.createLocationInterface(ui);
        return ui;
    }
    return {
        create : create,
    };
})();