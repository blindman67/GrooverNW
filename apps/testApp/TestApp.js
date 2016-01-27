"use strict";
function SpriteEditor(owner){
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
    this.transform.setMouseRotate(2); // set rotate funtion to button 3
    this.transform.setMouseTranslate(1); 
    this.transform.setWheelZoom(); 
    this.transform.setMode("smooth")       
    this.newView = false;
    

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

SpriteEditor.prototype.lostView = function(){
    this.view = this.owner.view;
    this.render = this.owner.render;  
    this.newView = true;
}
SpriteEditor.prototype.iconsAvaliable = function(imageGroup){
    this.icons = imageGroup;
    this.ready = true;
    log("Editor started");

  
}


SpriteEditor.prototype.imageLoaded = function(imageGroup){
    if(imageGroup.list[0].video){
        imageGroup.list[0].image.play();
        imageGroup.list[0].image.loop = true;
        groover.busy = false;
    }

}
SpriteEditor.prototype.imageDropped = function(file){
       

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

 SpriteEditor.prototype.display = function(){
    if(this.ready){

        this.render.drawBackground(this.images.background.image);
        if(this.transform){
            if(this.newView){
                this.transform.ctx = this.view.ctx;
                this.transform.fitView(0,0,2000,2000,"fit");
                this.newView = false;
            }
            this.transform.update();
            this.transform.setTransform();
        }

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
        }



        
        this.log.display();
        this.testGroup.mouse.isMouseOver();
        this.testGroup.update();
        this.testGroup.display();
        this.testWindow.update();
        this.testWindow.display();
        this.render.set2DStyles(this.textStyle.font,this.textStyle.fill,this.textStyle.stroke);
        this.render.drawText(this.time,this.view.width/2,14);

    }
}

groover.application = SpriteEditor;



var menu = new nw.Menu({type: 'menubar'});

// Create a submenu as the 2nd level menu
var submenu = new nw.Menu();
submenu.append(new nw.MenuItem({ label: 'Item A' }));
submenu.append(new nw.MenuItem({ label: 'Item B' }));

// Create and append the 1st level menu to the menubar
menu.append(new nw.MenuItem({
  label: 'First Menu',
  submenu: submenu
}));

// Assign it to `window.menu` to get the menu displayed
nw.Window.get().menu = menu;

