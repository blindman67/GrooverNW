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
    this.imageDumpType = "jpg";
    this.imageDumpQuality = 0.5;
    if(groover.appDescription.settings !== undefined && groover.appDescription.settings.imageDump !== undefined){
        groover.utils.files.imageSaveDirectory = groover.appDescription.settings.imageDump;
        this.imageDumpType = groover.appDescription.settings.imageDumpType;
        this.imageDumpQuality = groover.appDescription.settings.imageDumpQuality;
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
    this.fileList = [];
    this.createUI();
}
GifViewer.prototype.createColourDialog = function(){
    var UI = this.owner.ui;
    if(this.colourGroup === undefined){
        this.colourGroup = this.owner.ui.createUI("UIGroup","colourGroup");
        this.colourDialog = UI.createUI("UIDialogContainer","colourDialog",{
            x:"center",y:"center",
            width : 400, height : 400,
            group : this.colourGroup,
            uiCreate : this.colourUI.bind(this),
        });
    }
    this.colourDialog.addUI("{AC{+{+{BColour Dialog Test!}}}}\n");
    
}
GifViewer.prototype.colourUI = function(group){   
    var UI = this.owner.ui;
    var copy = groover.utils.language.objectCopyCombine;
    var sliderStyle = {
        bar : groover.utils.namedStyles.UIColourSliderBar,
        handle : groover.utils.namedStyles.UIColourSliderHandle,
        numDisplay : groover.utils.namedStyles.UIColourSliderDisplay,
    }        
    var yp = -300;
    var redSlider = {
        x : 10, y : yp, width: -10, height : 30,
        min : 0, max : 255,  value : 0,
        handleSpan : 32,
        decimalPlaces:0,digets:3,
        wheelStep : 6,            
        group:group,
        ondrag : undefined,
        toolTip:"Red channel value",
        style : sliderStyle,
        styleID : groover.utils.IDS.getID(),
    }
    var greenSlider =  copy(redSlider,{y :yp+35,toolTip:"Green channel value"});
    var blueSlider =  copy(redSlider,{y :yp+70,toolTip:"Blue channel value"});
    var alphaSlider =  copy(redSlider,{y :yp+105,toolTip:"Alpha channel value"});
    
    var okButton = {
        x: 10,y: -10,height : 30, minWidth : 100,
        text : "  OK  ",
        toolTip :"Accept and close dialog",
        onclick : undefined,
        group:group,
    }
    var cancelButton =  copy(okButton,{x :-10,text : "Cancel", toolTip : "Ignor change an close."});
        
    UI.createUI("UISlider","redSlide",redSlider);
    UI.createUI("UISlider","greenSlide",greenSlider);
    UI.createUI("UISlider","blueSlide",blueSlider);
    UI.createUI("UISlider","alphaSlide",alphaSlider);
    UI.createUI("UIButton","colOK",okButton);
    UI.createUI("UIButton","colCancel",cancelButton);
    
}


