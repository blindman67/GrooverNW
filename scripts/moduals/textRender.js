(function(){  // **MODUAL** code will have use strit prefixed
    // important do not add anything above this line. Modual loading adds (use strict) and accepts the returned value of this function
    
    // renders formated text
    // style delimiter is #! to add a # use \#
    var ids = 1;
    var textRender = {
        fillText_OLD : function(ctx,text,x,y,styleInfo){
            var str = text.replace(/\\#/g," GGG ");
            var tLines = str.split("\n");
            var font = ctx.font;
            var fontSize = Number(font.split("px")[0]);
            var lineSize = Math.floor(fontSize * 1.2);
            var i;
            for(i = 0; i < tLines.length; i ++){
                tLines[i] = tLines[i].replace(/ GGG /g,"#");
                var width = ctx.measureText(tLines[i]).width;                
                ctx.fillText(tLines[i],x,y+i*lineSize);
            }
        },
        getExtent : function(ctx,text,x,y,styleInfo){
            var str = text.replace(/\\#/g," %%% ");
            var tLines = str.split("\n");
            var font = ctx.font;
            var fontSize = Number(font.split("px")[0]);
            var lineSize = Math.floor(fontSize * 1.2);
            var i;
            var maxWidth = -Infinity;
            for(i = 0; i < tLines.length; i ++){
                tLines[i] = tLines[i].replace(/ GGG /g,"#");
                var width = ctx.measureText(tLines[i]).width;
                maxWidth = Math.max(maxWidth,width);
            }
            return {width : maxWidth,height : tLines.length * lineSize};            
        },
        STYLES : {
            BOLD : ids ++,  // #B
            FILL : ids ++,  // #F  the segment string is repeated to fill to next segment or end of line
            BIG : ids ++, // #+
            ALIGN : {
                LEFT : ids ++,  // #AL
                CENTER : ids ++,// #AC
                RIGHT : ids ++, // #AR
            },
            VALIGN : {
               TOP : ids ++,
               MIDDLE : ids ++,
               BOTTOM : ids ++,
            }
        },
        characterSizes : {
        },
        measureCharacters : function(ctx){  // chars[0] is font size
            var font = ctx.font.split("px").pop().trim().replace(/ /g,"");
            var fontSize = Number(ctx.font.split("px")[0]);
            if(this.characterSizes[font] === undefined){
                var chars = [];
                for(var i = 32; i < 128; i ++){
                    var w = ctx.measureText(String.fromCharCode(i)).width;
                    if(i === 32){
                        chars.push(fontSize);
                        for(var j = 1; j < 32; j++){
                            chars.push(w);                            
                        }
                    }
                    chars.push(w);                            
                }
                this.characterSizes[font] = chars;
            }
            return this.characterSizes[font];
        },
        formatText : function(ctx,text){
            function addSeg(){
                if(str !== ""){
                    segs.push({
                        str : str,
                        width : width*scaleX,
                        y : line,
                        x : x,
                        sx : scaleX,
                        sy : scaleY,
                        styles : [].concat(styles),
                    });
                }
                lineWidth += width*scaleX;
                x += width*scaleX;
                width = 0;
                str = "";
            }
                        
            var segs = [];
            var i,c;
            var len;
            var line = 0;
            var seg = "";
            var sizes = this.measureCharacters(ctx);
            var styles = [];
            var width = 0;
            var scaleX = 1;
            var scaleY = 1;
            var lineWidth = 0;
            var lineSpace = 1.2;
            var maxLineSpace = lineSpace;
            var maxWidth = -Infinity;
            var str = "";
            var x = 0;
            len = text.length;
            for(i = 0; i < len; i++){
                c = text[i];
                if(c !== "#"){
                    if(c === "\\"){
                        i ++;
                        if(i < len){
                            c = text[i];
                        }else{
                            c = "";
                        }
                    }
                    if(c === "\n"){
                        addSeg();
                        maxWidth = Math.max(maxWidth,lineWidth);
                        lineWidth = 0;
                        line += sizes[0] * maxLineSpace;
                        maxLineSpace = lineSpace;
                        x = 0;
                        
                    }else{
                        str += c;
                        maxLineSpace = Math.max(lineSpace*scaleY,maxLineSpace);
                        if(c !== ""){
                            width += sizes[c.charCodeAt(0)];
                        }
                    }
                }else{
                    addSeg();
                    i ++;
                    if(i < len){
                        c = text[i].toUpperCase();
                    }else{
                        c = "";
                    }
                    c = c.toUpperCase();
                    if(c === "#"){
                        var ps = styles.pop();
                        if(ps === this.STYLES.BIG){
                            scaleX -= 0.2;
                            scaleY -= 0.2;
                        }
                    }else
                    if(c === "B"){
                        styles.push(this.STYLES.BOLD);
                    }else
                    if(c === "F"){
                        styles.push(this.STYLES.FILL);
                    }else
                    if(c === "+"){
                        styles.push(this.STYLES.BIG);
                        scaleX += 0.2;
                        scaleY += 0.2;
                    }else
                    if(c === "A"){
                        i ++;
                        if(i < len){
                            c = text[i].toUpperCase();
                        }else{
                            c = "L";
                        }
                        if(c === "L"){
                            styles.push(this.STYLES.ALIGN.LEFT);
                        }else
                        if(c === "C"){
                            styles.push(this.STYLES.ALIGN.CENTER);
                        }else
                        if(c === "R"){
                            styles.push(this.STYLES.ALIGN.RIGHT);
                        }
                    }
                }          
            }
            if(str !== ""){
                addSeg();
            }
            // Do a alignment pass
            for(i = 0; i < segs.length; i ++){
                var seg = segs[i];
                var s = seg.styles;
                for(var j = 0; j < s.length; j ++){
                    var ss = s[j];
                    if(ss === this.STYLES.ALIGN.LEFT){
                        seg.x = 0;
                    }else
                    if(ss === this.STYLES.ALIGN.RIGHT){
                        seg.x = maxWidth - seg.width;
                    }else
                    if(ss === this.STYLES.ALIGN.CENTER){
                        seg.x = maxWidth/2 - seg.width/2;
                    }else
                    if(ss === this.STYLES.BOLD){
                        seg.bold = true;
                    }                    
                }                    
            }
            // do a pass for fill text
            for(i = 0; i < segs.length; i ++){
                var seg = segs[i];
                var s = seg.styles;
                var sx,ex;
                for(var j = 0; j < s.length; j ++){
                    var ss = s[j];
                    if(ss === this.STYLES.FILL){
                        if(i === 0){
                            sx = 0;
                        }else{
                            sx = segs[i-1].x + segs[i-1].width;
                        }
                        if(segs[i + 1] === undefined){
                            ex = maxWidth;
                        }else{
                            if(segs[i+1].y === seg.y){
                                ex = segs[i+1].x;
                            }else{
                                ex = maxWidth;
                            }
                        }
                        var str = seg.str;
                        var pos = 0;
                        var len = seg.width;
                        while(len < (ex-sx)){
                            c = seg.str[pos%seg.str.length];
                            len += sizes[c.charCodeAt(0)];
                            if(len < (ex-sx)){
                                str += c;
                            }
                            pos += 1;
                        }
                        seg.str = str;
                        seg.width = len-sizes[c.charCodeAt(0)];
                        seg.x = sx;
                    }
                    
                }                    
            }
            return {
                width : maxWidth,
                height : line,
                text : segs,
            }
        },
        fillText : function(ctx,text,x,y,align){
            console.log(text);
            if(align === "center"){
                x -= text.width / 2;
            }else
            if(align === "right"){
                x -= text.width;
            }
            var alignSave = ctx.textAlign;
            ctx.textAlign = "left";
            for(var i = 0; i < text.text.length; i ++){
                var t = text.text[i];
                ctx.setTransform(t.sx,0,0,t.sy,t.x+ x,t.y+ y);
                if(t.bold){
                    ctx.fillText(t.str,-0.5,0);
                    ctx.fillText(t.str,0.5,0);
                    
                }else{
                    ctx.fillText(t.str,0,0);
                }
            }
            ctx.setTransform(1,0,0,1,0,0);
            ctx.textAlign = alignSave;
        }
        
    };
    return textRender;
})();
    
    
    