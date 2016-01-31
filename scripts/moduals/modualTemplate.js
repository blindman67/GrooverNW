(function(){  // **MODUAL** code will have use strit prefixed
    // important do not add anything above this line. Modual loading adds (use strict) and accepts the returned value of this function
    var yourObject = {

    }
    var configure = function(){
        // add code here as a one off run to load any requiered moduals or stuff
        // be aware that it is posible to create a cyclic recursion here if loading moduals that
        // lead to referance to this modual so check if a modual has been loaded before you request them.
        // May be fix but for now be warned.
        
    }
    
    return {
        create : yourObject,  // requiered 
        configure : configure,  // optional.
    };
})();
    
    
    