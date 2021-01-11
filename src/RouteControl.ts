import { Route } from "wsdot-elc";

export interface IRouteSegment {
    route: Route,
    beginSrmp: number,
    endSrmp: number
}

export function getRoutesConnectedToRouteSegment(routeSegment: IRouteSegment, routes: Route[]): Route[] {
    // Get mainline route SR
    const { route, beginSrmp, endSrmp } = routeSegment;

    const sr = route.routeId.sr;

    const routesInRange = routes.filter(
        r => r.routeId.sr === sr && (
            typeof(r.routeId.mainlineIntersectionMP) === "number" && beginSrmp <= r.routeId.mainlineIntersectionMP && r.routeId.mainlineIntersectionMP <= endSrmp)
    ).sort(sortByRrq);

    return routesInRange;
}

/**
 * Sorting function for mainline Route objects only.
 * @param a First {@type Route} to compare
 * @param b Second {@type Route} to compare
 */
function sort(a: Route, b: Route): number {
    // Get the route IDs
    const aS = Number(a.routeId.sr);
    const bS = Number(b.routeId.sr);
    return aS === bS ? 0 : aS > bS ? 1 : -1;
}

function sortByRrq(a: Route, b: Route): number {
    const [rrqA, rrqB] = [a, b].map(r => r.routeId.mainlineIntersectionMP as number);
    return rrqA === rrqB ? 0 : rrqA > rrqB ? 1 : -1;
}

export function createRouteControl(routes: Route[]): HTMLFormElement {
    const form = document.createElement("form");

    form.classList.add("esri-widget")

    const label = document.createElement("label");
    label.innerText = "Select a route"
    const routeSelect = document.createElement("select");
    routeSelect.id = label.htmlFor = "routeSelect";

    form.appendChild(label);
    form.appendChild(routeSelect);

    // Filter the list of routes to just the mainline ones, then sort.
    const mainlineRoutes = routes.filter(r => r.isMainline).sort(sort);

    // Create options for each route.
    for (const r of mainlineRoutes) {

        const option = document.createElement("option");

        option.label = r.label;
        option.value = r.routeId.toString();

        routeSelect.options.add(option);
    }

    // SRMP controls

    for (const stopType of ["begin", "end"]) {
        const label = document.createElement("label");
        const textbox = document.createElement("input");
        textbox.type = "number";
        textbox.min = "0";
        textbox.step = "0.001";
        label.innerText = "Begin SRMP"

        label.innerText = `${stopType} SRMP`;
        textbox.id = label.htmlFor = `${stopType}SrmpInput`;

        textbox.required = true;

        form.appendChild(label);
        form.appendChild(textbox);
    }


    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.innerText = "Submit";
    form.appendChild(submitButton);

    form.addEventListener("submit", ev => {
        ev.preventDefault();

        const selectedRoute = mainlineRoutes.filter(
            r => r.routeId.toString() === routeSelect.selectedOptions[0].value)[0];

        const customEvent = new CustomEvent<IRouteSegment>("route-selected", {
            detail: {
                route: selectedRoute,
                beginSrmp: Number(form.querySelector<HTMLSelectElement>("#beginSrmpInput")?.value),
                endSrmp: Number(form.querySelector<HTMLSelectElement>("#endSrmpInput")?.value),
            }
        });
        form.dispatchEvent(customEvent);
    })


    return form;
}