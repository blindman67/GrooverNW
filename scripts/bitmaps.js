"use strict";
// for loading saving, manipulating, etc images, bitmaps,

function Bitmaps(owner){
    this.owner = owner;
    this.imageGroups = {};
    this.iEvent = this.imageEvent.bind(this);
    this.imageProcessor = imageProcessing;
    this.ready = true;
    log("Bitmap manager ready");
}

// some image tools used for code migration.
Bitmaps.prototype.imageTools = {
    canvas : function (width, height) {  // create a blank image (canvas)
        var c = document.createElement("canvas");
        c.width = width;
        c.height = height;
        return c;
    },
    createImage : function (width, height) {
        var image = this.canvas(width, height);
        image.ctx = image.getContext("2d");
        return image;
    },
    loadImage : function (url, callback) {
        var image = new Image();
        image.src = url;
        image.addEventListener('load', cb);
        image.addEventListener('error', cb);
        return image;
    },
    image2Canvas : function (img) {
        var image = this.canvas(img.width, img.height);
        image.ctx = image.getContext("2d");
        image.drawImage(ig, 0, 0);
        return image;
    },
    imageDat : function (image) { // returns only the data. You can not put it back 
        return (image.ctx || (this.image2Canvas(image).ctx)).getImageData(0, 0, image.width, image.height).data;
    },    
    imageData : function (image) {
        return (image.ctx || (this.image2Canvas(image).ctx)).getImageData(0, 0, image.width, image.height);
    },    
}
// creates a new image group replacing existing group if it exists.
Bitmaps.prototype.createImageGroup = function(name){
    this.imageGroups[name] = {
        list : [],
        callbacks : [],
        loadingCount : 0,
    }
    return this.imageGroups[name];    
}

// removes failed and images marked as remove from a group.
// If there is a referance to the image outside bitmaps then this will not delete the image,
Bitmaps.prototype.cleanImageGroup = function(imageGroup){
    var i;
    for(i = 0; i < imageGroup.list.length; i++){
        var image = imageGroup.list[i];
        if(image.failed || image.remove){
            if(image.name !== undefined){
                if(imageGroup.named !== undefined){
                    if(imageGroup.named[image.name] !== undefined){
                        imageGroup.named[image.name] = undefined;
                    }
                }
            }
            imageGroup.list.splice(i,1);
            i -= 1;
        }
    }
}
// gets an image group by name or creates a new image group if it does not exist.
Bitmaps.prototype.getGroup = function(groupName){
    var imageGroup = this.imageGroups[groupName];
    if(imageGroup === undefined){
        imageGroup = this.createImageGroup(groupName);
    }
    return imageGroup;
}

// updates a group with new image calling callbacks if needed
Bitmaps.prototype.updateGroup = function(group,image,status){
    if(image.callback !== undefined){
        image.callback(status,image,group);
    }else
    if(image.callbacks !== undefined){
        while(image.callbacks.length > 0){
            image.callbacks.shift()(status,image,group);
        }
    }
        
    group.loadingCount -= 1;
    if(group.loadingCount === 0){
        this.cleanImageGroup(group);
        while(group.callbacks.length > 0){
            group.callbacks.shift()(group);
        }
    }        
}
// DOM or Groover image event to indicate if image has loaded or  failed.
Bitmaps.prototype.imageEvent = function(event){
    var i;

    if(event.type === "load" || event.type === "canplay"){
        var imgs = event.path;
        for(i = 0; i < imgs.length; i++){
            var img = imgs[i];
            var image = img.self;
            image.ready = true;
            var group = image.group;            
            if(image.video){
                image.image.muted = true;
                image.image.height =image.image.videoHeight;
                image.image.width = image.image.videoWidth;
            }
            this.updateGroup(group,image,null);
        }
    }else
    if(event.type === "error"){
        var imgs = event.path;
        for(i = 0; i < imgs.length; i++){
            var img = imgs[i];
            var image = img.self;
            img.self = undefined;
            image.ready = false;
            image.failed = true;
            //log("Failed to load image:'"+image.filename+"'");
            var group = image.group;
            this.updateGroup(group,image,"error");       
        }        
    }   
}


