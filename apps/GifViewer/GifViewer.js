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
    this.transform.setMode("smooth")       
    this.newView = false;
    this.chaseFrame = 0;
    this.chaseFrameDelta = 0; 
    this.shapes = groover.code.load("shapes2D");
    this.gradients = groover.code.load("gradients");
    this.candy = this.bitmaps.create("icons",this.view.width,this.view.height,"candy");
    this.play = true;
    this.log =  this.owner.ui.createUI("UILogDisplay","Log",{pos:{x:0,y:0},displayLines:12,font:"14px Lucida Console",width:256});
    this.testGroup = this.owner.ui.createUI("UIGroup","testGroup");
    this.slider        = this.owner.ui.createUI("UISlider","slider"      ,{min:0,max:100,value:10,x:140,y:-8,width:-10,digets:3,colour:0,wheelStep : 1,group:this.testGroup,toolTip:"Drag this slider to set the frame location of the gif." });
    //this.frameSlider        = this.owner.ui.createUI("UISliderSmall","frameSlider"      ,{min:0,max:100,value:10,width:window.innerWidth-20,digets:3,colour:0,wheelStep : 1,group:this.testGroup,toolTip:"Drag this slider to set the frame location of the gif." });
   // this.playSpeed          = this.owner.ui.createUI("UISliderSmall","playSpeed"        ,{min:-200,max:200,value:20,width:window.innerWidth/2-20,digets:4,colour:1,wheelStep : 1,group:this.testGroup,toolTip:"Play bakc speed."});
    //this.frameCrossfade     = this.owner.ui.createUI("UISliderSmall","Crossfade"        ,{min:1,max:100,value:20,width:window.innerWidth/4-20,digets:4,colour:1,wheelStep : 1,group:this.testGroup,toolTip:"Controls frame crossfade rate\nLow values spred the fade over\nframes while high value\nmakes the cross fade quicker"});
    //this.chaseAccl          = this.owner.ui.createUI("UISliderSmall","ChaceAccl"        ,{min:1,max:100,value:20,width:window.innerWidth/4-20,digets:4,colour:1,wheelStep : 1,group:this.testGroup,toolTip:"Controls how quickly the frame time follows\nthe users input when scrubbing the frames"});
    //this.chaseDrag          = this.owner.ui.createUI("UISliderSmall","ChaceDrage"       ,{min:1,max:100,value:20,width:window.innerWidth/4-20,digets:4,colour:1,wheelStep : 1,group:this.testGroup,toolTip:"Controls the drag of the scrubbing.\n Some interesting FX can be created \nvia this and the above control."});
    //this.playCheck           = this.owner.ui.createUI("UICheckBox"   ,"playCheck"        ,{text:"Play.",checked:true,width:0,group:this.testGroup,toolTop:"Plays the loaded gif\nElse show current frame"});
    this.pingPongCheck      = this.owner.ui.createUI("UICheckBox"   ,"pingPongCheck"    ,{text:"Ping pong",checked:false,x:8,y:-65,width:0,group:this.testGroup,toolTip:"If selected then gif plays back and fourth."});
    this.ignoreDelayCheck   = this.owner.ui.createUI("UICheckBox"   ,"ignoreDelayCheck" ,{text:"Ignor load delay.",checked:false,x:8,y:-50,width:0,group:this.testGroup,toolTip:"If selected then play back speed ignorse the frame delay\nloaded from the gif and uses a fixed constant frame delay"});
    this.blendFrameCheck    = this.owner.ui.createUI("UICheckBox"   ,"blendFrameCheck"  ,{text:"Blend frames.",checked:false,x:8,y:-38,width:0,group:this.testGroup,toolTip:"If true blends gif frames when screen refresh time does not match gif frame time."});
    var icons = [
        {
            filename1 : "icons\\playOn.png",
            filename2 : "icons\\playOff.png",
            x: 10,
            y : -8,
            w : 32,
            h : 32,
            toolTip : "Click to play",
            cursor : "pointer",
        },
        {
            filename1 : "icons\\speedOn.png",
            filename2 : "icons\\speedOff.png",
            x: 46,
            y : -8,
            w : 32,
            h : 32,
            toolTip : "Click to play",
            cursor : "pointer",
        },
        {
            filename1 : "icons\\pauseOn.png",
            filename2 : "icons\\pauseOff.png",
            x: 46 + 38,
            y : -8,
            w : 32,
            h : 32,
            toolTip : "Click to play",
            cursor : "pointer",
        }
    ]
    this.iconButtons = this.owner.ui.createUI("UIIconButtons","controls",{icons:icons});
    var onBlendChange = (function(cont){
        if(cont.checked){
            //this.frameCrossfade.mouse.activate();
        }else{
            //this.frameCrossfade.mouse.deactivate();
        }
    }).bind(this)
            
    this.blendFrameCheck.onchecked = onBlendChange;
    this.blendFrameCheck.onunchecked = onBlendChange;

    var onPlayChange = (function(cont){
        if(cont.checked){
            //this.chaseAccl.mouse.deactivate();
           // this.chaseDrag.mouse.deactivate();
           // this.playSpeed.mouse.activate();
        }else{
          //  this.chaseAccl.mouse.activate();
           // this.chaseDrag.mouse.activate();
          //  this.playSpeed.mouse.deactivate();
        }
    }).bind(this)

   // this.playCheck.onchecked = onPlayChange;
