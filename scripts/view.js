"use strict";
function View(owner){
    this.owner = owner;
    this.width = window.innerWidth;    
    this.height = window.innerHeight;    
    this.ctx;  // main display
    this.views = [];
    this.render;
    this.namedViews = {};
    this.refreshed = true;
    this.ready = true;
    this.mainViewName = "main";
    log("View manager ready");
}
View.prototype.refreshedDone = function(){
    this.refreshed = false;
    log("View refreshed");
}
View.prototype.refresh = function(){
    this.canvas = this.owner.canvas;
    this.ctx = this.owner.canvas.ctx;
    this.width = this.owner.canvas.width;
    this.height = this.owner.canvas.height;
    this.addNamedView(this.mainViewName,this.canvas);
    this.render = this.owner.render;
    this.refreshed = true;
    if(this.owner.mouseKeyboard !== undefined && this.owner.mouseKeyboard.viewUpdated !== undefined){
        this.owner.mouseKeyboard.viewUpdated();
    }
    this.render.viewUpdated();    
}
View.prototype.setDefault = function(){
    if(this.owner.canvas !== undefined){
        this.canvas = this.owner.canvas;
        this.ctx = this.canvas.ctx;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }else{
        this.width = window.innerWidth;    
        this.height = window.innerHeight;    
        
    }
}
View.prototype.addNamedView = function(name,canvas){
    this.namedViews[name] = {
        canvas : canvas,
        ctx : canvas.ctx,
        width : canvas.width,
        height : canvas.height,
    };
    return this.namedViews[name];
}
View.prototype.setViewByName = function(name){
    var view = this.namedViews[name];
    if(view === undefined){
        return;
    }
    this.canvas = view.canvas;
    this.ctx = view.ctx;
    this.width = view.width;
    this.height = view.height;
}
View.prototype.create = function(width,height){
    var frame = {};
    frame.image = $C("canvas");
    frame.image.width = width;
    frame.image.height = height;
    frame.ctx = frame.image.getContext("2d");
    this.views.push(frame);
    return frame;
}


mMath.getDisplayTransformer = function(){
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
        var setScaleSpeed = function(speed){
            if(speed > 1){
                this.scaleSpeed  = speed;
                this.invScaleSpeed = 1/speed;
            }else
            if(speed < 1){
                this.invScaleSpeed  = speed;
                this.scaleSpeed = 1/speed;
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
            setScaleSpeed    : setScaleSpeed,
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
};