// Starts the liading of images to a group.
Bitmaps.prototype.startLoad = function(group,callback){
    var imageGroup = this.getGroup(group);
    imageGroup.callbacks.push(callback);
    if(imageGroup.loadingCount === 0){
        imageGroup.fresh = [];
    }
    return imageGroup;
}
// adds a callback to an image.
// the callback has the form 
//     callback(status,image,group)
//     status is null is all ok or String "error"  //more to come 
//     image is the bitmap image format. the DOM/groover image is image.image
//     group is the image group that the image belongs to
Bitmaps.prototype.addCallback2Image = function(image,callback){
    if(image.callback !== undefined){
        image.callbacks = [image.callback,callback];
        image.callback = undefined;
    }else
    if(image.callbacks !== undefined){
        image.callbacks.push(callback);
    }else{
        image.callback = callback;
    }
    
}
// 
// w and h are widtth and height
// see next this.load function for details on what this function does
Bitmaps.prototype.create = function(group,w,h,name,data){
    var image, imageGroup, iEvent;
    imageGroup = this.getGroup(group);
    if(name !== undefined && typeof name === "string"){  // if a named image check if it exists
        if(imageGroup.named !== undefined){
            if(imageGroup.named[name] !== undefined){
                image = imageGroup.named[name];
                return image;                        
            }
        }
    }    
    
    var image = {};
    image.image = document.createElement("canvas");
    image.image.width = w;
    image.image.height = h;
    image.image.ctx = image.image.getContext("2d");
    image.image.self = image;    
    image.filename = "";
    if(image.image.data === undefined && data !== undefined){
        image.data = data;
    }
    image.group = imageGroup;
    image.name = name;
    if(image.name !== undefined){  // add named image to group's named list
        if(image.group.named === undefined){
            image.group.named = {};
        }
        image.group.named[image.name] = image;
    }      
    imageGroup.list.push(image);
    image.ready = true;
    return image;
}

// load an image animation, movie, gif.
// group is the name (as string) of the group that the image will be stored in.
// filename (as string is the filename of the image)
// filename (as image is an image that will be attached to the group)
// [name] optional. Is the name of the image. If the name is given then the function will
//                  check if it exists already and use the existing (loaded or not) image reather then duplicate it
// [callback]  optional is the callback that is called when the image has loaded or there is an error
//           the callback will be passed two arguments the first is null is no error and second is the
//           image container.
// [data] optional data to be attached to the image or animation.
//
// returns the imageContainer.
// each image type has differing requierments so check out the examples to see how to use
//


