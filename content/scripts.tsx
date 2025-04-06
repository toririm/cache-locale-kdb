import ReactDOM from "react-dom/client";
import ContentApp from "./ContentApp";

let unmount: () => void;

// @ts-ignore
if (import.meta.webpackHot) {
	// @ts-ignore
	import.meta.webpackHot?.accept();
	// @ts-ignore
	import.meta.webpackHot?.dispose(() => unmount?.());
}

if (document.readyState === "complete") {
	unmount = initial() || (() => {});
} else {
	document.addEventListener("readystatechange", () => {
		if (document.readyState === "complete") unmount = initial() || (() => {});
	});
}

console.log("Hello from content script");

function initial() {
	// Create a new div element and append it to the document's body
	const rootDiv = document.createElement("div");
	rootDiv.id = "extension-root";
	document.body.appendChild(rootDiv);

	// Injecting content_scripts inside a shadow dom
	// prevents conflicts with the host page's styles.
	// This way, styles from the extension won't leak into the host page.
	const shadowRoot = rootDiv.attachShadow({ mode: "open" });
	const style = new CSSStyleSheet();
	shadowRoot.adoptedStyleSheets = [style];
	fetchCSS().then((response) => style.replace(response));

	// @ts-ignore
	if (import.meta.webpackHot) {
		// @ts-ignore
		import.meta.webpackHot?.accept("./styles.css", () => {
			fetchCSS().then((response) => style.replace(response));
		});
	}

	const mountingPoint = ReactDOM.createRoot(shadowRoot);
	mountingPoint.render(
		<div className="content_script">
			<ContentApp />
		</div>,
	);
	return () => {
		mountingPoint.unmount();
		rootDiv.remove();
	};
}

async function fetchCSS() {
	const cssUrl = new URL("./styles.css", import.meta.url);
	const response = await fetch(cssUrl);
	const text = await response.text();
	return response.ok ? text : Promise.reject(text);
}
