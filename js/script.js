var map;
var marker;
//ref for seach functionality: http://jsfiddle.net/zf5k9rxq/
function ViewModel() {
  var self = this;
  this.locations = ko.observableArray(locations);
  this.query = ko.observable("");
  this.filteredLocations = ko.computed(function() {
    var filter = self.query().toLowerCase();
    if (!filter) {
      //self.locations().map((x) => x.marker.setVisible(false));
      if (self.locations()[0].marker) {
        self.locations().map((x) => x.marker.setVisible(true));
      }
      return self.locations();
    } else {
      return ko.utils.arrayFilter(self.locations(), function(loc) {
        if (loc.title.toLowerCase().indexOf(filter) !== -1) {
          loc.marker.setVisible(true);
        } else {
          loc.marker.setVisible(false);
        }
        return loc.title.toLowerCase().indexOf(filter) !== -1;
      });
    }
  });

  //this block make the ajax call for wikipedia and streetview apis then open infowindo for its marker
  this.populateInfoWindow = function(marker, infowindow) {
    if (infowindow.marker != marker) {
      infowindow.marker = marker;
      var wikiUrl = `http://en.wikipedia.org/w/api.php?action=opensearch&search=${marker.title.replace(/\s+/, "")}
      &format=json&callback=wikiCallback`;
      $.ajax({
        url: wikiUrl,
        dataType: "jsonp",
        jsonp: "callback",
        success: function(response) {
          var streetviewUrl = 'http://maps.googleapis.com/maps/api/streetview?size=100x50&location=' + marker.title + '';
          var articleList = response[1];
          articleStr = articleList[0];
          console.log(articleStr);
          var url = `http://en.wikipedia.org/wiki/' ${articleStr}`;
          marker.wiki = `<li class="marker-wiki"><a href="${url}" >${articleStr}</a></li>`;
          infowindow.setContent(`<div class="marker-title">${marker.title}</div><br/><b>Type: </b>${self.locations()[marker.id].type}<br/><b>More on Wikipedia</b>${marker.wiki}<br><img class="bgimg" src="${streetviewUrl}">`);
          infowindow.open(map, marker);
        },
        error: function() {
          infowindow.setContent(`<div class="marker-title">${marker.title}</div><br><b>Error while loading data</b>`);
          infowindow.open(map, marker);
        }
      });

    }
  };
  //this block call the previous block to open the infowindow of the clicked place from the list
  this.popup = function(marker) {
    var info = new google.maps.InfoWindow();
    self.populateInfoWindow(this.marker, info);
    this.marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout((function() {
      this.marker.setAnimation(null);
      info.close();
    }).bind(this), 3000);
  };
  //this block initilizes the map and its markers taking places info from locations.js
  this.initMap = function() {
    var bounds = new google.maps.LatLngBounds();
    var highlightedIcon = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
    var defaultIcon = "http://maps.google.com/mapfiles/ms/icons/red-dot.png";

    map = new google.maps.Map(document.getElementById("map"), {
      zoom: 15,
      center: {
        lat: 24.643333,
        lng: 46.695831
      },
      styles: style
    });

    for (var i = 0; i < self.filteredLocations().length; i++) {
      var position = self.filteredLocations()[i].position;
      var title = self.filteredLocations()[i].title;
      var currentLocation = self.filteredLocations()[i];
      currentLocation.marker = new google.maps.Marker({
        position: position,
        map: map,
        title: title,
        icon: defaultIcon,
        animation: google.maps.Animation.DROP,
        id: i,
        visible: true
      });
      // Extend the boundries of the map for each marker
      bounds.extend(currentLocation.marker.position);
      // create onclick EL to open infowindow at each marker
      google.maps.event.addListener(currentLocation.marker, 'click', function() {
        self.popup.call(self.filteredLocations()[this.id],self.filteredLocations()[this.id]);
      });

      google.maps.event.addListener(currentLocation.marker, 'mouseover', function() {
        this.setIcon(highlightedIcon);
      });

      google.maps.event.addListener(currentLocation.marker, 'mouseout', function() {
        this.setIcon(defaultIcon);
      });

    }

    map.fitBounds(bounds);

  };
  this.initMap();
}

function googleMapsError() {
  alert('A problem accured while loading the map, please try again!');
}
//first method called
function start() {
  ko.applyBindings(new ViewModel());
}
