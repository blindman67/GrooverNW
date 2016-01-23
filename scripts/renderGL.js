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
    var glx = this.glx;

    // set up the default pixi settings..
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);

    this.renderTarget = new RenderTarget(gl, this.width, this.height, null, this.resolution, true);

    this.setRenderTarget(this.renderTarget);

    this.emit('context', gl);

    // setup the width/height properties and gl viewport
    this.resize(this.width, this.height);

    if(!this._useFXAA)
    {
        this._useFXAA = (this._contextOptions.antialias && ! gl.getContextAttributes().antialias);
    }


    if(this._useFXAA)
    {
        window.console.warn('FXAA antialiasing being used instead of native antialiasing');
        this._FXAAFilter = [new FXAAFilter()];
    }
};

function Quad(glx){

    this.glx = glx;
    this.vertices = new Float32Array([ 0,0,200,0,200,200,0,200]);
    this.uvs = new Float32Array([0,0, 1,0,1,1,  0,1]);
    this.colors = new Float32Array([1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1 ]);
    this.indices = new Uint16Array([ 0, 1, 2, 0, 3, 2 ]);
    this.vertexBuffer = glx.createBuffer();
    this.indexBuffer = glx.createBuffer();
    glx.bindBuffer(glx.ARRAY_BUFFER, this.vertexBuffer);
    glx.bufferData(glx.ARRAY_BUFFER, (8 + 8 + 16) * 4, glx.DYNAMIC_DRAW);
    glx.bindBuffer(glx.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    glx.bufferData(glx.ELEMENT_ARRAY_BUFFER, this.indices, glx.STATIC_DRAW);

    this.upload();
}


Quad.prototype.map = function(rect, rect2){
    var x = 0; //rect2.x / rect.width;
    var y = 0; //rect2.y / rect.height;
    this.uvs[0] = x;
    this.uvs[1] = y;
    this.uvs[2] = x + rect2.width / rect.width;
    this.uvs[3] = y;
    this.uvs[4] = x + rect2.width / rect.width;
    this.uvs[5] = y + rect2.height / rect.height;
    this.uvs[6] = x;
    this.uvs[7] = y + rect2.height / rect.height;
    x = rect2.x;
    y = rect2.y;
    this.vertices[0] = x;
    this.vertices[1] = y;
    this.vertices[2] = x + rect2.width;
    this.vertices[3] = y;
    this.vertices[4] = x + rect2.width;
    this.vertices[5] = y + rect2.height;
    this.vertices[6] = x;
    this.vertices[7] = y + rect2.height;
    this.upload();
};

Quad.prototype.upload = function(){
    var glx = this.glx;
    glx.bindBuffer( glx.ARRAY_BUFFER, this.vertexBuffer );
    glx.bufferSubData(glx.ARRAY_BUFFER, 0, this.vertices);
    glx.bufferSubData(glx.ARRAY_BUFFER, 8 * 4, this.uvs);
    glx.bufferSubData(glx.ARRAY_BUFFER, (8 + 8) * 4, this.colors);
};

Quad.prototype.destroy = function(){
     this.glx.deleteBuffer(this.vertexBuffer);
     this.glx.deleteBuffer(this.indexBuffer);
};


var Shader = require('./Shader');

/**
 * @class
 * @memberof PIXI
 * @extends PIXI.Shader
 * @param shaderManager {PIXI.ShaderManager} The webgl shader manager this shader works for.
 * @param [vertexSrc] {string} The source of the vertex shader.
 * @param [fragmentSrc] {string} The source of the fragment shader.
 * @param [customUniforms] {object} Custom uniforms to use to augment the built-in ones.
 * @param [fragmentSrc] {string} The source of the fragment shader.
 */
function TextureShader(shaderManager, vertexSrc, fragmentSrc, customUniforms, customAttributes)
{
    var uniforms = {

        uSampler:           { type: 'sampler2D', value: 0 },
        projectionMatrix:   { type: 'mat3', value: new Float32Array([1, 0, 0,
                                                                     0, 1, 0,
                                                                     0, 0, 1]) }
    };

    if (customUniforms)
    {
        for (var u in customUniforms)
        {
            uniforms[u] = customUniforms[u];
        }
    }


    var attributes = {
        aVertexPosition:    0,
        aTextureCoord:      0,
        aColor:             0
    };

    if (customAttributes)
    {
        for (var a in customAttributes)
        {
            attributes[a] = customAttributes[a];
        }
    }

    /**
     * The vertex shader.
     *
     * @member {string}
     */
    vertexSrc = vertexSrc || TextureShader.defaultVertexSrc;

    /**
     * The fragment shader.
     *
     * @member {string}
     */
    fragmentSrc = fragmentSrc || TextureShader.defaultFragmentSrc;

    Shader.call(this, shaderManager, vertexSrc, fragmentSrc, uniforms, attributes);
}

// constructor
TextureShader.prototype = Object.create(Shader.prototype);
TextureShader.prototype.constructor = TextureShader;
module.exports = TextureShader;

TextureShader.defaultVertexSrc = `
    precision lowp float;
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    attribute vec4 aColor;
    uniform mat3 projectionMatrix;
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    void main(void){
       gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
       vTextureCoord = aTextureCoord;
       vColor = vec4(aColor.rgb * aColor.a, aColor.a);
    }
`
TextureShader.defaultFragmentSrc = `
    precision lowp float;
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    uniform sampler2D uSampler;
    void main(void){
       gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor;
    }
`
