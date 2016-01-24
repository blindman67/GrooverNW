"use strict";
function SpriteEditor(owner){
    this.owner = owner;
    this.time;
    this.view = this.owner.display;
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
    this.slowMotionFilter = false;
    this.playBackTime = 10;
    this.weather = false;
    this.transform;
    this.transform = mMath.getDisplayTransformer();
    this.transform.mouse = this.MK;
    this.transform.setMouseRotate(2); // set rotate funtion to button 3
    this.transform.setMouseTranslate(1); 
    this.transform.setWheelZoom(); 
    this.transform.setMode("smooth")       
    this.newView = false;
    
//    this.dayViewUI = this.owner.ui.createDayView();
    this.dayViewUI =  this.owner.ui.createUI("UITimeDisplay","timeDisplay",{});
    this.log =  this.owner.ui.createUI("UILogDisplay","Log",{pos:{x:0,y:0},displayLines:12,font:"14px Lucida Console",width:256});
    this.testWindow = this.owner.ui.createUI("UIWindowSmall","windowTest",{title:"Test Window",toolTip:"Experimental Window"});
    this.testGroup = this.owner.ui.createUI("UIGroup","testGroup");
    this.testSlider = this.owner.ui.createUI("UISliderSmall","testSlider1",{min:0,max:100,value:10,width:500,digets:3,colour:0,wheelStep : 5,group:this.testGroup,toolTip:"This is a test slider.\nClick any where on it to set value.\nClick drag to set value.\nUse mouse wheel to change value\nMore functions soon." });
    this.testSlider1 = this.owner.ui.createUI("UISliderSmall","testSlider1",{min:0,max:100,value:10,width:200,digets:3,colour:1,wheelStep : 5,group:this.testGroup});
    this.testSlider2 = this.owner.ui.createUI("UISliderSmall","testSlider1",{min:0,max:100,value:10,width:200,digets:3,colour:2,wheelStep : 5,group:this.testGroup});
    this.testSlider3 = this.owner.ui.createUI("UISliderSmall","testSlider1",{min:0,max:100,value:10,width:200,digets:3,colour:3,wheelStep : 5,group:this.testGroup});
    this.checkBox = this.owner.ui.createUI("UICheckBox","checkBox",{text:"Test check box.",checked:false,width:0,group:this.testGroup});
    this.checkBox1 = this.owner.ui.createUI("UICheckBox","checkBox1",{text:"Check this to so you can.",checked:true,width:0,group:this.testGroup});
    this.checkBox2 = this.owner.ui.createUI("UICheckBox","checkBox2",{text:"Hide sliders.",checked:true,width:0,group:this.testGroup,onchecked:function(){log("CHECKED")},onunchecked:function(){log("UNCHECKED")}});
    
    var hideShowCh = (function(ui){
        if(ui.checked){
            this.checkBox.mouse.deactivate();
            this.checkBox1.mouse.deactivate();
            this.checkBox2.mouse.deactivate();
        }else{
            this.checkBox.mouse.activate();
            this.checkBox1.mouse.activate();
            this.checkBox2.mouse.activate();
        }
    }).bind(this);
    this.checkBox3 = this.owner.ui.createUI("UICheckBox","checkBox3",{text:"Hide Other checkboxes.",checked:true,width:0,group:this.testGroup,onchecked:hideShowCh,onunchecked:hideShowCh,toolTip:"Well bugger me it works?\nNew line should work.\nAnd another."});
    this.checkBox4 = this.owner.ui.createUI("UICheckBox","checkBox3",{text:"Green Red."  ,type:"greenRed",checked:true,width:0,group:this.testGroup,onchecked:hideShowCh,onunchecked:hideShowCh,toolTip:"Well bugger me it works?\nNew line should work.\nAnd another."});
    this.checkBox5 = this.owner.ui.createUI("UICheckBox","checkBox3",{text:"Tick Cross." ,type:"tickCross",checked:true,width:0,group:this.testGroup,onchecked:hideShowCh,onunchecked:hideShowCh,toolTip:"Well bugger me it works?\nNew line should work.\nAnd another."});
    this.checkBox6 = this.owner.ui.createUI("UICheckBox","checkBox3",{text:"Yes No."     ,type:"yesNo",checked:true,width:0,group:this.testGroup,onchecked:hideShowCh,onunchecked:hideShowCh,toolTip:"Well bugger me it works?\nNew line should work.\nAnd another."});
    this.checkBox7 = this.owner.ui.createUI("UICheckBox","checkBox3",{text:"On Off."     ,type:"onOff",checked:true,width:0,group:this.testGroup,onchecked:hideShowCh,onunchecked:hideShowCh,toolTip:"Well bugger me it works?\nNew line should work.\nAnd another."});
    this.checkBox8 = this.owner.ui.createUI("UICheckBox","checkBox3",{text:"Black White.",type:"blackWhite",checked:true,width:0,group:this.testGroup,onchecked:hideShowCh,onunchecked:hideShowCh,toolTip:"Well bugger me it works?\nNew line should work.\nAnd another."});
   //this.testSlider = this.owner.ui.createSlider(0,100,200,this.testGroup);
    this.testSlider.location.set(256,250);
    this.testSlider1.location.set(256,262);
    this.testSlider2.location.set(256,274);
    this.testSlider3.location.set(256,286);
    this.checkBox.location.set(256,298);
    this.checkBox1.location.set(256,314);
    this.checkBox2.location.set(256,330);
    this.checkBox3.location.set(256,346);
    var yy = 346 + 16;
    this.checkBox4.location.set(256,yy); yy += 16;
    this.checkBox5.location.set(256,yy); yy += 16;
    this.checkBox6.location.set(256,yy); yy += 16;
    this.checkBox7.location.set(256,yy); yy += 16;
    this.checkBox8.location.set(256,yy); yy += 16;

}
var imageType = {
    standard : ".png",
    gif : ".gif",
}
var imageTimes = {
    standard : {
        imageType : imageType.standard,
        times:0, // minutes past hour for first 
        period:6, // minutes between images.
    },
    standardLate : {
        imageType : imageType.standard,
        times:1, // minutes past hour for first 
        period:6, // minutes between images.
    },     
    standardVLate : {
        imageType : imageType.standard,
        times:5, // minutes past hour for first 
        period:6, // minutes between images.
    },    
    tenMinutes:{
        imageType : imageType.standard,
        times:0, // minutes past hour for first 
        period:10, // minutes between images.
    },
    hourlyP30 : {
        imageType : imageType.standard,
        times:30, // minutes past hour for first 
        period:60, // minutes between images.
    },
    hourly : {
        imageType : imageType.standard,
        times:0, // minutes past hour for first 
        period:60, // minutes between images.
    },
    delayed : {
        imageType : imageType.standard,
        times:1, // minutes past hour for first 
        period:6, // minutes between images.
    },
}
var knownStations = [["IDR773","Warruwi"],
["IDR093","Gove"],
["IDR633","Darwin (Berrimah)"],
["IDR783","Weipa"],
["IDR423","Katherine (Tindal)"],
["IDR073","Wyndham"],
["IDR413","Willis Is"],
["IDR363","Mornington Is (Gulf of Carpentaria)"],
["IDR193","Cairns"],
["IDR173","Broome"],
["IDR393","Halls Creek"],
["IDR733","Townsville (Hervey Range)"],
["IDR243","Bowen"],
["IDR163","Port Hedland"],
["IDR153","Dampier"],
["IDR753","Mount Isa"],
["IDR223","Mackay"],
["IDR293","Learmonth"],
["IDR563","Longreach"],
["IDR723","Emerald"],
["IDR253","Alice Springs"],
["IDR233","Gladstone"],
["IDR053","Carnarvon"],
["IDR443","Giles"],
["IDR083","Gympie (Mt Kanigan)"],
["IDR673","Warrego"],
["IDR503","Brisbane (Marburg)"],
["IDR663","Brisbane (Mt Stapylton)"],
["IDR063","Geraldton"],
["IDR533","Moree"],
["IDR283","Grafton"],
["IDR483","Kalgoorlie"],
["IDR693","Namoi (Blackjack Mountain) "],
["IDR273","Woomera"],
["IDR333","Ceduna"],
["IDR703","Perth (Serpentine)"],
["IDR043","Newcastle"],
["IDR713","Sydney (Terrey Hills)"],
["IDR323","Esperance"],
["IDR303","Mildura"],
["IDR033","Wollongong (Appin)"],
["IDR643","Adelaide (Buckland Park)"],
["IDR313","Albany"],
["IDR553","Wagga Wagga"],
["IDR463","Adelaide (Sellicks Hill)"],
["IDR403","Canberra (Captains Flat)"],
["IDR493","Yarrawonga"],
["IDR143","Mt Gambier"],
["IDR023","Melbourne"],
["IDR683","Bairnsdale"],
["IDR523","NW Tasmania (West Takone)"],
["IDR763","Hobart (Mt Koonya)"]]