Bitmaps.prototype.load = function(group,filename,name,callback,data){
    var image, imageGroup;
    imageGroup = this.getGroup(group);

    if(name !== undefined && typeof name === "string"){  // if a named image check if it exists
        if(imageGroup.named !== undefined){
            if(imageGroup.named[name] !== undefined){
                image = imageGroup.named[name];
                if(image.ready){
                    this.addCallback2Image(image,callback);
                    imageGroup.loadingCount += 1;
                    this.updateGroup(imageGroup,image,null);
                    return image;
                }else
                if(image.failed){ // Need to workout what to do with failed images
                    return image;
                }else{   // image is still loading                    
                    this.addCallback2Image(image,callback);
                    return image;                        
                }
            }
        }
    }
    if(typeof filename !== "string" && filename.length !== undefined){
        image = {
            image : new groover.animation(),
            animation : true,
        };
        image.image.src = filename;
        image.image.data = data;
        image.image.onload = this.iEvent;
        image.image.onerror = this.iEvent;
        image.image.onprogress = function(event){
            groover.busyMessage = "Frame "+event.frame + " "+ Math.floor((event.bytesRead/event.totalBytes)*100)+"%";
        };
        image.image.load();
    }else
    if(typeof filename !== "string"){
        if(filename.ctx !== undefined || filename.src !== undefined){
            image = {
                image : filename,
            };
            filename = "";
            var iE = this.iEvent;
            setTimeout(function(){ iE.bind(image.image)({type:"load",path:[image.image]})},10);
        }else{
            throw new Error("Bitmaps load passed a bad filename argument");
        }
    }else    
    if(filename.toLowerCase().indexOf(".gif") > -1){  // this is an animated gif
        image = {
            image : new groover.GIF(),
            animation : true,
        };
        image.image.src = filename;
        image.image.onload = this.iEvent;
        image.image.onerror = this.iEvent;
        image.image.onprogress = function(event){
            groover.busyMessage = "Frame "+event.frame + " "+ Math.floor((event.bytesRead/event.totalBytes)*100)+"%";
        };
        image.image.load();
    }else
    if(filename.toLowerCase().indexOf(".webm") > -1){  
        image = {
            image : document.createElement('video'),
            video: true,
        };
        image.image.src = filename;
        image.image.oncanplay = this.iEvent;
        image.image.onerror = this.iEvent;
    }else{    
        image = {
            image : new Image(),
        };
        image.image.src = filename;    
        image.image.onload = this.iEvent;
        image.image.onerror = this.iEvent;
    }
    image.image.self = image;    
    image.filename = filename;
    if(image.image.data === undefined && data !== undefined){
        image.data = data;
    }
    image.group = imageGroup;
    image.callback = callback;
    image.name = name;
    if(image.name !== undefined){  // add named image to group's named list
        if(image.group.named === undefined){
            image.group.named = {};
        }
        image.group.named[image.name] = image;
    }      
    imageGroup.list.push(image);
    imageGroup.loadingCount += 1;
    return image;
}


// images are saved via the blocking fileSystem.writeFileSync call and should 
// not be called while ding realtime rendering

// saves an animation
Bitmaps.prototype.saveAnimationFramesAs = function(image,filename,type,quality){
    var urlData,validTypes,dataType,fileStats,dirStats,i,frame,filenameBase;
    validTypes = ["png","jpeg","jpg","webp"];
    if(!image.animation){
        console.log("Cannot save as this is not an animation");
        image.saveError = "Cannot save as this is not an animation";
        return false;        
    }
    if(filename === null || filename === undefined || filename === ""){
        image.saveError = "Cannot save animation. Bad filename";
        return false;        
    }
    filenameBase = path.parse(filename);
    try{
        dirStats = fileSystem.statSync(filenameBase.dir);
        if(!dirStats.isDirectory()){
            console.log("Directory "+filenameBase.dir+" does not exist.");
            image.saveError = "No such directory";
            return false;
        }
    }catch(e){
        filenameBase.dir = groover.utils.files.imageSaveDirectory;
    }
    filename = filename.dir + "\\" + filename.name;
    var len = image.image.frames.length;
    var numPad = (""+len).length;
    for(i = 0; i < len; i++){
        frame = image.image.frames[i];
            
        if(frame.image.ctx === undefined){
            frame.image = this.imageProcessor.makeDrawable(frame.image);
        }
        filename = filenameBase.dir + "\\" + filenameBase.name + mMath.padNumber(i,numPad);
        if(type === undefined){
            type = "png";
        }else{
            type = type.toLowerCase();
            if(validTypes.indexOf(type) === -1){
                type = "jpg";
            }
        }
        filename = filename + "." + type;

        if(type !== "png"){
            if(quality === undefined){
                quality = 0.5;
            }
            dataType = "image/"+type;
            if(type === "jpg"){
                dataType = "image/jpeg";
            }
            urlData = new Buffer(frame.image.toDataURL(dataType, quality).replace(/^data:image\/(jpg|jpeg|webp);base64,/, ''), 'base64');
        }else{
            urlData = new Buffer(frame.image.toDataURL('image/' + type).replace(/^data:image\/png;base64,/, ''), 'base64');
        }
        try{
            fileSystem.writeFileSync(filename, urlData);
        }catch(e){
            image.saveError = e.message;
            return;        
        }
    }
    if(image.saveError !== undefined){
        image.saveError = undefined;
    }
    image.dirty = false;
    image.filename = filenameBase.dir + "\\" + filenameBase.name + mMath.padNumber(i,numPad);
}    

