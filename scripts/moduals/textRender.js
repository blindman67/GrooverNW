(function(){  // **MODUAL** code will have use strict prefixed
    // important do not add anything above this line. Modual loading adds (use strict) and accepts the returned value of this function
    
    // renders formated text
    var ids = 1;
    var textRender = {
        STYLES : {  // comments show the format specifier which start with a { and then the format code/info
                    // then the text and then the format is closed with }
                    // Eg to have bold text "{BBold Text}" 
                    //    for right aligned "{ARThis text is aligned right}"
                    // The formats can be nested and will carry past new lines
                    // example of nesting "{+Big text {BNow bold and big{#F00 Now red bold and big} back to just bold and big} back to big} now just default"
            BOLD : ids ++,  // {B
            FILL : ids ++,  // {F  the segment string is repeated to fill to next segment or end of line
            BIG : ids ++, // {+   increase scale by 0.2
            SMALL : ids ++, // {-  decrease scale  by 0.1
            COLOR : ids ++, // {#FFF  Only supporting RGB short format. This will be expanded as the need arrises.
            ALIGN : {
                LEFT : ids ++,  // {AL
                CENTER : ids ++,// {AC
                RIGHT : ids ++, // {AR
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
            
            if(this.characterSizes[font+fontSize] === undefined){
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
                this.characterSizes[font+fontSize] = chars;
            }
            console.log(this.characterSizes);
            return this.characterSizes[font+fontSize];
        },
        formatText : function(ctx,text){
            var aligned = [];
            function addSeg(){
                var added = false;
                if(str !== ""){
                    segs.push({
                        str : str,
                        width : width*scaleX,
                        y : lineID,
                        x : x,
                        sx : scaleX,
                        sy : scaleY,
                        color : currentColour,
                        styles : [].concat(styles),
                    });
                    aligned.push(false);
                    added = true;
                }
                lineWidth += width*scaleX;
                x += width*scaleX;
                width = 0;
                str = "";
                return added;
            }
                        
            var segs = [];
            var colourStack = [];
            var currentColour = ctx.fillStyle;
            var i,c;
            var len;
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
            var lastLineAt = 0;
            var lineID = -1;
            var newLine = true;
            var str = "";
            var x = 0;
            len = text.length;
            for(i = 0; i < len; i++){
                c = text[i];
                if(c !== "{" && c !== "}"){
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
                        var k = segs.length -1;
                        var yy = lineID;
                        while(k >= 0 && segs[k].y === yy){
                            segs[k].y = lastLineAt + sizes[0] * maxLineSpace;
                            k -= 1;
                        }
                        lineID -= 1;
                        lastLineAt = lastLineAt + sizes[0] * maxLineSpace;
                        newLine = true;
                        maxWidth = Math.max(maxWidth,lineWidth);
                        lineWidth = 0;
                        maxLineSpace = lineSpace;
                        x = 0;
                        
                    }else{
                        newLine = false;
                        str += c;
                        maxLineSpace = Math.max(lineSpace*scaleY,maxLineSpace);
                        if(c !== ""){
                            width += sizes[c.charCodeAt(0)];
                        }
                    }
                }else
                if(c === "{"){
                    newLine = false;
                    addSeg();
                    i ++;
                    if(i < len){
                        c = text[i].toUpperCase();
                    }else{
                        c = "";
                    }
                    c = c.toUpperCase();
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
                    if(c === "-"){
                        styles.push(this.STYLES.SMALL);
                        scaleX -= 0.1;
                        scaleY -= 0.1;
                    }else
                    if(c === "#"){
                        styles.push(this.STYLES.COLOR);
                        var col = "#";
                        for(var k = 0; k < 3; k++){
                            i ++;
                            if(i < len){
                                col += text[i].toUpperCase();
                            }else{
                                col += "0";
                            }
                        }
                        colourStack.push(currentColour);
                        currentColour = col;
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
                }else{
                    newLine = false;
                    addSeg();
                    var ps = styles.pop();
                    if(ps === this.STYLES.COLOR){
                        currentColour = colourStack.pop();
                    }else
                    if(ps === this.STYLES.BIG){
                        scaleX -= 0.2;
                        scaleY -= 0.2;
                    }else
                    if(ps === this.STYLES.SMALL){
                        scaleX += 0.1;
                        scaleY += 0.1;
                    }
                }
                    
            }
            if(str !== ""){
                addSeg();
            }
            if(!newLine){  // set the baseline for last line
                var k = segs.length -1;
                var yy = lineID;
                while(k >= 0 && segs[k].y === yy){
                    segs[k].y = lastLineAt+ sizes[0] * maxLineSpace;
                    k -= 1;
                }
            }                        
                
            var aligned = [];
            var alignW;
            function getAjoinedAlignment(i,alignment){
                var k = i;
                var same = true;
                var line = segs[i].y;
                alignW = 0;
                while(k < segs.length && same){
                    same = false     
                    if(segs[k].y === line){
                        for(var j = 0; j < segs[k].styles.length; j ++){
                            if(segs[k].styles[j] === alignment){
                                alignW += segs[k].width;
                                same = true
                                break;                            
                            }
                        }
                    }
                    if(same){
                        k++;
                    }
                }
                return k;   
            }
            var STYLES = this.STYLES; // for the function 
            function positionSegs(i,j,alignment,totalW){
                var x = 0;
                if(alignment === STYLES.ALIGN.LEFT){
                    x = 0;
                }else
                if(alignment === STYLES.ALIGN.RIGHT){
                    x = maxWidth - totalW;
                }else
                if(alignment === STYLES.ALIGN.CENTER){
                    x = maxWidth/2 - totalW/2;
                }
                for(var k = i; k < j; k ++){
                    var seg = segs[k];
                    seg.x = x;
                    x += seg.width;
                    aligned[k] = true;
                }                
            }
            // Do a alignment pass
            for(i = 0; i < segs.length; i ++){
                var seg = segs[i];
                var s = seg.styles;
                for(var j = s.length-1; j >= 0; j --){
                    var ss = s[j];
                    if(ss === this.STYLES.ALIGN.LEFT || ss === this.STYLES.ALIGN.RIGHT || ss === this.STYLES.ALIGN.CENTER){
                        if(!aligned[i]){
                            var ii = getAjoinedAlignment(i,ss);
                            positionSegs(i,ii,ss,alignW);
                        }
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
                            if(segs[i-1].y === seg.y){
                                sx = segs[i-1].x + segs[i-1].width;
                            }else{
                                sx = 0;
                            }
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
                            len += sizes[c.charCodeAt(0)] * seg.sx;
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
            // do clean up pass
            for(i = 0; i < segs.length; i ++){
                var seg = segs[i];
                if(seg.str.trim() === ""){
                    segs.splice(i,1);
                    i--;
                }else{
                    seg.styles = undefined;
                }
            }
            console.log(segs);
            return {
                width : maxWidth,
                height : lastLineAt,
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
            var baseSave = ctx.textBaseline;
            var colSave = ctx.fillStyle;
            var lastCol = colSave;
            ctx.textAlign = "left";
            ctx.textBaseline = "alphabetic";
            for(var i = 0; i < text.text.length; i ++){
                var t = text.text[i];
                if(t.color !== lastCol){
                    ctx.fillStyle = t.color;
                    lastCol = t.color;
                }
                ctx.setTransform(t.sx,0,0,t.sy,t.x+ x,t.y+ y);
                if(t.bold){
                    ctx.fillText(t.str,-0.25,0);
                    ctx.fillText(t.str,0.25,0);
                    
                }else{
                    ctx.fillText(t.str,0,0);
                }
            }
            ctx.setTransform(1,0,0,1,0,0);
            ctx.textAlign = alignSave;
            ctx.textBaseline = baseSave;
            ctx.fillStyle = colSave;
        }
        
    };
    return textRender;
})();
    
    
    