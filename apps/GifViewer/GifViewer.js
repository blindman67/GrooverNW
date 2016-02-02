"use strict";
function GifViewer(owner){
    this.owner = owner;
    this.time;
    this.view = this.owner.view;
    this.render = this.owner.render;
    this.bitmaps = this.owner.bitmaps;
    this.MK = this.owner.mouseKeyboard;
    this.ready = false;
    this.bitmaps.startLoad("icons",this.iconsAvaliable.bind(this));
    this.images = {};
    this.images.background = this.bitmaps.load("icons","icons/BlueGradBackground.png");
    this.icons;
    this.textStyle = {
        font:"14px Arial",
        fill:"White",
        stroke:"Black"
    }

    this.transform;
    this.transform = mMath.getDisplayTransformer();
    this.transform.mouse = this.MK;
    //this.transform.setMouseRotate(2); // set rotate funtion to button 3
    this.transform.setMouseTranslate(1); 
    this.transform.setWheelZoom(); 
    this.transform.setMode("smooth");
    this.transform.setScaleSpeed(1.02);    
    this.newView = false;
    this.chaseFrame = 0;
    this.chaseFrameDelta = 0; 
    this.shapes = groover.code.load("shapes2D");
    this.gradients = groover.code.load("gradients");
    this.candy = this.bitmaps.create("icons",this.view.width,this.view.height,"candy");
    this.play = true;
    this.playSpeed = 1;
    this.gifFrameCount = 0;
    this.fadeUI = 1;
    this.log =  this.owner.ui.createUI("UILogDisplay","Log",{pos:{x:0,y:0},displayLines:12,font:"14px Lucida Console",width:256});
    this.testGroup = this.owner.ui.createUI("UIGroup","testGroup");
    this.slider = this.owner.ui.createUI(
        "UISlider",
        "slider",
        {
            min:0,
            max:100,
            value:0,
            x:140,
            y:-8,
            width:-10,
            decimalPlaces:2,
            digets:3,
            wheelStep : 0.25,
            group:this.testGroup,
            ondrag : this.setPause.bind(this),
            toolTip:"Drag slider to set the time.\nUse the mouse wheel to\nstep quarter seconds." 
         }
    );
    var icons = [
        {
            filenames : ["icons\\speedSlowerOn.png","icons\\speedSlowerOff.png"],
            x: 10,
            y : -12,
            w : 40,
            h : 32,
            toolTip : "Decrease play speed\nor step back a frame",
            cursor : "pointer",
            onclick : (function(){
                if(this.play){
                    if(this.playSpeed > 1){
                        this.playSpeed -= 0.5;
                    }else{
                        this.playSpeed = this.playSpeed / 2;
                    }
                }else
                if(this.gifFrameCount > 0){
                    nextFrameIndex = frameIndex = Math.floor(this.getGifFrameIndex(this.playTime));
                    while(nextFrameIndex === frameIndex){
                        this.playTime += 10;
                        nextFrameIndex =Math.floor( this.getGifFrameIndex(this.playTime) );
                    }
                    this.slider.value = (this.playTime/1000) % (this.gifTotalTime/1000);
                }            
            }).bind(this),
        },
        {
            filenames : ["icons\\speedOn.png","icons\\speedOff.png"],
            x: 60,
            y : -12,
            w : 40,
            h : 32,
            toolTip : "Increase play speed\nor step forward a frame",
            cursor : "pointer",
            onclick : (function(){
                var frameIndex ,nextFrameIndex;
                if(this.play){
                    if(this.playSpeed < 1){
                        this.playSpeed = this.playSpeed * 2;
                    }else{
                        this.playSpeed += 0.5;
                    }
                }else
                if(this.gifFrameCount > 0){
                    nextFrameIndex = frameIndex = Math.floor(this.getGifFrameIndex(this.playTime));
                    while(nextFrameIndex === frameIndex){
                        this.playTime += 10;
                        nextFrameIndex =Math.floor( this.getGifFrameIndex(this.playTime) );
                    }
                    this.slider.value = (this.playTime/1000) % (this.gifTotalTime/1000);
                }            
            }).bind(this),
        },
        {
            filenames : ["icons\\pauseOn.png","icons\\pauseOff.png","icons\\playOn.png","icons\\playOff.png"],
            x: 104,
            y : -12, // negative is distance from the bottom of view to bottom of icon
            w : 32, // if there is a negative heigth or width then the value is calculated to fit that
            h : 32, // will make the width brint the right or bottom widthin that many pixels of the rigth or bottom of the view
            toolTip : "Click to toggle play and pause",
            cursor : "pointer",
            onclick : this.togglePlay.bind(this),
            
        },
    ]
    this.iconButtons = this.owner.ui.createUI("UIIconButtons","controls",{icons:icons});
}
GifViewer.prototype.setPlay = function(){
    if(this.play){
        return;
    }
    this.togglePlay();    
}
GifViewer.prototype.setPause = function(){
    if(!this.play){
        return;
    }
    this.togglePlay();    
}
GifViewer.prototype.togglePlay = function(){
    if(this.play){
        this.play = false;
    }else{
        this.play = true;
    }
    var t = this.iconButtons.icons[2].images[0];
    this.iconButtons.icons[2].images[0] = this.iconButtons.icons[2].images[2];
    this.iconButtons.icons[2].images[2] = t;
    var t = this.iconButtons.icons[2].images[1];
    this.iconButtons.icons[2].images[1] = this.iconButtons.icons[2].images[3];
    this.iconButtons.icons[2].images[3] = t;
    
}
GifViewer.prototype.lostView = function(){
    this.view = this.owner.view;
    this.render = this.owner.render;  
    var xx = 10;
    var yy = this.view.height - 40;
    this.slider.setup();//     .location.set(xx+190,yy,200); yy -= 28;
    this.iconButtons.setup();

    this.newView = true;
}

