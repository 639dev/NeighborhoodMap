var map;
var markers = [];
var x = document.getElementsByClassName('places-links');
var marker;
var wikis = [];



function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 15,
    center: {lat: 24.643333, lng: 46.695831}
  });

  // Overall viewmodel for this screen, along with initial state
  function LocationModel() {
    var self = this;  

    // Editable data
    self.locations = ko.observableArray([
    {title: 'riyadh', location: {lat: 24.698415, lng: 46.683869}},
    {title: 'Kingdom', location: {lat: 24.7114, lng: 46.6744}},
    {title: 'Burger', location: {lat: 24.703426, lng: 46.678498}},
    {title: 'Jarir', location: {lat: 24.702556, lng: 46.680667}},
    {title: 'Aqariyah', location: {lat: 24.708017, lng: 46.678737}}
    ]);

  }

  var viewModel = new LocationModel();
  ko.applyBindings(viewModel);


  var largeInfowindow = new google.maps.InfoWindow();
  var bounds = new google.maps.LatLngBounds();
  var highlightedIcon = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
  var defaultIcon = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';

  for (var i = 0; i < viewModel.locations().length; i++) {
    var position = viewModel.locations()[i].location;
    var title = viewModel.locations()[i].title;
    //create marker per location,then put in markers array

    marker = new google.maps.Marker({
      position: position,
      map: map,
      title: title,
      icon: defaultIcon,
      animation: google.maps.Animation.DROP,
      id: i,
    });
    loadData(marker.title);
    //push marker to the array
    markers.push(marker);
    // Extend the boundries of the map for each marker
    bounds.extend(marker.position);
    // create onclick EL to open infowindow at each marker
    google.maps.event.addListener(marker,'click', function(){
      populateInfoWindow(this, largeInfowindow);
    });

    google.maps.event.addListener(marker,'mouseover', function(){
      this.setIcon(highlightedIcon);
    });

    google.maps.event.addListener(marker,'mouseout', function(){
      this.setIcon(defaultIcon);
    });

    //https://blog.dmbcllc.com/why-does-javascript-loop-only-use-last-value/
    (function(ii){
        x[ii].addEventListener('click',function(){
          markers[ii].setIcon(highlightedIcon);
          populateInfoWindow(markers[ii], largeInfowindow);
        });
    })(i);

  }

 



  map.fitBounds(bounds);

  function populateInfoWindow(marker,infowindow) {
    if (infowindow.marker != marker) {
      infowindow.marker = marker;
      infowindow.setContent('<div>' + marker.title + '</div>' + '<br/>' + wikis[marker.id]);
      infowindow.open(map, marker);
    }
  }


  

}


function loadData(marker) {
    // Wikipedia ajax 
    var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker +
    '&format=json&callback=wikiCallback';

    $.ajax(wikiUrl, {
        url: wikiUrl,
        dataType: "jsonp",
        jsonp: "callback",
        success: function(response) {
          console.log("successsss");
          var articleList = response[1];
          articleStr = articleList[0];
          var url = 'http://en.wikipedia.org/wiki/'+ articleStr;
          wikis.push('<li><a href="'+ url + '">' + articleStr+ '</a></li>');
        }, 
        error: function() {
           alert("No information");
        }
    });
};



