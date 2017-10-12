function setCursorByID(id, cursorStyle) {
    var elem;
    if (
        document.getElementById &&
        (elem = document.getElementById(id))
    ) {
        if (elem.style) elem.style.cursor = cursorStyle;
    }
}

setCursorByID('view', 'crosshair');

var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
var svgNS = svg.namespaceURI;
drawing = [];
count = 0;
var selected = false, del = false, debug = false;

function mouseOver(evt) {
    var element = evt.target;
    element.setAttributeNS(null, 'tempStroke', element.getAttributeNS(null, 'stroke'));
    if (!selected) element.setAttributeNS(null, 'stroke', '#ddeeff')
}

function mouseOut(evt) {
    var element = evt.target;
    element.setAttributeNS(null, 'stroke', element.getAttributeNS(null, 'tempStroke'))
}

function mouseDown(evt) {
    if (!selected)
        if (confirm('Delete object?')) {
            var element = evt.target;
            var parent = element.parentNode;
            parent.removeChild(element);
            count--;
        }
}

function click(evt) {
    if (debug) {
        var s = document.getElementById("view");
        var serializer = new XMLSerializer();
        var source = serializer.serializeToString(s);
        document.getElementById('object').innerText = source
    }

    myProps = document.getElementById('view').getBoundingClientRect();
    var x = (evt.clientX - myProps.left).toFixed();
    var y = (evt.clientY - myProps.top).toFixed();
    color = document.getElementById('color').value;
    if (color === '') color = '#000000';
    document.getElementById('coords').innerHTML = 'objects=' + count + ', x=' + x + ', y=' + y;
    if (selected) {
        selected = false;
        drawing[count].setAttributeNS(null, 'x2', x);
        drawing[count].setAttributeNS(null, 'y2', y);
        count++
    } else {
        selected = true;
        drawing[count] = document.createElementNS(svgNS, 'line');
        drawing[count].setAttributeNS(null, "stroke", color);
        drawing[count].setAttributeNS(null, "stroke-width", 3);
        drawing[count].setAttributeNS(null, 'x1', x);
        drawing[count].setAttributeNS(null, 'y1', y);
        drawing[count].setAttributeNS(null, 'x2', x);
        drawing[count].setAttributeNS(null, 'y2', y);
        drawing[count].setAttributeNS(null, 'onmouseover', 'mouseOver(evt)');
        drawing[count].setAttributeNS(null, 'onmouseout', 'mouseOut(evt)');
        drawing[count].setAttributeNS(null, 'onmousedown', 'mouseDown(evt)');
        document.getElementById('view').appendChild(drawing[count]);
    }
}

function getCoords(evt) {
    myProps = document.getElementById('view').getBoundingClientRect();
    var x = (evt.clientX - myProps.left).toFixed();
    var y = (evt.clientY - myProps.top).toFixed();
    document.getElementById('coords').innerHTML = 'objects=' + count + ', x=' + x + ', y=' + y;
    if (selected) {
        if (drawing[count]) {
            drawing[count].setAttributeNS(null, 'x2', x);
            drawing[count].setAttributeNS(null, 'y2', y)
        }
    }
}
