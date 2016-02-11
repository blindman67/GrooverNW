(function(){  // **MODUAL** code will have use strit prefixed
    // important do not add anything above this line. Modual loading adds (use strict) and accepts the returned value of this function
    var gradients = {
        lastGradeSize : 0,
        createGradient : function (ctx,type, where){
            var radius,radius1,w,h,wc,hc,rw,rh,rd;
            wc = (w = ctx.canvas.width)/2;
            hc = (h = ctx.canvas.height)/2;
            if(type === undefined){
                if(where === undefined){
                    this.lastGradeSize =  h;
                    return ctx.createLinearGradient(wc,0,wc,h);
                }
                type = "linear";
            }
            if(where === undefined){
                where = "fill down";
            }                    
            
            if(typeof where === "string"){
                where = where.toLowerCase();
                
                if(type.toLowerCase() === "linear"){
                    switch(true){
                        case (where.indexOf("fill") > -1):
                            if(where.indexOf("diagonal") > -1){
                                this.lastGradeSize =  rd;
                                if(where.indexOf("down") > -1){
                                    return ctx.createLinearGradient(0,0,w,h);
                                }
                                return ctx.createLinearGradient(0,h,w,0);
                            }
                            if(where.indexOf("down") > -1){
                                this.lastGradeSize =  h;                                    
                                return ctx.createLinearGradient(wc,0,wc,h);
                            }
                        default:
                            this.lastGradeSize =  w;
                            return ctx.createLinearGradient(0,hc,w,hc);
                    }
                }
                rw = wc;
                rh = hc;
                rd = Math.hypot(wc,hc);
                if(where.indexOf("top") > -1){                        
                    rd = Math.hypot(wc,h);
                    rh = h;
                    hc = 0;
                }
                if(where.indexOf("bottom") > -1){                        
                    rd = Math.hypot(wc,h);
                    rh = h;
                    hc = h;
                    h = 0;
                }
                if(where.indexOf("left") > -1){
                    rd = Math.hypot(w,hc-h);
                    rw = w;
                    wc = 0;
                }
                if(where.indexOf("right") > -1){
                    rd = Math.hypot(w,hc-h);
                    rw = w;
                    wc = w;
                    w = 0;
                }
                        

                if(where.indexOf("fit") > -1){
                    
                    return ctx.createRadialGradient(wc,hc,0,wc,hc,(this.lastGradeSize = Math.min(rw,rh)));
                }
                if(where.indexOf("touch") > -1){
                    return ctx.createRadialGradient(wc,hc,0,wc,hc,(this.lastGradeSize =  Math.max(rw,rh)));
                }
                if(where.indexOf("vin small") > -1){
                    this.lastGradeSize =  rd-Math.min(rw,rh);
                    return ctx.createRadialGradient(wc,hc,Math.min(rw,rh),wc,hc,rd);
                }
                if(where.indexOf("vin large") > -1){
                    this.lastGradeSize =  rd-Math.max(rw,rh);
                    return ctx.createRadialGradient(wc,hc,Math.max(rw,rh),wc,hc,rd);
                }
                if(where.indexOf("fill") > -1){;}
                this.lastGradeSize =  rd
                return ctx.createRadialGradient(wc,hc,0,wc,hc,rd);
            }else{
                if(type.toLowerCase() === "linear"){
                    return ctx.createLinearGradient(where.x1,where.y1,where.x2,where.y2);
                }
                return ctx.createRadialGradient(where.x1,where.y1,where.r1,where.x2,where.y2,where.r2);
            }
            this.lastGradeSize = h;
            return ctx.createLinearGradient(wc,0,wc,h);
        },             
        completeGradient : function(img,desc,grad){
            var i, gr,g;
            gr = this.createGradient(img.ctx,desc.type,desc.where);                
            for(i = 0; i < grad.length; i ++){
                g = grad[i]; 
                gr.addColorStop(g[0],"rgba("+Math.floor(g[1][0])+","+Math.floor(g[1][1])+","+Math.floor(g[1][2])+","+g[1][3]+")");
            }
            return gr;
        },
        createLight : function(r,g,b,a,height,pos){
            return {
                rgb :[r,g,b],
                alpha : a,
                height : height,
                pos : pos,
            }
        },            
        createLightGrad : function (size,light,material){
            var y,gr, r, g, b, a, rgb, eye, step, i,z, h, ref, ref1,d1,d2,l, dist, ang, ang1,falloff,suf;
                          
            gr = [];
            eye = size;
            step = 1/(h = size);
            rgb = light.rgb;
            a = light.alpha;
            z = light.height;
            y = light.pos;
            
            for(i = 0; i <= 1; i += step ){
                l = i * h;
                d1 = l-y;
                d2 = l-(eye+y)/2;
                dist = Math.hypot(d1,h);
                ang = Math.asin(d1/dist);
                ref = Math.cos(ang);
                ang1 = Math.atan(d2,h);
                if(ref < 0){
                    ref = 0;
                }
                ref1 = Math.pow(Math.cos(ang1),material.specPower);
                suf = dist * Math.PI * 2;
                falloff = 1/suf;
                r = rgb[0] * rgb[0] * falloff * ref + rgb[0] * ref1;
                g = rgb[1] * rgb[1] * falloff * ref + rgb[1] * ref1;
                b = rgb[2] * rgb[1] * falloff * ref + rgb[2] * ref1;
                gr.push([i,[r,g,b,a]]);
            }
            return gr;
        }
 
        
    };


    return gradients;

})();
    
    
    