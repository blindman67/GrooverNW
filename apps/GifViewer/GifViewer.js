"use strict";
function GifViewer(owner){
    this.owner = owner;
    this.time;
    this.view = this.owner.view;
    this.render = this.owner.render;
    this.bitmaps = this.owner.bitmaps;
    this.MK = this.owner.mouseKeyboard;
    this.ready = false;
    this.bitmaps.startLoad(this.iconsAvaliable.bind(this),"icons");
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

    this.log =  this.owner.ui.createUI("UILogDisplay","Log",{pos:{x:0,y:0},displayLines:12,font:"14px Lucida Console",width:256});
    this.testGroup = this.owner.ui.createUI("UIGroup","testGroup");
    this.slider        = this.owner.ui.createUI("UISlider","slider"      ,{min:0,max:100,value:10,width:window.innerWidth-120,digets:3,colour:0,wheelStep : 1,group:this.testGroup,toolTip:"Drag this slider to set the frame location of the gif." });
    //this.frameSlider        = this.owner.ui.createUI("UISliderSmall","frameSlider"      ,{min:0,max:100,value:10,width:window.innerWidth-20,digets:3,colour:0,wheelStep : 1,group:this.testGroup,toolTip:"Drag this slider to set the frame location of the gif." });
    this.playSpeed          = this.owner.ui.createUI("UISliderSmall","playSpeed"        ,{min:-200,max:200,value:20,width:window.innerWidth/2-20,digets:4,colour:1,wheelStep : 1,group:this.testGroup,toolTip:"Play bakc speed."});
    this.frameCrossfade     = this.owner.ui.createUI("UISliderSmall","Crossfade"        ,{min:1,max:100,value:20,width:window.innerWidth/4-20,digets:4,colour:1,wheelStep : 1,group:this.testGroup,toolTip:"Controls frame crossfade rate\nLow values spred the fade over\nframes while high value\nmakes the cross fade quicker"});
    this.chaseAccl          = this.owner.ui.createUI("UISliderSmall","ChaceAccl"        ,{min:1,max:100,value:20,width:window.innerWidth/4-20,digets:4,colour:1,wheelStep : 1,group:this.testGroup,toolTip:"Controls how quickly the frame time follows\nthe users input when scrubbing the frames"});
    this.chaseDrag          = this.owner.ui.createUI("UISliderSmall","ChaceDrage"       ,{min:1,max:100,value:20,width:window.innerWidth/4-20,digets:4,colour:1,wheelStep : 1,group:this.testGroup,toolTip:"Controls the drag of the scrubbing.\n Some interesting FX can be created \nvia this and the above control."});
    this.playCheck           = this.owner.ui.createUI("UICheckBox"   ,"playCheck"        ,{text:"Play.",checked:true,width:0,group:this.testGroup,toolTop:"Plays the loaded gif\nElse show current frame"});
    this.pingPongCheck      = this.owner.ui.createUI("UICheckBox"   ,"pingPongCheck"    ,{text:"Ping pong",checked:false,width:0,group:this.testGroup,toolTip:"If selected then gif plays back and fourth."});
    this.ignoreDelayCheck   = this.owner.ui.createUI("UICheckBox"   ,"ignoreDelayCheck" ,{text:"Ignor load delay.",checked:false,width:0,group:this.testGroup,toolTip:"If selected then play back speed ignorse the frame delay\nloaded from the gif and uses a fixed constant frame delay"});
    this.blendFrameCheck    = this.owner.ui.createUI("UICheckBox"   ,"blendFrameCheck"  ,{text:"Blend frames.",checked:false,width:0,group:this.testGroup,toolTip:"If true blends gif frames when screen refresh time does not match gif frame time."});

    var onBlendChange = (function(cont){
        if(cont.checked){
            this.frameCrossfade.mouse.activate();
        }else{
            this.frameCrossfade.mouse.deactivate();
        }
    }).bind(this)
            
    this.blendFrameCheck.onchecked = onBlendChange;
    this.blendFrameCheck.onunchecked = onBlendChange;

    var onPlayChange = (function(cont){
        if(cont.checked){
            this.chaseAccl.mouse.deactivate();
            this.chaseDrag.mouse.deactivate();
            this.playSpeed.mouse.activate();
        }else{
            this.chaseAccl.mouse.activate();
            this.chaseDrag.mouse.activate();
            this.playSpeed.mouse.deactivate();
        }
    }).bind(this)

    this.playCheck.onchecked = onPlayChange;
    this.playCheck.onunchecked = onPlayChange;    
    


}

