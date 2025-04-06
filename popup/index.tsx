import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PopupApp } from "./PopupApp";

const root = document.getElementById("root");
if (root) {
	const reactRoot = createRoot(root);
	reactRoot.render(
		<StrictMode>
			<PopupApp />
		</StrictMode>,
	);
}