var weatherExtras = {
    layers : ["background","locations","range","topography","observations","waterways","catchments","wthrDistricts","roads","rail"],
    BOM_URL : "http://ws.cdn.bom.gov.au/",
    locations : {
        Perth : {
            name : "Perth (Serpentine)",
            products :["IDR704","IDR703","IDR702","IDR701"],
        },        
        Albany : {
            name : "Albany",
            products :["IDR313","IDR312","IDR311"],
        },
        Geraldton : {
            name : "Geraldton",
            products :["IDR063","IDR062","IDR061"],
        }
    },
    products : [{
        name : "64 km",
        id : ["IDR704",""],
        types : [{
            name:"Radar Loop",
            URL : "radar/######.T.#TIME#",
            imageDesc : imageTimes.standard,
        }]
    },{
        name : "128 km",
        id : ["IDR313","IDR063"],
        types : [{
            name:"Radar Loop",
            URL : "radar/######.T.#TIME#",
            imageDesc : imageTimes.tenMinutes,
        }]
    },{
        name : "256 km",
        id : ["IDR312","IDR062"],
        types : [{
            name:"Radar Loop",
            URL : "radar/######.T.#TIME#",
            imageDesc : imageTimes.tenMinutes,
        }]
    },{
        name : "128 km",
        id : ["IDR703",""],
        types : [{
            name:"Radar Loop",
            URL : "radar/######.T.#TIME#",
            imageDesc : imageTimes.standard,
        },{
            name:"Doppler wind",
            URL : "radar/#####I.T.#TIME#",
            imageDesc : imageTimes.standardLate,
        },{
            name:"6 min Rainfalls",
            URL : "radar/#####A.T.#TIME#",
            imageDesc : imageTimes.standard,
        },{
            name:"1 hour Rainfalls",
            URL : "radar/#####B.T.#TIME#",
            imageDesc : imageTimes.standard,
        },{
            name:"Since 9 am Rainfalls",
            URL : "radar/#####C.T.#TIME#",
            imageDesc : imageTimes.hourlyP30,
        },{
            name:"24 hour Rainfalls",
            URL : "radar/#####D.T.#TIME#",
            imageDesc : imageTimes.hourly,
        }]
    },{
        name : "256 km",
        id : ["IDR702",""],
        types : [{
            name:"Radar Loop",
            URL : "radar/######.T.#TIME#",
            imageDesc : imageTimes.standard,
        }]
    },{
        name : "512 km composite",
        id : ["IDR701",""],
        types : [{
            name:"Radar Loop",
            URL : "radar/######.T.#TIME#",
            imageDesc : imageTimes.standardVLate,
        }]
    }],
    currentProduct : undefined,
    setProduct : function(id){
        var i;
        for(i = 0; i < this.products.length; i++){
            if(this.products[i].id === id){
                if(this.images !== undefined && this.images.list !== undefined){
                    this.images.list.forEach(function(img){
                        img.remove = true;
                    });
                }
                groover.main.bitmaps.startLoad(function(ig){
                        weatherExtras.images = ig;
                    },"weather"
                );
                weatherExtras.layers.forEach(function(name){
                    groover.main.bitmaps.load(
                        "weather",
                        "http://ws.cdn.bom.gov.au/products/radar_transparencies/"+id+"."+name+".png",
                        name
                    );
                });
                groover.main.editor.imageToLoad({path:"http://ws.cdn.bom.gov.au/radar/"+id+".T.201601162100.png"});
                return;
            }
        }
    },        
    images : undefined,
}

