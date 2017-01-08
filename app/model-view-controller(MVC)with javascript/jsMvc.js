/**
 * Created by pengzongcheng on 2017/1/7.
 */
//We will start with the basic modular design pattern and expose our library to the global
//scope through an Object facade in the end.
; (function (w, d, undefined) {
  //rest of the code
  var _viewElement = null; //element that will be used to render the view

  var _defaultRoute = null;

  var jsMvc = function () {
    //mapping object for the routes
    this._routeMap = {};
  }
 // After this its time to create the route object in which we will store the information about
  // the route, template and the controller.
  var routeObj = function (c, r, t) {
    this.controller = c;
    this.route = r;
    this.template = t;
  }
  //There will be a separate route object routeObj for every different url. All of those objects
  // will be added to our _routeMap object so that we can later retrieve them by the means of
  // key-value pair associations.

  //To add routes to the mvc library, we will need to expose a function from the library facade.
  // So lets create a function that can be used to add new routes with their respective
  // controllers.
  jsMvc.prototype.AddRoute = function (controller, route, template) {
    this._routeMap[route] = new routeObj(controller, route, template);
  }
  //The function AddRoute accepts three arguments; contoller, route and template. They are:

     // controller: The reference to the controller function that will be called whenever this particular route is accessed.
     // route: Path of the route. This is simply the part that we expect after the pound(#) sign in the url.
     // template: This is the external html file which will be loaded as a view for this route.

  //Now we need an entry point for our library to start parsing the url and serving the associated
  // html templates to the page. To do that, we will need a function. Initialize function is doing
  // the following things:

     // 1) Get the reference of the view element initially. The code expects an element with the
  // attribute view so that it can be searched in the html page.
      //2) Set the default route
      // 3) Validate the view element.
      // 4) Bind the window hash change event so that views can be updated properly in the event
  // of a different hash value in the url.
      // 5) Finally, start the Mvc support.

  //Initialize the Mvc manager object to start functioning
  jsMvc.prototype.Initialize = function () {
    var startMvcDelegate = startMvc.bind(this);

    //get the html element that will be used to render the view
    _viewElement = d.querySelector('[view]');
    if (!_viewElement) return; //do nothing if view element is not found

    //Set the default route
    _defaultRoute = this._routeMap[Object.getOwnPropertyNames(this._routeMap)[0]];

    //start the Mvc manager
    w.onhashchange = startMvcDelegate;
    startMvcDelegate();
  }

 // In the above code, we are creating a function delegate startMvcDelegate from startMvc function. This delegate will then be called everytime the hash value changes. Following is the sequence of steps that we need to perform every time the hash value is changed:

  //1) Get the hash value.
  //2) Get the route value from the hash.
  //3) Get the route object routeObj from the route map object _routeMap.
  //4) Get the default route object if no route is found in the url.
  //5) Finally call the controller associated with the route and serve the required view in the view element.

  //All the above steps are done in the following startMvc function code.
  //function to start the mvc support
  function startMvc() {
    var pageHash = w.location.hash.replace('#', ''),
        routeName = null,
        routeObj = null;

    routeName = pageHash.replace('/', ''); //get the name of the route from the hash
    routeObj = this._routeMap[routeName]; //get the route object

    //Set to default route object if no route found
    if (!routeObj)
      routeObj = _defaultRoute;

    loadTemplate(routeObj, _viewElement, pageHash); //fetch and set the view of the route
  }

  //Function to load external html data
  function loadTemplate(routeObject, view) {
    var xmlhttp;
    if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    }
    else {
      // code for IE6, IE5
      xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
    }
    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        loadView(routeObject, view, xmlhttp.responseText);
      }
    }
    xmlhttp.open('GET', routeObject.template, true);
    xmlhttp.send();
  }

  //All that is left now is to load the view and bind the object model with the view template.
  // We will create an empty model object and then will invoke the route's controller function
  // along with passing the model reference to that function. The updated model object will
  // be then binded with the html template loaded previously in the XHR call.

  //loadView function will be used to call the controller function and to prepare the model object.
  //replaceToken function will be used to bind the model with the html template.
  //Function to load the view with the template
  function loadView(routeObject, viewElement, viewHtml) {
    var model = {};

    //get the resultant model from the controller of the current route
    routeObject.controller(model);

    //bind the model with the view
    viewHtml = replaceToken(viewHtml, model);

    //load the view into the view element
    viewElement.innerHTML = viewHtml;
  }

  function replaceToken(viewHtml, model) {
    var modelProps = Object.getOwnPropertyNames(model);

        modelProps.forEach(function (element, index, array) {
      viewHtml = viewHtml.replace('{{' + element + '}}', model[element]);
    });
    return viewHtml;
  }
  //Finally we will expose the plugin to the outside world of JavaScript Global Scope.
  //attach the mvc object to the window
  w['jsMvc'] = new jsMvc();
  })(window, document);