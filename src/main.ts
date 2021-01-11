import Extent from "esri/geometry/Extent";
import EsriMap from "esri/Map";
import MapView from "esri/views/MapView";
import Search from "esri/widgets/Search";
import { RouteLocator } from "wsdot-elc";
import { createRouteControl, IRouteSegment, getRoutesConnectedToRouteSegment } from "./RouteControl";

const map = new EsriMap({
  basemap: "topo-vector"
});

/**
 * The extent of WA.
 * @see {https://epsg.io/1416-area}
 */
const waExtent = new Extent({
  xmin: -124.79,
  ymin: 45.54,
  xmax: -116.91,
  ymax: 49.05
});

const view = new MapView({
  container: "viewDiv",
  map,
  extent: waExtent
});

const search = new Search({
  view,
  // This search is configured to only search within the extent of WA.
  // To get the default behavior, change "includeDefaultSources" to
  // true and remove the "sources" property.
  includeDefaultSources: false,
  sources: [
    {
      locator: {
        url:
          "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer"
      },
      filter: {
        geometry: waExtent
      } as __esri.SearchSourceFilter,
      countryCode: "US"
    } as __esri.LocatorSearchSource
  ]
});

view.ui.add(search, "top-right");

const routeLocator = new RouteLocator();

routeLocator.getRouteList(true).then(routes => {
  console.group("Get Route List");
  console.debug("routes", routes);
  
  if (routes === null) {
    throw new Error("null routes")
  }

  const currentRoutes = routes.Current;
  console.debug("current routes", currentRoutes);

  const routeControl = createRouteControl(currentRoutes);

  view.ui.add(routeControl, "top-right");
  
  console.groupEnd();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  routeControl.addEventListener("route-selected", (evt: any) => {
    const customEvent = evt as CustomEvent<IRouteSegment>
    const routeSegment = customEvent.detail;
    const {route, beginSrmp, endSrmp} = routeSegment;
    console.debug(`Selected route is ${route.name} @ ${beginSrmp} - ${endSrmp}`, customEvent);

    const connectedRoutes = getRoutesConnectedToRouteSegment(routeSegment, currentRoutes);

    console.debug("connected routes", connectedRoutes);

    const message = connectedRoutes.map(r => `${r.routeId.description} (${r.name})`).join("\n");

    alert(`Connected routes are\n${message}`)
  });
}, error => {
  console.error(error);
})
