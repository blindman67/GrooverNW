"use strict";
function Render(owner){
    this.owner = owner;
    this.view = this.owner.view;
    this.name = "Render";    
    this.ready = true;
    this.currentTarget;
    log("Render manager ready");

    var ctx;
    var lastFont = "";
    var lastFill = "";
    var lastStroke = "";
    var w,w2;
    var h,h2;
    var sources = "source-over,lighter,darker,source-atop,source-in,source-out,destination-over,destination-atop,destination-in,destination-out,copy,xor,multiply,screen,overlay,color-dodge,color-burn,hard-light,soft-light,difference,exclusion,hue,saturation,color,luminosity".split(",");

    this.viewUpdated = function(){
        ctx = this.view.ctx;
        this.currentTarget = this.view;
        ctx.renderer = this;
        w = this.view.width;
        h = this.view.height;
        w2 = Math.round(w/2);
        h2 = Math.round(h/2);
        lastFont = "";        
        lastFill = "";
        lastStroke = "";
        log("Render updated");
    }
    this.update = function(){
    }
    
    this.invMatrix = [0,0,0,0,0,0];

    var ctx1 = []; // context Stack
    var matrixStack = [[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0]];
    var matrixCount = 0;
    var m0,m1,m2,m3,m4,m5;
    var mA0,mA1,mA2,mA3,mA4,mA5;
    var ox,oy; // origin for stacked transforms
    var tx,ty; // general purpose temps  

    var globalScale;
    var blendMode = 0;
    var globalAlpha = 1;
    this.pushCTX = function(ctxNew){
        ctx1.push(ctx);
        ctx = ctxNew;
        blendMode = 0;
    }
    this.popCTX = function(){
        ctx = ctx1.shift();
    }
    this.getCTX = function(){
        return ctx;
    }
    this.pushMatrix = function(mat){
        var ms = matrixStack[matrixCount++];
        ms[0] = mA0 = m0;
        ms[1] = mA1 = m1;
        ms[2] = mA2 = m2;
        ms[3] = mA3 = m3;
        ms[4] = mA4 = m4;
        ms[5] = mA5 = m5;
        ox = mat[4];
        oy = mat[5];
        m0 = mA0*mat[0]+mA2*mat[1];
        m1 = mA1*mat[0]+mA3*mat[1];
        m2 = mA0*mat[2]+mA2*mat[3];
        m3 = mA1*mat[2]+mA3*mat[3];
        m4 = mA0*ox+mA2*oy+mA4;
        m5 = mA1*ox+mA3*oy+mA5;
        globalScale = Math.hypot(m0,m1);
    }
    this.setMatrix = function(mat){
        m0 = mat[0]; m1 = mat[1]; m2 = mat[2]; m3 = mat[3]; m4 = mat[4]; m5 = mat[5];
        globalScale = Math.hypot(m0,m1);     
     
    }
    this.putMatrix = function(mat){
        mA0 = m0; mA1 = m1; mA2 = m2; mA3 = m3; mA4 = m4; mA5 = m5;
        m0 = mat[0]; m1 = mat[1]; m2 = mat[2]; m3 = mat[3]; m4 = mat[4]; m5 = mat[5];
        globalScale = Math.hypot(m0,m1);
    }
    this.popQuickMatrix = function(){
        m0 = mA0; m1 = mA1; m2 = mA2; m3 = mA3; m4 = mA4; m5 = mA5;
        globalScale = Math.hypot(m0,m1);
    }
    this.popMatrix = function(){
        matrixCount -= 1;
        var ms = matrixStack[matrixCount];
        m0 = ms[0]; m1 = ms[1]; m2 = ms[2]; m3 = ms[3]; m4 = ms[4]; m5 = ms[5];
        globalScale = Math.hypot(m0,m1);
    }
    this.blendLighten = function(){
        ctx.globalCompositeOperation = "lighter"; 					
    }
    this.blendDarken = function(){
        ctx.globalCompositeOperation = "multiply"; 					
    }
    this.blendMode = function(type){
        ctx.globalCompositeOperation = sources[type]; 					
    }
    this.blendNormal = function(){
        ctx.globalCompositeOperation = "source-over";        
    }
    this.setGlobalAlpha = function(alpha){
        globalAlpha = alpha;
    }
    this.setSmoothing = function(val){
        ctx.imageSmoothingEnabled = val;         
    }
     
    
    
    this.drawBackground = function(img){
        ctx.globalAlpha = 1 * globalAlpha;
        ctx.setTransform(1, 0, 0, 1, 0,0);        
        ctx.drawImage(img,0,0,w,h);
    }
    this.drawBitmap = function(img,x,y){
        ctx.globalAlpha = 1 * globalAlpha;
        ctx.setTransform(1, 0, 0, 1, x,y);
        ctx.drawImage(img,0,0);
    }
    this.drawBitmapA = function(img,x,y,alpha){
        ctx.globalAlpha = alpha * globalAlpha;
        ctx.setTransform(1, 0, 0, 1, x,y);
        ctx.drawImage(img,0,0);
    }
    this.drawBitmapPart = function(img,x,y,fx,fy,fw,fh,alpha){
        ctx.globalAlpha = alpha * globalAlpha;
        ctx.setTransform(1, 0, 0, 1, x,y);
        ctx.drawImage(img,fx,fy,fw,fh,0,0,fw,fh);
    }
    this.measureSpriteText = function(img,text,textBase){
        var len = text.length;
        var pos = 0;
        for(var i = 0; i < len; i++){
            var s = text.charCodeAt(i)-33
            if(s === -1){
                pos += img.sprites[1 + textBase].w + 1;
            }else{
                var sp = img.sprites[s + textBase];
                pos += sp.w + 1;
            }
        }
        return pos;
    }
    this.drawSpriteText = function(img,x,y,text,textBase){
        ctx.globalAlpha = 1 * globalAlpha;
        ctx.setTransform(1, 0, 0, 1, x,y);
        var len = text.length;
        var pos = 0;
        for(var i = 0; i < len; i++){
            var s = text.charCodeAt(i)-33
            if(s === -1){
                pos += img.sprites[1 + textBase].w + 1;                
            }else{
                var sp = img.sprites[s + textBase];
                ctx.drawImage(img,sp.x,sp.y,sp.w,sp.h,pos,0,sp.w,sp.h);
                pos += sp.w + 1;
            }
        }
    }
    this.drawBitmapAbs = function(img,x,y,x1,y1,alpha){
        ctx.globalAlpha = alpha * globalAlpha;
        if(x1 < x){
            if(y1 < y){
                ctx.setTransform(-1, 0, 0, -1, x , y);
                ctx.drawImage(img,0,0,x-x1,y-y1);
            }else{
                ctx.setTransform(-1, 0, 0, 1, x , y);
                ctx.drawImage(img,0,0,x-x1,y1-y);
            }
        }else{
            if(y1 < y){
                ctx.setTransform(1, 0, 0, -1, x , y);
                ctx.drawImage(img,0,0,x1-x,y-y1);
            }else{
                ctx.setTransform(1, 0, 0, 1, x , y);
                ctx.drawImage(img,0,0,x1-x,y1-y);
            }
        }
    }
    this.drawBitmapSize = function(img,x,y,ww,hh,alpha){
        ctx.globalAlpha = alpha * globalAlpha;
        ctx.setTransform(1, 0, 0, 1, x,y);
        ctx.drawImage(img,0,0,ww,hh);
    }        
    this.drawToFit = function(img,alpha){
        var sc = Math.min(w/img.width,h/img.height);
        ctx.globalAlpha = alpha * globalAlpha;
        ctx.setTransform(sc, 0, 0, sc, w2,h2);
        ctx.drawImage(img,-img.width/2, -img.height/2);
    }
    this.drawToFill = function(img,alpha){
        var sc = Math.max(w/img.width,h/img.height);
        ctx.globalAlpha = alpha * globalAlpha;
        ctx.setTransform(sc, 0, 0, sc, w2,h2);
        ctx.drawImage(img,-img.width/2, -img.height/2);
    }        
     this.drawToFitV = function(img,alpha){
        var sc = Math.min(w/img.videoWidth,h/img.videoHeight);
        ctx.globalAlpha = alpha * globalAlpha;
        ctx.setTransform(sc, 0, 0, sc, w2,h2);
        ctx.drawImage(img,-img.videoWidth/2, -img.videoHeight/2);
    }
    this.drawToFillV = function(img,alpha){
        var sc = Math.max(w/img.videoWidth,h/img.videoHeight);
        ctx.globalAlpha = alpha * globalAlpha;
        ctx.setTransform(sc, 0, 0, sc, w2,h2);
        ctx.drawImage(img,-img.videoWidth/2, -img.videoHeight/2);
    }        
    this.drawImageSRA = function(img, x, y,scale,ang,alpha) {        
        ctx.globalAlpha = alpha * globalAlpha;
        ctx.setTransform(scale, 0, 0, scale, x,y);
        ctx.rotate(ang);
        ctx.drawImage(img,-img.width/2, -img.height/2);
    }     
    this.drawBitmapC = function(img,x,y){
        ctx.globalAlpha = 1 * globalAlpha;
        ctx.setTransform(1, 0, 0, 1, 0,0);        
        ctx.drawImage(img,x-img.width/2,y-img.height/2);
    }
    this.drawBitmapCF = function(img,x,y){
        var w1,h1;
        w1 = img.width;
        h1 = img.height;
        var scale = h/h1;
        ctx.drawImage(img,x-(w1/2)*scale,y-(h1/2)*scale,w1 * scale, h1 * scale);
    }
    // sprite screen renderers
    
    this.drawSpriteA = function(image,spriteID, x, y,alpha) {
        ctx.globalAlpha = alpha * globalAlpha;
        ctx.setTransform(1, 0, 0, 1, x,y);
        var sp = image.sprites[spriteID % image.sprites.length];
        ctx.drawImage(image,sp.x,sp.y,sp.w,sp.h,0,0,sp.w,sp.h);
    }     
    this.drawSpriteAW = function(image,spriteID, x, y,w,alpha) {
        ctx.globalAlpha = alpha * globalAlpha;
        ctx.setTransform(1, 0, 0, 1, x,y);
        var sp = image.sprites[spriteID % image.sprites.length];
        ctx.drawImage(image,sp.x,sp.y,sp.w,sp.h,0,0,w,sp.h);
    }      
    this.drawSpriteAWH = function(image,spriteID, x, y,w,h,alpha) {
        ctx.globalAlpha = alpha * globalAlpha;
        ctx.setTransform(1, 0, 0, 1, x,y);
        var sp = image.sprites[spriteID % image.sprites.length];
        ctx.drawImage(image,sp.x,sp.y,sp.w,sp.h,0,0,w,h);
    }      
    this.drawSpriteSRA = function(image,spriteID, x, y,s,ang,alpha) {
        ctx.globalAlpha = alpha * globalAlpha;
        ctx.setTransform(s, 0, 0, s, x,y);
        ctx.rotate(ang);
        var sp = image.sprites[spriteID % image.sprites.length];
        ctx.drawImage(image,sp.x,sp.y,sp.w,sp.h,-Math.floor(sp.w/2),-Math.floor(sp.h/2),sp.w,sp.h);
    }       
    
    // world renders
    
    this.drawBitmapGSRA = function(img, x, y,scale,ang,alpha) {
        ctx.globalAlpha = alpha*globalAlpha;
        ctx.setTransform(m0,m1,m2,m3,m4,m5);
        ctx.translate(x,y);
        ctx.scale(scale,scale);
        ctx.rotate(ang);
        ctx.drawImage(img,-img.width/2, -img.height/2);
    }  
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    this.set2DStyles = function(font,fill,stroke){
        if(font !== lastFont){
            lastFont = font;
            ctx.font = font;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
        }
        if(lastFill !== fill){
            lastFill = fill;
            ctx.fillStyle = fill;
        }
        if(lastStroke !== stroke){
            lastStroke = stroke;
            ctx.strokeStyle = stroke;
        }
    }
    this.drawText = function(text,x,y){
        ctx.globalAlpha = 1  * globalAlpha;
        ctx.setTransform(1, 0, 0, 1, x,y);                
        ctx.fillText(text,0,0);
    }
}

