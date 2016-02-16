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

// create and display colour dialog 
// also provides the custom draw function for the dialog to display the colour swatch
GifViewer.prototype.createColourDialog = function(rVal,gVal,bVal,alphaVal){
    var r,g,b,a,count;
    count = 0;
    var drawColour = function(dialog){
        dialog.updated = false;
        var can = dialog.canvas;
        var c = can.ctx;
        var st = groover.utils.namedStyles.colourSwatch;
        var stO = groover.utils.namedStyles.colourSwatchOld;
        st.fillStyle = "rgba(";
        st.fillStyle += Math.floor(r.value);
        st.fillStyle += ",";
        st.fillStyle += Math.floor(g.value)
        st.fillStyle += ",";
        st.fillStyle += Math.floor(b.value)
        st.fillStyle += ",";
        st.fillStyle += (a.value/255)
        st.fillStyle += ")";
        if(count === 0){
            count += 1;
            stO.fillStyle = st.fillStyle;
            
        }
            
        var ins = stO.inset + stO.lineWidth + 10;
        dialog.shapes.drawRectangle(can, ins, ins + 55, can.width - ins * 2, 105 - ins * 2, stO);
        var ins = st.inset + st.lineWidth + 10;
        dialog.shapes.drawRectangle(can, ins, ins + 55, can.width - ins * 2, 105 - ins * 2, st);
    }   

    var UI = this.owner.ui;
    if(this.colourGroup === undefined){
        groover.utils.styles.createDrawStyle("colourSwatchOld","rgba(255,0,0,1)", "black", 2,16, 0);
        groover.utils.styles.createDrawStyle("colourSwatch","rgba(255,0,0,1)", "black", 0,16, 20);
        this.colourGroup = this.owner.ui.createUI("UIGroup","colourGroup");
        this.colourDialog = UI.createUI("UIDialogContainer","colourDialog",{
            x:"center",y:"center",
            width : 400, height : 300,
            group : this.colourGroup,
            uiCreate : this.colourUI.bind(this),
            redraw : drawColour,
        });
    }
    // returns the containing group.
    var cGroup = this.colourDialog.addUI("{AC{+{+{BColour Dialog Test!}}}}\n{-{AC{#F00Red:}{MredValue:255} {#0F0Green:}{MgreenValue:255} {#00FBlue:}{MblueValue:255} {#888Alpha:}{MalphaValue:255}}}\n");
    this.colourDialog.updated = true;
    // get the sliders by name
    r = cGroup.getNamedUI("redSlide");
    g = cGroup.getNamedUI("greenSlide");
    b = cGroup.getNamedUI("blueSlide");
    a = cGroup.getNamedUI("alphaSlide");   
    // set the values if they are avalible
    r.setValue(rVal);
    g.setValue(gVal);
    b.setValue(bVal);
    a.setValue(alphaVal);
    this.colourDialog.text.marked.redValue = Math.floor(rVal);
    this.colourDialog.text.marked.greenValue = Math.floor(gVal);
    this.colourDialog.text.marked.blueValue = Math.floor(bVal);
    this.colourDialog.text.marked.alphaValue = Math.floor(alphaVal);
    count = 0;
}

