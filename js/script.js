
      var map;
      var markers = [];
      function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
          zoom: 15,
          center: {lat: 24.643333, lng: 46.695831}
        });

        // var locations = [
        //   {title: 'Centeria Mall', location: {lat: 24.698415, lng: 46.683869}},
        //   {title: 'Kingdom Tower', location: {lat: 24.7114, lng: 46.6744}},
        //   {title: 'Burger Boutique', location: {lat: 24.703426, lng: 46.678498}},
        //   {title: 'Jarir Bookstore', location: {lat: 24.702556, lng: 46.680667}},
        //   {title: 'Aqariyah Plaza', location: {lat: 24.708017, lng: 46.678737}}
        // ];


        // Overall viewmodel for this screen, along with initial state
        function PlaceViewModel() {
          var self = this;  

          // Editable data
          self.locations = ko.observableArray([
          {title: 'Centeria Mall', location: {lat: 24.698415, lng: 46.683869}},
          {title: 'Kingdom Tower', location: {lat: 24.7114, lng: 46.6744}},
          {title: 'Burger Boutique', location: {lat: 24.703426, lng: 46.678498}},
          {title: 'Jarir Bookstore', location: {lat: 24.702556, lng: 46.680667}},
          {title: 'Aqariyah Plaza', location: {lat: 24.708017, lng: 46.678737}}
          ]);
        }

        var viewModel = new PlaceViewModel();
        ko.applyBindings(viewModel);


        var largeInfowindow = new google.maps.InfoWindow();
        var bounds = new google.maps.LatLngBounds();
        var highlightedIcon = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
        var defaultIcon = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';

        for (var i = 0; i < viewModel.locations().length; i++) {
          var position = viewModel.locations()[i].location;
          var title = viewModel.locations()[i].title;
          //create marker per location,then put in markers array
          var marker = new google.maps.Marker({
            position: position,
            map: map,
            title: title,
            icon: defaultIcon,
            animation: google.maps.Animation.DROP,
            id: i
          });
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
        }

        map.fitBounds(bounds);

        function populateInfoWindow(marker,infowindow) {
          //check to make sure the infowindow is not already opend in this marker
          if (infowindow.marker != marker) {
            infowindow.marker = marker;
            infowindow.setContent('<div>' + marker.title + '</div>');
            infowindow.open(map, marker);
            // make sure the marker property is cleared if the infowindow is closed
            infowindow.addEventListener('closeclick',function(){
              infowindow.setMarker(null);
            });
          }
        }

      }
