var map;
var markers = [];
var x = document.getElementsByClassName("places-links");
var marker;
var wikis = [];



function initMap() {
    var largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();
    var highlightedIcon = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
    var defaultIcon = "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
    var mymodel = new model();

    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 15,
        center: {
            lat: 24.643333,
            lng: 46.695831
        }
    });

    // Overall viewmodel for this screen, along with initial state
    function Location(title, lat, lng) {
        this.title = ko.observable(title);
        this.location = {
            lat: lat,
            lng: lng
        }
    }

    //ref: http://jsfiddle.net/zf5k9rxq/
    function model() {
        var self = this;
        self.locations = ko.observableArray("");
        self.query = ko.observable("");
        self.filteredLocations = ko.computed(function() {
            var filter = self.query().toLowerCase();

            if (!filter) {
                return self.locations();
            } else {
                return ko.utils.arrayFilter(self.locations(), function(loc) {
                    return loc.title().toLowerCase().indexOf(filter) !== -1;
                });
            }
        });
    }


    loaddata();
    ko.applyBindings(mymodel);


    function loaddata() {
        mymodel.locations.push(new Location("Centeria", 24.698754, 46.684100));
        mymodel.locations.push(new Location("KingdomTower", 24.7114, 46.6744));
        mymodel.locations.push(new Location("Shawerma", 24.709159, 46.687544));
        mymodel.locations.push(new Location("Jarirbookstore", 24.702600, 46.680479));
        mymodel.locations.push(new Location("Al Hammadi Hospital", 24.710260, 46.681838));
        mymodel.locations.push(new Location("SushiYoshi", 24.706037, 46.706238));
        mymodel.locations.push(new Location("dipndip", 24.705002, 46.703607));
    };



    for (var i = 0; i < mymodel.locations().length; i++) {
        var position = mymodel.locations()[i].location;
        var title = mymodel.locations()[i].title();
        //create marker per location,then put in markers array

        marker = new google.maps.Marker({
            position: position,
            map: map,
            title: title,
            icon: defaultIcon,
            animation: google.maps.Animation.DROP,
            id: i,
        });
        //push marker to the array
        markers.push(marker);
        //once marker pushed , its wiki pushed to the array so they will be at the same index in both arrays!
        loadData(markers[i].title);
        // Extend the boundries of the map for each marker
        bounds.extend(marker.position);
        // create onclick EL to open infowindow at each marker
        google.maps.event.addListener(marker, 'click', function() {
            populateInfoWindow(this, largeInfowindow);
        });

        google.maps.event.addListener(marker, 'mouseover', function() {
            this.setIcon(highlightedIcon);
        });

        google.maps.event.addListener(marker, 'mouseout', function() {
            this.setIcon(defaultIcon);
        });

        //https://blog.dmbcllc.com/why-does-javascript-loop-only-use-last-value/
        (function(ii) {
            x[ii].addEventListener('click', function() {
                markers[ii].setIcon(highlightedIcon);
                populateInfoWindow(markers[ii], largeInfowindow);
            });
        })(i);

    }




    map.fitBounds(bounds);

    function populateInfoWindow(marker, infowindow) {
        if (infowindow.marker != marker) {
            infowindow.marker = marker;
            infowindow.setContent('<div>' + marker.title + '</div>' + '<br/>' + wikis[marker.id]);
            infowindow.open(map, marker);
        }
    }




}


function loadData(title) {
    // Wikipedia ajax
    var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + title +
        '&format=json&callback=wikiCallback';

    $.ajax(wikiUrl, {
        url: wikiUrl,
        dataType: "jsonp",
        jsonp: "callback",
        success: function(response) {
            var articleList = response[1];
            articleStr = articleList[0];
            var url = 'http://en.wikipedia.org/wiki/' + articleStr;
            wikis.push('<li><a href="' + url + '">' + articleStr + '</a></li>');
        },
        error: function() {
            wikis.push('<li>No Informations!</li>');
        }
    });
};
