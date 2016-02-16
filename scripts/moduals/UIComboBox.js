(function () {  // CheckBox UI
    var shapes;
    var create = function (name, settings, UI, owner) {
        if (owner === undefined) {
            owner = UI;
        }
        
        UI.setupStyleDefaults(settings,[
            ["main","UIComboBox"],
            ["selected","UIComboBoxSelected"],
            ["highlight","UIComboBoxHighlight"],
            ["openClose","UIComboBoxOpenClose"],
            ["scrollBar","UIComboBoxScrollBar"],
            ["scrollHandle","UIComboBoxScrollHandle"],
            ["font","UIFont","copy"],
        ]);         

        settings.style.font.textAlign = "left";
        settings.height = settings.height === undefined ? settings.style.main.height : settings.height;
        settings.style.font.fontSize = Math.max(12, settings.height - Math.floor(settings.height / 3));
        settings.style.font.textAlign = "left";
        settings.style.font.textBaseline = "middle";


        var ui = {
            items : settings.items,
            openCloseWidth : 0,
            multiSelect : settings.multiSelect === undefined ? false : settings.multiSelect,
            selected : (function(){
                var arr = [];
                settings.items.forEach(function(){arr.push(false)});
                return arr;
            })(),
            selectedCount : 0,
            selectedIndex : null,
            open : false,
            openVal : 0,
            speed : 0.1,
            scrollPos : 0,
            scrollSize : 4,
            maxDisplayLines : settings.maxDisplayLines === undefined ? 10 : settings.maxDisplayLines,
            updateSelections : function(){
                var i,len;
                len = this.items.length;
                this.selectedCount = 0;
                this.selectedIndex = null;
                for(i = 0; i < len; i ++){
                    if(this.selected[i]){
                        this.selectedCount += 1;
                        if(this.selectedIndex === null){
                            this.selectedIndex = i;
                        }
                    }
                }
                this.dirty = true;
            },
            addItem : function(item){
                this.items.push(item);
                this.selected.push(false);
                this.updateSelections();
            },
            removeItem : function(index){
                if(index >= 0 && index < this.items.length){
                    this.items.splice(index,1);
                    this.selected.splice(index,1);
                    this.updateSelections();
                }
            },
                
            clearSelection : function(){
                var i,len;
                len = this.items.length;
                this.selectedCount = 0;
                this.selectedIndex = null;
                for(i = 0; i < len; i ++){
                    this.selected[i] = false;
                }
                this.dirty = true;
            },
            selectItem : function (index){
                if(index >= 0 && index < this.items.length){
                    if(!this.multiSelect){
                        this.clearSelection();
                    }
                    this.selected[index] = true;
                    this.updateSelections();
                    this.selectedIndex = index;

                }
            },
            deselectItem : function (index){
                if(index >= 0 && index < this.items.length){
                    this.selected[index] = false;
                }
                this.updateSelections();
            },

            setup : function () {
                if(this.canvas !== undefined){
                    this.location.set(this.x,this.y,undefined,this.height);
                }else{
                    var h = (this.maxDisplayLines + 1) * (this.style.font.fontSize + 2);
                    var w = groover.utils.styles.measureTextArray(this.items, this.style.font).max;
                    w += (this.style.main.inset + this.style.main.rounding)*2;
                    w += (this.openCloseWidth = (this.style.openClose.inset + this.style.openClose.rounding) * 2 + 10);
                    if(this.minWidth !== undefined){
                        w = Math.max(w,this.minWidth);
                    }
                    this.canvas = this.owner.createCanvas(w,h);
                    this.location.set(this.x,this.y,undefined,this.height);
                }
                if(this.updateMod !== undefined){
                    this.standardUpdate = this.update
                    this.update = this.updateMod;                    
                    this.updateMod = undefined;
                }
            },             
            redraw : function(){
                var w, ins, h, ch, ocw, selIns, highIns, opIns,scBIns,scHIns;
                w = this.canvas.width;
                ch = this.canvas.width;
                h = this.height;
                ocw = this.openCloseWidth;
                this.canvas.ctx.setTransform(1, 0, 0, 1, 0, 0);
                this.canvas.ctx.clearRect(0, 0, w, this.canvas.height);
                ins = this.style.main.inset + this.style.main.lineWidth;
                selIns = this.style.selected.inset + this.style.selected.lineWidth;
                highIns = this.style.highlight.inset + this.style.highlight.lineWidth;
                scBIns = this.style.scrollBar.inset + this.style.scrollBar.lineWidth;
                scHIns = this.style.scrollHandle.inset + this.style.scrollHandle.lineWidth;
                shapes.drawRectangle(this.canvas, ins, ins, w - ins * 2, h - ins * 2, this.style.main);
                groover.utils.styles.assignFontToContext(this.canvas.ctx, this.style.font);
                if(this.selectedIndex !== null){
                    this.canvas.ctx.fillText(this.items[this.selectedIndex], ins+4, h * 0.5);
                }
                opIns = this.style.openClose.inset + this.style.openClose.lineWidth;
                shapes.drawRectangle(this.canvas, (w - ocw) + opIns, opIns, ocw - opIns * 2, h - opIns * 2, this.style.openClose);
                
                if(this.openVal > 0){
                    ins = this.style.main.inset + this.style.main.lineWidth;
                    this.canvas.ctx.save();
                    this.canvas.ctx.beginPath();
                    this.canvas.ctx.rect(ins, h , w , (ch-h));
                    this.canvas.ctx.clip();
                    shapes.drawRectangle(this.canvas, ins, ins, w - ins * 2, ch - ins * 2, this.style.main);
                    shapes.drawRectangle(this.canvas, (w - ocw) + scBIns, scBIns, ocw - scBIns * 2, ch - scBIns * 2, this.style.scrollBar);
                    var sp = this.scrollPos;
                    var spS = this.scrollSize * h;
                    shapes.drawRectangle(this.canvas, (w - ocw) + scHIns, h + scHIns, ocw - scHIns * 2, spS - scHIns * 2, this.style.scrollHandle);
                    
                    this.canvas.ctx.restore();
                    groover.utils.styles.assignFontToContext(this.canvas.ctx, this.style.font);
                    w -= ocw;
                    for(var i = 0; i < this.maxDisplayLines; i++){
                        var pos = h + h * i;
                        if(i < this.items.length){
                            var item = this.items[i];
                            if(this.selected[i]){
                                shapes.drawRectangle(this.canvas, selIns,pos +  selIns, w - selIns * 2, h - selIns * 2, this.style.selected);
                                groover.utils.styles.assignFontToContext(this.canvas.ctx, this.style.selected);
                                this.canvas.ctx.fillText(item, ins+4, pos + h * 0.5);
                                
                            }else{
                                groover.utils.styles.assignFontToContext(this.canvas.ctx, this.style.font);
                                this.canvas.ctx.fillText(item, ins+4, pos + h * 0.5);
                            }
                        }
                    }
                    
                            
                }
                
                this.dirty = false;
            },
            clicked : function(){
                this.open = ! this.open;
                if(this.open){
                    //this.location.set(this.x,this.y,this.canvas.width,this.canvas.height);
                    this.dirty = true;
                    this.openVal += this.speed;
                    if(this.group !== undefined){
                        this.group.focusedOn = this;
                    }
                }else{
                    //this.location.set(this.x,this.y,this.canvas.width,this.height);                        
                    this.openVal -= this.speed;
                    if(this.group !== undefined){
                        if(this.group.focusedOn !== undefined && this.group.focusedOn.id === this.id){
                            this.group.focusedOn = undefined;
                        }
                    }
                }
            },
            updateMod : function() {
                if (this.ready) {
                    if(this.openVal > 0 && this.openVal < 1){
                        if(this.open){
                            this.openVal += this.speed;
                            if(this.openVal > 1){
                                this.openVal = 1;
                            }
                        }else{
                            this.openVal -= this.speed;
                            if(this.openVal < 0){
                                this.openVal = 0;
                                this.dirty = true;                                    
                            }
                        }
                        this.location.h = this.openVal * (this.canvas.height-this.height)+ this.height;
                        
                    }
                    if(this.open){
                        this.standardUpdate();
                        if(this.open && this.mouse.mouse.mousePrivate !== 0 && this.mouse.mouse.mousePrivate !== this.mouse.id){
                            this.clicked();
                        }
                        
                    }else{
                        this.standardUpdate();
                    }
                }
                    
            },
            display : function () {
                var e,c,w,l,h,R;
                if (this.ready) {
                    R = this.owner.render;
                    l = this.location;
                    w = this.canvas.width;
                    h = this.height;
                    var ch = this.canvas.height;
                    R.drawBitmapPart(this.canvas,l.x,l.y, 0,0,w,h,l.alpha);
                    if(this.openVal > 0){
                        if(this.openVal < 1){
                            e = this.openVal * (ch-h);
                            R.drawBitmapPart(this.canvas,l.x,l.y+h, 0,ch-e,w,e,l.alpha);
                        }else{
                            R.drawBitmapPart(this.canvas,l.x,l.y+h, 0,h,w,ch-h,l.alpha);
                        }                        
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
            ["draw","UIComboBox", "Blue", "white", 2, 6, 1],
            ["draw","UIComboBoxSelected", "RED", "white", 2, 6, 3],
            ["draw","UIComboBoxHighlight", "Green", "white", 2, 6, 5],
            ["draw","UIComboBoxOpenClose", "#999", "white", 2, 6, 0],
            ["draw","UIComboBoxScrollBar", "#999", "white", 2, 6, 2],
            ["draw","UIComboBoxScrollHandle", "#CCC", "white", 2, 4, 4],
        ]);
            
    }    
    return {
        create : create,
        configure : configure,
    };
})();