GifViewer.prototype.lostView = function(){
    this.view = this.owner.view;
    this.render = this.owner.render;  
    var xx = 10;
    var yy = this.view.height - 40;
    this.slider     .location.set(xx,yy); yy -= 10;
    //this.frameSlider     .location.set(xx,yy); yy += 10;
    this.playSpeed       .location.set(xx,yy); yy -= 10;
    this.frameCrossfade       .location.set(xx,yy); yy -= 10;
    this.chaseAccl            .location.set(xx,yy); yy -= 10;
    this.chaseDrag            .location.set(xx,yy); yy -= 10;
    this.playCheck       .location.set(xx,yy); yy -= 16;
    this.pingPongCheck   .location.set(xx,yy); yy -= 16;
    this.ignoreDelayCheck.location.set(xx,yy); yy -= 16;
    this.blendFrameCheck .location.set(xx,yy); yy -= 16;
    this.newView = true;
}
GifViewer.prototype.iconsAvaliable = function(imageGroup){
    this.icons = imageGroup;
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
    this.gifImages = this.bitmaps.startLoad(this.imageLoaded.bind(this),"gifImages");
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
                this.playCheck.setChecked(!this.playCheck.checked);                
            }
            if(this.gifImage.ready){
                if(this.pingPongCheck.checked){
                    frameCount = len + len -2
                }else{
                    frameCount = len;
                }
                var playSpeed = Math.abs(this.playSpeed.value/20);                
                if(!img.complete){

                    img.lastframeAt = new Date().valueOf() ;
                    img.nextframeAt = new Date().valueOf() + 10;
                    img.currentFrame = len-1;
                    frameInd = img.currentFrame;
                }else{

                    if(this.time > img.nextFrameAt && this.playCheck.checked){
                        img.currentFrame += 1;
                        img.currentFrame %= frameCount;
                        frameInd = img.currentFrame;
                        if(frameInd >= len){
                            frameInd = len-(frameInd-(len - 2));
                        }
                        img.lastFrameAt = img.nextFrameAt;
                        var playSpeed = Math.abs(this.playSpeed.value/20);
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
                
                if(this.playCheck.checked){
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
                
                if(this.playSpeed.value < 0){
                    frameInd = (frameCount - 1)-frameInd;
                }
                
                if(!this.playCheck.checked){
                    this.chaseFrameDelta += (frameInd - this.chaseFrame) * this.chaseAccl.value/100;
                    this.chaseFrameDelta *= this.chaseDrag.value/100;
                    this.chaseFrame += this.chaseFrameDelta < 0 ? -Math.sqrt(-this.chaseFrameDelta):Math.sqrt(this.chaseFrameDelta) ;
                
                }else{
                    this.chaseFrameDelta = 0;
                    this.chaseFrame = frameInd;
                }
                
                fade = this.chaseFrame% 1;
                frameInd= Math.floor(this.chaseFrame);
                if((this.playSpeed.value < 0 && frameInd < len) || (this.playSpeed.value > 0 && frameInd >= len)){
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
                    fade = mMath.easeInOut(fade,this.frameCrossfade.value/20);
                    if(this.playSpeed.value < 0){
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

        this.render.set2DStyles(this.textStyle.font,this.textStyle.fill,this.textStyle.stroke);
        this.render.drawText(info,this.view.width/2,10);

    }
}

groover.application = GifViewer;


