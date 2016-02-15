(function () {  // CheckBox UI
    var shapes;
    var create = function (name, settings, UI, owner) {
        if (owner === undefined) {
            owner = UI;
        }
        
        UI.setupStyleDefaults(settings,[
            ["main","UICheckBox"],
            ["checked","UICheckBoxChecked"],
            ["unchecked","UICheckBoxUnchecked"],
            ["font","UIFont","copy"],
        ]);                
        settings.style.font.textAlign = "left";
        settings.height = settings.height === undefined ? settings.style.main.height : settings.height;
        settings.style.font.fontSize = Math.max(12, settings.height - Math.floor(settings.height / 3));
        settings.style.font.textAlign = "left";
        settings.style.font.textBaseline = "middle";



        var ui = {
            keepOpen : settings.keepOpen !== undefined ? settings.keepOpen : false,
            checked : settings.checked,
            setChecked : function (value){
                if (this.checked !== value) {
                    this.checked = value;
                    this.dirty = true;
                    if (this.checked && this.onchecked) {
                        this.onchecked(this);
                    } else
                    if (!this.checked && this.onunchecked) {
                        this.onunchecked(this);
                    }
                }
            },
            check : function () {
                this.setChecked(true);
            },
            uncheck : function () {
                this.setChecked(false);
            },
            onchecked : settings.onchecked,
            onunchecked : settings.onunchecked,
            setup : function () {
                if (this.canvas !== undefined) {
                    this.location.set(this.x, this.y);
                } else {
                    var w = groover.utils.styles.measureText(this.text, this.style.font).width;
                    w += this.height * 1.25;
                    this.canvas = this.owner.createCanvas(w, this.height);
                    this.location.set(this.x, this.y);
                }
            },            
            redraw : function(){
                var cw, ins, h;
                cw = this.canvas.width;
                h = this.canvas.height;
                this.canvas.ctx.setTransform(1, 0, 0, 1, 0, 0);
                this.canvas.ctx.clearRect(0, 0, cw, this.canvas.height);
                ins = this.style.main.lineWidth + this.style.main.inset;
                shapes.drawRectangle(this.canvas, ins, ins, cw - ins * 2, h - ins * 2, this.style.main);
                if (this.checked) {
                    ins = this.style.checked.lineWidth + this.style.checked.inset;
                    shapes.drawRectangle(this.canvas, ins, ins, h - ins * 2, h - ins * 2, this.style.checked);
                } else {
                    ins = this.style.unchecked.lineWidth + this.style.unchecked.inset;
                    shapes.drawRectangle(this.canvas, ins, ins, h - ins * 2, h - ins * 2, this.style.unchecked);
                }
                groover.utils.styles.assignFontToContext(this.canvas.ctx, this.style.font);
                this.canvas.ctx.fillText(this.text, this.location.h * 1, this.location.h * 0.5);
                this.dirty = false;
            },
            clicked : function(){  this.setChecked(! this.checked); },
            display : function () {
                var l,e,w,r,tw;
                l = this.location;
                if (this.hover) {
                    if(this.hoverVal < 1){
                        this.hoverVal += 0.1;
                        if(this.hoverVal > 1){
                            this.hoverVal = 1;
                        }
                    }
                } else {
                    if (this.hoverVal > 0) {
                        this.hoverVal -= 0.02;
                        if (this.hoverVal < 0) {
                            this.hoverVal = 0;
                        }
                    }
                }
                if(this.keepOpen){
                    this.owner.render.drawBitmapSize(this.canvas, l.x, l.y, l.w, l.h, l.alpha);                    
                }else{
                    e = mMath.easeInOut(this.hoverVal,3);
                    r = this.style.main.rounding;
                    tw = l.h-this.style.checked.lineWidth * 2;
                    if (e <= 0) {
                        this.owner.render.drawBitmapPart(this.canvas, l.x, l.y, 0, 0, tw, l.h, l.alpha);
                        this.owner.render.drawBitmapPart(this.canvas, l.x + tw, l.y, l.w - r, 0, r, l.h, l.alpha);
                    } else
                    if (e === 1) {
                        this.owner.render.drawBitmapSize(this.canvas, l.x, l.y, l.w, l.h, l.alpha);
                    } else {
                        this.owner.render.drawBitmapPart(this.canvas, l.x, l.y, 0, 0, tw, l.h, l.alpha);
                        w = (l.w - tw - r) * e + r;
                        this.owner.render.drawBitmapPart(this.canvas, l.x + tw, l.y, l.w - w, 0, w, l.h, l.alpha);
                    }
                }
            }
        }
        UI.addUIDefaults.bind(ui)(UI, owner, name, settings);
        return ui;
    }
    
    var configure = function(){
        if (shapes === undefined) {
            shapes = groover.code.load("shapes2D");
        }
        groover.utils.styles.createNamedStylesFromList ([
            ["font","UIFont", "arial", 20, "white"],
            ["draw","UICheckBox", "Blue", "white", 2, 6, 0],
            ["draw","UICheckBoxChecked", "RED", "white", 2, 6, 3],
            ["draw","UICheckBoxUnchecked", "Green", "white", 2, 6, 5],
        ]);        
    }    
    return {
        create : create,
        configure : configure,
    };
})();