// save an image
Bitmaps.prototype.saveImageAs = function(image,filename,type,quality){
    var urlData,validTypes,dataType,fileStats,dirStats;
    validTypes = ["png","jpeg","jpg","webp"];
    if(image.animation){
        console.log("saveImageAs does not save animations");
        image.saveError = "Animated image use saveAnimation";
        return;        
    }
    if(image.image.ctx === undefined){
        image.image = this.imageProcessor.makeDrawable(image.image);
    }
    if(filename === undefined || filename === null || filename === ""){
        if(image.filename === undefined || image.filename === null || image.filename === ""){
            if(groover.directories.currentProject === null){
                filename = path.format( path.addFilename2Path( groover.directories.scratch, "grooverImage"+ groover.utils.IDS.getUID()));
            }else{
                filename = path.format( path.addFilename2Path( groover.directories.currentProject.images, "grooverImage"+groover.utils.IDS.getUID()));
            }
        }else{
            filename = image.filename;
        }
    }
    filename = path.parse(filename);
    dirStats = fileSystem.statSync(filename.dir);
    if(!dirStats.isDirectory()){
        console.log("Directory "+filename.dir+" does not exist.");
        image.saveError = "No such directory";
        return;
    }
    filename = filename.dir + "\\" + filename.name;
    if(type === undefined){
        type = "png";
    }else{
        type = type.toLowerCase();
        if(validTypes.indexOf(type) === -1){
            type = "jpg";
        }
    }
    filename = filename + "." + type;
    try{
        fileStats = fileSystem.statSync(filename);
        image.imageError = "File exists";
        return;
    }catch(e){
        // file does not exist so safe to write???
    }
    if(type !== "png"){
        if(quality === undefined){
            quality = 0.5;
        }
        dataType = "image/"+type;
        if(type === "jpg"){
            dataType = "image/jpeg";
        }
        urlData = new Buffer(image.image.toDataURL(dataType, quality).replace(/^data:image\/(jpg|jpeg|webp);base64,/, ''), 'base64');
    }else{
        urlData = new Buffer(image.image.toDataURL('image/' + type).replace(/^data:image\/png;base64,/, ''), 'base64');
    }
    log("URL Size:"+urlData.length);
    try{
        fileSystem.writeFileSync(filename, urlData);
    }catch(e){
        console.log("Error saving file:'"+filename+"'");
        console.log("Error:"+e.message);   
        image.saveError = e.message;
        return;        
    }
    if(image.saveError !== undefined){
        image.saveError = undefined;
    }
    image.dirty = false;
    image.filename = filename;
    log("Saved image as "+image.filename);   
}