function getTime(ago){
    var timeChange =new Date().valueOf()- ago * 1 * 60 * 1000;
    var d = new Date(timeChange);
    var year = d.getUTCFullYear();
    var month = d.getUTCMonth()+1;
    var day = d.getUTCDate();
    var hour = d.getUTCHours();
    var minute = Math.floor(d.getUTCMinutes()/1)*1;
    var time = year;
    time += month < 10?"0"+month:month;
    time += day < 10?"0"+day:day;
    time += hour < 10?"0"+hour:hour;
    time += minute < 10?"0"+minute:minute;
    return time;
}
function discovereLocation(id){
    function loaded(){
        groover.dialogs.alert("Fone discover");
    }
    var imageG = groover.main.bitmaps.startLoad(loaded,"discover");
    var time = getTime(0);
    time = time.substr(0,time.length-2) + "00";
    var id1 = id.substr(0,5) + "4";
    var URL = "http://ws.cdn.bom.gov.au/radar/"+id1+".T."+time+".png";
    groover.main.bitmaps.load("discover",URL,undefined,function(e,image){
        if(e === null){
            groover.dialogs.alert("Found 64KM");
        }else{
            groover.dialogs.alert("ERROR"+image.filename);
        }
    });
    id1 = id.substr(0,5) + "3";
    URL = "http://ws.cdn.bom.gov.au/radar/"+id1+".T."+time+".png";
    groover.main.bitmaps.load("discover",URL,undefined,function(e,image){
        if(e === null){
            groover.dialogs.alert("Found 128KM");
        }else{
            groover.dialogs.alert("ERROR"+image.filename);
        }
    });
    id1 = id.substr(0,5) + "2";
    URL = "http://ws.cdn.bom.gov.au/radar/"+id1+".T."+time+".png";
    groover.main.bitmaps.load("discover",URL,undefined,function(e,image){
        if(e === null){
            groover.dialogs.alert("Found 256KM");
        }else{
            groover.dialogs.alert("ERROR"+image.filename);
        }
    });
    id1 = id.substr(0,5) + "A";
    URL = "http://ws.cdn.bom.gov.au/radar/"+id1+".T."+time+".png";
    groover.main.bitmaps.load("discover",URL,undefined,function(e,image){
        if(e === null){
            groover.dialogs.alert("Found rain 6min");
        }else{
            groover.dialogs.alert("ERROR"+image.filename);
        }
    });
    id1 = id.substr(0,5) + "B";
    URL = "http://ws.cdn.bom.gov.au/radar/"+id1+".T."+time+".png";
    groover.main.bitmaps.load("discover",URL,undefined,function(e,image){
        if(e === null){
            groover.dialogs.alert("Found rain 1 hour");
        }else{
            groover.dialogs.alert("ERROR"+image.filename);
        }
    });
    id1 = id.substr(0,5) + "C";
    URL = "http://ws.cdn.bom.gov.au/radar/"+id1+".T."+time+".png";
    groover.main.bitmaps.load("discover",URL,undefined,function(e,image){
        if(e === null){
            groover.dialogs.alert("Found rain since 9");
        }else{
            groover.dialogs.alert("ERROR"+image.filename);
        }
    });
    id1 = id.substr(0,5) + "D";
    URL = "http://ws.cdn.bom.gov.au/radar/"+id1+".T."+time+".png";
    groover.main.bitmaps.load("discover",URL,undefined,function(e,image){
        if(e === null){
            groover.dialogs.alert("Found rain 24min");
        }else{
            groover.dialogs.alert("ERROR"+image.filename);
        }
    });
}


