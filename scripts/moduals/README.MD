(function(){

    const MPI2 = Math.PI * 2;
    const MPI = Math.PI ;
    // create a vector
    function Vec(x,y){
        if x and y undefined then create a unit vector
        if only x as number the create a line x units long
        if both x and y are numbers create a vector with those values
        if x is a vector copy that vector;
        if x and y are vector create a vector that is vector y.sub(x);
        
        
    Properties 
        x Number
        y Number
        
        
    Vec.prototype = {
        type : "vec",
        copy : function(){
            create a copy 
        add : function(v){
            add v to this
        sub : function(v){
            sub v from this
        mult : function(m){
            multiply by m
        div : function(m){
            divide by m
        r90 : function(){
            rotate clockwise 90deg
        rN90 : function(){
            rotate anticlockwise 90deg
        r180 : function(){
            rotate  180deg
        half : function(){
            half the vector length
        setLeng : function(len){
            set the vecot length without changing the direction
        setDir : function(dir){
            set the direction without changing the length
        rotate : function(ang){
            rotate by ang
        leng : function(){
            return the leng
        leng2 : function(){
            return the length squared
        dir : function(){
            return the direction
        norm : function(){
            normalise
        dot : function(v){
            get the do product of this and Vec v
        cross : function(v){
            get the cross product of this and vector v
        dotNorm : function(v){
            get the dit product after normalising
        crossNorm : function(v){
            get the cross product after normalising
    }

    Arc 
    function Arc(circle,start,end){
        circle is a circle 
        start is a number in radians 
        end is a number in radians
    
        Properties 
        c circle
        s start angle in radians
        e end angle in radians
        
    Arc.prototype = {
        type : "arc",
        copy : function(){
        fromPoints : function(p1,p2,p3){
            sets the start and end angles to include the points p1-p3
            p3 is optional.
            The points do not need to be in the circumferance
        setRadius : function (r){
            set the radius of the arc
        setCircle : function (c){
            set the circle of the arc
        normalise : function(){
            brings the start and end angles within the range 0 to Math.PI*2 
        cordLeng : function(){
            returns the length of the cord made by the arc 
        setCordLeng : function(leng){
            sets the end angle to make the cord size leng
        great : function(){
            changes start and end angles to make the arc the largest possible
        minor : function(){
            changes the start and end angle to make the arc the smallest possible
        isPointOn : function(p){
            returns true if the point is on the pie shape created by the arc
        fromTangents : function(l1,l2){
            ?? forgot??
    }
    function Circle(p,r){
        p is a Vec that is the center of the circle
        r is the radius
        
    Circle.prototype = {
        type : "circle",
        copy : function(){
        radius : function (number){
            get the radius
        circumferance : function(){
            get the circumferance
        area : function(){
            get the area
        fromPoints2 : function (vec, vec ){
            redefine the circle to fit the points a (center) and b a point on the circumferance
        fromPoints3 : function (vec, vec, vec){
            redefine the circle to fit all the points on the circumferance. If not posible return null
        fromRadius : function (number){
            set the radius
        fromArea : function(area){
            set the area
        fromCircumferance : function(number){
            set the circumferance
        touching : function(circle){
            returns true if this circle is touching in any way circle c
        touchingLine : function(line){
            returns true if line intercepts the circle
        lineIntercept : function(line){
            returns an array of vec that are the intercept poitn of the line and circle. 
            returns an empty array if there is no intercept
        circleIntercept : function(circle){
            returns an array of points that are the intercept of the two circles.
            returns an empty array if there is no intercept
        tangentAtPoint : function(vec){
            returns the line that is the tangent to the point on the circumferance that is closest
            to the point vec
        angleOfPoint : function(vec){
            returns the angle from the circle center to the point
            
    }

    function Line(p1,p2){
        p1 is a vec that sets the start of the line
        p2 is a vec that sets the end of the line.

    Line.prototype = {
        type : "line",
        copy : function(){
        swap : function(){
            swaps the start and end of the line.
        asVec : function(){
            returns the line as a vector with the start point at the origin (0,0)
        leng : function(){
            returns the length of the line
        dir : function(){
            returns the direction of the line in radians
        cross : function(){
            returns the cross product (start and end) of the two vectors describing the line
        crossBack : function(){
            returns the cross product (end and start) of the two vectors describing the line            
        setTransformToLine :function(ctx){
            utillity function to set the canvas 2D context transform to have the X axis 
            aligned to the line. Pixel scale remains 1 and the Y axis is at 90deg clockwise
            from the line. ctx is the 2D context.
        intercept : function(line){
            returns the intercep point as a vec between this line and line
        distFrom : function(vec){
            returns the distance the point is from the line
        lineTo : function(vec){
            returns the Line from vec to the cloeset point on the line
        closestPoint : function(vec){
            returns the Vec that is the closest point on the line to vec
        reflect : function(line){
            returns the vec that is the reflection of line on this line
        reflectLine : function(line){
            returns the Line that is the reflection of line on this line
        centerOnStart : function(){
            moves the line to maintian it length and direction and centered on the line start.
        midLine : function(line){ // this is bad must find a better way
            returns the line that is halfway between this line a and line 
    return {
        Vec : Vec,
        Line : Line,
        Circle : Circle,
        Arc : Arc,
    };
})();