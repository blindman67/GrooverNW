# GROOVER NS
###THIS is a work in progress.

##THIS is very much a work in progress and is subject to change at any time.

Groover is a set of applications and site for the design and creation of realtime cross platform media such as games, animations, pressentations and anything that requiers realtime pressention.

GrooverNW is the first public part of this suit of applications. It is intended as a stand alone frame work for groover derived works though not specifucly tied to Groover created content.

The aim is to have minimum contact with the DOM and interact only via the canvas (veiw) 

It is intended that the GrooverNW is a runtime framework and does not requier a process of linking, compilation, resource collection/bundling. Applications are run via the command line argument `app=applicationName` where applicationName is the name of the directory where the application code is. (Though subject to change)

##How to run.

Currently there is an example aplication called GifViewer that can be found in the directory /GifViewer
To run groover you need to have NW.js installed. I am using NW.js 13
Create a shortcut or use a console to create the command

```bash
C:\nw\nw.exe D:\Marks\DEV\GrooverNW app=GifViewer
```

This will run nw.exe loading the app in the directory `D:\Marks\DEV\GrooverNW` and starting the application GifViewer.
The applications needs to be in the directory `D:\Marks\DEV\GrooverNW\apps`

The App requiers a `description.json` file to be in the same directory as the app. The description file describes the app to groover and what it needs to do to load. It also provides settings for the application. This is dependent on the application and can be found in the Javascript names space `groover.appDescription.settings`.

Example of the description file. The only requiered field for the time being is the array JavaScript.scripts which contains the filenames of the javascript files to load. All the files in this directory are concated into one script file in the order they appear in the array.

```json
{
    "applicationName" : "Gif viewer",
    "description" : "GrooverNW Application for viewing GIF images.",
    "version" : "1",
    "styles" : ["UIStyles.json"],
    "JavaScript" : {
         "scripts" : ["GifViewer.js"], 
         "moduals" : []                            
    },
    "settings" : {
        "welcomeName" : "GIF Groover.",
        "welcomeMessage" : "Drop groovey GIFs here!",
    }
}
```
Groover will create one copy of the object named the same as the app. In this case this is GifViewer.

For example  

```JavaScript
"use strict";  // Should have but not requiered.
function GifViewer(owner){  // the app. owner is optional and is a referance to the main groover app
    this.owner = owner;
    this.ready = true;    // requiered property and should be set to true when the app is ready to run
}
// requiered method called at the start of the frame. 
GifVeiwer.prototype.update = function(){ 
    // do non redering work here.
}
// requiered method called once a frame after update.
GifVeiwer.prototype.display = function(){   
    // do your rendering work here.
}
// optional method
// Please note this will be changed to fileDropped as I develop the functionality
GifVeiwer.prototype.imageDropped = function(file){  // call once for each image drop on the app
    // do what is needed with the image
}
// requiered method is called after the main view has been recreated. this can be because of
// resize event or a veriaty of reasons. 
// This will be called at least once at start up.
GifVeiwer.prototype.lostView = function(){  
}
```

Groover will create one copy of GifViewer by invocking a new object passing a referance to its self.

Example of how the app is invocked 

```JavaScript
this.application = new GifViewer(this);
```

Groover will wait for the application to set the flag `app.ready` to true befor starting the realtime display. If you do not set ready to tre then the app will never start.

The object will need to provide the following functions 
 
 

##Current Status.

Still working on UI. 

Having a rethink of how to handle views. I was going to have all view associated with a canvas but this does not always hold true as I have found the need for a view without a canvas. I also managed to forget that a view also has a top left..Will also rewrite the UI location interface to take a view as a argument


## Files

A breif overview of GrooverNW framework files.


### animFrame .js 
realtime frame managment that runs the whole shebang. It provides to execution lists. Functions will be called in order of their appearance on the list every frame. There is a frame Start list that is called att the begining of the frame and frameEnd ist for the end of frame. There is also a frame end stack. Functions placed on this stack are call once at the end of the frame and then removed. They are only run once.
Groover once started has 3 modes of realtime.
Unnamed normal running mode that uses requestAnimationFrame to manage frame rate and runs at 60Fps max.
Manual : frame rate is managed via setTimeout and can be addapped to meet the current needed of the app. (NOTE to do) Would be nice if this was still timed by request animation frame so that display refresh can be respected.
Paused : Stops calling any functions in the execution lists and waits for unpaused. The monorting of unpause is set at the manual frame rate.
Stopped : Completely stop all execution within animFrame. Will requier a call to start to restart.

### bitmaps.js 
Manage bitmap/image resources. 

### docUtills.js
clunky stop gap for the time being and provides a set of short cuts $ prefixed functions (sorry JQuery I deliberatly created this naming conflict)

### dragDrop.js
A small utillity to monitor drag drop events and pass on the relevant information via callbacks to code that requiers this info.

### gifDecoder.js
A simple gif decoder (Not not finnished (interlaced disabled and some gifs are not doing disposal correctly)
Gif decoder creates an image that has a frame list that contains an image and relevant timing info.

### grooverUtils.js

### loader.js
Handles splash screen.

### main.js 
Main entry point of the framework via document onload.

### math.js
what is graphics withoout some handy and hopfully fast math.

### mouseKeyboard.js
Dam dam dam.. No keyup and keydown events this is a major issuse 
Appart from that mouseKeyboard provides the interface to user input via mouse and keyboard. Also manages the cursor (will son have dynamic cursors like Groover Animator and Groover player)
When dealing with the mouse please respect the mousePrivate id. if it is zero you are free to use it, if it is not zero the mouse is being held by another control and should not be used.

To avoid having dozens of UI's and what not calling the mouse function to see if they have useage I leave it up to the code to do that. 

### native.js
First javascript run. Sets up requiers and stuf to do with NW.js

### render.js
The core renderer. Providing general purpose render functions.

### ui.js
UI handler for creating and managing UI's and provide some common shared methods (toolTop, Locatoion, mouse/key)









Security. 

As it is intendered for Groover to be able to run any javascript there is a security consern that is as yet to be addressed.



