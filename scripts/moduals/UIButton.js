(function () {  // CheckBox UI
    var shapes;
    var create = function (name,settings,UI,owner) {
        if(owner === undefined){
            owner = UI;
        }
        
        UI.setupStyleDefaults(settings,[
            ["main","UIButton"],
            ["hover","UIButtonHover"],
            ["click","UIButtonClick"],
            ["font","UIFont","copy"],
        ]);        
       
        settings.height = settings.height===undefined?settings.style.main.height:settings.height;        
        settings.style.font.fontSize = Math.max(12,settings.height-Math.floor(settings.height/3));
        settings.style.font.textAlign = "center";
        settings.style.font.textBaseline = "middle";

        var ui = {
            onclick :settings.onclick,
            release : function(){
                if(this.group !== undefined){
                    this.group.release(this.id);
                }
                if(this.canvas !== undefined){
                    if(this.canvas.ctx !== undefined){
                        this.canvas.ctx = undefined;
                    }
                    this.canvas = undefined;
                }
                this.location = undefined;
                this.mouse = undefined;
            },
            setup : function () {
                if(this.canvas !== undefined){
                    this.location.set(this.x,this.y,undefined,this.height);
                }else{
                    var w = groover.utils.styles.measureText(this.text, this.style.font).width;
                    w += (this.style.main.inset + this.style.main.rounding)*2;
                    if(this.minWidth !== undefined){
                        w = Math.max(w,this.minWidth);
                    }
                    this.canvas = this.owner.createCanvas(w,this.height*3);
                    this.location.set(this.x,this.y,undefined,this.height);
                }
            },            
            redraw : function(){
                var ins,h,cw;
                cw = this.canvas.width;
                h = this.canvas.height / 3;
                this.canvas.ctx.setTransform(1, 0, 0, 1, 0, 0);
                this.canvas.ctx.clearRect(0, 0, cw, this.canvas.height);
                ins = this.style.main.inset + this.style.main.lineWidth;
                shapes.drawRectangle(this.canvas, ins, ins, cw - ins * 2, h - ins * 2, this.style.main);
                groover.utils.styles.assignFontToContext(this.canvas.ctx, this.style.font);
                this.canvas.ctx.fillText(this.text, cw / 2, h * 0.5);

                ins = this.style.hover.inset + this.style.hover.lineWidth;
                shapes.drawRectangle(this.canvas, ins, ins + h, cw - ins * 2, h - ins * 2, this.style.hover);
                groover.utils.styles.assignFontToContext(this.canvas.ctx, this.style.font);
                this.canvas.ctx.fillText(this.text, cw / 2, h * 0.5 + h);

                ins = this.style.click.inset + this.style.click.lineWidth;
                shapes.drawRectangle(this.canvas, ins, ins + h * 2, cw - ins * 2, h - ins * 2, this.style.click);
                groover.utils.styles.assignFontToContext(this.canvas.ctx, this.style.font);
                this.canvas.ctx.fillText(this.text, cw / 2, h * 0.5 + h * 2);

                this.dirty = false;
            },
            display : function () {
                var e,c,w,l,h;
                l = this.location;
                w = this.canvas.width;
                h = this.canvas.height/3
                if(this.hover){
                    if(this.hoverVal < 1){
                        this.hoverVal += 0.1;
                        if(this.hoverVal > 1){
                            this.hoverVal = 1;
                        }
                    }
                }else{
                    if(this.hoverVal > 0){
                        this.hoverVal -= 0.02;
                        if(this.hoverVal < 0){
                            this.hoverVal = 0;
                        }
                    }
                }
                if(this.clicking){
                    if(this.clickingVal < 1){
                        this.clickingVal += 0.1;
                        if(this.clickingVal > 1){
                            this.clickingVal = 1;
                        }
                    }
                }else{
                    if(this.clickingVal > 0){
                        this.clickingVal -= 0.02;
                        if(this.clickingVal < 0){
                            this.clickingVal = 0;
                        }
                    }
                }
                if(e <= 0){
                    this.owner.render.drawBitmapPart(this.canvas,l.x,l.y, 0,0,w,h,l.alpha);
                }else
                if(e === 1){
                    this.owner.render.drawBitmapPart(this.canvas,l.x,l.y, 0,h,w,h,l.alpha);
                }else{
                    e = mMath.easeInOut(this.hoverVal,3);
                    this.owner.render.drawBitmapPart(this.canvas,l.x,l.y, 0,0,w,h,l.alpha);
                    this.owner.render.drawBitmapPart(this.canvas,l.x,l.y, 0,h,w,h,l.alpha * e);
                }
                c = mMath.easeInOut(this.clickingVal,3);
                if(c > 0 ){
                    this.owner.render.drawBitmapPart(this.canvas,l.x,l.y, 0,h*2,w,h,l.alpha * c);
                }
            }
        };
        UI.addUIDefaults.bind(ui)(UI,owner,name,settings);
        return ui;
    };
    var configure = function(){
        if(shapes === undefined){
            shapes = groover.code.load("shapes2D");
        }
        
        groover.utils.styles.createNamedStylesFromList ([
            ["font","UIFont", "arial", 20, "white"],
            ["draw","UIButton","Blue","white",2,6,1],
            ["draw","UIButtonHover","green","white",2,6,0],
            ["draw","UIButtonClick","RED","white",2,6,0],
        ]);
                               
    };
    return {
        create : create,
        configure : configure,
    };
})();