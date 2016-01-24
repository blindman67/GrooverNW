"use strict";
groover.session = {
    ID:null,
    dateTime:new Date().valueOf(),
}
if(groover.utils === undefined){
    groover.utils = {};
}
groover.utils.IDS = {
    UID: (function(){
        if(localStorage !== undefined){
            if(localStorage.groover_UID !== undefined){
                return Number(localStorage.groover_UID);
            }
        }
        return 0;
    })(),
    ID:0,
    idChars : "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
    getID : function(){
            this.ID += 1;
            return this.ID - 1;
    },
    saveUID : (function(){
        if(localStorage !== undefined){
            return function(){
                localStorage.groover_UID = this.UID;
            };
        }
        return function(){};
    })(),
    getUID : function(){
        this.UID += 1;
        this.saveUID();
        return this.UID - 1;
    },
    getGUID : function(){
        var i,s,l;
        l = this.idChars.length;
        s = "_";
        for(i = 0; i < 15; i++){
            s += this.idChars[Math.floor(Math.random() * l)];
        }
        return s;
    },
}
groover.createCanvas = function(type){  // defaults to fullscreen no other types defined yet
    $R("canv");
    var canvas = $C("canvas"); 
    canvas.id = "canv";    
    if(type === undefined || type === null || type === "fullscreen"){
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight; 
        canvas.style.position = "absolute";
        canvas.style.top = "0px";
        canvas.style.left = "0px";
        canvas.style.zIndex = 1000;
    }
    canvas.ctx = canvas.getContext("2d"); 
    return canvas;
};
groover.directories = {
    scratch : path.parse("D:\\temp\\Groover"),
    currentProject : {
        images : path.parse("D:\\Marks\\Groover\\TestProject\\Images"),
        sounds : path.parse("D:\\Marks\\Groover\\TestProject\\Sounds"),
        movies : path.parse("D:\\Marks\\Groover\\TestProject\\Movies"),
        scratch : path.parse("D:\\Marks\\Groover\\TestProject\\Temp"),
        animation : path.parse("D:\\Marks\\Groover\\TestProject\\Animation"),
    },
    home : path.parse("D:\\Marks\\Dev\\GrooverNW"),
};
groover.author = {
    details: {
        author    : "Mark Sppronck",
        email     : "markspronck@gmail.com",
        copyright : "Copyright 2016.",
        notes     : "",
        URL       : "",
    },
    getDetails : function(asComments){
        if(asComments){
            var str = "";
            var eol = "\n";
            str += "//---------------------------------------------------------------------------------------------"+eol;
            str += "// Author     :"+this.details.author    +eol;
            str += "// AuthorEmail:"+this.details.email     +eol;
            str += "// Copyright  :"+this.details.copyright +eol;
            str += "// Notes      :"+this.details.notes     +eol;
            str += "// URL        :"+this.details.URL       +eol;
            str += "// SessionID  :"+groover.session.ID     +eol;
            str += "// DateSaved  :"+(new Date()).toDateString() +eol;      
            str += "//---------------------------------------------------------------------------------------------"+eol;
            return str;
        }
        return {
            author      :this.details.author,
            email       :this.details.email,
            copyright   :this.details.copyright,
            notes       :this.details.notes,
            URL         :this.details.URL,
            sessionID   :groover.session.ID,
            dateSaved   :(new Date()).toDateString(),
        };
    }
}

