var placeLink = document.getElementsByClassName("places-links");
var input = document.getElementsByClassName("input-field");
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
      return self.locations();
    } else {
      return ko.utils.arrayFilter(self.locations(), function(loc) {
        return loc.title.toLowerCase().indexOf(filter) !== -1;
      });
    }
  });

  this.populateInfoWindow = function(marker, infowindow) {
    if (infowindow.marker != marker) {
      infowindow.marker = marker;
      console.log(marker.title.replace(/\s+/, ""));
      var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title.replace(/\s+/, "") +
        '&format=json&callback=wikiCallback';
      $.ajax({
        url: wikiUrl,
        dataType: "jsonp",
        jsonp: "callback",
        success: function(response) {
          var streetviewUrl = 'http://maps.googleapis.com/maps/api/streetview?size=100x50&location=' + marker.title.replace(/\s+/, "") + '';
          var articleList = response[1];
          articleStr = articleList[0];
          var url = 'http://en.wikipedia.org/wiki/' + articleStr;
          marker.wiki = '<li class="marker-wiki"><a href="' + url + '">' + articleStr + '</a></li>';
          infowindow.setContent('<div class="marker-title">' + marker.title + '</div>' + '<br/><b>More on Wikipedia</b> ' + marker.wiki + '<br>' + '<img class="bgimg" src="' + streetviewUrl + '">');
          infowindow.open(map, marker);
        },
        error: function() {
          infowindow.setContent('<div class="marker-title">' + marker.title + '</div>' + '<br><b>Error while loading data</b>');
          infowindow.open(map, marker);
        }
      });

    }
  };

  this.pop = function(marker) {
    let info = new google.maps.InfoWindow();
    self.populateInfoWindow(self.filteredLocations()[marker.id - 1].marker, info);
    self.filteredLocations()[marker.id - 1].marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout((function() {
      self.filteredLocations()[marker.id - 1].marker.setAnimation(null);
      info.close();
    }).bind(self.filteredLocations()[marker.id - 1].marker), 3000);
  }

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

    this.largeInfowindow = new google.maps.InfoWindow();

    for (var i = 0; i < self.filteredLocations().length; i++) {
      var lat = self.filteredLocations()[i].lat;
      var lng = self.filteredLocations()[i].lng;
      var title = self.filteredLocations()[i].title;
      var currentLocation = self.filteredLocations()[i];
      currentLocation.marker = new google.maps.Marker({
        position: {
          lat: lat,
          lng: lng
        },
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
        self.populateInfoWindow(this, self.largeInfowindow);
        setTimeout((function() {
          currentLocation.marker.setAnimation(null);
          self.largeInfowindow.close();
        }).bind(currentLocation.marker), 5000);
      });

      google.maps.event.addListener(currentLocation.marker, 'mouseover', function() {
        this.setIcon(highlightedIcon);
      });

      google.maps.event.addListener(currentLocation.marker, 'mouseout', function() {
        this.setIcon(defaultIcon);
      });

      document.getElementById("input-field").addEventListener('input', function() {
        if (document.getElementById("input-field").value === "") {
          self.locations().map((x) => x.marker.setVisible(true));
        }
        self.locations().map((x) => x.marker.setVisible(false));
        self.filteredLocations().map((x) => x.marker.setVisible(true));
      });

    }

    map.fitBounds(bounds);

  }
  this.initMap();
}

function start() {
  ko.applyBindings(new ViewModel());
}