// draws a nice And way over kill welcome screen.
GifViewer.prototype.iconsAvaliable = function(imageGroup){
    this.icons = imageGroup;
    var text = groover.appDescription.settings.welcomeName ? groover.appDescription.settings.welcomeName:"GIF GROOVER!";
    var text1 = groover.appDescription.settings.welcomeMessage ? groover.appDescription.settings.welcomeMessage:"Drag and drop your groovey GIFs here...";;
    var h = this.candy.image.height;
    var w = this.candy.image.width;
    var grA = this.gradients.createLightGrad(
        this.candy.image.height,
        {rgb:[255,255,255],alpha:1,pos:100,height:200},
        {specPower:0.5}
    );
    var grA = this.gradients.completeGradient(
        this.candy.image, 
        {type:"linear",where:{x1:0,y1:0,x2:w,y2:h*0.9}},
        grA
    );
    var r,g,b,rr,gg,bb,yy,xx,sx,sy,gr;
    r = mMath.randI(150,260);
    g = mMath.randI(150,260);
    b = mMath.randI(150,260);
    rr = mMath.randI(150);
    gg = mMath.randI(150);
    bb = mMath.randI(150);
    yy = mMath.randI(150);
    xx = mMath.randI(w);
    this.candy.image.ctx.font = "120px Arial Black";
    this.candy.image.ctx.textAlign = "center";
    this.candy.image.ctx.textBaseLine = "middle";
    this.candy.image.ctx.lineJoin = "round";
    var textWidth = this.candy.image.ctx.measureText(text).width;
    var scaleFont = (this.candy.image.width * 0.85)/textWidth;
   
    this.candy.image.ctx.font = Math.floor(120 * scaleFont)+"px Arial Black";
    this.candy.image.ctx.fillStyle = gr;
    this.candy.image.ctx.fillRect(0,0,this.candy.image.width,this.candy.image.height);
    for(var i = 0; i < 1; i += 0.01){
        var gr = this.gradients.createLightGrad(
            this.candy.image.height,
            {rgb:[r-rr*i,g-i*gg,b-i*bb],alpha:0.05,pos:100+i*100,height:100-i*yy},
            {specPower:0.4-i*0.3}
        );
        var gr = this.gradients.completeGradient(
            this.candy.image, 
            {type:"linear",where:{x1:i*xx,y1:0,x2:w-xx*i,y2:h*0.89}},
            gr
        );
        this.candy.image.ctx.fillStyle = gr;
        this.candy.image.ctx.fillRect(i*8,i*8,this.candy.image.width-i*16,this.candy.image.height-i*16);   
    }
    r = mMath.randI(150,260);
    g = mMath.randI(150,260);
    b = mMath.randI(150,260);
    rr = mMath.randI(150);
    gg = mMath.randI(150);
    bb = mMath.randI(150);
    yy = mMath.randI(150);
    xx = mMath.randI(w);    
    sx = mMath.randI(100)-50;
    sy = mMath.randI(100)-50;
    for(var i = 0; i < 1; i += 0.05){
        var gr1 = this.gradients.createLightGrad(
            this.candy.image.height,
            {rgb:[r+i*rr,g+i*gg,b-i*bb],alpha:0.15,pos:100+i*yy,height:300-i*yy},
            {specPower:0.4-i*0.39}
        );
        var gr1 = this.gradients.completeGradient(
            this.candy.image, 
            {type:"linear",where:{x2:i*xx,y2:0,x1:w-xx*i,y1:h*0.89}},
            gr1
        );
        
        this.candy.image.ctx.strokeStyle = gr1;
        this.candy.image.ctx.lineWidth = (1-i) * 20;
        this.candy.image.ctx.fillStyle = gr1;
        this.candy.image.ctx.strokeStyle = gr1;
        this.candy.image.ctx.shadowBlur = 20 - 10*i;
        this.candy.image.ctx.shadowOffsetX = -10 -sy*i;
        this.candy.image.ctx.shadowOffsetY = -10 -sy*i;
        this.candy.image.ctx.shadowColor = "rgba("+Math.floor(i*bb) + ","+Math.floor(i*gg) +","+Math.floor(i*rr) +","+i*0.1+")";
        this.candy.image.ctx.fillText(text,w/2,h/2);
        this.candy.image.ctx.shadowBlur = 10 + 10*i;
        this.candy.image.ctx.shadowOffsetX = 10 + sx*i;
        this.candy.image.ctx.shadowOffsetY = 10 + sy*i;
        this.candy.image.ctx.globalCompositeOperation = "multiply"
        this.candy.image.ctx.shadowColor = "rgba("+Math.floor(i*gg) + ","+Math.floor(i*bb) +","+Math.floor(i*rr) +",0.1)";
        this.candy.image.ctx.strokeText(text,w/2,h/2);
        this.candy.image.ctx.globalCompositeOperation = "source-over"
    }
    this.candy.image.ctx.fillStyle = grA;
        this.candy.image.ctx.shadowBlur = 2;
        this.candy.image.ctx.shadowOffsetX = 2;
        this.candy.image.ctx.shadowOffsetY = 2;
    this.candy.image.ctx.globalCompositeOperation = "lighter"
    this.candy.image.ctx.fillText(text,w/2,h/2);
    this.candy.image.ctx.fillText(text,w/2,h/2);
    this.candy.image.ctx.fillText(text,w/2,h/2);
    this.candy.image.ctx.font = "20px Arial Black";
    this.candy.image.ctx.fillText(text1,w/2,h/2+50);
    this.candy.image.ctx.fillText(text1,w/2,h/2+50);
    this.candy.image.ctx.globalCompositeOperation = "source-over"
    this.ready = true;
    log("Viewer started");

  
}


