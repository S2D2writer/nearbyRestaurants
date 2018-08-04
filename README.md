# nearbyRestaurants


nearbyRestaurants is a learning-project SPA I wrote using React.js (with material-ui components) for the view and node.js (with socket.io) for the backend. The application uses your location to generate a prettified list of dropdowns containing menus of nearby restaurants. I currently use Foursquare API's to get the nearby restaurants and to then get the menus for those restaurants. 

### Development Environment
  - Install webpack globally using `npm install -g webpack`
  - Install dependencies locally using `npm install`, followed by development           dependencies using `npm install --only=dev`
  - Install React developer tools for your browser by googling it - [obligatory lmgtfy](http://bfy.tw/JGTt)
  - Build any view source changes with `npm run build` in the project directory. The build script is in `package.json`.
  - Start the node server (server/index.js).

### Architecture

  - The node server exposes a minimal API to query nearby restaurants from Foursquare based on latitude and longitude as query parameters. It also exposes the ability to request menus via a socket.io event, and it sends these menus (as they come in) back to the browser via events, so that it can update dynamically.

  - React uses a NestedList component which consits of CollapsibleList components       representing each menu. The NestedList component displays a loading bar until the first menu comes in.