// Image processing utilities
var imageProcessing = {
    createImage : function(w,h){
        var newI = document.createElement("canvas");
        newI.width = w;
        newI.height =h;
        newI.ctx = newI.getContext("2d");
        return newI;                
    },
    makeDrawable : function(image){
        var w = image.width;
        var h = image.height;
        var self = image.self;
        var newI = this.createImage(w, h);
        newI.ctx.drawImage(image, 0, 0);
        newI.self = self;
        return newI;
    },
    half : function(image){
        var w = image.width;
        var h = image.height;
        var self = image.self;
        if (image.ctx === undefined) {
            image = imageProcessing.makeDrawable(image);
        }
        var data = image.ctx.getImageData(0, 0, w, h);
        var d = data.data;
        var x, y;
        var ww = w * 4;
        var ww4 = ww + 4;
        for (y = 0; y < h; y += 2) {
            for (x = 0; x < w; x += 2) {
                var id = y * ww + x * 4;
                var id1 = Math.floor(y / 2) * ww + Math.floor(x / 2) * 4;
                d[id1] = Math.sqrt((d[id] * d[id] + d[id + 4] * d[id + 4] + d[id + ww] * d[id + ww] + d[id + ww4] * d[id + ww4]) / 4);
                id += 1;
                id1 += 1;
                d[id1] = Math.sqrt((d[id] * d[id] + d[id + 4] * d[id + 4] + d[id + ww] * d[id + ww] + d[id + ww4] * d[id + ww4]) / 4);
                id += 1;
                id1 += 1;
                d[id1] = Math.sqrt((d[id] * d[id] + d[id + 4] * d[id + 4] + d[id + ww] * d[id + ww] + d[id + ww4] * d[id + ww4]) / 4);
                id += 1;
                id1 += 1;
                d[id1] = Math.sqrt((d[id] * d[id] + d[id + 4] * d[id + 4] + d[id + ww] * d[id + ww] + d[id + ww4] * d[id + ww4]) / 4);
            }
        }
        image.ctx.putImageData(data, 0, 0);
        var data = image.ctx.getImageData(0, 0, Math.floor(w / 2), Math.floor(h / 2));
        var newI = this.createImage(Math.floor(w / 2), Math.floor(h / 2));
        newI.ctx.putImageData(data, 0, 0);
        newI.ready = true;
        newI.self = self;
        self.dirty = true;
        return newI;
    }    
}    
// very ugly code. Must do something to this.
// encoding of images will remain. Though tempted to depreciate there is good arguments
// to keep this format for the time being as it is more suited to Web development
// 
Bitmaps.prototype.onLoadCreateSprites1 = function(status,image){
    if(status === null){
        if(image.image.sprites === undefined){
            this.checkAndDecodeSpriteData(image);
        }
    }    
}

// helper function to be called when image has loaded.
// Creates sprite list for the image
Bitmaps.prototype.onLoadCreateSprites = function(status,image){
    if(status === null){
        if(image.image.sprites === undefined){
            if(image.data && image.data.spriteCutter){
                if(image.data.spriteCutter.how.toLowerCase() === "grid"){
                    this.gridSpriteCutter(image);
                }else
                if(image.data.spriteCutter.how.toLowerCase() === "horizonal"){
                    this.horizontalSpriteCutter(image);
                }else
                if(image.data.spriteCutter.how.toLowerCase() === "decode"){
                    this.checkAndDecodeSpriteData(image);
                }else
                if(image.data.spriteCutter.how.toLowerCase() === "file"){
                    this.loadSpriteList(image);
                }
            }else{
                this.horizontalSpriteCutter(image);
            }
        }
    }    
}

// depreciated function. Will remove as sone as demos have been changed
Bitmaps.prototype.onLoadCreateHSprites = function(status,image){
    if(status === null){
        if(image.image.sprites === undefined){
            this.horizontalSpriteCutter(image);
        }
    }    
}
Bitmaps.prototype.horizontalSpriteCutter = function(image){
    var sprites, start, w, h, x, y,ctx, canvas, data
    function defaultSprite(){
        sprites = [{
            x:0,
            y:0,
            h:image.image.height,
            w:image.image.width,
        }];
    }
    if(image.animation || image.video){
        return undefined;
    }
    var filename = image.data.spriteCutter.filename;
    if(filename === undefined){
        if(image.filename){
            filename = path.parse(filename);
            filename = filename.dir + "\\" + filename.name;
            filename += ".json";
        }else{
            return undefined;
        }
    }
    if(!groover.utils.files.doesFileExist(filename)){
        // if file can not be found then create a sprite that is the whole image
        defaultSprite();
    }else{
        sprites = groover.utils.files.loadJson(filename);
        if(sprites === undefined){
            defaultSprite();
        }
    }
    image.image.sprites = sprites;
    image.hasSprites = true;
    image.spriteCount = sprites.length;    
    return sprites;    
    
}
// Cuts image into sprites by finding the alpha = 0 gaps 
Bitmaps.prototype.horizontalSpriteCutter = function(image){
    var sprites, start, w, h, x, y,ctx, canvas, data
    if(image.animation || image.video){
        return undefined;
    }
    log("Horizontal sprite cutter on: '"+ image.filename + "'");
    
    sprites = [];
    w = image.image.width;
    h = image.image.height;
    canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = 1;
    ctx = canvas.getContext("2d");
    for(y = 0; y < h; y++){
        ctx.drawImage(image.image,0,-y);
    }
    data = ctx.getImageData(0,0,w,1).data;
    start = -1;
    for(x = 0; x < w+1; x++){
        if(x === w || data[x*4+3] === 0){
            if(start !== -1){
                sprites.push({
                    x:start,
                    y:0,
                    h:h,
                    w:x-start,
                });
                start = -1;
            }
        }else{
            if(start === -1){
                start = x;
            }
        }
    }
    image.image.sprites = sprites;
    image.hasSprites = true;
    image.spriteCount = sprites.length;
    return sprites;
}

