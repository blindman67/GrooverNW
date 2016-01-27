 "use strict";
 
 // WebGL render
function RenderGL(owner){
     this.owner = owner;
     this.view = owner.display;
     this.canvas = null;
     var glx = null;
     this.ready = false;
}
 
RenderGL.prototype.createContext = function () {
    var glx = this.view.getContext('webgl', this._contextOptions) || this.view.getContext('experimental-webgl', this._contextOptions);
    this.glx = glx;
    glx.render = this;
};

WebGLRenderer.prototype._initContext = function ()
{

};
