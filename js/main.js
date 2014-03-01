var simplify = require('simplify-geojson')
  , topojsonserverapi = require("topojson")

$(document).ready(function(){

  var map = new L.Map('map').setView(new L.LatLng(38.85, -77), 7)
    , geojsonlayer
    , originalgeojson
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
      originalgeojson = res
      addGeoJson(originalgeojson)
    })
  }
  getGeoJson()

  function addGeoJson(geojson){
    if(map.hasLayer(geojsonlayer)) map.removeLayer(geojsonlayer)
    simplifiedgeojson = geojson
    geojsonlayer = L.geoJson(geojson, { style: style }).addTo(map)
    $('.vertices').html(countvertices(simplifiedgeojson))
    $('.geojsonarea').val(JSON.stringify(simplifiedgeojson))
  }

  //TODO fix for multipolygons
  function countvertices(geojson){
    var vertices = 0
    for(var i = 0; i < geojson.features.length; i++){
      var feature = geojson.features[i]
      vertices += feature.geometry.coordinates[0].length
    }
    return vertices
  }

  //TODO verify valid geojson
  $('.add').click(function(e){
    var geojson = JSON.parse($('.geojsonarea').val())
    originalgeojson = geojson
    addGeoJson(geojson)
  })

  $('.simplify').click(function(e){
    var tolerance = $('input[name="tolerance"]').val()
    if(tolerance) {
      var geojson = simplify(simplifiedgeojson, tolerance)
      addGeoJson(geojson)
    }
  })

  $('.topojson').click(function(e){
    var topology = topojsonserverapi.topology({collection: simplifiedgeojson})
    topology = topojson.presimplify(topology)
    var geojson = topojson.feature(topology, topology.objects.collection)
    addGeoJson(geojson)
  })

  $('.reset').click(function(e){
    addGeoJson(originalgeojson)
  })

})