// image must have the following structered object for cutting info in image.data
// spriteCutter = {
//    pixelWidth : ?  // Prefered optional. Sprite pixel width
//    pixelHeight : ? // option but requiered with above. sprites pixel height
//    widthCount : ?  // if not pixelWidth then image is cut into width count slices. sprite size is calaculated
//                       form floor(image.width / widthCount)
//    heightCount : ?  // same as above
//    repackwidth : ?    // optional Boolean if true resizes sprite to trim transparent left and right edges
//    repackHeight : ?   // same as above for top bottom pixel
//  }

Bitmaps.prototype.gridSpriteCutter = function(image){
    var sprites, w, h, x, y,hCount,wCount,pixelW,pixelH,canvas,ctx,repackW,repackH,top,left,bot,right,data,xx,yy,ind;
    if(image.animation || image.video){
        return undefined;
    }
    log("Grid sprite cutter on: '"+ image.filename + "'");
    sprites = [];
    w = image.image.width;
    h = image.image.height;
    if(image.data.spriteCutter.pixelWidth !== undefined){
         pixelW = image.data.spriteCutter.pixelWidth;
         pixelH = image.data.spriteCutter.pixelHeight;
         hCount = Math.floor(h/pixelH);
         wCount = Math.floor(w/pixelW);         
    }else{
         wCount = image.data.spriteCutter.widthCount;
         hCount = image.data.spriteCutter.heightCount;
         pixelH = Math.floor(h/hCount);
         pixelW = Math.floor(w/wCount);         
    }
    if(image.data.spriteCutter.repackWidth || image.data.spriteCutter.repackHeight){
        repackW = image.data.spriteCutter.repackWidth;
        repackH = image.data.spriteCutter.repackHeight;
        canvas = document.createElement("canvas");
        canvas.width = pixelW;
        canvas.height = pixelH;
        ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;  
    }
    for(y = 0; y < hCount ; y++){
        for(x = 0; x < wCount; x++){
            if(repackW || repackH){
                ctx.clearRect(0,0,pixelW,pixelH);
                ctx.drawImage(image.image,-x*pixelW,-y*pixelH);
                data = ctx.getImageData(0,0,pixelW,pixelH).data;
                top = 0;
                bot = 0;
                left = pixelW;
                right = 0;
                for(yy = 0; yy < pixelH; yy++){ 
                    for(xx = 0; xx < pixelW; xx++){
                        ind = yy * 4 * pixelW + xx * 4;
                        if(data[ind + 3] > 0){
                            if(top === undefined){
                                top = y;
                            }
                            if(xx < left){
                                left = xx;
                            }
                            if(xx > right){
                                right = xx;
                            }
                            bot = yy;
                        }
                    }
                }
                if(!repackW){
                    left = 0;
                    right = pixelW;
                }
                if(!repackH){
                    top = 0;
                    bot = pixelH;
                }
                sprites.push({
                    x:x*pixelW + left,
                    y:y*pixelH + top,
                    w:right-left,
                    h:bot-top,
                });
            }else{
                sprites.push({
                    x:x*pixelW,
                    y:y*pixelH,
                    w:pixelW,
                    h:pixelH,
                });
            }
        }
    }
    image.image.sprites = sprites;
    image.hasSprites = true;
    image.spriteCount = sprites.length;
    return sprites;
    
}
    
    
// Trying to avoid using this function. Here for legacy sprites. Groover Designer has option for packing
// sprite with JSON description file. If you need to have packed variable sized sprites select do it
// with the JSON descriptor rather than the encoding the image as eventualy this will be removed as
// I find it very clunky.
Bitmaps.prototype.checkAndDecodeSpriteData = function(image){
    var w,h,canavs,ctx,indx,imData,nd,i,line,prefix,same,packetSize,bigData,sprites,groups;
    var spritesPerLine,reading,ccc,groupNum,old,first,first1,first2,ns,canvas;
    var vals = [0x80,0x40,0x20,0x10,0x08,0x04,0x02,0x01];
    w = image.image.width;
    h = image.image.height;
    canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = 1;
    ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;  
    ctx.drawImage(image.image,0,(-h)+1);
    imData = ctx.getImageData(0,0,w,1).data;
    packetSize = 18;
    prefix = "Groover";    
    indx = w * 4 - 64;
    var readByte = function(){
        var j,b = 0;
        for(j = 0; j < 8; j++){
            b += imData[indx++] > 128 ? vals[j] : 0;
        }
        return b;
    }
    var readByte1 = function(){
        var j,b = 0;
        for(j = 0; j < 8; j++){
            b += bigData[indx++] > 128 ? vals[j] : 0;
        }
        return b;
    }
    var readNibit = function(){
        var j,b = 0;
        for(j = 0; j < 4; j++){
            b += imData[indx++] > 128 ? vals[j] : 0;
        }
        return b;
    }
    var readPix = function(daa){
        return {
            x : ((daa[0] & 0xff) << 4) + ((daa[1] >>4 ) & 0xf),
            y : ((daa[1] & 0xf) << 8) + (daa[2] & 0xff),
        };
    }    
    
    // check for prefix
    nd = [];
    for( i = 0; i < 8; i++){
        nd[i] = readByte();    
    }
    line = nd[0]-1;
    same = true;
    for(i = 0; i < prefix.length; i++){
        if(prefix.charCodeAt(i) !== nd[i+1]){
            return false;
        }
    }
    bigData = [];
    while (line > 0){
        ctx.clearRect(0,0,w,1);
        ctx.drawImage(image.image,0,-(h-line));
        imData = ctx.getImageData(0,0,w,1).data;
        for(i = 0; i < w*4; i++){
            bigData.push(imData[i]);
        }
        line-=1;        
    }
    indx = 4;
    sprites = [];
    groups = [];
    spritesPerLine = Math.floor((w-8)/packetSize);
    reading = true;
    ccc= 0;
    groupNum = -1;
    line = 0;
    old = indx;
    while ( reading  && indx < bigData.length){
        first = readPix([readByte1(),readByte1(),readByte1()]);
        first1 = readPix([readByte1(),readByte1(),readByte1()]);
        first2 = readPix([readByte1(),readByte1(),readByte1()]);
        if(first1.x === 0 || first1.y === 0){
            reading = false;
        }else{
            ccc++;
            if(ccc=== spritesPerLine){
                line+= 1;
                indx += (w-(packetSize*spritesPerLine))*4;
                ccc = 0;
                old = indx;
            }
            if((first2.x & 0x800)=== 0x800){ // this is a group description
                first2.x = first2.x & 0x7ff;
                groups.push({x:first.x,y:first.y,w:first1.x,h:first1.y});
            }else{
                if((first2.y & 0x800)=== 0x800){
                    groupNum += 1;
                }
                first2.y = first2.y & 0x7ff;
                sprites.push({x:first.x,y:first.y,w:first1.x,h:first1.y,b:first2.x,s:first2.y,g:groupNum});
            }
        }
    }
    ns = this.fixSpriteList(sprites);    
    image.image.sprites = ns.sprites;
    image.image.spriteGroups = ns.spriteGroups;
    image.hasSprites = true;
    image.spriteCount = ns.sprites.length;
    return true;
}
Bitmaps.prototype.fixSpriteList = function(inSprites,outSprites){
    var ns,spriteGroups,ss,s,n,i;
    if(outSprites !== undefined){
        ns = outSprites;
    }else{
        ns = [];
    }
    spriteGroups = [];
    ss = inSprites;
    for(i = 0; i < ss.length; i++){
        s = ss[i];
        n = {};
        n.x = s.x;
        n.y = s.y;
        n.w = s.w;
        n.h = s.h;
        if(ss.rx === undefined){
            n.rx = s.x;
            n.ry = s.y;
            n.rw = s.w;
            n.rh = s.h;
        }
        n.g = s.g;
        if(s.g > -1){
            if(spriteGroups[s.g ] !== undefined){
                spriteGroups[s.g ].start = Math.min(i,spriteGroups[s.g].start);
                spriteGroups[s.g ].end = Math.max(i,spriteGroups[s.g].end);
            }else{
                spriteGroups[s.g] = {start:undefined,end:undefined};
                spriteGroups[s.g ].start = i;
                spriteGroups[s.g ].end = i;
            }
        }
        n.b = s.b;
        ns.push(n);
    }
    return {sprites:ns,spriteGroups:spriteGroups};
}