GifViewer.prototype.createUI = function(){    
    this.alert = this.owner.ui.createUI("UIAlerts","myAlert",{
            x:"center",y:"center",
            buttonStyles :{
                button : groover.utils.namedStyles.UIAlertButton,
                hover : groover.utils.namedStyles.UIAlertButtonHover,
                click : groover.utils.namedStyles.UIAlertButtonClick,
            },
        }
    );
    this.alertType = 0;
    
    this.log =  this.owner.ui.createUI("UILogDisplay","Log",{pos:{x:0,y:0},displayLines:12,font:"14px Lucida Console",width:256});
    this.testGroup = this.owner.ui.createUI("UIGroup","testGroup");
    this.slider = this.owner.ui.createUI("UISlider","slider", {
            min:0,
            max:100,
            value:0,
            handleSpan : 0.01,
            x:240, y:-8, width:-10,
            decimalPlaces:2,
            digets:3,
            wheelStep : 0.25,            
            group:this.testGroup,
            ondrag : this.setPause.bind(this),
            toolTip:"Drag slider to set the time.\nUse the mouse wheel to\nstep quarter seconds." 
         }
    );
    var by = -86;
    var bys = 34;
    this.fitViewButton = this.owner.ui.createUI( "UIButton","fitView",{
            x: 10,y: by,height : 30,
            text : "Fit",
            toolTip :"Resets the view to fit within the window.",
            onclick : this.fitView.bind(this),
            group:this.testGroup,
        }
    )
    by-= bys;
    this.nextFile = this.owner.ui.createUI("UIButton","nextFile",{
            x: 10,y: by,height : 30,
            text : "?",
            toolTip :"Displays information about\nthe current gif.",
            onclick : this.showInfo.bind(this),
            group:this.testGroup,
        }
    )
    by-= bys;    
    var saveImages = this.saveGifAsImages.bind(this);
    this.saveButton = this.owner.ui.createUI("UIButton","save",{
            x: 10,y: by,height : 30,
            text : "Save",
            toolTip :"Save gif as a set of jpg images.",
            onclick : this.saveAnimation.bind(this),
            group:this.testGroup,
        }
    )
    by-= bys;    
    this.colourButton = this.owner.ui.createUI("UIButton","colourText",{
            x: 10,y: by,height : 30,
            text : "Color",
            toolTip :"Text the dialalog container UI element",
            onclick : this.createColourDialog.bind(this),
            group:this.testGroup,
        }
    )
    by-= bys;
    var bx = -35;
    this.checkFade = this.owner.ui.createUI( "UICheckBox", "checkBox1", {
            x: 10, y: -52, height : 30,
            text : "Use frame fade.",
            toolTip :"If checked this will add the next frame\nwith a part fade to smooth\ngifs with low frame rates.",
            group:this.testGroup,
        }
    )
    var icons = [ {
            filenames : ["icons\\prevOn.png","icons\\prevOff.png"],
            x: bx+=45 , y : -12, w : 40, h : 32,cursor : "pointer",
            toolTip : "Load previouse gif",            
            onclick : this.prevGif.bind(this),
        },  {
            filenames : ["icons\\speedSlowerOn.png","icons\\speedSlowerOff.png"],
            x: bx += 45, y : -12, w : 40, h : 32,cursor : "pointer",
            toolTip : "Decrease play speed\nor step back a frame",
            onclick : this.speedDown.bind(this),
        }, {
            filenames : ["icons\\speedOn.png","icons\\speedOff.png"],
            x: bx += 45, y : -12, w : 40, h : 32,cursor : "pointer",
            toolTip : "Increase play speed\nor step forward a frame",
            onclick : this.speedUp.bind(this),
        }, {
            filenames : ["icons\\nextOn.png","icons\\nextOff.png"],
            x: bx += 45,y : -12,w : 40,h : 32,cursor : "pointer",
            toolTip : "Load next gif",
            onclick : this.nextGif.bind(this),
        }, {
            filenames : ["icons\\pauseOn.png","icons\\pauseOff.png","icons\\playOn.png","icons\\playOff.png"],
            x: bx += 55,y : -12, w : 32, h : 32, cursor : "pointer",
            toolTip : "Click to toggle play and pause",
            onclick : this.togglePlay.bind(this),
        },
    ]
    this.iconButtons = this.owner.ui.createUI("UIIconButtons","controls",{icons:icons,group:this.testGroup});
    groover.utils.files.saveJson("UIStyle",groover.utils.namedStyles);
}
GifViewer.prototype.saveGifAsImages = function(button){
    if(button === "OK"){
        var filename  = path.parse(this.gifImage.filename);       
        this.bitmaps.saveAnimationFramesAs(this.gifImage,filename.name,this.imageDumpType,this.imageDumpQuality );
        
    }
}

GifViewer.prototype.fitView = function(){
   if(this.gifImage !== undefined){
        var img = this.gifImage.image.frames[0].image;
        this.transform.fitView(-img.width/2,-img.height/2,img.width/2,img.height/2,"fit");
    }                
}
GifViewer.prototype.showInfo = function(){
    if(this.gifImage !== undefined){
        var str = "{+{+{B{ACGIF Image Info}}}}\n\n";
        str += "Test super and sub script {BA{U1}{S2}} * {BX{S3}}\n";
        var filename  = path.parse(this.gifImage.filename);
        str += "{BFilename:}{F.}{AR'"+(filename.name +filename.ext)+ "'}\n";
        if(this.gifImage.image.comment !== ""){
            str += "{BGif Comment:}\n{AC'"+this.gifImage.image.comment + "'}\n\n";
        }
        var bSize = this.gifImage.image.frames.length*this.gifImage.image.frames[0].image.width * this.gifImage.image.frames[0].image.height * 4;
        str += "{BFrames:}{F.}{AR"+this.gifImage.image.frames.length+ "}\n";
        str += "{BLength:}{F.}{AR"+(this.gifTotalTime/1000).toFixed(2)+" seconds}\n";
        str += "{BSize:}{F.}{AR"+this.gifImage.image.frames[0].image.width + " by "+this.gifImage.image.frames[0].image.height + "}\n";
        str += "{BBytes:}{F.}{AR"+mMath.formatNumber(bSize,",")+ " bytes}\n";
        this.alert.alert(str);
    }
}
GifViewer.prototype.saveAnimation = function(){
    if(this.gifImage !== undefined){
        if(this.gifImage.image.complete){
            var str = "";
            str += "{AC{+{+{BAnimation Save.}}}}\n";
            var filename  = path.parse(this.gifImage.filename);
            str += "{ACSave gif {B'"+(filename.name +filename.ext)+ "'}}\n";
            str += "{ACas "+this.gifImage.image.frames.length + " "+this.imageDumpType+" images at quality setting "+this.imageDumpQuality+"?}}\n"
            this.alert.prompt(str,this.saveGifAsImages);
        }else{
            this.alert.alert("{ACThe GIF is still loading.\nTry again when loading is complete}\n");
        }
    }                
}
    
    
    
