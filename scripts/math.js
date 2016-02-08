"use strict";
// math utils.

// for gemo and math that involves points there are genraly 2 versions
// the normal version where points as definded x1,y1 for point1 or x,y for point
// and the point vertions post fixed with P and take points in the form {x:?,y:?};

// inter is a structure that is used to store intermediate values that are needed to get the
// results of some function. It is intended that code fetch values from here instead of repeating
// the caculations. The variables are general purpose and can have differing meaning depending
// on the function just called.
// Use createInter to create a new default interum object. You must set  the referance your self
//       eg var keep = mMath.inter; 
//          mMath.inter = mMath.createInter();
// As referancing inter can negativly effect the performance of some simplier functions
// you can postFix _I if you need the caculations.
// This is not a general rule and you will have to check which form of the function is avialibe
//
// An example of its benifit. Say you need the normalised cross of two line segments.
//   use the following function with L for Line segment and N for noramlised
//   var crossP = mMath.crossProductLN(x,y,xx,yy,x1,y1,xx1,yy1);
//   // You also have
//   the two lines as vectors mMath.inter.x, mMath.inter.y  and mMath.inter.x, mMath.inter.y
//   you have the normalised vectors in nx,ny & nx1,ny2
//   you have the length of both line segments as d,d2
var mMath = {
    inter : {
        x  : 0,   // coordinate
        y  : 0,
        x1 : 0,   // 2nd coordinate if needed
        y1 : 0,
        u  : 0,   // unit length
        i  : 0,   // index
        d  : 0,   // distance / dot product
        d2 : 0,   // distance squared
        l  : 0,   // length
        a  : 0,   // length of triangle side a
        b  : 0,   // length of triangle side b
        c  : 0,   // cross product, or c length of triangle
        a2  : 0,   // length of triangle side a squared
        b2  : 0,   // length of triangle side b
        c2  : 0,   // cross product, or c length of triangle
        pA : 0,  // angle in triange oppisite the length a
        pB : 0,  // angle 
        pC : 0,  // angle 
        nx : 0,   // normal vector
        ny : 0,
        nx1: 0,   // normal vector
        ny1: 0,
        result : false, // boolean result
    },
    createInter : function(){
        return {
            x  : 0,   // coordinate
            y  : 0,
            x1 : 0,   // 2nd coordinate if needed
            y1 : 0,
            u  : 0,   // unit length
            i  : 0,   // index
            d  : 0,   // distance / dot product
            d2 : 0,   // distance squared
            l  : 0,   // length
            a  : 0,   // length of triangle side a
            b  : 0,   // length of triangle side b
            c  : 0,   // cross product, or c length of triangle
            a2 : 0,   // length of triangle side a squared
            b2 : 0,   // length of triangle side b squared
            c2 : 0,   //  c length of triangle squared
            pA : 0,  // angle in triange oppisite the length a
            pB : 0,  // angle 
            pC : 0,  // angle 
            nx : 0,   // normal vector
            ny : 0,
            nx1: 0,   // normal vector
            ny1: 0,
            result : false, // boolean result
        };
    },
    copyInter : function(){
        var i = this.inter;
        return {
            x  : i.x  ,   // coordinate
            y  : i.y  ,
            x1 : i.x1 ,   // 2nd coordinate if needed
            y1 : i.y1 ,
            u  : i.u  ,   // unit length
            i  : i.i  ,   // index
            d  : i.d  ,   // distance / dot product
            d2 : i.d2 ,   // distance squared
            l  : i.l  ,   // length
            a  : i.a  ,   // length of triangle side a
            b  : i.b  ,   // length of triangle side b
            c  : i.c  ,   // cross product, or c length of triangle,cos or sin
            a2 : i.a2  ,   // length of triangle side a squared
            b2 : i.b2  ,   // length of triangle side b squared
            c2 : i.c2  ,   //  or c length of triangle side squared
            pA : i.pA ,  // angle in triange oppisite the length a
            pB : i.pB ,  // angle 
            pC : i.pC ,  // angle 
            nx : i.nx ,   // normal vector
            ny : i.ny ,
            nx1: i.nx1 ,   // normal vector
            ny1: i.ny1 ,
            result : i.result, // boolean result
        };
    },
    // value and number displays
    pads : ['','0','00','000','0000','00000','000000'],
    padNumber : function(num,pad){
        if(pad <= 1){
            return num;
        }
        if(num === "string"){
            num = Number(num);
        }
        var p = pad-1;
        if(num < 10){
            return this.pads[p] + num;
        }else
        if(num < 100){
            return this.pads[Math.max(0,p-1)] + num;
        }else
        if(num < 1000){
            return this.pads[Math.max(0,p-2)] + num;
        }else
        if(num < 10000){
            return this.pads[Math.max(0,p-3)] + num;
        }else
        if(num < 100000){
            return this.pads[Math.max(0,p-4)] + num;
        }          
    },
    formatNumber : function(val,format){
        var e = 0;
        var preFix = "";
        var postFix = "";
        var d = format.indexOf(".");
        if(d > -1){
            var e = format.lastIndexOf("#");
            if(e > -1){
                 e = e-d;
            }            
        }
        if(format.indexOf("%")>-1){
            val = val * 100;
            postFix = "%";
        }
        if(format.indexOf("$")>-1){
            e = 2;
            preFix = "$";
        }
        if(format.indexOf(",")>-1){
            var n = Math.abs(val).toFixed(e);
            if(e > 0){
                var l = n.length-e;
                var nn = n.substr(l);
                l -= 1;
            }else{
                var l = n.length -1;
                var nn = "";
            }
            var c = 1;
            while(l >= 0){
                nn = n[l]+nn;
                if(c === 3 && l !== 0){
                    c = 0;
                    nn = ","+nn;
                }
                c += 1;
                l -= 1;
            }
            return preFix+(val <0?"-":"")+nn+postFix;
        }
        return preFix+val.toFixed(e)+postFix;
    },
    // gemoetry lines etc  
    // 2D Cross and Dot products for vectors and lines.
    // for vectors postFix V eg dotProductV 
    // for lines postFix  L
    // for Normalised vectors or lines postfix N. All caclulations are done on the normalised lines
    // For conveniance mMath keeps a copy of normalised lines. and many other (when I get around to it) intrume 
    // values. Many times you will need the normals and the is no point recaculating them if they
    // have just been caculated
    
    // tri for triangle. The following are general triangle solutions
    // triPheta returns the angle oppisite side c when a,b,c are lengths of the triangle
    // triCosPheta returns the cos of the angle oppisite side c when a,b,c are lengths of the triangle
    // triLenC returns the length of side oppisite angle pheta when a,b are lengths of the ajacent sides and pheta is the angle 
    // triLenC2 returns the square of length of side oppisite angle pheta when a,b are lengths of the ajacent sides and pheta is the angle 
    // completTri and completeTriP finds lengths and angles for triangle described by 3 points. 
    triPheta : function(a,b,c){
        return Math.acos((c * c - (a * a + b * b)) / (-2 * a * b));
    },
    triCosPheta : function(a,b,c){
        return (c * c - (a * a + b * b)) / (-2 * a * b);
    },
    triLenC : function(a,b,pheta){
        return Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(pheta));
    },
    triLenC2 : function(a,b,pheta){
        return a*a + b*b - 2*a*b*Math.cos(pheta);
    },
    triPheta_I : function(a,b,c){
        var i = this.inter;
        return Math.acos(((i.c2 = c * c) - ((i.a2=a * a) + (i.b2=b * b))) / (-2 * a * b));
    },
    triCosPheta_I : function(a,b,c){
        var i = this.inter;
        return ((i.c2 = c * c)- ((i.a2=a * a) + (i.b2=b * b))) / (-2 * a * b);
    },
    triLenC_I : function(a,b,pheta){
        var i = this.inter;
        return Math.sqrt((i.a2=a * a)+ (i.b2=b * b) - 2 * a * b * (i.c = Math.cos(pheta)));
    },
    triLenC2_I : function(a,b,pheta){
        var i = this.inter;
        return (i.a2=a * a) + (i.b2=b * b) - 2*a*b*(i.c=Math.cos(pheta));
    },
    // x1,y1 is point one and so on
    // inter a2,b2,c2 are length squared and a,b,c are cos of angles A,B,C
    completeTri : function completeTri(data,x1,y1,x2,y2,x3,y3){ // given points on triagle find lengths and angles
        var aa,bb,cc,a,b,c,C,B,A,i; 
        i = this.inter;        
        if(data === undefined){
            data = {};
        }

        data.a = a = Math.sqrt(i.a2 = aa = Math.pow(x2-x1,2)+Math.pow(y2-y1,2));
        data.b = b = Math.sqrt(i.b2 = bb = Math.pow(x3-x2,2)+Math.pow(y3-y2,2));
        data.c = c = Math.sqrt(i.c2 = cc = Math.pow(x1-x3,2)+Math.pow(y1-y3,2));
        data.pB = Math.acos(i.b = (bb - (cc + aa)) / (-2 * c * a));
        data.pC = Math.acos(i.c = (cc - (aa + bb)) / (-2 * a * b));
        data.pA = Math.acos(i.a = (aa - (cc + bb)) / (-2 * c * b));
        return data;
    },
    completeTriP : function completeTri(data,P1,p2,p3){ // given points on triagle find lengths and angles
        var aa,bb,cc,a,b,c,C,B,A; 
        if(data === undefined){
            data = {};
        }
        // a is len p1 to p2 
        // aa square length 
        // A is angle between p1,p2 and p1,p3
        data.a = a = Math.sqrt(aa = Math.pow(p2.x-p1.x,2)+Math.pow(p2.y-p1.y,2));
        data.b = b = Math.sqrt(bb = Math.pow(p3.x-p2.x,2)+Math.pow(p3.y-p2.y,2));
        data.c = c = Math.sqrt(cc = Math.pow(p1.x-p3.x,2)+Math.pow(p1.y-p3.y,2));
        data.pB = Math.acos((bb - (cc + aa)) / (-2 * c * a));
        data.pC = Math.acos((cc - (aa + bb)) / (-2 * a * b));
        data.pA = Math.acos((aa - (cc + bb)) / (-2 * c * b));
        return data;
    },
    dotProductVN : function(x, y, xx, yy) {
        var i;
        i = this.inter;
        i.d = Math.hypot(x, y);
        i.d2 = Math.hypot(xx, yy);
        if (i.d > 0) {
            i.nx = x / i.d;
            i.ny = y / i.d;
        } else {
            i.nx = x = 1;
            i.ny = y = 0;
        }
        if (i.d2 > 0) {
            i.nx1 = xx / i.d2;
            i.ny1 = yy / i.d2;
        } else {
            i.nx1 = 1;
            i.ny1 = 0;
        }
        return i.nx * i.nx1 + i.ny * i.ny1;
    },
    crossProductVN : function(x, y, xx, yy) {
        var i;
        i = this.inter;
        i.d = Math.hypot(x, y);
        i.d2 = Math.hypot(xx, yy);
        if (i.d > 0) {
            i.nx = x / i.d;
            i.ny = y / i.d;
        } else {
            i.nx = x = 1;
            i.ny = y = 0;
        }
        if (i.d2 > 0) {
            i.nx1 = xx / i.d2;
            i.ny1 = yy / i.d2;
        } else {
            i.nx1 = 1;
            i.ny1 = 0;
        }
        return i.nx * i.ny1 - i.ny * i.nx1;
    },
    dotProductLN : function(x, y,x1,y1, xx, yy,xx1,yy1) {
        var d1,d2,nx1,ny1,nx2,ny2,i;
        i = this.inter;                
        x = x1 - x;
        y = y1 - y;
        xx = xx1 - xx;
        yy = yy1 - yy;
        i.d = Math.hypot(x, y);
        i.d2 = Math.hypot(xx, yy);
        if (i.d > 0) {
            i.nx = x / i.d;
            i.ny = y / i.d;
        } else {
            i.nx = x = 1;
            i.ny = y = 0;
        }
        if (i.d2 > 0) {
            i.nx1 = xx / i.d2;
            i.ny1 = yy / i.d2;
        } else {
            i.nx1 = 1;
            i.ny1 = 0;
        }
        return i.nx * i.nx1 + i.ny * i.ny1;
    },
    crossProductLN : function(x, y,x1,y1, xx, yy,xx1,yy1) {
        var i;
        i = this.inter;        
        i.x = x1 - x;
        i.y = y1 - y;
        i.xx = xx1 - xx;
        i.yy = yy1 - yy;
        i.d = Math.hypot(i.x, i.y);
        i.d2 = Math.hypot(i.xx, i.yy);
        if (i.d > 0) {
            i.nx = x / i.d;
            i.ny = y / i.d;
        } else {
            i.nx = x = 1;
            i.ny = y = 0;
        }
        if (i.d2 > 0) {
            i.nx1 = xx / i.d2;
            i.ny1 = yy / i.d2;
        } else {
            i.nx1 = 1;
            i.ny1 = 0;
        }
        return i.nx * i.ny1 - i.ny * i.nx1;
    },
    dotProductV : function(x, y, xx, yy) {
       return x * xx + y * yy;
    },
    crossProductV : function(x, y, xx, yy) {
       return x * yy - y * xx;
    },
    dotProductL : function(x, y,x1,y1, xx, yy,xx1,yy1) {
        var i;
        i = this.inter;        
        i.x = x1 - x;
        i.y = y1 - y;
        i.xx = xx1 - xx;
        i.yy = yy1 - yy;
       return i.x * i.xx + i.y * i.yy;
    },
    crossProductL : function(x, y,x1,y1, xx, yy,xx1,yy1) {
        var i;
        i = this.inter;        
        i.x = x1 - x;
        i.y = y1 - y;
        i.xx = xx1 - xx;
        i.yy = yy1 - yy;
       return i.x * i.yy - i.y * i.xx;
    },
    // random functions
    // rand is random float. Between inclusive v1,v2 or if v2 undefined from 0 to v1
    // randI is Integer form of above function rand
    // the following bell curves reduce distrubution as the number 2,3 or p get higher
    // randBell2 returns a bell curve distrubution of randoms center mid way between v1,v2 or 0 to v1
    // randBell3 returns a bell curve distrubution of randoms center mid way between v1,v2 or 0 to v1
    // randBell  returns a bell curve distrubution of randoms center mid way between v1,v2 or 0 to v1
    //           p defines the distrubution with hight values reducing distabution
    rand :function(v1,v2){ // random float
        if(v2 === undefined){
            return Math.random() * v1;
        }        
        return Math.random() * (v2 - v1) + v1;
    },
    randI :function(v1,v2){ // Random int 
        if(v2 === undefined){
            return Math.floor(Math.random() * v1);
        }
        return Math.floor(Math.random() * (v2 - v1) + v1);
    },
    randBell2 : function(v1,v2){
        var r = Math.random() + Math.random();
        if(v1 === undefined){
            return r / 2;
        }
        if(v2 === undefined){
            return (r * v1) / 2;
        }
        return  (r / 2) * (v2 - v1) + v1
    },
    randBell3 : function(v1,v2){
        var r = Math.random() + Math.random() + Math.random();
        if(v1 === undefined){
            return r / 3;
        }
        if(v2 === undefined){
            return (r / 3) * v1 ;
        }
        return  (r / 3) * (v2 - v1) + v1
    },
    randBell : function(p,v1,v2){
        var r,pp = p;
        while(p--){
            r += Math.random();
        }
        if(v1 === undefined){
            return r / pp;
        }
        if(v2 === undefined){
            return (r / pp) * v1 ;
        }
        return  (r / pp) * (v2 - v1) + v1
    },
    // ease functions
    easeInOut : function(x,pow){
        var xx = Math.pow(x,pow);
        return (xx/(xx+Math.pow(1-x,pow)));
    },
	bump : function (x, pow) {
        return Math.pow(Math.sin(x*Math.PI),pow);
    },
	easeBell : function (x, pow) {
        x = x*2;
        if( x > 1){
            x = 1-(x-1);
            var xx = Math.pow(x,pow);
            return(xx/(xx+Math.pow(1-x,pow)))
        }else{
            var xx = Math.pow(x,pow);
            return(xx/(xx+Math.pow(1-x,pow)))
        }
    },
	easeBellFlatTop : function (x, pow) {
        x = x*3;
        
        if( x > 3){
            var xx = Math.pow(0,pow);
            return(xx/(xx+Math.pow(1,pow)))
        }else
        if( x > 2){
            x = 1-(x-2);
            var xx = Math.pow(x,pow);
            return(xx/(xx+Math.pow(1-x,pow)))
        }else
        if( x > 1){
            var xx = Math.pow(1,pow);
            return(xx/(xx+Math.pow(0,pow)))
        
        }else
        if( x >= 0){
            var xx = Math.pow(x,pow);
            return(xx/(xx+Math.pow(1-x,pow)))
        
        }else{
            var xx = Math.pow(0,pow);
            return(xx/(xx+Math.pow(1,pow)))
        }
    },
	easeIn : function (x, pow) {
        x /=2;
        var xx = Math.pow(x,pow);
        return (xx/(xx+Math.pow(1-x,pow)))*2;
    },
	rushIn : function (x, pow) {
        x = Math.min(1,Math.max(0,x));
        x = x/2+0.5;
        var xx = Math.pow(x,pow);
        return ((xx/(xx+Math.pow(1-x,pow)))-0.5)*2;
    },
	easeCircle : function (x){
        return 1 - Math.sqrt(1-x*x);
    },
	rushCircle : function (x){
        x = 1-x;
        return 1 - Math.sqrt(1-x*x);
    },
	circularBump : function (x){
        x = x*2-1;
        return Math.sqrt(1-x*x);
    },
	circularSlop : function (x){
        x = x*2-1;
        if( x < 0){
            return Math.sqrt(1-x*x)/2;
        }
        return (1-Math.sqrt(1-x*x))/2 + 0.5;
    },
	ease : function(p,out,inn){  // bezier start at zero end at 1 out start adjust inn end ajust
        return 3*p*(1-p)*(1-p)*out+3*Math.pow(p,2)*(1-p)*inn+Math.pow(p,3);
    },
	easeCenter : function (p,pow){   // ease in middle
        p = (p* 0.9)+0.05;
        return 3*0.9*p*(1-p)*(1-p)+0.1*3*p*p*(1-p)+Math.pow(p,3);
    } ,        
        
    // view and render functions    
    mat2FromLine : function(matrix,x1,y1,x2,y2){
        if(matrix ===  undefined){
            matrix = [0,0,0,0,0,0];
        }
        // stub only
        return matrix;
    },
    mat2FromLineP : function(matrix,p1,p2){
        if(matrix ===  undefined){
            matrix = [0,0,0,0,0,0];
        }
        // stub only
        
        return matrix;
    },
}