import { Route, } from "wsdot-elc";

export interface IRouteSegment {
    route: Route,
    beginSrmp: number,
    endSrmp: number
}

function sort(a: Route, b: Route): number {
    const aS = Number(a.routeId.sr);
    const bS = Number(b.routeId.sr);
    return aS === bS ? 0 : aS > bS ? 1 : -1;
}

export function createRouteControl(routes: Route[]): HTMLFormElement {
    const form = document.createElement("form");

    const label = document.createElement("label");
    label.innerText = "Select a route"
    const routeSelect = document.createElement("select");
    routeSelect.id = label.htmlFor = "routeSelect";

    form.appendChild(label);
    form.appendChild(routeSelect);

    const mainlineRoutes = routes.filter(r => r.isMainline).sort(sort);

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