GifViewer.prototype.imageLoaded = function(imageGroup){
    var img = this.gifImage.image.frames[0].image;
    this.transform.fitView(-img.width/2,-img.height/2,img.width/2,img.height/2,"fit");
    this.playTime = 0;    
    this.setPlay();
}
GifViewer.prototype.imageDropped = function(file){
    if(this.gifImages){
        if(this.gifImage){
            if(this.gifImage.image.loading){
                var who = this;
                if(this.gifImage.image.cancel(
                        function(){
                            who.loadGif(file);
                        })
                    ){
                    return;
                }
            }
            this.gifImage.remove = true;
            this.bitmaps.cleanImageGroup(this.gifImages);            
        }
    }
    this.loadGif(file);
}    
GifViewer.prototype.loadGif = function(file){

    log("Loading Image '"+file.path+"'","#0F0");
    this.gifImages = this.bitmaps.startLoad("gifImages",this.imageLoaded.bind(this));
    this.gifImage = this.bitmaps.load("gifImages",file.path);
    this.gifImage.image.onloadall = function(){groover.busy = false;};
    groover.busy = true;
    groover.busyMessage = "loading Image!";
    this.gifLoadTime = new Date().valueOf() + 5 * 1000;
}
GifViewer.prototype.update = function(){
    if(this.view.refreshed){
        this.lostView();
        log("Refresh");
    }
    var time = new Date().valueOf();
    this.frameTime = time-this.time;
    this.time = time;

}
GifViewer.prototype.createGifTimeline = function(){
    this.timeline = [];
    if(this.gifImage !== undefined){
        var img = this.gifImage.image;
        var frames = img.frames;
        var len = frames.length;
        for(var i = 0; i < len; i++){
            var delay = frames[i].delay;
            for(var j = 0; j < delay; j += 1){
                this.timeline.push(i + j / delay);
            }            
        }
        this.gifTotalTime = (this.timeline.length-1) * 10;
        this.gifFrameCount = frames.length;    
    }
}
GifViewer.prototype.getGifFrameIndex = function(time){
    var frame,next,timeI;
    time /= 10;
    timeI = Math.floor(time);
    frame = this.timeline[timeI%this.timeline.length];
    if((timeI+1)%this.timeline.length < timeI%this.timeline.length){
        next = this.gifImage.image.frames.length;
    }else{
        next = this.timeline[(timeI+1)%this.timeline.length];
    }
    var frac = (next-frame) *(time%1);
    return frame + frac
    
}
GifViewer.prototype.display = function(){
    var frameTime,img,frames,len,frameCount,frameIndex;    
    var info = "No frames loaded.";
    if(this.ready){

        this.render.drawBackground(this.images.background.image);
        if(groover.draggedOver){
            if(this.fadeOut === undefined){
                this.fadeOut = 1;
            }
            if(this.fadeOut >0){
                this.render.drawBitmapSize(this.candy.image,0,0,this.view.width,this.view.height,mMath.easeInOut(this.fadeOut,2));
                this.fadeOut -= 0.01;
            }
        }else{
            this.render.drawBackground(this.candy.image);
        }
        
        if(this.transform){
            if(this.newView){
                this.transform.ctx = this.view.ctx;
                if(this.gifImage !== undefined){
                    var img = this.gifImage.image.frames[0].image;
                    this.transform.fitView(-img.width/2,-img.height/2,img.width/2,img.height/2,"fit");
                }
                this.newView = false;
            }
            this.transform.update();
            this.transform.setTransform();
        }
        if(this.gifImage !== undefined && this.gifImage.ready === true){
            img = this.gifImage.image;
            frames = img.frames;
            len = frames.length;
            frameCount = len;
            if(this.MK.mousePrivate === 0 && this.MK.B1){
                this.MK.B1 = false;
                this.togglePlay();
            }
            if(this.gifImage.ready){
                if(!img.complete){
                    this.createGifTimeline();
                    this.slider.max = this.gifTotalTime/1000;
                    this.done = false;
                    
                }else{
                    if(!this.done){
                        this.done = true;
                        this.createGifTimeline();
                        this.slider.max = this.gifTotalTime/1000;
                    }
                }
                
                if(this.done){
                    if(this.play){
                        this.playTime += this.frameTime * this.playSpeed;
                        this.slider.value = (this.playTime/1000) % (this.gifTotalTime/1000);
                    }else{
                        this.playTime = this.slider.value*1000;
                    }
                    frameIndex = this.getGifFrameIndex(this.playTime);

                }else{
                    frameIndex = Math.max(0,frames.length - 1);
                    this.slider.max = this.gifTotalTime/1000;
                    this.slider.value = ((this.playTime)/1000) % (this.gifTotalTime/1000);
                }
                this.render.drawBitmapGSRA(frames[Math.floor(frameIndex)].image,0,0,1,0,1);
                
                // only fade if playing and if not playing only if not at last frame
                if(this.play || (!this.play && Math.floor(frameIndex+1)%frameCount > Math.floor(frameIndex))){
                    var fade = (frameIndex%1)
                    this.render.drawBitmapGSRA(frames[Math.floor(frameIndex+1)%frameCount].image,0,0,1,0,fade);
                }
                
                if(this.time < this.gifLoadTime){
                    if(img.comment !== ""){
                        info = img.comment;
                    }else{
                        info = "W:"+img.width+ " H:"+img.height;
                    }
                }else{
                    if(this.play){
                        info = "Length:"+(this.gifTotalTime/1000).toFixed(2)+"seconds Speed:"+(this.playSpeed).toFixed(2);
                    }else{
                        info = "Frame:"+frameIndex.toFixed(0) + "/"+frameCount;
                        
                    }
                }
            }
        }



        if(this.time - this.MK.lastEventTime > 3*1000){
            this.MK.requestCursor("none",0);
            if(this.fadeUI > 0){
                this.fadeUI -= 0.02;
                if(this.fadeUI < 0){
                    this.fadeUI = 0;
                }
            }
            
        }else{
            this.MK.releaseCursor(0);
            if(this.fadeUI < 1){
                this.fadeUI += 0.02;
                if(this.fadeUI > 1){
                    this.fadeUI = 1;
                }
            }                        
        }
        
        if(this.gifImage === undefined){
            this.fadeUI = 0;
        }
        this.iconButtons.location.alpha = this.fadeUI;
        this.slider.location.alpha = this.fadeUI;
        this.log.display();
        this.testGroup.mouse.isMouseOver();
        this.testGroup.update();
        this.testGroup.display();
        this.iconButtons.update();
        this.iconButtons.display();

        this.render.set2DStyles(this.textStyle.font,this.textStyle.fill,this.textStyle.stroke);
        this.render.drawText(info,this.view.width/2,10);

    }
}

groover.application = GifViewer;


