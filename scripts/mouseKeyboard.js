"use strict"
/* For referance only
alias
all-scroll
auto
cell
context-menu
col-resize
copy
crosshair
default
e-resize
ew-resize
grab
grabbing
help
move
n-resize
ne-resize
nesw-resize
ns-resize
nw-resize
nwse-resize
no-drop
none
not-allowed
pointer
progress
row-resize
s-resize
se-resize
sw-resize
text
url(smiley.gif),url(myBall.cur),auto
vertical-text
w-resize
wait
zoom-in
zoom-out
initial
*/

function MouseKeyboard(owner){
    this.owner = owner;
    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.alt = false;
    this.shift = false;
    this.ctrl = false;
    this.lastKey;
    this.keyEvents = [];
    this.keys = [];
    for (var i = 0; i < 256; i++) {
		this.keys[i] = false;
        this.keyEvents[i] = undefined;
    }
    this.lastEventTime = 0;
    this.B1 = 0;
    this.B2 = 0;
    this.B3 = 0;
    this.BR = 0;
    this.oldB1;
    this.oldB2;
    this.oldB3;
    this.oldBR;
    this.mousePrivate = 0;
    this.buttonDownOn = 0; // ID of UI element when the button first down. 
    this.holderID = 10;
    this.getHolderID = function(){
        this.holderID += 1;
        return this.holderID - 1;
    }
    
    this.bm = [1, 2, 4, 6, 5, 3];
    this.butNames = ["B1","B2","B3"];
    this.over = false;
    this.ready = true;
    var mouseEventList = "mousemove,mousedown,mouseup,mouseout,mouseover,mousewheel".split(",");
    var keyEventList = ["keypress"];
    this.mainCanvas;
    this.viewUpdated = function(){
        if(this.mainCanvas !== undefined){
            this.removeViewListeners();
        }
        var can = this.owner.canvas;
        var listener = this.mouseEvent.bind(this);
        var listenerK = this.keyEvent.bind(this);
        this.mainCanvas = can;
        mouseEventList.forEach((event)=>{can.addEventListener(event, listener);});
        keyEventList.forEach((event)=>{can.addEventListener(event, listenerK);});
        //can.addEventListener("contextmenu", this.preventDefault);
        log("Mouse and key listeners added");
    }    
    this.removeViewListeners = function(){    
        var can = this.mainCanvas;
        var listener = this.mouseEvent.bind(this);
        var listenerK = this.keyEvent.bind(this);
        mouseEventList.forEach((event)=>{can.removeEventListener(event, listener);});
        keyEventList.forEach((event)=>{can.removeEventListener(event, listenerK);});
        can.removeEventListener("contextmenu", this.preventDefault);
        lastCursor = "default";
        log("Mouse and key listeners Removed");
    }
    
    this.addListenersTo = function(element){
        var e = $(element)
        if(e !== null){
            var listener = this.mouseEvent.bind(this);
            var listenerK = this.keyEvent.bind(this);
            mouseEventList.forEach((event)=>{e.addEventListener(event, listener);});
            keyEventList.forEach((event)=>{e.addEventListener(event, listenerK);});
            can.addEventListener("contextmenu", this.preventDefault);
        }
        
    }
    this.defaultCursor = "default";
    var currentCursor = "default";
    var lastCursor = "default";
    var cursorHolder = 0;
    this.requestCursor = function(cursor,requestingID){
        if(cursor !== lastCursor){
            if(this.mousePrivate === 0 || requestingID === this.mousePrivate){
                currentCursor = cursor;
                cursorHolder = requestingID;
            }            
        }
    }
    this.releaseCursor = function(holderID){
        if(cursorHolder === holderID){
            currentCursor = this.defaultCursor;
            cursorHolder = 0;
        }
        
    }

        
    this.doCursor = function(){
        if(currentCursor !== lastCursor){
            if(this.mainCanvas !== undefined){
                this.mainCanvas.style.cursor = currentCursor;
                lastCursor = currentCursor;
            }
        }
        
    }
    
    log("Mouse keyboard manager ready");
    

}
MouseKeyboard.prototype.preventDefault = function(e){
    e.preventDefault();
}
MouseKeyboard.prototype.addKeyCallback = function(key,callback){
    if(key >= 0 && key < 256){
        this.keyEvents[key] = callback;
    }
}

MouseKeyboard.prototype.keyEvent = function(e){
    console.log(e)
    this.shift = e.shiftKey;
    this.alt = e.altKey;
    this.ctrl = e.ctrlKey;
    log("Key:" + e.keyCode,"cyan");
    if(e.type === "keypress"){
        this.lastKey = e.keyCode;
        this.keys[e.keyCode] = true;
        if(this.keyEvents[e.keyCode] !== undefined && typeof this.keyEvents[e.keyCode] === "function"){
            this.keyEvents[e.keyCode](e);
        }
    }else{
        this.keys[e.keyCode] = false;        
    }
    
    e.preventDefault();    
}
MouseKeyboard.prototype.mouseEvent = function(e){
    var t, m, bn;
    t = e.type;
    m = this;
    m.x = e.offsetX; 
    m.y = e.offsetY;
    m.alt = e.altKey;
    m.shift = e.shiftKey;
    m.ctrl = e.ctrlKey;
    m.lastEventTime = new Date().valueOf();
    e.preventDefault();    
    if (t === "mousemove") { 
        return;
    }else if (t === "mousedown") { 
        m.oldBR = m.BR;
        m.BR |= m.bm[e.which-1];
        bn = m.butNames[e.which-1]
        m["old"+bn] = m[bn];
        m[bn] = true;
    } else if (t === "mouseup") { 
        m.oldBR = m.BR;
        m.BR &= m.bm[e.which + 2];
        bn = m.butNames[e.which-1]
        m["old"+bn] = m[bn];
        m[bn] = false;
    } else if (t === "mouseout") { 
        m.oldBR = m.BR;
        m.BR = 0;
        if(m.B1){
            m.oldB1 = true;
            m.B1 = false;
        }
        if(m.B2){
            m.oldB2 = true;
            m.B2 = false;
        }
        if(m.B3){
            m.oldB3 = true;
            m.B3 = false;
        }
        m.over = false;
    } else if (t === "mouseover") { 
        m.over = true;
    } else if (t === "mousewheel") { 
        m.w = e.wheelDelta;
    } else if (t === "DOMMouseScroll") { 
        m.w = -e.detail;
    }
}
