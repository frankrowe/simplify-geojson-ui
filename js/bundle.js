(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var simplify = require('simplify-geojson')

$(document).ready(function(){

  var map = new L.Map('map').setView(new L.LatLng(38.85, -77), 7);

  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map)

})
},{"simplify-geojson":2}],2:[function(require,module,exports){
var simplify = require('simplify-geometry')

module.exports = function(geojson, tolerance, dontClone) {
  if (!dontClone) geojson = JSON.parse(JSON.stringify(geojson)) // clone obj
  if (geojson.features) return simplifyFeatureCollection(geojson, tolerance)
  else if (geojson.type && geojson.type === "Feature") return simplifyFeature(geojson, tolerance)
  else return new Error('FeatureCollection or individual Feature required')
}

module.exports.simplify = function(coordinates, tolerance) {
  return simplify(coordinates, tolerance)
}

// modifies in-place
function simplifyFeature(feat, tolerance) {
  var geom = feat.geometry
  var type = geom.type
  if (type === 'LineString') {
    geom.coordinates = module.exports.simplify(geom.coordinates, tolerance)
  } else if (type === 'Polygon' || type === 'MultiLineString') {
    for (var j = 0; j < geom.coordinates.length; j++) {
      geom.coordinates[j] = module.exports.simplify(geom.coordinates[j], tolerance)
    }
  } else if (type === 'MultiPolygon') {
    for (var k = 0; k < geom.coordinates.length; k++) {
      for (var l = 0; l < geom.coordinates[k].length; l++) {
        geom.coordinates[k][l] = module.exports.simplify(geom.coordinates[k][l], tolerance)
      }
    }
  }
  return feat
}

// modifies in-place
function simplifyFeatureCollection(fc, tolerance) {
  // process all LineString features, skip non LineStrings
  for (var i = 0; i < fc.features.length; i++) {
    fc.features[i] = simplifyFeature(fc.features[i], tolerance)
  }
  return fc
}

},{"simplify-geometry":3}],3:[function(require,module,exports){
var Line = require('./line');

var simplifyGeometry = function(points, tolerance){

  var dmax = 0;
  var index = 0;

  for (var i = 1; i <= points.length - 2; i++){
    d = new Line(points[0], points[points.length - 1]).perpendicularDistance(points[i]);
    if (d > dmax){
      index = i;
      dmax = d;
    }
  }

  if (dmax > tolerance){
    var results_one = simplifyGeometry(points.slice(0, index), tolerance);
    var results_two = simplifyGeometry(points.slice(index, points.length), tolerance);

    var results = results_one.concat(results_two);

  }

  else if (points.length > 1) {

    results = [points[0], points[points.length - 1]];

  }

  else {

    results = [points[0]];

  }

  return results;


}

module.exports = simplifyGeometry;

},{"./line":4}],4:[function(require,module,exports){
var Line = function(p1, p2){

  this.p1 = p1;
  this.p2 = p2;

};

Line.prototype.rise = function() {

  return this.p2[1] - this.p1[1];

};

Line.prototype.run = function() {

  return this.p2[0] - this.p1[0];

};

Line.prototype.slope = function(){

  return  this.rise() / this.run();

};

Line.prototype.yIntercept = function(){

  return this.p1[1] - (this.p1[0] * this.slope(this.p1, this.p2));

};

Line.prototype.isVertical = function() {

  return !isFinite(this.slope());

};

Line.prototype.isHorizontal = function() {

  return this.p1[1] == this.p2[1];

};

Line.prototype._perpendicularDistanceHorizontal = function(point){

  return Math.abs(this.p1[1] - point[1]);

};

Line.prototype._perpendicularDistanceVertical = function(point){

  return Math.abs(this.p1[0] - point[0]);

};

Line.prototype._perpendicularDistanceHasSlope = function(point){
  var slope = this.slope();
  var y_intercept = this.yIntercept();

  return Math.abs((slope * point[0]) - point[1] + y_intercept) / Math.sqrt((Math.pow(slope, 2)) + 1);

};

Line.prototype.perpendicularDistance = function(point){
  if (this.isVertical()) {

    return this._perpendicularDistanceVertical(point);

  }

  else if (this.isHorizontal()){

    return this._perpendicularDistanceHorizontal(point);

  }

  else {

    return this._perpendicularDistanceHasSlope(point);

  }

};

module.exports = Line;

},{}]},{},[1])