//this.playCheck.onunchecked = onPlayChange;    
    


}

GifViewer.prototype.lostView = function(){
    this.view = this.owner.view;
    this.render = this.owner.render;  
    var xx = 10;
    var yy = this.view.height - 40;
   // this.iconButtons.location.set(xx + 10, yy, 0);
   // this.iconButtons.location.set(xx + 46, yy, 1);
  //  this.iconButtons.location.set(xx + 82, yy, 2);
    this.slider.setup();//     .location.set(xx+190,yy,200); yy -= 28;
    this.iconButtons.setup();
    //this.frameSlider     .location.set(xx,yy); yy += 10;
    //this.playSpeed       .location.set(xx,yy); yy -= 10;
    //this.frameCrossfade       .location.set(xx,yy); yy -= 10;
   // this.chaseAccl            .location.set(xx,yy); yy -= 10;
   // this.chaseDrag            .location.set(xx,yy); yy -= 10;
   // this.playCheck       .location.set(xx,yy); yy -= 16;
    this.pingPongCheck   .location.set(xx,yy); yy -= 16;
    this.ignoreDelayCheck.location.set(xx,yy); yy -= 16;
    this.blendFrameCheck .location.set(xx,yy); yy -= 16;
    this.newView = true;
}
GifViewer.prototype.iconsAvaliable = function(imageGroup){
    this.icons = imageGroup;
    var text = "GIF GROOVER!";
    var text1 = "Drag and drop your groovey GIFs here...";
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
    if(imageGroup.list[0].video){
        imageGroup.list[0].image.play();
        imageGroup.list[0].image.loop = true;
        groover.busy = false;
    }
    var img = this.gifImage.image.frames[0].image;
    this.transform.fitView(-img.width/2,-img.height/2,img.width/2,img.height/2,"fit");
    

}
GifViewer.prototype.imageDropped = function(file){
    this.gifImages = this.bitmaps.startLoad("gifImages",this.imageLoaded.bind(this));
    this.gifImage = this.bitmaps.load("gifImages",file.path);
    this.gifImage.image.onloadall = function(){groover.busy = false;};
    groover.busy = true;
    groover.busyMessage = "loading Image!";
    this.gifLoadTime = new Date().valueOf() + 5 * 1000;
    this.chaseFrame = 0;
    this.chaseFrameDelta = 0;
}
GifViewer.prototype.update = function(){
    if(this.view.refreshed){
        this.lostView();
        log("Refresh");
    }
    this.time = new Date().valueOf();


}

 GifViewer.prototype.display = function(){
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
                this.transform.fitView(-1000,-1000,1000,1000,"fit");
                this.newView = false;
            }
            this.transform.update();
            this.transform.setTransform();
        }
        if(this.gifImage !== undefined){
            var img = this.gifImage.image;
            var frames = img.frames;
            var len = frames.length;
            var frameCount = len;
            var frameInd;
            var fade;
            if(this.MK.mousePrivate === 0 && this.MK.B1){
                this.MK.B1 = false;
                this.play = !this.play;
                //this.playCheck.setChecked(!this.playCheck.checked);                
            }
            if(this.gifImage.ready){
                if(this.pingPongCheck.checked){
                    frameCount = len + len -2
                }else{
                    frameCount = len;
                }
                var playSpeed = 1;//Math.abs(this.playSpeed.value/20);                
                if(!img.complete){

                    img.lastframeAt = new Date().valueOf() ;
                    img.nextframeAt = new Date().valueOf() + 10;
                    img.currentFrame = len-1;
                    frameInd = img.currentFrame;
                }else{

                    if(this.time > img.nextFrameAt && this.play){
                        img.currentFrame += 1;
                        img.currentFrame %= frameCount;
                        frameInd = img.currentFrame;
                        if(frameInd >= len){
                            frameInd = len-(frameInd-(len - 2));
                        }
                        img.lastFrameAt = img.nextFrameAt;
                        var playSpeed = 1;//Math.abs(this.playSpeed.value/20);
                        if(this.ignoreDelayCheck.checked){
                            img.nextFrameAt = this.time+(1000/60)*playSpeed;
                            
                        }else{
                            if(img.nextFrameAt+frames[frameInd].delay * 10 * playSpeed < this.time){
                                img.lastFrameAt = this.time;
                                img.nextFrameAt = this.time + frames[frameInd].delay * 10 * playSpeed;
                            }else{                                
                                img.nextFrameAt += frames[frameInd].delay * 10 * playSpeed;
                            }
                        }
                    }
                    
                }
               
                

                this.slider.max = frameCount-0.01;
                
                if(this.play){
                    if(img.nextFrameAt-img.lastFrameAt !== 0){
                        fade = (this.time -img.lastFrameAt)/(img.nextFrameAt-img.lastFrameAt);
                    }else{
                        fade = 0;
                    }
                    this.slider.value = img.currentFrame+fade;
                    frameInd = img.currentFrame + fade;
                }else{
                    fade = this.slider.value % 1;
                    img.currentFrame = Math.floor(this.slider.value);
                    frameInd = this.slider.value;
                }
                
               // if(this.playSpeed.value < 0){
               //     frameInd = (frameCount - 1)-frameInd;
               // }
                
                if(!this.play){
                    this.chaseFrameDelta += (frameInd - this.chaseFrame) * 0.4;
                    this.chaseFrameDelta *= 0.4;
                    this.chaseFrame += this.chaseFrameDelta < 0 ? -Math.sqrt(-this.chaseFrameDelta):Math.sqrt(this.chaseFrameDelta) ;
                
                }else{
                    this.chaseFrameDelta = 0;
                    this.chaseFrame = frameInd;
                }
                
                fade = this.chaseFrame% 1;
                frameInd= Math.floor(this.chaseFrame);
                if((playSpeed< 0 && frameInd < len) || (playSpeed > 0 && frameInd >= len)){
                    fade = 1- fade;
                }
                if(frameInd >= len){
                    fade = 1- fade;
                    frameInd = len-(frameInd-(len - 2));
                }
                frameInd = ((frameInd%len) + len * 2)%len
                this.render.drawBitmapGSRA(frames[frameInd].image,0,0,1,0,1);
                if(this.time < this.gifLoadTime){
                    if(img.comment !== ""){
                        info = img.comment;
                    }else{
                        info = "W:"+img.width+ " H:"+img.height;
                    }
                }else{
                    info = "Time:"+((img.totalDelay * 10 * playSpeed)/1000).toFixed(2)+"seconds Frame:"+(frameInd+fade).toFixed(2);
                }
                


                if(this.blendFrameCheck.checked){
                    frameInd = Math.floor(this.chaseFrame +1)%frameCount;
                    fade = mMath.easeInOut(fade,2);
                    if(playSpeed < 0){
                        frameInd = (frameCount - 1)-frameInd;
                    }
                    if(frameInd >= len){
                        frameInd = len-(frameInd-(len - 2));
                    }
                    frameInd = ((frameInd%len) + len * 2)%len
                    this.render.drawBitmapGSRA(frames[frameInd%len].image,0,0,1,0,fade);
                }

                
//                this.pingPongCheck;
  //              this.ignoreDelayCheck;
    //            this.blendFrameCheck;
            }
        }



        
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