SpriteEditor.prototype.lostView = function(){
    this.view = this.owner.display;
    this.render = this.owner.render;  
    this.newView = true;
    log("new view");
}
SpriteEditor.prototype.iconsAvaliable = function(imageGroup){
    this.icons = imageGroup;
    this.ready = true;
    log("Editor started");

            this.imageToLoad("http://ws.cdn.bom.gov.au/radar/IDR702.T.201601162100.png");

    if(!groover.utils.files.saveText("WeatherProducts.json",JSON.stringify(weatherExtras.products))){
    alert("File save error.\n" + groover.utils.files.error.filename +"\n"+groover.utils.files.error.message);
}
    weatherExtras.setProduct("IDR704");
    log("Sprite editor ready");
}
SpriteEditor.prototype.weatherAvaliable = function(imageGroup){
    weatherExtras = imageGroup;
}

SpriteEditor.prototype.imageLoaded = function(imageGroup){
    log("Image loaded");
    if(imageGroup.list[0].video){
        imageGroup.list[0].image.play();
        imageGroup.list[0].image.loop = true;
        groover.busy = false;
    }

}
SpriteEditor.prototype.imageToLoad = function(file){
        log("Image to load");

    if(this.project === undefined){
        this.project = {
            images: null,
        }
    }else{
        if(this.project.images.list.length > 0){
            this.project.images.list[0].remove = true;
        }
    }
    this.project.images = this.bitmaps.startLoad(this.imageLoaded.bind(this),"project");
    //http://ws.cdn.bom.gov.au/radar/IDR702.T.201601162100.png
    //if(file.path.indexOf("radar") > -1){
        var urls = [];
        var data = [];
        //var fname = file.path.split(".");
       // var product = fname[4].split("/").pop();
        var timeChange =new Date().valueOf()- 48 * 60 * 60 * 1000;
        for(var i = 0; i < 48; i++){
            var d = new Date(timeChange);
            var year = d.getUTCFullYear();
            var month = d.getUTCMonth()+1;
            var day = d.getUTCDate();
            var hour = d.getUTCHours();
            var minute = Math.floor(d.getUTCMinutes()/60)*60 +30;
            var name = year;
            name += month < 10?"0"+month:month;
            name += day < 10?"0"+day:day;
            name += hour < 10?"0"+hour:hour;
            name += minute < 10?"0"+minute:minute;
            //urls.push("http://www.bom.gov.au/gms/IDE00135."+name+".jpg");
           // urls.push("http://www.bom.gov.au/gms/IDE00106."+name+".jpg");
            urls.push("http://www.bom.gov.au/gms/IDE00133."+name+".jpg");
            //http://www.bom.gov.au/gms/IDE00106.201601190630.jpg
            //urls.push("http://ws.cdn.bom.gov.au/radar/"+product+".T."+name+".png");
            //log("http://ws.cdn.bom.gov.au/radar/"+product+".T."+name+".png");
            data.push({
                time:timeChange,
                len: 60 * 60 * 1000,
            });
            timeChange += 60 * 60 * 1000;
            
        }
        this.bitmaps.load("project",urls,undefined,undefined,data);
    //}else{
    //    this.bitmaps.load("project",file.path);
   //}
    groover.busy = true;
    groover.busyMessage = "loading Image!";
}
SpriteEditor.prototype.update = function(){
    if(this.view.refreshed){
        this.lostView();
        log("Refresh");



    }

    this.time = new Date().valueOf();


}
SpriteEditor.prototype.displaydhfdhf = function(){
    if(this.ready){
        this.render.drawBackground(this.images.background.image);
        if(this.project !== undefined){
            if(this.project.images.list.length > 0){
                if(this.project.images.list[0].ready && this.project.images.list[0].video){
                    var an = this.project.images.list[0].image;
                    this.render.drawToFitV(an);
                    
                }else
                if(this.project.images.list[0].ready && this.project.images.list[0].animation){
                    if(this.MK.B1){
                        this.MK.B1 = false;
                        this.slowMotionFilter = !this.slowMotionFilter;
                        if(this.slowMotionFilter){
                            this.playBackTime = 20;
                        }else{
                            this.playBackTime = 10;
                        }
                            
                    }

                    var an = this.project.images.list[0].image;
                    if(an.complete){
                        groover.busy = false;
                    }
                    var count = an.frames.length;
                    var sCount = 0;
                    while(this.time > an.nextFrameAt){
                        an.currentFrame = (an.currentFrame  + 1)%count;
                        an.lastFrameAt = an.nextFrameAt;
                        an.nextFrameAt = an.nextFrameAt + an.frames[(an.currentFrame+1)%count].delay * this.playBackTime;
                        sCount += 1;
                        if(sCount > 10){
                            an.nextFrameAt = this.time + 1;
                        }
                    }
                    var frameImage = an.frames[an.currentFrame].image;
                    var frameImage1 = an.frames[(an.currentFrame+1)%count].image;

                    this.render.drawToFit(frameImage,1);
                    if(this.slowMotionFilter && an.nextFrameAt-an.lastFrameAt > 0){
                        var f = (this.time - an.lastFrameAt)/(an.nextFrameAt-an.lastFrameAt);
                        this.render.drawToFit(frameImage1,f);
                    }
                    
                }
                //this.render.drawImageSRA(this.project.images.list[0].image,this.view.width/2,this.view.height/2,1,0,1);
            }
        }
        this.render.set2DStyles(this.textStyle.font,this.textStyle.fill,this.textStyle.stroke);
        this.render.drawText(this.time,this.view.width/2,14);
        /*this.render.set2DStyles(this.textStyle.font,this.textStyle.fill,this.textStyle.stroke);
        var td = this.owner.animFrame.timeData;
        this.render.drawText("F:"+td.lastFrame+" Ave:"+td.average.toFixed(0),this.view.width/2,this.view.height/2);
        var str = "Mouse:"
        str += "X:"+this.MK.x;
        str += " y:"+this.MK.y + " ";
        str += this.MK.BR+" ";
        str += this.MK.B1?"1":"0";
        str += this.MK.B2?"1":"0";
        str += this.MK.B3?"1 ":"0 ";
        str += this.MK.oldB1?"1":"0";
        str += this.MK.oldB2?"1":"0";
        str += this.MK.oldB3?"1 ":"0 ";
        str += this.MK.over?"Over ":"out ";
        str += "W:"+this.MK.w + " ";
        str += this.MK.shift?"S":"-";
        str += this.MK.ctrl?"C":"-";
        str += this.MK.alt?"A":"-";
        this.render.drawText(str,this.view.width/2,this.view.height/2+20);
        str = "Last key:" + this.MK.lastKey + " ";
        for(var i = 0; i < 256; i++){
            if(this.MK.keys[i]){
                str += String.fromCharCode(i);
            }
        }
        this.render.drawText(str,this.view.width/2,this.view.height/2+40);*/
    }
}
 SpriteEditor.prototype.display = function(){
    if(this.ready){

        this.render.drawBackground(this.images.background.image);
        if(this.transform){
            if(this.newView){
                if(this.project !== undefined){
                    if(this.project.images.list.length > 0){
                        if(this.project.images.list[0].ready && this.project.images.list[0].animation){
                            this.transform.ctx = this.view.ctx;
                            var i = this.project.images.list[0].image.frames[0].image;
                            this.transform.fitView(-i.width/2,-i.height/2,i.width/2,i.height/2,"fit");
                            this.newView = false;
                        }
                    }
                }
            }
            this.transform.update();
            this.transform.setTransform();
        }
        if(this.project !== undefined){
            if(this.project.images.list.length > 0){
                if(this.project.images.list[0].ready && this.project.images.list[0].animation){
                    if(this.MK.B1 && this.MK.mousePrivate === 0){
                        this.MK.B1 = false;
                        groover.dialogs.confirm(
                            "Save current animation frames to disk?",
                            function(result){
                                if(result === "ok"){
                                    groover.dialogs.alert("Image selected to save!");
                                }
                            }
                        )
                            
                        //this.bitmaps.saveAnimationFramesAs(this.project.images.list[0],"Sat","jpg",0.2);
                        this.slowMotionFilter = !this.slowMotionFilter;
                        if(this.slowMotionFilter){
                            this.playBackTime = 20;
                        }else{
                            this.playBackTime = 10;
                        }
                            
                    }

                    var an = this.project.images.list[0].image;
                    if(an.complete){
                        groover.busy = false;
                    }
                    var count = an.frames.length;
                    var sCount = 0;
                    while(this.time > an.nextFrameAt){
                        an.currentFrame = (an.currentFrame  + 1)%count;
                        an.lastFrameAt = an.nextFrameAt;
                        an.nextFrameAt = an.nextFrameAt + an.frames[(an.currentFrame+1)%count].delay * this.playBackTime;
                        sCount += 1;
                        if(sCount > 10){
                            an.nextFrameAt = this.time + 1;
                        }
                    }
                    var frameImage = an.frames[an.currentFrame].image;
                    var frameImage1 = an.frames[(an.currentFrame+1)%count].image;
                    var frameImageN1 = an.frames[(an.currentFrame+(count-1))%count].image;
                    if(weatherExtras.images !== undefined){
                        if(weatherExtras.images.named !== undefined){
                            if(weatherExtras.images.named.background !== undefined){
                                this.render.drawToFit(weatherExtras.images.named.background.image,1);
                                this.render.drawToFit(weatherExtras.images.named.topography.image,1);
                                this.render.drawToFit(weatherExtras.images.named.waterways.image,1);
                                this.render.drawToFit(weatherExtras.images.named.range.image,1);
                                this.render.drawToFit(weatherExtras.images.named.locations.image,1);
                            }
                        }                    
                    }
                    if(this.slowMotionFilter && an.nextFrameAt-an.lastFrameAt > 0){
                        var f = (this.time - an.lastFrameAt)/(an.nextFrameAt-an.lastFrameAt);
                        this.render.drawBitmapGSRA(frameImageN1,0,0,1,0,1-f);
                    }
                    this.render.drawBitmapGSRA(frameImage,0,0,1,0,1);
                    if(this.slowMotionFilter && an.nextFrameAt-an.lastFrameAt > 0){
                        var f = (this.time - an.lastFrameAt)/(an.nextFrameAt-an.lastFrameAt);
                        this.render.drawBitmapGSRA(frameImage1,0,0,1,0,f);
                    }

                    var data = an.frames[an.currentFrame].data;
                    var tt,td;
                    if(data !== undefined){
                        tt = data.time;
                        td = data.len;
                    }
                    this.dayViewUI.update(tt,td);
                    this.dayViewUI.location.set(0,this.view.height-this.dayViewUI.canvas.height,this.view.width,this.dayViewUI.canvas.height);
                    this.dayViewUI.display();
                    
                    this.log.display();
                    this.testGroup.mouse.isMouseOver();
                    this.testGroup.update();
                    this.testGroup.display();
                    this.testWindow.update();
                    this.testWindow.display();
                }
            }
        }
        this.render.set2DStyles(this.textStyle.font,this.textStyle.fill,this.textStyle.stroke);
        this.render.drawText(this.time,this.view.width/2,14);

    }
}

