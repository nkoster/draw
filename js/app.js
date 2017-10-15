function setCursorByID(id, cursorStyle) {
    var element;
    if (document.getElementById && (element = document.getElementById(id)))
        if (element.style) element.style.cursor = cursorStyle
}

setCursorByID('view', 'crosshair');

function calcCirclePath(x1, y1, x2, y2, x3, y3){
    var a = [x1, y1];
    var b = [x3, y3];
    var c = [x2, y2];

    var A = dist(b, c);
    var B = dist(c, a);
    var C = dist(a, b);

    var angle = Math.acos((A*A + B*B - C*C)/(2*A*B));

    //calc radius of circle
    var K = .5*A*B*Math.sin(angle);
    var r = A*B*C/4/K;
    r = Math.round(r*1000)/1000;

    //large arc flag
    var laf = +(Math.PI/2 > angle);

    //sweep flag
    var saf = +((b[0] - a[0])*(c[1] - a[1]) - (b[1] - a[1])*(c[0] - a[0]) < 0);

    return ['M', a, 'A', r, r, 0, laf, saf, b].join(' ')
}

function dist(a, b){
    return Math.sqrt(
        Math.pow(a[0] - b[0], 2) +
        Math.pow(a[1] - b[1], 2))
}

var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
var svgNS = svg.namespaceURI;
drawing = [];
count = 0;
var
    selected = false,
    del = false,
    debug = true,
    escapePress = false,
    deletePress = false;

var
    drawLine = 0,
    drawArc = 1,
    draw = drawLine;
var xx, yy;

function mouseOver(evt) {
    var element = evt.target;
    element.setAttributeNS(null, 'tempStroke', element.getAttributeNS(null, 'stroke'));
    if (!selected) element.setAttributeNS(null, 'stroke', '#ddeeff');
    if (selected && escapePress) {
        escapePress = false;
        selected = false;
        var parent = element.parentNode;
        parent.removeChild(element);
        if (debug) debug_update();
    }
}

function mouseOut(evt) {
    var element = evt.target;
    element.setAttributeNS(null, 'stroke', element.getAttributeNS(null, 'tempStroke'))
}

function debug_update() {
    var s = document.getElementById("view");
    var serializer = new XMLSerializer();
    var source = serializer.serializeToString(s);
    document.getElementById('debug').innerText = source
}

function mouseDown(evt) {
    if (!selected)
        if (deletePress) {
        deletePress = false;
        setCursorByID('view', 'crosshair');
        if (confirm('Delete object?')) {
                var element = evt.target;
                var parent = element.parentNode;
                parent.removeChild(element);
                count--;
                if (debug) debug_update();
            }
        }
}

function click(evt) {
    if (debug) debug_update();
    myProps = document.getElementById('view').getBoundingClientRect();
    var x = (evt.clientX - myProps.left).toFixed();
    var y = (evt.clientY - myProps.top).toFixed();
    color = document.getElementById('color').value;
    if (color === '') color = '#000000';
    document.getElementById('coords').innerHTML = 'objects=' + count + ', x=' + x + ', y=' + y;
    if (selected) {
        selected = false;
        if (draw === drawLine) {
            drawing[count].setAttributeNS(null, 'x2', x);
            drawing[count].setAttributeNS(null, 'y2', y);
            count++
        }
        if (draw === drawArc) {
            drawing[count].setAttributeNS(null, 'd', 'M' + xx + ',' + yy + ' C5,45 45,45 ' + x + ',' + y);
            count++
        }
    } else {
        selected = true;
        deletePress = false;
        setCursorByID('view', 'crosshair');
        if (draw === drawLine) {
            drawing[count] = document.createElementNS(svgNS, 'line');
            drawing[count].setAttributeNS(null, 'stroke', color);
            drawing[count].setAttributeNS(null, 'stroke-width', 3);
            drawing[count].setAttributeNS(null, 'x1', x);
            drawing[count].setAttributeNS(null, 'y1', y);
            drawing[count].setAttributeNS(null, 'x2', x);
            drawing[count].setAttributeNS(null, 'y2', y);
            drawing[count].setAttributeNS(null, 'onmouseover', 'mouseOver(evt)');
            drawing[count].setAttributeNS(null, 'onmouseout', 'mouseOut(evt)');
            drawing[count].setAttributeNS(null, 'onmousedown', 'mouseDown(evt)');
            document.getElementById('view').appendChild(drawing[count])
        }
        if (draw === drawArc) {
            xx = x; yy = y;
            drawing[count] = document.createElementNS(svgNS, "path");
            drawing[count].setAttributeNS(null, 'stroke', color);
            drawing[count].setAttributeNS(null, 'stroke-width', 3);
            //drawing[count].setAttributeNS(null, 'd', 'M' + xx + ',' + yy + ' C5,45 45,45 ' + x + ',' + y);
            drawing[count].setAttributeNS(null, 'd', calcCirclePath(xx,yy, xx,yy, x,y));
            drawing[count].setAttributeNS(null, 'fill', 'none');
            drawing[count].setAttributeNS(null, 'onmouseover', 'mouseOver(evt)');
            drawing[count].setAttributeNS(null, 'onmouseout', 'mouseOut(evt)');
            drawing[count].setAttributeNS(null, 'onmousedown', 'mouseDown(evt)');
            document.getElementById('view').appendChild(drawing[count]);
        }
    }
}

function getCoords(evt) {
    myProps = document.getElementById('view').getBoundingClientRect();
    var x = (evt.clientX - myProps.left).toFixed();
    var y = (evt.clientY - myProps.top).toFixed();
    document.getElementById('coords').innerHTML = 'objects=' + count + ', x=' + x + ', y=' + y;
    if (selected) {
        if (draw === drawLine) {
            if (drawing[count]) {
                drawing[count].setAttributeNS(null, 'x2', x);
                drawing[count].setAttributeNS(null, 'y2', y)
            }
        }
        if (draw === drawArc) {
            if (drawing[count]) {
                drawing[count].setAttributeNS(null, 'd', calcCirclePath(xx,yy, x,y, 100,100));
            }
        }
    }
}

document.onkeydown = function(evt) {
    evt = evt || window.event;
    if (evt.keyCode === 27) escapePress = true;
    if (evt.keyCode === 46 || evt.keyCode === 68) {
        setCursorByID('view', 'default');
        deletePress = true
    }
};
