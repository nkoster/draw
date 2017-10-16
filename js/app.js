function setCursorByID(id, cursorStyle) {
    var element;
    if (document.getElementById && (element = document.getElementById(id)))
        if (element.style) element.style.cursor = cursorStyle
}

setCursorByID('view', 'crosshair');

function calcCirclePath(x1, y1, x2, y2, x3, y3){
    var
        a = [x1, y1],
        b = [x3, y3],
        c = [x2, y2],
        A = dist(b, c),
        B = dist(c, a),
        C = dist(a, b),
        angle = Math.acos((A * A + B * B - C * C) / (2 * A * B)),
        // Radius of circle
        K = .5 * A * B * Math.sin(angle),
        r = A * B * C / 4 / K;

    r = Math.round(r * 1000) / 1000;

    // Large Arc Flag
    var laf = +(Math.PI / 2 > angle);

    // Sweep Flag
    var saf = +((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]) < 0);

    return ['M', a, 'A', r, r, 0, laf, saf, b].join(' ')
}

function dist(a, b){
    return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2))
}

var
    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"),
    svgNS = svg.namespaceURI,
    drawing = [],
    count = 0,
    selected = 0,
    debug = true,
    escapePress = false,
    deletePress = false,
    drawLine = 0,
    drawArc = 1,
    draw = drawArc,
    xx, yy, xxx, yyy;

var action = document.getElementById('action');
draw = action.selectedIndex;

function mouseOver(evt) {
    var element = evt.target;
    element.setAttributeNS(null, 'tempStroke', element.getAttributeNS(null, 'stroke'));
    if (selected === 0) element.setAttributeNS(null, 'stroke', '#ddeeff');
    if (selected > 0 && escapePress) {
        escapePress = false;
        selected--;
        if (selected === 0) {
            var parent = element.parentNode;
            parent.removeChild(element);
            if (debug) debug_update();
        }
    }
}

function mouseOut(evt) {
    var element = evt.target;
    element.setAttributeNS(null, 'stroke', element.getAttributeNS(null, 'tempStroke'))
}

function debug_update() {
    var s = document.getElementById("view");
    var serializer = new XMLSerializer();
    document.getElementById('debug').innerText = serializer.serializeToString(s)
}

function mouseDown(evt) {
    if (selected === 0)
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
    if (selected > 0) {
        if (draw === drawLine) {
            drawing[count].setAttributeNS(null, 'x2', x);
            drawing[count].setAttributeNS(null, 'y2', y);
            selected--;
            count++
        }
        if (draw === drawArc) {
            if (selected === 1) {
                xxx = x;
                yyy = y;
                selected++;
                drawing[count].setAttributeNS(null, 'd', calcCirclePath(xx, yy, x, y, xx, yy));
            } else if (selected === 2) {
                selected = 0;
                drawing[count].setAttributeNS(null, 'd', calcCirclePath(xxx, yyy, x, y, xx, yy));
                xxx = 0;
                yyy = 0;
                count++
            }
        }
    } else {
        selected++;
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
            drawing[count] = document.createElementNS(svgNS, "path");
            drawing[count].setAttributeNS(null, 'stroke', color);
            drawing[count].setAttributeNS(null, 'stroke-width', 3);
            drawing[count].setAttributeNS(null, 'd', calcCirclePath(x,y, x,y, x,y));
            xx = x;
            yy = y;
            drawing[count].setAttributeNS(null, 'fill', 'none');
            drawing[count].setAttributeNS(null, 'onmouseover', 'mouseOver(evt)');
            drawing[count].setAttributeNS(null, 'onmouseout', 'mouseOut(evt)');
            drawing[count].setAttributeNS(null, 'onmousedown', 'mouseDown(evt)');
            document.getElementById('view').appendChild(drawing[count]);        }
    }
}

function getCoords(evt) {
    if (selected === 0) draw = action.selectedIndex;
    myProps = document.getElementById('view').getBoundingClientRect();
    var x = (evt.clientX - myProps.left).toFixed();
    var y = (evt.clientY - myProps.top).toFixed();
    document.getElementById('coords').innerHTML = 'objects=' + count + ', x=' + x + ', y=' + y;
    if (selected > 0) {
        if (draw === drawLine) {
            if (drawing[count]) {
                drawing[count].setAttributeNS(null, 'x2', x);
                drawing[count].setAttributeNS(null, 'y2', y)
            }
        }
        if (draw === drawArc) {
            if (drawing[count]) {
                if (xxx === 0 && yyy === 0) {
                    drawing[count].setAttributeNS(null, 'd', calcCirclePath(xx, yy, x, y, xx, yy))
                } else {
                    drawing[count].setAttributeNS(null, 'd', calcCirclePath(xxx, yyy, x, y, xx, yy))
                }
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
