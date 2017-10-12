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

function mouseOver(id) {
    drawing[id].setAttributeNS(null, 'tempStroke', drawing[id].getAttributeNS(null, 'stroke'));
    if (!selected) {
        if (!del) {
            drawing[id].setAttributeNS(null, 'stroke', '#ddeeff')
        } else {
            del = false;
            drawing.slice(id)
        }
    }
}

function mouseOut(id) {
    drawing[id].setAttributeNS(null, 'stroke', drawing[id].getAttributeNS(null, 'tempStroke'))
}

function mouseDown(evt, id) {
    if (!selected)
        if (confirm('Delete object?')) {
            var element = evt.target;
            var parent = element.parentNode;
            parent.removeChild(element);
            for (var i = 0; i < count - 1; i++) {
                //if (drawing[i].setAttributeNS === 'function') {
                    drawing[i].setAttributeNS(null, 'onmouseover', 'mouseOver(' + i + ')');
                    drawing[i].setAttributeNS(null, 'onmouseout', 'mouseOut(' + i + ')');
                    drawing[i].setAttributeNS(null, 'onmousedown', 'mouseDown(evt, ' + i + ')')
                //}
            }
            count--
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
        drawing[count].setAttributeNS(null, 'onmouseover', 'mouseOver(' + count + ')');
        drawing[count].setAttributeNS(null, 'onmouseout', 'mouseOut(' + count + ')');
        drawing[count].setAttributeNS(null, 'onmousedown', 'mouseDown(evt, ' + count + ')');
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