GifViewer.prototype.prevGif = function(){
    this.currentFile = (this.currentFile  + (this.fileList.length-1))%this.fileList.length;
    this.loadGif({path:this.fileList[this.currentFile],type:"image/gif"});                
}
GifViewer.prototype.nextGif = function(){
    this.currentFile = (this.currentFile + 1)%this.fileList.length;
    this.loadGif({path:this.fileList[this.currentFile],type:"image/gif"});   
}
GifViewer.prototype.speedDown = function(){
    var frameIndex ,nextFrameIndex;                
    if(this.play){
        if(this.playSpeed > 1){
            this.playSpeed -= 0.5;
        }else{
            this.playSpeed = this.playSpeed / 2;
        }
    }else
    if(this.gifFrameCount > 0){
        frameIndex = Math.floor(this.getGifFrameIndex(this.playTime));
        this.playTime = this.getGifTimeIndex(((frameIndex -1)+this.gifImage.image.frames.length)%(this.gifImage.image.frames.length));
        this.slider.value = (this.playTime/1000) % (this.gifTotalTime/1000);
    }            
}
GifViewer.prototype.speedUp = function(){
    var frameIndex ,nextFrameIndex;
    if(this.play){
        if(this.playSpeed < 1){
            this.playSpeed = this.playSpeed * 2;
        }else{
            this.playSpeed += 0.5;
        }
    }else
    if(this.gifFrameCount > 0){
        frameIndex = Math.floor(this.getGifFrameIndex(this.playTime));
        this.playTime = this.getGifTimeIndex((frameIndex +1)%(this.gifImage.image.frames.length));
        this.slider.value = (this.playTime/1000) % (this.gifTotalTime/1000);
    }            
}

GifViewer.prototype.setPlay = function(){
    if(this.play){
        return;
    }
    this.togglePlay(this.iconButtons.icons[4]);    
}
GifViewer.prototype.setPause = function(){
    if(!this.play){
        return;
    }
    this.togglePlay(this.iconButtons.icons[4]);    
}
GifViewer.prototype.togglePlay = function(icon){
    if(this.play){
        this.play = false;
    }else{
        this.play = true;
    }
    var t = icon.images[0];
    icon.images[0] = icon.images[2];
    icon.images[2] = t;
    var t = icon.images[1];
    icon.images[1] = icon.images[3];
    icon.images[3] = t;
    
}
GifViewer.prototype.lostView = function(){
    this.view = this.owner.view;
    this.render = this.owner.render;  
    var xx = 10;
    var yy = this.view.height - 40;
    this.testGroup.setup();  // redraw UIs

    this.newView = true;
}

// draws a nice and way over kill welcome screen.
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
    this.lastFrameIndex = 0;
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
    
    this.images.background = this.bitmaps.create("icons",Math.floor(this.view.width/10),Math.floor(this.view.height/10),"background");
    this.images.background.image.ctx.drawImage(this.candy.image,0,0,Math.floor(this.view.width/10),Math.floor(this.view.height/10));
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
    this.loadGif(file);
    this.fileList = groover.utils.files.getFilesOfTypeInDir(file,".gif");
    this.currentFile = 0;
    for(var i = 0; i < this.fileList.length; i++){
        if(this.fileList[i].indexOf(file.path) > -1){
            this.currentFile = i;
            break;
        }
    }
}    

