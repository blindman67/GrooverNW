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
            ["font","UIFont","copy"],
        ]);         

        settings.style.font.textAlign = "left";
        settings.height = settings.height === undefined ? settings.style.main.height : settings.height;
        settings.style.font.fontSize = Math.max(12, settings.height - Math.floor(settings.height / 3));
        settings.style.font.textAlign = "left";
        settings.style.font.textBaseline = "middle";


        var ui = {


            setup : function () {
                if(this.canvas !== undefined){
                    this.location.set(this.x,this.y,undefined,this.height);
                }else{
                    var w = groover.utils.styles.measureText(this.text, this.style.font).width;
                    w += (this.style.main.inset + this.style.main.rounding)*2;
                    if(this.minWidth !== undefined){
                        w = Math.max(w,this.minWidth);
                    }
                    this.canvas = this.owner.createCanvas(w,this.height);
                    this.location.set(this.x,this.y,undefined,this.height);
                }
            },             
            redraw : function(){
                var cw, ins, h;
                cw = this.canvas.width;
                h = this.canvas.height;
                this.canvas.ctx.setTransform(1, 0, 0, 1, 0, 0);
                this.canvas.ctx.clearRect(0, 0, cw, this.canvas.height);
                this.dirty = false;
            },
            update : function() {
                
            },
            display : function () {
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
            ["draw","UIComboBox", "Blue", "white", 2, 6, 0],
            ["draw","UIComboBoxSelected", "RED", "white", 2, 6, 3],
            ["draw","UIComboBoxHighlight", "Green", "white", 2, 6, 5],
        ]);
            
    }    
    return {
        create : create,
        configure : configure,
    };
})();