function DropManager(dropElement, callback, types) {
    if (typeof dropElement === "string") {
        var s = dropElement;
        dropElement = $(dropElement);
        if (dropElement === null) {
            throw new ReferenceError("Can not find elementID:" + s);
        }
    }
    dropElement.ondrop = this.drop.bind(this);
    dropElement.ondragover = this.onDragOver;
    this.fileList = [];
    this.dropFileCallback = callback;
    this.types = types;
}
DropManager.prototype.getit = function (str) {
    var type = "";
    if (str.indexOf("img") > -1) {
        var s = str.split('src="');
        for (var i = 0; i < s.length; i++) {
            type = "";
            if (s[i].indexOf(".gif") > -1) {
                type = "image/gif";
            }
            if (s[i].indexOf(".jpg") > -1) {
                type = "image/jpg";
            }
            if (s[i].indexOf(".png") > -1) {
                type = "image/png";
            }
            if (s[i].indexOf(".jpeg") > -1) {
                type = "image/jpeg";
            }
            if (type !== "") {
                this.fileList.push(s[i].split('"')[0]);
            }
        }
    }
}
// drop event for importing content.
DropManager.prototype.drop = function (event) {
    event.preventDefault();
    this.droppedItems = [];
    var getData = false;
    dt = event.dataTransfer;
    console.log("DropManager:dt:next line");
    console.log(dt);
    for (var i = 0; i < dt.types.length; i++) {
        getData = false;
        if (dt.types[i] === "text/html") { // if its html there might be content in it
            getData = true;
        }
        if (getData) {
            dt.getData(dt.types[i]);
            for (var j = 0; j < dt.items.length; j++) {
                dt.items[j].getAsString(this.getit.bind(this));
            }
        }
        if (dt.types[i] === "Files") { // content from the file system
            try { // IE and Firefox do not have type Files
                var types = dt.getData(dt.types[i]);
            } catch (e) {
                dt.getData("URL"); // if cant take type file
            }
            console.log("DropManager:dt.files:"+dt.files);
            for (var j = 0; j < dt.files.length; j++) {
                log("DropManager:dt.files[j].type:"+dt.files[j].type);
                for (var k = 0; k < this.types.length; k++) {
                    if (dt.files[j].type.toUpperCase() === this.types[k].toUpperCase() || this.types[k] === "*") {
                        this.fileList.push({
                            name : dt.files[j].name,
                            path : dt.files[j].path,
                            size : dt.files[j].size,
                            type : dt.files[j].type,
                        });
                        break;
                    }
                }
            }
        }
    }
    if (this.fileList.length > 0 && this.dropFileCallback !== undefined) {
        while (this.fileList.length > 0) {
            this.dropFileCallback(this.fileList.shift());
        }
    } else {
        if (log) {
            log("Dropped file of wrong type. 'DropManager'");
        }
    }
}
// just stops default on drag enter and over
DropManager.prototype.onDragEnter = function (event) {
    event.preventDefault();
}
DropManager.prototype.onDragOver = function (event) {
    event.preventDefault();
    groover.draggedOver = true;
}
DropManager.prototype.mimeTypes = {
    png : "image/png",
    jpg : "image/jpg",
    gif : "image/gif",
    jpeg : "image/jpeg",
    svg : "image/svg+xml",
    mp3 : "audio/mp3",
    wav : "audio/wav",
    mp4 : "video/mp4",
    mpeg : "video/mpeg",
    ogg : "audio/ogg",
    wav : "audio/wav",
    ogg : "video/ogg",
    webm : "video/webm",
    txt : "text/plain",
    json : "text/json",
    grv : "text/json",
    grvb : "text/groover-batch",
    csv : "application/vnd.ms-excel",
    js : "application/javascript",
    all : "*",
}

// usage
//var dr = new DropManager(
//    document.getElementById("GrooverStart"),
//    callBack, //callback for each file dropped
//    ["image/jpeg","image/png","image/gif"]
 //   );