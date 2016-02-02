"use strict";
groover.GIF = function(){
    // used in de-interlacing. They are set here to avoid recreating them each frame
    var offsets = [0, 4, 2, 1];
    var steps = [8, 8, 4, 2];
    // simple buffered stream
    var Stream = function (data) {
        this.data = data;
        this.pos = 0;
        var len = data.length;
        this.getString = function(count){ // returns a string from current pos of len count
            var s = "";
            while(count --){
                s += String.fromCharCode(this.data[this.pos++]);
            }
            return s;
        };
        this.readSubBlocks = function(){  // reads a set of blocks as a string
            var size, count, data;
            data = "";
            do{
                count = size = this.data[this.pos++];
                while(count --){
                    data += String.fromCharCode(this.data[this.pos++]);
                }
            }while(size !== 0 && this.pos < len);
            return data;
        }
        this.readSubBlocksB = function(){ // reads a set of blocks as binary
            var size,count,data;
            data = [];
            do{
                count = size = this.data[this.pos++];
                while(count --){
                    data.push(this.data[this.pos++]);
                }
            }while(size !== 0 && this.pos < len);
            return data;
        }
                
    };    
    var st;  // holds the stream when loaed.

    // LZW decoder uncompresses each frames pixels
    // this needs to be optimised. 
    // minSize is the min dictionary as powers of two
    // size and data is the compressed pixels
    var lzwDecode = function (minSize, data) {
        var i, pos, out, clear, eod, size, done, dic, code, last,d, len;
        pos = 0; 
        out = [];
        dic = [];
        clear = 1 << minSize;
        eod = clear + 1;
        size = minSize + 1;
        done = false;
        while (!done) { // javascript optimisers like a clear exit though I never use done apart from fooling the optimiser
            last = code;
            code = 0;
            for ( i = 0; i < size; i++) {
                if (data[pos >> 3] & (1 << (pos & 7))) {
                    code |= 1 << i;
                }
                pos++;
            }            
            if (code === clear) {  // clear and reset the dictionary
                dic = [];
                size = minSize + 1;
                for ( i = 0; i < clear; i++) {
                    dic[i] = [i];
                }
                dic[clear] = [];
                dic[eod] = null;
                continue;
            }
            if (code === eod){  // end of data
                done = true;
                return out;
            }

            if (code >= dic.length){
                dic.push(dic[last].concat(dic[last][0]));
            }else
            if (last !== clear) {
                dic.push(dic[last].concat(dic[code][0]));
            }               
            d = dic[code]
            len = d.length;
            for ( i = 0 ; i < len ; i++ ) { // should use apply here but unsure about speed???
                out.push(d[i]);
            }
            if (dic.length === (1 << size) && size < 12) {
                size++;
            }
        }
        return out;  // for the optimiser
    };
    // get a colour table of length count
    var parseColourTable = function (count) { // Each entry is 3 bytes, for RGB.
        var colours = [];
        for (var i = 0; i < count; i ++ ) {
            colours.push([ st.data[st.pos ++], st.data[st.pos ++], st.data[st.pos ++] ]);
        }
        return colours;
    };        
    // read the header. This is the starting point of the decode and async calls parseBlock
    var parse = function () {
        var bitField
        st.pos += 6; // skip the first stuff see GifEncoder for details
        gif.width = (st.data[st.pos++]) + ((st.data[st.pos++]) << 8);
        gif.height = (st.data[st.pos++]) + ((st.data[st.pos++]) << 8);
        bitField = st.data[st.pos++];
        gif.colorRes = (bitField & 0b1110000) >> 4;
        gif.globalColourCount = 1 << ((bitField & 0b111) + 1);
        gif.bgColourIndex = st.data[st.pos++];
        st.pos++; // ignoring pixel aspect ratio. if not 0, aspectRatio = (pixelAspectRatio + 15) / 64
        if (bitField & 0b10000000) { // global colour flag
            gif.globalColourTable = parseColourTable(gif.globalColourCount);
        }
        setTimeout(parseBlock, 0);
    };    
    var parseAppExt = function () { // get appliction specific data. Netscape added iterations and terminator. Ignoring that
        st.pos += 1;
        if('NETSCAPE' === st.getString(8)) {
            st.pos += 8; // ignoring this data. iterations (word) and terminator (byte)            
        }else{            
            st.pos += 3;  // 3 bytes of string usualy "2.0" when identifier is NETSCAPE
            st.readSubBlocks();// unknown app extention
        }
    };    
    var parseGCExt = function () {
        var bitField;
        st.pos++;
        bitField = st.data[st.pos++];
        gif.disposalMethod = (bitField & 0b11100) >> 2;
        // ignoring bit two that is marked as  userInput???
        gif.transparencyGiven = bitField & 0b1 ? true : false;
        gif.delayTime = (st.data[st.pos++]) + ((st.data[st.pos++]) << 8);
        gif.transparencyIndex = st.data[st.pos++];
        st.pos++;
    };
    var parseImg = function () {
        var deinterlace, frame, bitField;
        deinterlace = function (pixels, width) {
            var newPixels, rows, cpRow, fromRow, pass, toRow;
            newPixels = new Array(pixels.length);
            rows = pixels.length / width;
            cpRow = function (toRow, fromRow) {
                var fromPixels;
                fromPixels = pixels.slice(fromRow * width, (fromRow + 1) * width);
                newPixels.splice.apply(newPixels, [toRow * width, width].concat(fromPixels));
            };
            fromRow = 0;
            for (pass = 0; pass < 4; pass++) {
                for (toRow = offsets[pass]; toRow < rows; toRow += steps[pass]) {
                    cpRow(toRow, fromRow)
                    fromRow++;
                }
            }
            return newPixels;
        };
        frame = {}
        gif.frames.push(frame);
        frame.disposalMethod = gif.disposalMethod;
        frame.delay = gif.delayTime;
        gif.totalDelay += frame.delay;
        if(gif.transparencyGiven){
            frame.transparencyIndex = gif.transparencyIndex;
        }else{
            frame.transparencyIndex = undefined;
        }
        frame.leftPos = (st.data[st.pos++]) + ((st.data[st.pos++]) << 8);
        frame.topPos = (st.data[st.pos++]) + ((st.data[st.pos++]) << 8);
        frame.width = (st.data[st.pos++]) + ((st.data[st.pos++]) << 8);
        frame.height = (st.data[st.pos++]) + ((st.data[st.pos++]) << 8);
        bitField = st.data[st.pos++];
        frame.localColourTableFlag =    bitField&0b10000000?true:false;;
        if (frame.localColourTableFlag) {
            frame.localColourTable = parseColourTable(1 << ((bitField&0b111) + 1));
        }
        frame.pixels = lzwDecode(st.data[st.pos++], st.readSubBlocksB());
        if ( bitField & 0b1000000) { // Move
            // Going to ignore this to find out how often it is used
            //frame.pixels = deinterlace(frame.pixels, frame.width);
        }
        processFrame(frame);
    };
    // creates a RGBA image from the indexed pixel data.
    var processFrame = function(frame){
        var ct, cData, dat, pixCount, ind, useT, i, pixel, pDat, col, frame, ti;
        frame.image = document.createElement('canvas');        
        frame.image.width = gif.width;
        frame.image.height = gif.height;
        frame.image.ctx = frame.image.getContext("2d");        
        ct = frame.localColourTableFlag ? frame.localColourTable : gif.globalColourTable; 
        if(gif.lastFrame === undefined){
            gif.lastFrame = frame;
        }
        useT = (gif.lastFrame.disposalMethod === 2 || gif.lastFrame.disposalMethod === 3)?true:false;
        //useT = (frame.disposalMethod === 2 || frame.disposalMethod === 3)?true:false;
        if(!useT){
            frame.image.ctx.drawImage(gif.lastFrame.image,0,0,gif.width,gif.height);
        }        
        //cData = gif.lastFrame.image.ctx.getImageData(frame.leftPos, frame.topPos, frame.width, frame.height);
        cData = frame.image.ctx.getImageData(frame.leftPos, frame.topPos, frame.width, frame.height);
        ti = frame.transparencyIndex;
        dat = cData.data;
        pDat = frame.pixels;
        pixCount = pDat.length;
        ind = 0;

        for( i = 0; i < pixCount; i++){
            pixel = pDat[i];
            col = ct[pixel];
            if (ti !== pixel) { 
                dat[ind++] = col[0];
                dat[ind++] = col[1];
                dat[ind++] = col[2];
                dat[ind++] = 255; // Opaque.
            } else 
            if (useT) {
                dat[ind + 3] = 0; // Transparent.
                ind += 4;
            } else {
                ind += 4;
            }
        }
        frame.image.ctx.putImageData(cData, frame.leftPos, frame.topPos);   
        gif.lastFrame = frame;
        frame.pixels = undefined;
        
        if(!gif.waitTillDone && typeof gif.onload === "function"){  // if !waitTillDone the call onload now after first frame is loaded
            doOnloadEvent();
        }
    };
    var finnished = function(){
        gif.loading = false;
        gif.frameCount = gif.frames.length;            
        gif.lastFrame = undefined;
        st = undefined;
        gif.complete = true;
        gif.disposalMethod = undefined;
        gif.transparencyGiven = undefined;
        gif.delayTime =   undefined;
        gif.transparencyIndex =  undefined;     
        gif.waitTillDone = undefined;
        doOnloadEvent();
        if(typeof gif.onloadall === "function"){
            (gif.onloadall.bind(gif))({type : 'loadall', path : [gif]});
        }                
    }
    var canceled = function(){
        finnished();
        if(typeof gif.cancelCallback === "function"){
            (gif.cancelCallback.bind(gif))({type : 'canceled', path : [gif]});
        }        
    }
    var parseExt = function(){
        switch (st.data[st.pos++]) {
            case 0xF9:
                parseGCExt();
                break;
            case 0xFE:
                gif.comment = st.readSubBlocks(); // found a comment field
                break;
            case 0xFF:
                parseAppExt();
                break;
            case 0x01:  // not keeping this data 
                st.pos+= 13;
            default:   // not keeping this if it happens
                st.readSubBlocks();
                break;
        }    
    }
    var parseBlock = function () {
        if(gif.cancel !== undefined && gif.cancel === true){
            canceled();
            return;
        }
            
        switch (st.data[st.pos++]) { 
            case 0x2c: // image block
                parseImg();
                if(gif.firstFrameOnly){
                    finnished();
                    return;
                }
                break;
            case 59:  // EOF found so cleanup and exit.
                finnished();
                return;
            case 0x21: // extened block 
            default:
                parseExt();
                break;
        }
        if(typeof gif.onprogress === "function"){
            gif.onprogress({bytesRead : st.pos, totalBytes : st.data.length, frame : gif.frames.length});
        }        
        setTimeout(parseBlock, 0); // parsing frame async so processes can get some time in.
    };        
    var cancelLoad = function(callback){
        if(gif.complete){
            return false;
        }
        gif.cancelCallback = callback;
        gif.cancel = true;
    }
    // fire onload event is set
    var doOnloadEvent = function(){
        gif.currentFrame = 0;
        gif.lastFrameAt = new Date().valueOf(); // just sets the time now
        gif.nextFrameAt = new Date().valueOf(); // just sets the time now
        if(typeof gif.onload === "function"){
            (gif.onload.bind(gif))({type : 'load', path : [gif]});
        }
        gif.onload = undefined;
        gif.onerror = undefined;
    }
    // fileSystem data loaded. Parse data or call onerror then exit.
    var dataLoaded = function(err,data){
        if(err === null){
            st = new Stream(data);
            parse();            
        }else{
            if(typeof gif.onerror === "function"){
                (this.onerror.bind(this))({type : 'error', path : [this]});
            }
            gif.onerror = undefined;
            gif.onload = undefined;
            gif.loading = false;
        }
    }
    var loadGif = function(filename){
        this.loading = true;
        fileSystem.readFile(this.src, dataLoaded.bind(this));
    }
    var gif = {
        src: null,
        onload : null,
        onerror : null,
        onprogress : null,
        onloadall : null,
        load : loadGif,
        cancel :cancelLoad, 
        waitTillDone : false,
        loading : false,
        width : null,
        height : null,
        frames : [],
        comment : "",
        totalDelay : 0,
        currentFrame : 0,
        lastFrameAt : new Date().valueOf(),
        nextFrameAt : new Date().valueOf(),
        firstFrameOnly : false,
    };
    return gif;
}