// Function to create colour dialog controls.
GifViewer.prototype.colourUI = function(owner){   
    var UI = this.owner.ui;
    var group = owner.containerGroup;
    var copy = groover.utils.language.objectCopyCombine;
    var sliderStyle = {
        bar : groover.utils.namedStyles.UIColourSliderBar,
        handle : groover.utils.namedStyles.UIColourSliderHandle,
        numDisplay : groover.utils.namedStyles.UIColourSliderDisplay,
    }        
    var yp = -120;
    var ySpace = 22;
    var redSlider = {
        x : 10, y : yp, width: -10, height : ySpace - Math.floor(ySpace *0.1),
        min : 0, max : 255,  value : 0,
        handleSpan : 32,
        decimalPlaces:0,digits:3,
        wheelStep : 6,            
        group:group,
        ondrag : undefined,
        toolTip:"Red channel value",
        style : sliderStyle,
        showValue : false,
        styleID : groover.utils.IDS.getID(),
        ondrag : function(){
            
            owner.text.marked["redValue"] = Math.floor(group.getNamedUI("redSlide").value);
            owner.text.marked["greenValue"] = Math.floor(group.getNamedUI("greenSlide").value);
            owner.text.marked["blueValue"] = Math.floor(group.getNamedUI("blueSlide").value);
            owner.text.marked["alphaValue"] = Math.floor(group.getNamedUI("alphaSlide").value);
            owner.dirty = true;
            owner.updated = true;
        },
    }
    var greenSlider =  copy(redSlider,{y :yp+ySpace,toolTip:"Green channel value"});
    var blueSlider =  copy(redSlider,{y :yp+ySpace*2,toolTip:"Blue channel value"});
    var alphaSlider =  copy(redSlider,{y :yp+ySpace*3,toolTip:"Alpha channel value"});
    var t = this;
    var okButton = {
        x: 10,y: yp+ySpace*5,height : 30, minWidth : 100,
        text : "OK",
        toolTip :"Accept and close dialog",
        onclick : function(){
            if(this.text === "OK"){ 
                t.redCandy = group.getNamedUI("redSlide").value;
                t.greenCandy = group.getNamedUI("greenSlide").value;
                t.blueCandy = group.getNamedUI("blueSlide").value;
                setTimeout(t.createCandy.bind(t),0);
            }
            owner.show = false;
        },
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
    var appDir = groover.appDescription.directory;
    var iconDir = appDir + "\\icons\\";

    var UI = this.owner.ui;
    var copy = groover.utils.language.objectCopyCombine;    
    this.alert = UI.createUI("UIAlerts","myAlert",{
            x:"center",y:"center",
            buttonStyles :{
                main : groover.utils.namedStyles.UIAlertButton,
                hover : groover.utils.namedStyles.UIAlertButtonHover,
                click : groover.utils.namedStyles.UIAlertButtonClick,
            },
        }
    );
    // for testing 
    this.alertType = 0;
    
    // this still uses old UI logic and should be rewriten
    this.log =  UI.createUI("UILogDisplay","Log",{pos : {x : 0, y : 0}, displayLines : 12,font : "14px Lucida Console", width : 256});
    
    // creates a UI group that all the main UI will be grouped in.
    this.mainUI = UI.createUI("UIGroup","mainUI");
    var sliderDetails = {
            min : 0, max : 100, value : 0, handleSpan : 0.01,
            x : 240, y : -8, width : -10,
            decimalPlaces : 2, digits : 3,wheelStep : 0.25,            
            group : this.mainUI,
            useSpriteNumbers : false,
            ondrag : this.setPause.bind(this),
            toolTip:"Drag slider to set the time.\nUse the mouse wheel to\nstep quarter seconds." 
    };
    var bys = 34;
    var by = -50 - bys;
    var fit = {
            x: 10,y: by,height : 30,
            text : "Fit",
            toolTip :"Resets the view to fit within the window.",
            onclick : this.fitView.bind(this),
            group:this.mainUI,
            minWidth : 10,
    }
        
    by-= bys;
    var fill = copy(fit,{y : by, text : "Fill", onclick : this.fillView.bind(this), toolTip :"Resets the view to fill the window."});
    by-= bys;
    var info = copy(fit,{y : by, text : "?", onclick : this.showInfo.bind(this), toolTip :"Displays information about\nthe current gif."});
    by-= bys;
    var save = copy(fit,{y : by, text : "Save", onclick : this.saveAnimation.bind(this), toolTip :"Save gif as a set of jpg images."});
    by-= bys;
    var colour = copy(fit,{y : by, text : "Color", onclick : this.openColourDialog.bind(this), toolTip :"Text the dialalog container UI element"});
    by-= bys;
    var checkFade = copy(fit,{y : -50, text : "Use frame fade.",keepOpen : true, onclick : undefined, toolTip :"If checked this will add the next frame\nwith a part fade to smooth\ngifs with low frame rates."});
    by-= bys;
    var comboTest = copy(fit,{y : by, toolTip :"Combo box test control.\nThis control is still being\ndeveloped so has no\nreal function"});
    comboTest.items = "blah blah balh,this and that,some or none,lots and lots,give that a go,dont try,do try,why not,this is just a test,one plus one,two plus two,the last word".split(",");
    
    this.slider = UI.createUI("UISlider","slider",sliderDetails);
    UI.createUI("UIButton", "fitView", fit);
    UI.createUI("UIButton", "fillView", fill);
    UI.createUI("UIButton", "info"   , info);
    UI.createUI("UIButton", "save"   , save);
    UI.createUI("UIButton", "colour" , colour);
    this.comboTest = UI.createUI("UIComboBox", "comboTest" , comboTest);
    this.checkFade = UI.createUI( "UICheckBox", "checkBox1",checkFade);
    this.comboTest.selectItem(0);
    var bx = -35;
    var h = 32;
    var w = 40;
    by = -12;
    var icons = [ {
            filenames : [iconDir+"prevOn.png",iconDir+"prevOff.png"],
            x : bx += 45 , y : by, w : w, h : h, cursor : "pointer",
            toolTip : "Load previouse gif",            
            onclick : this.prevGif.bind(this),
        },  {
            filenames : [iconDir+"speedSlowerOn.png",iconDir+"speedSlowerOff.png"],
            x : bx += 45, y : by, w : w, h : h, cursor : "pointer",
            toolTip : "Decrease play speed\nor step back a frame",
            onclick : this.speedDown.bind(this),
        }, {
            filenames : [iconDir+"speedOn.png",iconDir+"speedOff.png"],
            x : bx += 45, y : by, w : w, h : h, cursor : "pointer",
            toolTip : "Increase play speed\nor step forward a frame",
            onclick : this.speedUp.bind(this),
        }, {
            filenames : [iconDir+"nextOn.png",iconDir+"nextOff.png"],
            x : bx += 45,y : by,w : w,h : h, cursor : "pointer",
            toolTip : "Load next gif",
            onclick : this.nextGif.bind(this),
        }, {
            filenames : [iconDir+"pauseOn.png",iconDir+"pauseOff.png",iconDir+"playOn.png",iconDir+"playOff.png"],
            x : bx += 55,y : by, w : 32, h : h, cursor : "pointer",
            toolTip : "Click to toggle play and pause",
            onclick : this.togglePlay.bind(this),
        },
    ]
    this.iconButtons = UI.createUI("UIIconButtons","controls",{icons:icons,group:this.mainUI});
    //groover.utils.files.saveJson("UIStyle",groover.utils.namedStyles);
}

GifViewer.prototype.openColourDialog = function(button){    
    this.createColourDialog(this.redCandy,this.greenCandy,this.blueCandy,255);
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
GifViewer.prototype.fillView = function(){
   if(this.gifImage !== undefined){
        var img = this.gifImage.image.frames[0].image;
        this.transform.fitView(-img.width/2,-img.height/2,img.width/2,img.height/2,"fill");
    }                
}
GifViewer.prototype.showInfo = function(){
    if(this.gifImage !== undefined){
        var str = "{+{+{B{ACGIF Image Info}}}}\n\n";
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
    this.mainUI.setup();  // redraw UIs

    this.newView = true;
}

// draws a nice and way over kill welcome screen.
GifViewer.prototype.iconsAvaliable = function(imageGroup){
    this.icons = imageGroup;
    this.createCandy();
    this.ready = true;
    log("Viewer started");

}    
GifViewer.prototype.createCandy = function(){
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
    if(this.redCandy === undefined){
        this.redCandy = r = mMath.randI(150,260);
        this.greenCandy = g = mMath.randI(150,260);
        this.blueCandy = b = mMath.randI(150,260);
    }else{
        r = this.redCandy;
        g = this.greenCandy;
        b = this.blueCandy;
        
    }
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



        if(this.MK.mousePrivate === 0 && (this.time - this.MK.lastEventTime > 3*1000 || !this.MK.over)){
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
           // this.fadeUI = 0;
        }
        //this.iconButtons.location.alpha = this.fadeUI;
        //this.slider.location.alpha = this.fadeUI;
        this.mainUI.location.alpha = this.fadeUI;
        this.log.display();
        if(this.fadeUI > 0){
            this.mainUI.mouse.isMouseOver();
            this.mainUI.update();
            this.mainUI.display();
        }
        //this.iconButtons.update();
        //this.iconButtons.display();

        this.render.set2DStyles(this.textStyle.font,this.textStyle.fill,this.textStyle.stroke);
        this.render.drawText(info,this.view.width/2,10);

    }
    if(Math.random() < 0.01){
        this.comboTest.selectItem(Math.floor(Math.random()*10));
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