// for gemo and math that involves points there are genraly 2 versions
// the normal version where points as definded x1,y1 for point1 or x,y for point
// and the point vertions post fixed with P and take points in the form {x:?,y:?};
var mMath = {
    // value and number displays
    pads : ['','0','00','000','0000','00000','000000'],
    padNumber : function(num,pad){
        if(pad <= 1){
            return num;
        }
        var p = pad-1;
        if(num < 10){
            return this.pads[p] + num;
        }else
        if(num < 100){
            return this.pads[Math.max(0,p-1)] + num;
        }else
        if(num < 1000){
            return this.pads[Math.max(0,p-2)] + num;
        }else
        if(num < 10000){
            return this.pads[Math.max(0,p-3)] + num;
        }else
        if(num < 100000){
            return this.pads[Math.max(0,p-4)] + num;
        }          
    },
    
    // gemoetry lines etc  
    triPheta : function(a,b,c){
        return Math.acos((c * c - (a * a + b * b)) / (-2 * a * b));
    },
    triCosPheta : function(a,b,c){
        return (c * c - (a * a + b * b)) / (-2 * a * b);
    },
    triLenC : function(a,b,pheta){
        return Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(pheta));
    },
    triLenC2 : function(a,b,pheta){
        return a*a + b*b - 2*a*b*Math.cos(pheta);
    },

    // x1,y1 is point one and so on
    completeTri : function completeTri(data,x1,y1,x2,y2,x3,y3){ // given points on triagle find lengths and angles
        var aa,bb,cc,a,b,c,C,B,A; 
        if(data === undefined){
            data = {};
        }
        // a is len p1 to p2 
        // aa square length 
        // A is angle between p1,p2 and p1,p3
        data.a = a = Math.sqrt(aa = Math.pow(x2-x1,2)+Math.pow(y2-y1,2));
        data.b = b = Math.sqrt(bb = Math.pow(x3-x2,2)+Math.pow(y3-y2,2));
        data.c = c = Math.sqrt(cc = Math.pow(x1-x3,2)+Math.pow(y1-y3,2));
        data.pB = Math.acos((bb - (cc + aa)) / (-2 * c * a));
        data.pC = Math.acos((cc - (aa + bb)) / (-2 * a * b));
        data.pA = Math.acos((aa - (cc + bb)) / (-2 * c * b));
        return data;
    },
    completeTriP : function completeTri(data,P1,p2,p3){ // given points on triagle find lengths and angles
        var aa,bb,cc,a,b,c,C,B,A; 
        if(data === undefined){
            data = {};
        }
        // a is len p1 to p2 
        // aa square length 
        // A is angle between p1,p2 and p1,p3
        data.a = a = Math.sqrt(aa = Math.pow(p2.x-p1.x,2)+Math.pow(p2.y-p1.y,2));
        data.b = b = Math.sqrt(bb = Math.pow(p3.x-p2.x,2)+Math.pow(p3.y-p2.y,2));
        data.c = c = Math.sqrt(cc = Math.pow(p1.x-p3.x,2)+Math.pow(p1.y-p3.y,2));
        data.pB = Math.acos((bb - (cc + aa)) / (-2 * c * a));
        data.pC = Math.acos((cc - (aa + bb)) / (-2 * a * b));
        data.pA = Math.acos((aa - (cc + bb)) / (-2 * c * b));
        return data;
    },
    
    // random functions
    rand :function(v1,v2){ // random float
        if(v2 === undefined){
            return Math.random() * v1;
        }        
        return Math.random() * (v2 - v1) + v1;
    },
    randI :function(v1,v2){ // Random int 
        if(v2 === undefined){
            return Math.floor(Math.random() * v1);
        }
        return Math.floor(Math.random() * (v2 - v1) + v1);
    },
    randBell2 : function(v1,v2){
        var r = Math.random() + Math.random();
        if(v1 === undefined){
            return r / 2;
        }
        if(v2 === undefined){
            return (r * v1) / 2;
        }
        return  (r / 2) * (v2 - v1) + v1
    },
    randBell3 : function(v1,v2){
        var r = Math.random() + Math.random() + Math.random();
        if(v1 === undefined){
            return r / 3;
        }
        if(v2 === undefined){
            return (r / 3) * v1 ;
        }
        return  (r / 3) * (v2 - v1) + v1
    },
    randBell : function(p,v1,v2){
        var r,pp = p;
        while(p--){
            r += Math.random();
        }
        if(v1 === undefined){
            return r / pp;
        }
        if(v2 === undefined){
            return (r / pp) * v1 ;
        }
        return  (r / pp) * (v2 - v1) + v1
    },
    // ease functions
    easeInOut : function(x,pow){
        var xx = Math.pow(x,pow);
        return (xx/(xx+Math.pow(1-x,pow)));
    },
	bump : function (x, pow) {
        return Math.pow(Math.sin(x*Math.PI),pow);
    },
	easeBell : function (x, pow) {
        x = x*2;
        if( x > 1){
            x = 1-(x-1);
            var xx = Math.pow(x,pow);
            return(xx/(xx+Math.pow(1-x,pow)))
        }else{
            var xx = Math.pow(x,pow);
            return(xx/(xx+Math.pow(1-x,pow)))
        }
    },
	easeBellFlatTop : function (x, pow) {
        x = x*3;
        
        if( x > 3){
            var xx = Math.pow(0,pow);
            return(xx/(xx+Math.pow(1,pow)))
        }else
        if( x > 2){
            x = 1-(x-2);
            var xx = Math.pow(x,pow);
            return(xx/(xx+Math.pow(1-x,pow)))
        }else
        if( x > 1){
            var xx = Math.pow(1,pow);
            return(xx/(xx+Math.pow(0,pow)))
        
        }else
        if( x >= 0){
            var xx = Math.pow(x,pow);
            return(xx/(xx+Math.pow(1-x,pow)))
        
        }else{
            var xx = Math.pow(0,pow);
            return(xx/(xx+Math.pow(1,pow)))
        }
    },
	easeIn : function (x, pow) {
        x /=2;
        var xx = Math.pow(x,pow);
        return (xx/(xx+Math.pow(1-x,pow)))*2;
    },
	rushIn : function (x, pow) {
        x = Math.min(1,Math.max(0,x));
        x = x/2+0.5;
        var xx = Math.pow(x,pow);
        return ((xx/(xx+Math.pow(1-x,pow)))-0.5)*2;
    },
	easeCircle : function (x){
        return 1 - Math.sqrt(1-x*x);
    },
	rushCircle : function (x){
        x = 1-x;
        return 1 - Math.sqrt(1-x*x);
    },
	circularBump : function (x){
        x = x*2-1;
        return Math.sqrt(1-x*x);
    },
	circularSlop : function (x){
        x = x*2-1;
        if( x < 0){
            return Math.sqrt(1-x*x)/2;
        }
        return (1-Math.sqrt(1-x*x))/2 + 0.5;
    },
	ease : function(p,out,inn){  // bezier start at zero end at 1 out start adjust inn end ajust
        return 3*p*(1-p)*(1-p)*out+3*Math.pow(p,2)*(1-p)*inn+Math.pow(p,3);
    },
	easeCenter : function (p,pow){   // ease in middle
        p = (p* 0.9)+0.05;
        return 3*0.9*p*(1-p)*(1-p)+0.1*3*p*p*(1-p)+Math.pow(p,3);
    } ,        
        
    // view and render functions    
    mat2FromLine : function(matrix,x1,y1,x2,y2){
        if(matrix ===  undefined){
            matrix = [0,0,0,0,0,0];
        }
        // stub only
        return matrix;
    },
    mat2FromLine : function(matrix,p1,p2){
        if(matrix ===  undefined){
            matrix = [0,0,0,0,0,0];
        }
        // stub only
        
        return matrix;
    },
    getDisplayTransformer : function(){
        return (function(){                
            const buttons = [1, 2, 4];
            var contextShim =  {
                setTransform:function(){},
                canvas:{
                    width: 100,
                    height: 100,
                }
            };
            // create a location description.
            // x and y is the position of the (where on the canvas the transformed point 0,0 will end up)
            // origin x,y is the location that zooms, rotations will be centered on.
            // scale is the scale (zoom) large numbers are zooming in small is zoom out. 1 is 1pixel = 1pixel
            // rotation is rotation. 0 id From left to right across the screen with positives values rotation
            // clockwise. Values are in radians
            var location = function (x, y, originX, originY, scale, rotation){
                return {
                    x      : x,
                    y      : y,
                    ox     : originX,
                    oy     : originY,
                    scale  : scale,
                    rotate : rotation,
                };
            }            
            // returns an array to hold the transformation matrix
            // if a is undefined then returns the Identity (default) matrix
            var matrix = function (a, b, c, d, e, f){
                if(a === undefined){
                    return [1, 0, 0, 1, 0, 0];
                }
                return [a, b, c, d, e, f];
            }            
            // set the ctx transformation 
            var setTransform = function(){ 
                var m, i;
                m = this.matrix;
                i = 0;
                if(this.ctx.renderer !== undefined){
                    this.ctx.renderer.setMatrix(m);
                }else{
                    this.ctx.setTransform(m[i ++], m[i ++], m[i ++], m[i ++], m[i ++], m[i ++]);
                }
            }
            var smoothTransform = function(){
                var a, g, d, c, l, cross, m, im;
                // create short vars for code clarity
                a  = this.acceleration;
                g  = this.drag;
                l  = this.location;
                c  = this.locationChaser;
                d  = this.locationDelta;
                m  = this.matrix;
                im = this.invMatrix;
                c.x      += (d.x      = (d.x      += (l.x      - c.x      ) * a ) * g);
                c.y      += (d.y      = (d.y      += (l.y      - c.y      ) * a ) * g);
                c.ox     += (d.ox     = (d.ox     += (l.ox     - c.ox     ) * a ) * g);
                c.oy     += (d.oy     = (d.oy     += (l.oy     - c.oy     ) * a ) * g);
                c.scale  += (d.scale  = (d.scale  += (l.scale  - c.scale  ) * a ) * g);
                c.rotate += (d.rotate = (d.rotate += (l.rotate - c.rotate ) * a ) * g);
                this.quiet = false;
                if(Math.abs(c.x - l.x) < 0.1 && Math.abs(c.y - l.y) < 0.1 && Math.abs(c.rotate - l.rotate) < 0.001 ){
                    if(Math.abs(d.x) < 0.1 && Math.abs(d.y) < 0.1 && Math.abs(d.rotate) < 0.001){
                        this.quiet = true;
                    }
                }
                m[3] =   m[0] = Math.cos(c.rotate) * c.scale;
                m[2] = -(m[1] = Math.sin(c.rotate) * c.scale);
                m[4] = -(c.x * m[0] + c.y * m[2]) + c.ox;
                m[5] = -(c.x * m[1] + c.y * m[3]) + c.oy;
                cross = m[0] * m[3] - m[1] * m[2];
                im[0] =  m[3] / cross;
                im[1] = -m[1] / cross;
                im[2] = -m[2] / cross;
                im[3] =  m[0] / cross;
                im[4] = (m[1] * m[5] - m[3] * m[4]) / cross;
                im[5] = (m[2] * m[4] - m[0] * m[5]) / cross;
                this.invScale = 1/c.scale;
            }
            var transform = function(){
                var a, g, d, c, l, cross, m, im;
                a  = this.acceleration;
                g  = this.drag;
                l  = this.location;
                m  = this.matrix;
                im = this.invMatrix;
                this.quiet = true;  // no movement so always quiet
                m[3] =   m[0] = Math.cos(l.rotate) * l.scale;
                m[2] = -(m[1] = Math.sin(l.rotate) * l.scale);
                m[4] = -(l.x * m[0] + l.y * m[2]) + l.ox;
                m[5] = -(l.x * m[1] + l.y * m[3]) + l.oy;
                cross = m[0] * m[3] - m[1] * m[2];
                im[0] =  m[3] / cross;
                im[1] = -m[1] / cross;
                im[2] = -m[2] / cross;
                im[3] =  m[0] / cross;
                im[4] = (m[1] * m[5] - m[3] * m[4]) / cross;
                im[5] = (m[2] * m[4] - m[0] * m[5]) / cross;
                this.invScale = 1/l.scale;
            }
            var setUpMouseTranslate = function(mouseButton){
                this.mouseAction[mouseButton] = this.mouseTranslate.bind(this);
                this.mouseActionOff[mouseButton] = undefined;
            }
            // Does mouse drag translation 
            var mouseTranslate = function (mouse) {
                var mdx, mdy;
                var mdx = mouse.x - this.mouseLastX; // get the mouse movement
                var mdy = mouse.y - this.mouseLastY; // get the mouse movement
                this.location.x -= (mdx * this.invMatrix[0] + mdy * this.invMatrix[2]);
                this.location.y -= (mdx * this.invMatrix[1] + mdy * this.invMatrix[3]);   
            }
            var setUpMouseRotate = function(mouseButton){
                this.rotationData = {
                    rotateStart : false,      // the rotation has just started
                    rotateOX    : 0,          // the screen start location of the rottae
                    rotateOY    : 0,
                    startAng    : undefined,  // the starting world rotatoin
                    lastAng     : undefined,  // last angle input. Used to track cyclic rotation
                    rotFrom     : undefined,  // the starting draged angle. 
                }
                this.mouseAction[mouseButton] = this.mouseRotate.bind(this);
                this.mouseActionOff[mouseButton] = (function(){
                    this.rotationData.rotateStart = true;
                }).bind(this);
            }
            var mouseRotate = function (mouse) {
                var loc, mdx, mdy, dist, rot, rd;
                loc = this.location;
                rd = this.rotationData;
                if(rd.rotateStart){
                    rd.rotateStart = false;
                    rd.rotateOX = mouse.x;
                    rd.rotateOY = mouse.y;
                    loc.ox = mouse.x;
                    loc.oy = mouse.y;
                    loc.x = this.mouseWorldX;
                    loc.y = this.mouseWorldY;   
                    rd.startAng = loc.rotate;
                    rd.lastAng = undefined;
                    rd.rotFrom = undefined;
                }
                mdx = mouse.x - rd.rotateOX; 
                mdy = mouse.y - rd.rotateOY;
                dist = Math.hypot(mdy, mdx);
                if(dist > 14){   // tollerance (too close and the rotation goes all over thr plavce)
                    rot = Math.atan2(mdy, mdx);  // get the angle from the start of the geusture to the mouse
                    if(rd.lastAng === undefined){  // if the last ang is not avalible us the current angle
                        rd.lastAng = rot;
                        rd.rotFrom = rot;
                    }
                    if(rd.lastAng < -Math.PI / 2 && rot > Math.PI / 2 ){
                        rd.startAng -= Math.PI * 2;
                    }
                    if(rd.lastAng > Math.PI / 2 && rot < -Math.PI / 2 ){
                        rd.startAng += Math.PI * 2
                    }
                    loc.rotate = (rot-rd.rotFrom) + rd.startAng;
                    rd.lastAng = rot; 
                }
            }
            var mouseZoom = function (mouse) {}
            var setWheelZoom = function(){
                this.mouseWheel = this.mouseWheelZoom;
            }
            var mouseWheelZoom = function (mouse) {
                var loc;
                loc = this.location;
                loc.ox = mouse.x;
                loc.oy = mouse.y;
                loc.x = this.mouseWorldX;
                loc.y = this.mouseWorldY;
                if(mouse.w > 0){ // zoom in
                    loc.scale *= this.scaleSpeed;
                    mouse.w -= 20;
                    if(mouse.w < 0){
                        mouse.w = 0;
                    }
                }
                if(mouse.w < 0){ // zoom out
                    loc.scale *= this.invScaleSpeed;
                    mouse.w += 20;
                    if(mouse.w > 0){
                        mouse.w = 0;
                    }
                }
            }
            var mouseWheelRotate = function (mouse) {}
            var mouseWheelScroll = function (mouse) {}
            var pinch = function () {}
            var setLocation = function (x1, y1, x2, y2, type){ // set bound to fit or fill
                var w,h, vw, vh, loc;
                loc = this.location;
                w = this.ctx.canvas.width;
                h = this.ctx.canvas.height;
                loc.ox = w/2;
                loc.oy = h/2;
                vw = x2 - x1;
                vh = y2 - y1;
                if(type === "fit"){
                    loc.scale = Math.min( w / vw, h / vh);
                }else{
                    loc.scale = Math.max( w / vw, h / vh);
                }
                loc.x = (x1 + x2) / 2;
                loc.y = (y1 + y2) / 2;
                loc.rotate = Math.round(loc.rotate / (Math.PI * 2)) * Math.PI * 2;
            }
            var setOrientation = function (x, y, dx, dy){
                var w,h, vx, vy, loc, ang, size;
                loc = this.location;
                w = this.ctx.canvas.width;
                h = this.ctx.canvas.height;
                loc.ox = w/2;
                loc.oy = h/2;
                vx = dx - x;
                vy = dy - y;
                loc.rotate =- Math.atan2(vy, vx);
                size = Math.hypot(vx ,vy);
                loc.scale = w / (size*2);
                vx /= (size*2);
                vy /= (size*2);
                w = (1/loc.scale) * (w );
                h = (1/loc.scale) * (h );
                loc.x = x;
                loc.y = y;
            }
            var updateWorld = function () {
                var msx, msy, im, m, loc, mouse, but, i, im0, im1, im2, im3, im4, im5, cor;
                but = buttons;
                m   = this.matrix;
                im  = this.invMatrix;
                loc = this.locationChaser;
                cor = this.corners;
                this.transform(); // update and set matrix
                im0 = im[0];
                im1 = im[1];
                im2 = im[2];
                im3 = im[3];
                im4 = m[4];
                im5 = m[5];
                if(this.mouse !== undefined){
                    mouse = this.mouse;
                    if(mouse.mousePrivate === 0){
                        i = 0;
                        while( i < 3){
                            if(this.mouseAction[i] !== undefined){
                                if((mouse.BR & but[i]) === but[i]){
                                    this.mouseAction[i](mouse);
                                }else
                                if(this.mouseActionOff[i] !== undefined){
                                    this.mouseActionOff[i](mouse);
                                }
                            }
                            i++;
                        }
                        if(this.mouseWheel !== undefined){
                            if(mouse.w !== 0){
                                this.mouseWheel(mouse);
                            }
                        }
                    }
                    msx = mouse.x - im4;
                    msy = mouse.y - im5;
                    this.mouseWorldX = (msx * im0 + msy * im2);
                    this.mouseWorldY = (msx * im1 + msy * im3);     
                    this.mouseLastX = mouse.x;
                    this.mouseLastY = mouse.y;        
                }
                if(this.firstTime === undefined){
                    this.firstTime = 0;
                }
                this.firstTime += 1;
                if(this.firstTime < 100000){
                    msx = -im4;
                    msy = -im5;
                    cor[0] = (msx * im0 + msy * im2);
                    cor[1] = (msx * im1 + msy * im3);     
                    msx =  this.ctx.canvas.width - im4;
                    msy =  this.ctx.canvas.height - im5;
                    cor[4] = (msx * im0 + msy * im2);
                    cor[5] = (msx * im1 + msy * im3);     
                    msx =   - im4;
                    msy =  this.ctx.canvas.height - im5;
                    cor[6] = (msx * im0 + msy * im2);
                    cor[7] = (msx * im1 + msy * im3);         
                    msx =  this.ctx.canvas.width - im4;
                    msy =  - im5;
                    cor[2] = (msx * im0 + msy * im2);
                    cor[3] = (msx * im1 + msy * im3);   
                    this.invScale = 1/loc.scale;
                    this.pixelXx = im0;
                    this.pixelXy = im1;     
                }
            }
            var setMode = function (mode){
                mode = mode.toLowerCase();
                if(mode === "smooth"){
                    this.mode = mode;
                    this.locationChaser = location(0, 0, 0, 0, 1, 0);
                    this.transform = smoothTransform;
                }else{
                    mode = "normal";
                    this.mode = mode;
                    this.locationChaser = this.location;
                    this.transform = transform;
                }
            }
            var displayTransform = {
                mode             : "smooth",
                setMode          : setMode,
                location         : location(0, 0, 0, 0, 1, 0),
                locationChaser   : location(0, 0, 0, 0, 1, 0),
                locationDelta    : location(0, 0, 0, 0, 1, 0),
                corners          : [0, 0, 0, 0, 0, 0, 0, 0],  // corners x,y start from top left to top right
                pixelXx          : 0,                         // the bot right to bot left
                pixelXy          : 0,
                transform        : smoothTransform,
                drag             : 0.1,  // drag for movements
                acceleration     : 0.7, // acceleration
                quiet            : false,   // this is true when most of the movement scaling and rotation have stopped
                matrix           : matrix(), // main matrix
                invMatrix        : matrix(), // invers matrix;
                invScale         : 1,
                mouseWorldX      : 0, // the mouse location in world space
                mouseWorldY      : 0, // the mouse location in world space
                mouseLastX       : 0, // the last mouse position in screen space
                mouseLastY       : 0,
                mouseAction      : [undefined, undefined, undefined],
                mouseActionOff   : [undefined, undefined, undefined],
                mouseWheel       : undefined,
                scaleSpeed       : 1.1,
                invScaleSpeed    : 1 / 1.1,
                mouseTranslate   : mouseTranslate,
                mouseRotate      : mouseRotate,
                mouseZoom        : mouseZoom,
                mouseWheelRot    : mouseWheelRotate,
                mouseWheelZoom   : mouseWheelZoom,
                mouseWheelScroll : mouseWheelScroll,
                setMouseRotate   : setUpMouseRotate,
                setMouseTranslate: setUpMouseTranslate,
                setWheelZoom     : setWheelZoom,
                setTransform     : setTransform,
                setDefault       : function(){ this.ctx.setTransform(1, 0, 0, 1, 0, 0); },
                update           : updateWorld,
                fitView          : setLocation,
                orientView       : setOrientation,
                ctx              : contextShim,
                mouse            : undefined,
                
            } 
            return displayTransform;
        })();
    },
}

