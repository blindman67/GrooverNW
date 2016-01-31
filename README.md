THIS is a work in progress.

Groover is a set of applications and site for the design and creation of realtime cross platform media such as games, animations, pressentations and anything that requiers realtime pressention.

GrooverNW is the first public part of this suit of applications. It is intended as a stand alone frame work for groover derived works though not specifucly tied to Groover created content.

The aim is to have minimum contact with the DOM and interact only via the canvas (veiw) 

It is intended that the GrooverNW is a runtime framework and does not requier a process of linking, compilation, resource collection/bundling. Applications are run via the command line argument `app=applicationName` where applicationName is the name of the directory where the application code is. (Though subject to change)

Current Status.

Still working on UI. The anim is for very complex UIs that do not drop the frame rate but still provide rich animated functionality,
The UI is just working, but still laking in many areas.


Files

A breif overview of GrooverNW framework files.


animFrame .js 
realtime frame managment that runs the whole shebang. It provides to execution lists. Functions will be called in order of their appearance on the list every frame. There is a frame Start list that is called att the begining of the frame and frameEnd ist for the end of frame. There is also a frame end stack. Functions placed on this stack are call once at the end of the frame and then removed. They are only run once.
Groover once started has 3 modes of realtime.
Unnamed normal running mode that uses requestAnimationFrame to manage frame rate and runs at 60Fps max.
Manual : frame rate is managed via setTimeout and can be addapped to meet the current needed of the app. (NOTE to do) Would be nice if this was still timed by request animation frame so that display refresh can be respected.
Paused : Stops calling any functions in the execution lists and waits for unpaused. The monorting of unpause is set at the manual frame rate.
Stopped : Completely stop all execution within animFrame. Will requier a call to start to restart.

bitmaps.js 
Manage bitmap/image resources. 

docUtills.js
clunky stop gap for the time being and provides a set of short cuts $ prefixed functions (sorry JQuery I deliberatly created this naming conflict)

dragDrop.js
A small utillity to monitor drag drop events and pass on the relevant information via callbacks to code that requiers this info.

gifDecoder
A simple gif decoder (Not not finnished (interlaced disabled and some gifs are not doing disposal correctly)
Gif decoder creates an image that has a frame list that contains an image and relevant timing info.

grooverUtils.js

loader.js
Handles splash screen.

main.js 
Main entry point of the framework via document onload.

math.js
what is graphics withoout some handy and hopfully fast math.

mouseKeyboard.js
Dam dam dam.. No keyup and keydown events this is a major issuse 
Appart from that mouseKeyboard provides the interface to user input via mouse and keyboard. Also manages the cursor (will son have dynamic cursors like Groover Animator and Groover player)
When dealing with the mouse please respect the mousePrivate id. if it is zero you are free to use it, if it is not zero the mouse is being held by another control and should not be used.

To avoid having dozens of UI's and what not calling the mouse function to see if they have useage I leave it up to the code to do that. 

native.js
First javascript run. Sets up requiers and stuf to do with NW.js

render.js
The core renderer. Providing general purpose render functions.

ui.js
UI handler for creating and managing UI's and provide some common shared methods (toolTop, Locatoion, mouse/key)









Security. 

As it is intendered for Groover to be able to run any javascript there is a security consern that is as yet to be addressed.