// load a gif file.
// file is the file descriptor
// {
//  path : "full file name and path",
//  type : "mime type as string" example "image/gif"
// }
// If an existing gif then remove it if loaded
// if not loaded cancel set cancel callback to this function.    
GifViewer.prototype.loadGif = function(file){
    if(file.type === "image/gif"){
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
    }
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
    }
    var time = new Date().valueOf();
    this.frameTime = time-this.time;
    this.time = time;

}
GifViewer.prototype.createGifTimeline = function(){
    this.timeline = [];
    this.frameTimes = [];
    if(this.gifImage !== undefined){
        var img = this.gifImage.image;
        var frames = img.frames;
        var len = frames.length;
        for(var i = 0; i < len; i++){
            var delay = frames[i].delay?frames[i].delay:1;
            this.frameTimes.push( this.timeline.length * 10 );
            for(var j = 0; j < delay; j += 1){
                this.timeline.push(i + j / delay);
            }            
        }
        this.frameTimes.push( this.timeline.length * 10 );
        this.gifTotalTime = (this.timeline.length-1) * 10;
        this.gifFrameCount = frames.length;    
    }
}
GifViewer.prototype.getGifTimeIndex = function(frame){
    log("Frame time "+this.frameTimes.length);
    frame = ((frame % this.frameTimes.length)+this.frameTimes.length)%this.frameTimes.length;    
    return this.frameTimes[Math.floor(frame)];
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
        /*if(!this.alert.active){
            this.alert.active = true;
            var doneFunction = (function(name){
                log("Done with alert after "+name+" button clicked");
                if(name === "cancel"){
                    this.alertType = 2;
                }
            }).bind(this);
            if(this.alertType === 0){
                this.alert.alert("Some bigger text to see\nOverflow behaviour and stuff\nlinked to resizing the allerts\nThe time is:\n"+this.time,doneFunction);
                this.alertType = 1;
            }else
            if(this.alertType === 1){
                this.alert.prompt("Big number is cool:\nClick cancel to stop the alerts and prompts"+this.time,doneFunction);
                this.alertType = 0;
                
            }
            
        }*/
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
                this.togglePlay(this.iconButtons.icons[4]);
            }
            if(this.gifImage.ready){
                if(!img.complete){
                    this.createGifTimeline();
                    this.slider.handleSpan = (this.gifTotalTime/1000)/len;
                    this.slider.setMinMax(0,this.gifTotalTime/1000);
                    //this.slider.max = this.gifTotalTime/1000;
                    this.done = false;
                    
                }else{
                    if(!this.done){
                        this.done = true;
                        this.createGifTimeline();
                        this.slider.handleSpan = (this.gifTotalTime/1000)/len;
                        this.slider.setMinMax(0,this.gifTotalTime/1000);
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
                var frameBetweenCount = 0;
                if(this.lastFrameIndex > frameIndex){
                    frameBetweenCount = (frameIndex + frameCount)-this.lastFrameIndex;
                }else{
                    frameBetweenCount = frameIndex-this.lastFrameIndex;
                }
                var f = frames[Math.floor(frameIndex)];
                this.render.drawBitmapGSRA(f.image,0,0,1,0,1);

                if(this.checkFade.checked){
                    if(frameBetweenCount >= 2 && this.play){
                        var fade = 2/(frameBetweenCount-1);
                        for(var i = 1; i < frameBetweenCount -1; i ++){
                            var f1 = frames[Math.floor(this.lastFrameIndex +i)%frameCount];
                            this.render.drawBitmapGSRA(f1.image,0,0,1,0,fade);
                        }
                    }else{
                        if(this.play || (!this.play && Math.floor(frameIndex+1)%frameCount > Math.floor(frameIndex))){
                            var fade = (frameIndex%1)
                            var f1 = frames[Math.floor(frameIndex+1)%frameCount]
                            this.render.drawBitmapGSRA(f1.image,0,0,1,0,fade);
                        }
                    }
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
                this.lastFrameIndex = frameIndex;
            }
        }



        if(this.time - this.MK.lastEventTime > 3*1000 || !this.MK.over){
            this.MK.requestCursor("none",0);
            if(this.fadeUI > 0){
                this.fadeUI -= 0.1;
                if(this.fadeUI < 0){
                    this.fadeUI = 0;
                }
            }
            
        }else{
            this.MK.releaseCursor(0);
            if(this.fadeUI < 1){
                this.fadeUI += 0.1;
                if(this.fadeUI > 1){
                    this.fadeUI = 1;
                }
            }                        
        }
        
        if(this.gifImage === undefined){
            this.fadeUI = 0;
        }
        //this.iconButtons.location.alpha = this.fadeUI;
        //this.slider.location.alpha = this.fadeUI;
        this.testGroup.location.alpha = this.fadeUI;
        this.log.display();
        if(this.fadeUI > 0){
            this.testGroup.mouse.isMouseOver();
            this.testGroup.update();
            this.testGroup.display();
        }
        //this.iconButtons.update();
        //this.iconButtons.display();

        this.render.set2DStyles(this.textStyle.font,this.textStyle.fill,this.textStyle.stroke);
        this.render.drawText(info,this.view.width/2,10);

    }
    if(this.colourDialog !== undefined){
        if(this.colourDialog.active){
            this.colourDialog.update();
            this.colourDialog.display();
        }
    }
    if(this.alert.active){
        this.alert.update();
        this.alert.display();
    }
}

groover.application = GifViewer;