/*
displayTransform.ctx = ctx;
displayTransform.mouse = mouse;
displayTransform.setMouseRotate(2); // set rotate funtion to button 3
displayTransform.setMouseTranslate(0); 
displayTransform.setWheelZoom(); 
displayTransform.setMode("smooth")

        
    
*/

groover.code = {
    moduals : {
        stub : function(){},
    },
    modualDir : process.cwd()+"\\scripts\\moduals",
    presentError : function(e){
        console.log(e);
    },
    load : function (name){
        var filename;
        if(this.moduals[name] !== undefined){
            return this.moduals[name];
        }
        filename = this.modualDir + "\\" + name + ".js";
        var code = groover.utils.files.loadText(filename);
        if(code === undefined){
            if(groover.utils.files.error.error){
                log("Error loading modual '"+name+"'","red");
                log("See console details.","red");
                console.log($JC(groover.utils.files.error));
            }
            return undefined;
        }
        var modual = "'use strict';\n";
        modual += "groover.code.moduals."+name+" = ";
        modual += code;
        modual += "\n\n";
        modual += "console.log('Modual "+name+" for console referance.');\n";
        modual += "groover.code.parsed = true";
        groover.code.parsed = false;

        try{  // add code to the web page and run 
            var script = $C('script');
            script.async = true;
            script.text = modual;
            $A($TN('head')[0],script);
            if(this.parsed && this.moduals[name] !== undefined){
                return this.moduals[name];
            }
            log("Modual '"+name+"' did not parse.", "red");
            if(!this.parsed){
                console.log("Modual '"+name+"' did not parse. Reparsing for debug only.");
                modual = "\n";
                modual += "console.log('Modual "+name+" pasrsed with debug' );\n";
                modual += "try{  // debugmode\n";
                modual += "groover.code.moduals."+name+" = ";
                modual += code;
                modual += "\n\n";
                modual += "groover.code.parsed = true;\n";
                modual +=  "console.log('Modual "+name+" parse when not in strict mode.' );\n";
                modual += "}catch(e){\n";
                modual += "console.log('Modual "+name+" threw error on parsing' );\n";
                modual += "groover.code.presentError(e);}";
                var script = $C('script');
                script.async = true;
                script.text = modual;
                $A($TN('head')[0],script);
                    
                groover.code.parsed = false;                
            }else{
                console.log("Modual '"+name+"' Failed to excecute.");
            }
            
            return undefined;
                

        }catch(e){
            log("Could not load Modual '"+name+"' see console.", "red");
            console.log(e);
        }        
        
    }
    
};

