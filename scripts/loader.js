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
    busy:function(){
        if(groover.busy){
            
            
        }
    }
}
