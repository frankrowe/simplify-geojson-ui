var simplify = require('simplify-geojson')

$(document).ready(function(){

  var map = new L.Map('map').setView(new L.LatLng(38.85, -77), 7)
    , geojsonlayer
    , simplifiedgeojson
    , style = {
      "color": "#f00"
      , "weight": 3
      , "opacity": .9
      , "fill": false
    }

  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map)

  function getGeoJson(){
    $.getJSON('data/mdcnty.geojson', function(res){
      addGeoJson(res)
    })
  }
  getGeoJson()

  function addGeoJson(geojson){
    if(map.hasLayer(geojsonlayer)) map.removeLayer(geojsonlayer)
    simplifiedgeojson = geojson
    geojsonlayer = L.geoJson(geojson, { style: style }).addTo(map)
    $('.verticies').html(countVerticies(simplifiedgeojson))
  }

  //TODO fix for multipolygons
  function countVerticies(geojson){
    var verticies = 0
    for(var i = 0; i < geojson.features.length; i++){
      var feature = geojson.features[i]
      verticies += feature.geometry.coordinates[0].length
    }
    return verticies
  }

  $('.simplify').click(function(e){
    var tolerance = $('input[name="tolerance"]').val()
    if(tolerance) {
      var geojson = simplify(simplifiedgeojson, tolerance)
      addGeoJson(geojson)
    }
  })

  $('.reset').click(function(e){
    getGeoJson()
  })

})
