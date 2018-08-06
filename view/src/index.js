import React from 'react';
import ReactDOM from 'react-dom';

import AppBar from '@material-ui/core/AppBar';
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import SwipeableViews from 'react-swipeable-views';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import LinearProgress from '@material-ui/core/LinearProgress';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Collapse from '@material-ui/core/Collapse';

import {withStyles} from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

import {parseOutVenueIds, getNearbyRestaurantRawData} from './menuRequester';


let socket = io('http://localhost:8080/');
// function styles(theme) {
//     return {
//         root: {
//             backgroundColor: theme.palette.background.paper,
//         },
//     }
// };

class CollapsibleList extends React.Component {
    constructor(props) {
        super(props);
    }

    generateSubmenuElements(sections) {
        let sectionElementsArray = [];
        for (let i = 0; i < sections.length; i++) {
            for (let j = 0; j < sections[i].entries.items.length; j++) {
                let foodItem = sections[i].entries.items[j];
                sectionElementsArray.push(<ListItem><ListItemText primary={foodItem.name}/></ListItem>)
            }
        }
        return sectionElementsArray;
    }

    render() {
        let subMenuElements = this.generateSubmenuElements(this.props.data);
        return (
            <List>
                <ListItem button onClick={() => {
                    this.props.collapseEventHandler(this.props.restaurantId)
                }}>
                    <ListItemText primary={this.props.restaurantName}/>
                    {this.props.collapsed ? <ExpandMore/> : <ExpandLess/>}
                </ListItem>
                <Collapse in={!this.props.collapsed} timeout="auto" unmountOnExit>
                    <List>
                        {subMenuElements}
                    </List>
                </Collapse>
            </List>
        );
    }
}

class NestedList extends React.Component {
    constructor(props) {
        super(props);
        this.toggleVisiblity = this.toggleVisiblity.bind(this);

        // set initial state for loading bar and event handlers for when
        // menus come after the AJAX call made in cDM
        this.state = {fetchInProgress: true};
        socket.on('menu-arrived', function (menuJson) {
            if (menuJson.response.menu.menus.items) {
                let restaurantId = menuJson.restaurant_id;
                this.setState(function (prevState, props) {
                    return {
                        fetchInProgress: false, // redundant after first menu comes, but that's okay..
                        [restaurantId]: {
                            collapsed: prevState[restaurantId].collapsed,
                            data: menuJson.response.menu.menus.items[0].entries.items,
                            name: prevState[restaurantId].name,
                        }
                    };
                });
            }
        }.bind(this));
    }


    // fire off ajax calls for menus
    componentDidMount() {
        getNearbyRestaurantRawData().then(function (rawData) {
            let restaurants = parseOutVenueIds(rawData);
            let state = {};
            for (let i = 0; i < restaurants.length; i++) {
                state[restaurants[i].id] = {
                    collapsed: true,
                    name: restaurants[i].name,
                };
            }
            this.setState(state, () => {
                socket.emit('get-menus', {
                    ids: restaurants.map(restaurant => restaurant.id), // send an array of the ids
                });
            });
        }.bind(this));
    }

    toggleVisiblity(restaurantId) {
        this.setState(function (prevState, props) {
            let newState = Object.assign({}, prevState);
            newState[restaurantId].collapsed = !prevState[restaurantId].collapsed;
            return newState;
        });
    }

    render() {
        if (this.state.fetchInProgress) {
            return (<LinearProgress/>);
        }
        let arrayOfMenus = [];
        for (let restaurantId in this.state) {
            if (this.state[restaurantId].data) {
                arrayOfMenus.push(<CollapsibleList collapsed={this.state[restaurantId].collapsed}
                                                   collapseEventHandler={this.toggleVisiblity}
                                                   restaurantId={restaurantId} key={restaurantId}
                                                   data={this.state[restaurantId].data}
                                                   restaurantName={this.state[restaurantId].name}/>);
                arrayOfMenus.push(<Divider/>)
            }
        }
        return (
            <List>
                <React.Fragment>
                    <CssBaseline>
                        {arrayOfMenus}
                    </CssBaseline>
                </React.Fragment>
            </List>
        );
    }
}

// class HeaderBar extends React.Component {
//     render() {
//         return (<);
//     }
// }


class AppHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: 0,
        };
        this.changeTab = this.changeTab.bind(this);
    }

    changeTab(newTabValue) {
        this.setState({
            value: newTabValue,
        })
    }

    render() {
        return (
            <React.Fragment>
                <AppBar position="static">
                    <Tabs fullWidth={true} centered value={this.state.value} onChange={(event, value) => {
                        this.changeTab(value);
                    }}>
                        <Tab label="Menus"/>
                        <Tab label="Item Two"/>S
                        <Tab label="About"/>
                    </Tabs>
                </AppBar>
                <SwipeableViews index={this.state.value}>
                    <NestedList/>
                    <p>Page 2 bitches.</p>
                    <p>Page 3. Does it EVER end?</p>
                </SwipeableViews>
            </React.Fragment>
        );
    }
}

//let StyledNestedList = withStyles(styles)(NestedList);
ReactDOM.render(<AppHeader/>, document.getElementById("box"));