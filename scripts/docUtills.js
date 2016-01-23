"use strict";
// document utills
var $ = function(id){  // Query for ID
    if(typeof id === "string"){
        return document.getElementById(id);
    }
    return id;
}
var $R = function(id,element){  // Remove by ID from element or document
    if(typeof id === "string"){
        id = $(id);        
    }
    if(id !== null){
        if(element !== undefined){
            element.removeChild(id);
            return;
        }
        document.body.removeChild(id);
    }
}
var $A = function(element,element1){  // Append element to document or element1 to element
    if(element1 !== undefined){
        element.appendChild(element1);
        return;
    }
    document.body.appendChild(element);
}
var $C = function(type,className,id){ // creat element optional add classname and or id
    var e;
    e = document.createElement(type);
    if(className !== undefined){
        e.className = className;
    }
    if(id !== undefined){
        e.id = id;
    }
    return e;
}
var $TN = function(tagName){           // get elements by tag name
    return document.getElementsByTagName(tagName);
}
var $I = function(to,type,className,data){
    var e,str;
    if(typeof to === "string"){
        to = $(to);
    }
    e = document.createElement(type);
    if(type === "details"){
        str  = "<summary>"+data.sum+"</summary>";
        str = "<P>"+data.detail+"</p>";
        if(data.img !== undefined){
            str += "<img src='"+data.img+"'>";
        }
        
    }
    
    e.innerHTML = str;
    if(className !== undefined){
        e.className = className;
    }

    $A(to,e);    
    return e;
}
var $JC = function(obj){   // JSON copy
    try{
        return JSON.parse(JSON.stringify(obj));
    }catch(e){
        return undefined;
    }
}
groover.dialogActive = false;
groover.dialogs = {
    active: false,
    confirm: function(message,callback,data){
        this.active = true;
        var frame = $C("div","dialog frame");
        frame.innerHTML = message+"<br><br>";
        var buttonOK = $C("button","dialog ok");
        buttonOK.innerHTML = "OK";
        buttonOK.addEventListener("click",function(){
            $R(frame);
            groover.dialogActive = false;
            if(callback !== undefined && typeof callback === "function"){
                callback("ok",data);
            }
        });
        var buttonC = $C("button","dialog cancel");
        buttonC.innerHTML = "Cancel";
        buttonC.addEventListener("click",function(){
            $R(frame);
            groover.dialogActive = false;
            if(callback !== undefined && typeof callback === "function"){
                callback("cancel",data);
            }
        });
        $A(frame,buttonOK);
        $A(frame,buttonC);
        $A(frame);
    },    
    alert: function(message){
        this.active = true;
        var frame = $C("div","dialog frame");
        if(typeof message === "string"){
            frame.innerHTML = message.replace(/\\r\\n|\\n/g,"<br>")+"<br><br>";
        }else
        if(message === undefined || message === null || message.toString === undefined){
            frame.innerHTML = "UNKNOWN ALERT!";
        }else{
            frame.innerHTML = message.toString();
        }
        var buttonOK = $C("button","dialog okCenter");
        buttonOK.innerHTML = "OK";
        buttonOK.addEventListener("click",function(){
            $R(frame);
            groover.dialogActive = false;
        });
        $A(frame,buttonOK);
        $A(frame);
    },
    imageDetails: function(file){
        var div = $C("div","imgContainer");
        var img = $C("img","loadImage");
        var sp = $C("span","fileDetails");
        sp.textContent = file.name + " "+ file.size+"k";
        img.src = file.path;
        $A(div,sp);
        $A(div,img);
        return div;
        
    },
    imageLoader: function(file){
        groover.dialogActive = true;
        var frame = $C("div","dialog frame");
        var promptT = $C("p","dialog prompt"); //frame.innerHTML = "Load image?";
        var buttonOK = $C("button","dialog ok");
        var buttonC = $C("button","dialog cancel");
        var sp = this.imageDetails(file);

        
        promptT.textContent = "Load '"+file.path+"'?";
  
        buttonOK.innerHTML = "OK";
        buttonC.innerHTML = "Cancel";

        buttonOK.addEventListener("click",function(){
            $R(frame);
            groover.dialog.active = false;
        });
        buttonC.addEventListener("click",function(){
            $R(frame);
            groover.dialog.active = false;
        });
        $A(frame,sp);
        $A(frame,promptT);
        $A(frame,buttonOK);
        $A(frame,buttonC);
        $A(frame);
    }
}

