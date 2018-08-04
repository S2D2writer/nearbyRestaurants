function getLocation() {
    return new Promise(function (resolve, reject) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                resolve(position)
            });
        }
    });
}

function getNearbyRestaurantRawData() {
    return getLocation().then(function (position) {
        let latitude = position.coords.latitude;
        let longitude = position.coords.longitude;
        return fetch(`http://localhost:8080/go?latitude=${latitude}&longitude=${longitude}`);
    }).then(function (restaurantsResponse) {
        return restaurantsResponse.json();
    });
}

function parseOutVenueIds(rawVenuesJson) {
    let venuesArray = rawVenuesJson.response.venues;
    return venuesArray.map(venue => ({
        id: venue.id,
        name: venue.name,
    }));
}


export {getNearbyRestaurantRawData, parseOutVenueIds};