groover.utils.files = {
    error : {
        error : false,
        message : "",
        filename : "",
    },
    imageSaveDirectory : "D:\\Marks\\JavaScript\\GameEngine\\July2015",
    currentDirectory : process.cwd(),
    saveText : function(filename,text,replace){
        var fileStats,dirStats;
        this.error.error = false;
        filename = path.parse(filename);
        if(filename.dir === ""){
            filename.dir = this.currentDirectory;
        }
        try{
            dirStats = fileSystem.statSync(filename.dir);
            if(!dirStats.isDirectory()){
                throw "No such directory";
            }
        }catch(e){
            this.error.message = "No such directory!";
            this.error.filename = filename;
            this.error.error = true;
            return false;
        }
        if(filename.ext === ""){
            filename.ext = ".txt";
        }
        filename = filename.dir + "\\" + filename.name + filename.ext;

        if(replace !== undefined && !replace ){
            try{
                fileStats = fileSystem.statSync(filename);
                this.error.message = "File exists!";
                this.error.filename = filename;
                this.error.error = true;
                return false;
            }catch(e){
                // file does not exist so safe to write???
            }
        }
 
        try{
            text = fileSystem.writeFileSync(filename, text, "utf8");
        }catch(e){
            this.error.message = "Writting. Error saving file!";
            this.error.filename = filename;
            this.error.error = true;
            return false;
        }
        log("Saved file " + filename);  
        return true;        
    },
    loadText : function(filename){
        var fileStats,dirStats,text;
        this.error.error = false;
        filename = path.parse(filename);
        if(filename.dir === ""){
            filename.dir = this.currentDirectory;
        }
        try{
            dirStats = fileSystem.statSync(filename.dir);
            if(!dirStats.isDirectory()){
                throw "No such directory";
            }
        }catch(e){
            this.error.message = "Reading. No such directory!";
            this.error.filename = filename;
            this.error.error = true;
            return undefined;
        }
        if(filename.ext === ""){
            filename.ext = ".txt";
        }
        filename = filename.dir + "\\" + filename.name + filename.ext;

        try{
            fileStats = fileSystem.statSync(filename);
        }catch(e){
            this.error.message = "Reading. File not found!";
            this.error.filename = filename;
            this.error.error = true;
            return undefined;
        }
 
        try{
            text = fileSystem.readFileSync(filename, "utf8");
        }catch(e){
            this.error.message = "Reading. Error reading file!";
            this.error.filename = filename;
            this.error.error = true;
            return undefined;
        }
        log("file read " + filename);  
        return text;        
        
    },
    laodJson : function (name){
        var filename;
        filename = name + ".json";
        var text = this.loadFile(filename);
        if(text !== undefined){
            try{
                text = JSON.parse(text);
            }catch(e){
                text = undefined;
            }
        }
        return text;
    },
    saveJson : function (name,data){
        var filename;
        filename = name + ".json";
        try{
            var text = JSON.stringify(data);
        }catch(e){
            return false;
        }
        return this.saveFile(filename,text);
    }
    
}