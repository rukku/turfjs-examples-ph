var bbox = [121.045,
   14.6362,
   121.077, 14.6635];

var map = L.mapbox.map('map', 'examples.map-y7l23tes', { zoomControl: false })
    .setView([14.659974,121.07022,], 15);
map.scrollWheelZoom.disable();

var layerGroup = L.layerGroup().addTo(map);


var grid = turf.hex(bbox, 0.0025);
var grid = turf.count(grid, pts, 'pt_count');

grid.features.forEach(function(cell) {

  var pt_count = cell.properties.pt_count;

  var _nohex = cell._nohex = {};
  _nohex.weight = 0;
  _nohex.color = '#00ffff';
  _nohex.fillOpacity = 0;

  var _nocount = cell._nocount = {};
  _nocount.weight = 0.5;
  _nocount.color = '#00ffff';
  _nocount.fillOpacity = 0;

  var _withCount = cell._withCount = {};
  _withCount.color = '#00ffff';
  _withCount.weight = 0;
  _withCount.fill = '#00FFFF';
  _withCount.fillOpacity = 0;
  if(pt_count >= 1) {
    _withCount.fillOpacity = 0.1;
  } if(pt_count >= 3) {
    _withCount.fillOpacity = 0.6;
    _withCount.weight = 1;
  } if(pt_count >= 5) {
    _withCount.weight = 2;
    _withCount.fillOpacity = 1.0;
  } if(pt_count >= 10) {
    _withCount.weight = 3;
    _withCount.fillOpacity = 0.6;
  }

  cell.properties = cell._nohex;
});

var hex = L.geoJson(grid)
    .eachLayer(function(l) {
        l.setStyle(l.feature.properties);
    })
    .addTo(layerGroup);

L.geoJson(pts, {
  pointToLayer: function(feature, latlng) {
    return L.circleMarker(latlng, {
      radius: 4,
      fillColor:'#fff',
      fillOpacity:1,
      stroke: false
    });
  }
}).addTo(layerGroup);

function setStage(stage) {
    var fns = [];
    hex.eachLayer(function(l) {
        // fns.push(function() {
            l.setStyle(l.feature[stage]);
        // });
    });
    // stage === 'raw' ? fastChain(fns) : slowChain(fns);
}

function slowChain(fns) {
    function run() {
        var fn = fns.pop();
        if (!fn) return;
        fn();
        setTimeout(function() {
            run();
        }, 0);
    }
    run();
}

function fastChain(fns) {
    for (var i = 0; i < fns.length; i++) fns[i]();
}

function setButton(t) {
    var stages = document.getElementById('steps').getElementsByTagName('a');
    for (var i = 0; i < stages.length; i++) {
        stages[i].className = stages[i].className.replace('fill-green', '');
    }
    t.className = t.className + ' fill-green';
}

document.getElementById('raw').onclick = function() { setButton(this); setStage('_nohex'); };
document.getElementById('hex').onclick = function() { setButton(this); setStage('_nocount'); };
document.getElementById('count').onclick = function() { setButton(this); setStage('_withCount'); };

setStage('_withCount');
setButton(document.getElementById('count'));