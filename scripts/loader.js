"use strict";
// loader
groover.loader = {
    progress:function(pec){
        $("splashProgress").innerHTML = (pec * 100).toFixed(0)+"%"; 
    },
    clearSplash:function(){
        var s = $("splashInfo");
        if(s !== null){
            document.body.removeChild(s);
        }
    },
    showInfo : function(info){
        this.clearSplash();
        var splash = $C("div","splash","splashInfo");
        var infoEl = $C("div","splashExtra","extraInfo");
        infoEl.innerHTML = info;
        splash.innerHTML += "<img src='icons/groover.png'><br><br><br><br>"
        $A(splash,infoEl);
        splash.innerHTML += "<small>Copyright 2016</small>";
        $A(splash)    
    },
    busy:function(){
        if(groover.busy){
            
            
        }
    }
}
