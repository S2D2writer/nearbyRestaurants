const request = require('request');
const fs = require('fs');

let menuData = JSON.parse(fs.readFileSync('./server/menuData.json', {encoding: "UTF-8"}));

function getNearbyRestaurants(responseToBeSent, parameters) {
    const latitude = parseFloat(parameters.latitude);
    const longitude = parseFloat(parameters.longitude);
    request({
        url: `https://api.foursquare.com/v2/venues/search`,
        qs: {
            client_id: `BAAAY511EYIJL5BO3WSJXGQ0KO0IWWVXLDZS4BZPWCWSXMJM`,
            client_secret: `GIKJDBPHQ55XEVACXM1NDDXKTWPYNXOGGFM0PLC4ZZ5K3WXR`,
            ll: `${latitude},${longitude}`,
            categoryId: "4d4b7105d754a06374d81259",
            limit: 10,
            v: 20180601,
        }
    }, function (error, response, body) {
        responseToBeSent.write(body);
        responseToBeSent.end();
    });
}

/** Socket.IO Event listeners */

function socketIoConnectionHandler(socket) {
    /**
     * wraps each request in a promise, emitting a socket event when it comes back. As a result
     * of this, client doesn't have to wait for each menu to come to start rendering, and it's
     * motherfukin fast.
     * @param menuIds
     */
    function reportNearbyMenus(restaurantIds) {
        restaurantIds.forEach(function (id) {
            let restaurantId = id;
            new Promise(function (resolve) {
                request({
                    url: `https://api.foursquare.com/v2/venues/${id}/menu`,
                    qs: {
                        client_id: `BAAAY511EYIJL5BO3WSJXGQ0KO0IWWVXLDZS4BZPWCWSXMJM`,
                        client_secret: `GIKJDBPHQ55XEVACXM1NDDXKTWPYNXOGGFM0PLC4ZZ5K3WXR`,
                        v: 20180601,
                    }
                }, function(error, response, body) {
                    resolve(body);
                });
            }).then(function (menuJson) {
                menuJson = JSON.parse(menuJson);
                menuJson["restaurant_id"] = restaurantId;
                socket.emit('menu-arrived', menuJson);
            });
        });
    }
    socket.on('get-menus', function (menusIds) {
        reportNearbyMenus(menusIds.ids);
    })
}


exports.getNearbyRestaurants = getNearbyRestaurants;
exports.socketIoConnectionHandler = socketIoConnectionHandler;