// returns a image animation object.
groover.animation = function(){
    var imageCount = 0;
    var loadCount = 0;
    var handledCount = 0;
    var loading = [];
    function fireProgress(){
        if(typeof animation.onprogress === "function"){
            animation.onprogress({bytesRead : handledCount, totalBytes : imageCount, frame : loadCount});
        }
    }
    function fireOnload(done){
        animation.currentFrame = 0;
        animation.lastFrameAt = new Date().valueOf(); // just sets the time now
        animation.nextFrameAt = new Date().valueOf(); // just sets the time now        
        if((done || ! animation.waitTillDone) && typeof animation.onload === "function"){
            (animation.onload.bind(animation))({type : 'load', path : [animation]});
        }
    }
    function stackFrames(){
        var i;
        var next = animation.frames.length;
        for(i = next; i < loading.length; i++){
            if(loading[i].loaded){
                animation.frames.push({
                    image:loading[i].image,
                    delay:loading[i].delay,
                    data:loading[i].data,
                });
                if(animation.frames.length === 1){
                    fireOnload();
                }
            }else
            if(animation.ignoreMissing && loading[i].error){
            }else{
                return;
            }
        }        
    }
    function imageEvent(event){
        handledCount += 1;
        if(event.type === "load"){
            loadCount += 1;
            this.self.loaded = true;
        }else
        if(event.type === "error"){
            if(animation.errors === undefined){
                animation.errors = [];
            }
            animation.errors.push(this.self);
            this.self.error = true;
        }
        stackFrames();
        setTimeout(fireProgress,0);
        if(handledCount === imageCount){
            if(!animation.ignoreMissing && animation.errors !== undefined && typeof animation.onerror === "function"){
                (animation.onerror.bind(animation))({type : 'error', path : [animation]});
                animation.onerror = undefined;
                animation.onload = undefined;
            }
            animation.complete = true;
            animation.frameCount = animation.frames.length;
            fireOnload(true);
        }
    }
    
    function addImage(filename,data){
        var image,frame;        
        image = new Image();
        image.src = filename;
        image.onload = imageEvent;
        image.onerror = imageEvent;
        frame = {
            image : image,
            delay : animation.delay,
            data : data,
        }
        frame.image.self = frame;
        frame.index = loading.length;
        loading.push(frame);
        
    }
    function load(){
        var i,dat;
        var data = animation.data;
        if(data !== undefined){
            if(data.length === undefined){
                data = undefined;
            }
        }
        for(i = 0; i < this.src.length; i++){
            imageCount += 1;
            dat = undefined;
            if(data !== undefined){
                dat = data[i];
            }
            addImage(this.src[i],dat);
        }
        if(data !== undefined){
            data = undefined;
        }
    }    
    var animation = {
        src: null,
        onload : null,
        onerror : null,
        onprogress : null,
        load : load,
        waitTillDone : false,
        ignoreMissing : true,
        width : null,
        height : null,
        loadingError: false,
        delay : 10,
        frames : [],
    };
    return animation;    
    
}