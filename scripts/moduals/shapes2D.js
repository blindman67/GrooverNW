(function(){  // **MODUAL** code will have use strit prefixed
    // important do not add anything above this line. Modual loading adds "use strict" and accepts the returned value of this function

    // these draw functions are not intened for realtime readering as there has been
    // no effort to optimise them or use the fastes posible method.
    var shapes = {
        
        // functions adding to the ctx path and do not call stroke or fill
        roundedPolygon : function(ctx,coords){
            var r, cross, o, len, len2, x1, y1, x2, y2, x3, y3, p1, p2, p3, a, b, c, vx1, vx2, vy1, vy2, ang, d1, as, ae, x, y, i, nx1, nx2, ny1, ny2;
            if (ctx.rounding === undefined) {
                r = 1;
            } else {
                r = Number(ctx.rounding);
            }
            o = coords;
            len = (len2 = o.length) / 2;
            if (len < 2) { // if not a polygon do nothing.
                return;
            }
            ctx.beginPath();
            for (i = 0; i < len; i++) {
                // get corner indexs
                p1 = i * 2;
                p2 = ((i + 1) * 2) % len2;
                p3 = ((i + len - 1) * 2) % len2;

                // get corner points
                x1 = o[p1];
                y1 = o[p1 + 1];
                x2 = o[p2];
                y2 = o[p2 + 1];
                x3 = o[p3];
                y3 = o[p3 + 1];
                // convert lines to vectors
                vx1 = x2 - x1;
                vy1 = y2 - y1;
                vx2 = x3 - x1;
                vy2 = y3 - y1;
                // get length of lines
                a = Math.sqrt(vx1 * vx1 + vy1 * vy1);
                b = Math.sqrt(vx2 * vx2 + vy2 * vy2);
                // get the length of line oppisite corner to easy angle calculation
                c = Math.sqrt(Math.pow(x2 - x3, 2) + Math.pow(y2 - y3, 2));
                // normalise vectors
                nx1 = vx1 / a;
                ny1 = vy1 / a;
                nx2 = vx2 / b;
                ny2 = vy2 / b;
                // get angle
                ang = Math.acos((c * c - (a * a + b * b)) / (-2 * a * b));
                // get dist along first line when circle tangent meets line
                d1 = Math.sqrt(Math.pow(r / Math.sin(ang / 2), 2) - r * r);
                // get the cross product to know if the rounding is inside or outside
                cross = nx1 * ny2 - nx2 * ny1;
                if (cross < 0) { // outside rounding
                    as = Math.atan2(-nx2, ny2); // get start angle
                    ae = Math.atan2(nx1, -ny1); // get end angle
                    // find circle center
                    x = x1 + nx1 * d1 - (-ny1) * r;
                    y = y1 + ny1 * d1 - nx1 * r;
                    // add the arc to the path
                    ctx.arc(x, y, r, as, ae, true);
                } else {
                    as = Math.atan2(nx2, -ny2);
                    ae = Math.atan2(-nx1, ny1);
                    // find circle center
                    x = x1 + nx1 * d1 + -ny1 * r;
                    y = y1 + ny1 * d1 + nx1 * r;
                    // add the arc to the path
                    ctx.arc(x, y, r, as, ae);
                }
            }
            ctx.closePath();
        },
        roundedInsetCircle : function (ctx, x, y, r1, r2, a1, a2) {
            var r, rr1, rr2, aa1, aa2, xx, yy;
            if (ctx.rounding === undefined) {
                r = 1;
            } else {
                r = Number(ctx.rounding);
            }
            rr1 = Math.min(r1, r2);
            rr2 = Math.max(r1, r2);
            if (r > (rr2 - rr1) / 2) {
                r = (rr2 - rr1) / 2;
            }
            a1 = ((a1 % PI2) + PI2 * 2) % PI2;
            a2 = ((a2 % PI2) + PI2 * 2) % PI2;
            aa1 = Math.asin(r / (rr1 + r));
            aa2 = Math.asin(r / (rr2 - r));

            ctx.beginPath();
            xx = Math.cos(a1 + aa2) * (rr2 - r) + x;
            yy = Math.sin(a1 + aa2) * (rr2 - r) + y;

            ctx.arc(xx, yy, r, a1 - Math.PI / 2, a1 + aa2);
            ctx.arc(x, y, rr2, a1 + aa2, a2 - aa2);
            xx = Math.cos(a2 - aa2) * (rr2 - r) + x;
            yy = Math.sin(a2 - aa2) * (rr2 - r) + y;
            ctx.arc(xx, yy, r, a2 - aa2, a2 + Math.PI / 2);

            xx = Math.cos(a2 + aa1) * (rr1 + r) + x;
            yy = Math.sin(a2 + aa1) * (rr1 + r) + y;

            ctx.arc(xx, yy, r, a2 - Math.PI / 2, (a2 + aa1) - Math.PI, true);
            ctx.arc(x, y, rr1, a2 + aa1, a1 - aa1);

            xx = Math.cos(a1 - aa1) * (rr1 + r) + x;
            yy = Math.sin(a1 - aa1) * (rr1 + r) + y;
            ctx.arc(xx, yy, r, (a1 - aa1) - Math.PI, a1 + Math.PI / 2, true);
            ctx.closePath();
        },
        gear : function (c, x, y, r1, r2, teeth) {
            var rr1, rr2, step, subStep, len, lenA, a1, a2;
            rr1 = Math.min(r1, r2);
            rr2 = Math.max(r1, r2);
            if (r > (rr2 - rr1) / 2) {
                r = (rr2 - rr1) / 2;
            }
            step = PI2 / teeth;
            subStep = step / 2;

            len = rr1 * subStep;
            lenA = (subStep - (len / rr2)) / 2;
            c.beginPath();
            for (i = 0; i < teeth; i++) {
                a1 = i * step;
                a2 = a1 + subStep;
                c.arc(x, y, rr1, a1, a1 + subStep);
                c.arc(x, y, rr2, a1 + subStep + lenA, a1 + step - lenA);

            }
            c.closePath();
        },
        band : function (ctx, x, y, r1, r2, a1, a2, r) { // draws an open donut
            ctx.beginPath();
            ctx.arc(x, y, r1, a1, a2);
            ctx.arc(x, y, r2, a2, a1, true);
            ctx.closePath();
        },
        insetCircle : function (ctx, x, y, r1, r2, a1, a2) {
            a1 = ((a1 % PI2) + PI2 * 2) % PI2;
            a2 = ((a2 % PI2) + PI2 * 2) % PI2;
            ctx.beginPath();
            ctx.arc(x, y, r1, a1, a2);
            ctx.arc(x, y, r2, a2, a1);
            ctx.closePath();
        },
        triangle : function (ctx, x1, y1, x2, y2, x3, y3) {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x3, y3);
            ctx.closePath();
        },
        polygon : function (ctx, points) {
            var i,
            len = points.length;
            ctx.beginPath();
            ctx.moveTo(points[0], points[1]);
            for (i = 2; i < len; i += 2) {
                ctx.lineTo(points[i], points[i + 1]);
            }
            ctx.closePath();
        },
        // style helpers for creating and storing styles
        styles : {},
        createNamedStyle : function (name, col, lineCol, lineWidth, rounding) {
            return (this.style[name] = {
                    fillStyle : col,
                    strokeStyle : lineCol,
                    lineWidth : lineWidth,
                    rounding : rounding,
                });
        },
        createStyle : function (col, lineCol, lineWidth, rounding) {
            return {
                fillStyle : col,
                strokeStyle : lineCol,
                lineWidth : lineWidth,
                rounding : rounding,
            };
        },
        getStyleFromContext : function (ctx) {
            var names = "fillStyle,strokeStyle,lineWidth,lineJoin,lineCap,font,textAlign,textBaseline,miterLimit".split(",");
            var style = {};
            for (var i = 0; i < names.length; i++) {
                style[names[i]] = ctx[names[i]];
            }
            return style;
        },
        setStyle : function (ctx, style) {
            if ( style === undefined) {
                return;
            }
            for (var i in style) {
                ctx[i] = style[i];
            };
        },
        fillStroke : function(ctx){
            if (ctx.fillStyle !== "" && !(ctx.fillStyle === "rgba(0,0,0,0)")) {
                ctx.fill();
            }
            if(ctx.lineWidth !== "0" && ctx.lineWidth !== 0){
                ctx.stroke();
            }            
        },
        // draw functions draw. Set line width to 0 to suppress stroke and sill style to "" to stop fill
        // They are all pased the image that has attatched the context names ctx.
        // They all must returns the image so that they can be chained
        drawRoundedPoly : function (img, points, style) {
            this.setStyle(img.ctx,style);
            this.roundedPolygon(img.ctx,points);
            this.fillStroke(img.ctx);
            return img
        }, 
        drawSquare : function(img,x,y,size,style){
            var p = [];
            var ind = 0;
            p[ind++] = x;
            p[ind++] = y;
            p[ind++] = x + size;
            p[ind++] = y;
            p[ind++] = x + size;
            p[ind++] = y + size;
            p[ind++] = x ;
            p[ind++] = y + size;
            return this.drawRoundedPoly(img,p,style);
        },
        drawRectangle : function(img,x,y,width,height,style){
            var p = [];
            var ind = 0;
            p[ind++] = x;
            p[ind++] = y;
            p[ind++] = x + width;
            p[ind++] = y;
            p[ind++] = x + width;
            p[ind++] = y + height;
            p[ind++] = x ;
            p[ind++] = y + height;
            return this.drawRoundedPoly(img,p,style);
        },
        drawParrallelogram : function(img,x,y,width,height,skew,horizontal,style){
            var p = [];
            var ind = 0;
            if(horizontal){
                p[ind++] = x;
                p[ind++] = y;
                p[ind++] = x + width;
                p[ind++] = y;
                p[ind++] = x + width + skew;
                p[ind++] = y + height;
                p[ind++] = x + skew;
                p[ind++] = y + height;
            }else{
                p[ind++] = x;
                p[ind++] = y;
                p[ind++] = x + width;
                p[ind++] = y + skew;
                p[ind++] = x + width ;
                p[ind++] = y + height + skew;
                p[ind++] = x ;
                p[ind++] = y + height;            
            }
            return this.drawRoundedPoly(img,p,style);
        },
        drawRhombus : function(img,x,y,size,skew,horizontal,style){
            var p = [];
            var ind = 0;
            if(skew > size || skew < -size){
                return img;
            }
            var angled = Math.sqrt(size * size - skew * skew);
            if(horizontal){
                p[ind++] = x;
                p[ind++] = y;
                p[ind++] = x + size;
                p[ind++] = y;
                p[ind++] = x + size + skew;
                p[ind++] = y + angled;
                p[ind++] = x + skew;
                p[ind++] = y + angled;
            }else{
                p[ind++] = x;
                p[ind++] = y;
                p[ind++] = x + angled;
                p[ind++] = y + skew;
                p[ind++] = x + angled ;
                p[ind++] = y + size + skew;
                p[ind++] = x ;
                p[ind++] = y + size;            
            }
            return this.drawRoundedPoly(img,p,style);
        },       
        drawTrapezoidUS : function(img,x,y,len1,x1,y1,len2,horizontal,style){
            var p = [];
            var ind = 0;
            if(horizontal){
                p[ind++] = x;
                p[ind++] = y;
                p[ind++] = x + len1;
                p[ind++] = y;
                p[ind++] = x1 + len2;
                p[ind++] = y1;
                p[ind++] = x1;
                p[ind++] = y1;
            }else{
                p[ind++] = x;
                p[ind++] = y;
                p[ind++] = x1 ;
                p[ind++] = y1 ;
                p[ind++] = x1;
                p[ind++] = y1+ len2;
                p[ind++] = x ;
                p[ind++] = y + len1;            
            }
            return this.drawRoundedPoly(img,p,style);
        },
        drawBand : function (img,x,y,r1,r2,a1,a2, style) {
            setStyle(img.ctx,style)
            r1 = Math.abs(r1);
            r2 = Math.abs(r2);
            if(style.rounding === 0){
                band(img.ctx,x,y,r1,r2,a1,a2)
            }else{
                roundedBand(img.ctx,x,y,r1,r2,a1,a2)
            }
            this.fillStroke(img.ctx);
            return img;
        },
        drawCircleInset : function (img,x,y,r1,r2,a1,a2, style) {
            setStyle(img.ctx, style);
            r1 = Math.abs(r1);
            r2 = Math.abs(r2);
            if (style.rounding === 0) {
                insetCircle(img.ctx, x, y, r1, r2, a1, a2)
            } else {
                roundedInsetCircle(img.ctx, x, y, r1, r2, a1, a2)
            }
            this.fillStroke(img.ctx);
            return img;
        },
        drawGear : function (img, x, y, r1, r2, a, teeth, style) {
            var rr1, rr2, p, steos, subStep, len, lenA, a1, a2, i;
            setStyle(img.ctx, style)
            r1 = Math.abs(r1);
            r2 = Math.abs(r2);
            rr1 = Math.min(r1, r2);
            rr2 = Math.max(r1, r2);
            p = [];
            step = PI2 / teeth;
            subStep = step / 2;

            len = rr1 * subStep;
            lenA = (subStep - (len / rr2)) / 2;
            for (i = 0; i < teeth; i++) {
                a1 = i * step;
                a2 = a1 + subStep;
                p[i * 8 + 0] = Math.cos(a + a1) * rr1 + x;
                p[i * 8 + 1] = Math.sin(a + a1) * rr1 + y;
                p[i * 8 + 2] = Math.cos(a + a1 + subStep) * rr1 + x;
                p[i * 8 + 3] = Math.sin(a + a1 + subStep) * rr1 + y;
                p[i * 8 + 4] = Math.cos(a + a1 + subStep + lenA) * rr2 + x;
                p[i * 8 + 5] = Math.sin(a + a1 + subStep + lenA) * rr2 + y;
                p[i * 8 + 6] = Math.cos(a + a1 + step - lenA) * rr2 + x;
                p[i * 8 + 7] = Math.sin(a + a1 + step - lenA) * rr2 + y;

            }
            if (style.rounding === 0) {
                gear(img.ctx, x, y, r1, r2, 20)
            } else {
                roundedPolygon(img.ctx, p)
            }
            this.fillStroke(img.ctx);
            return img;
        }
    };
    return shapes;
})()