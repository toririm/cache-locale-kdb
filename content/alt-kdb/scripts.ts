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
	console.log("initial called");
	const table = document.querySelector("#root > main > table");
	if (!table) {
		return;
	}

	const observer = new MutationObserver(main);
	observer.observe(table, {
		childList: true,
		subtree: true,
	});
	main();

	return () => {
		observer.disconnect();
	};
}

function main() {
	chrome.storage.local.get(["kdbData"]).then((data) => {
		console.log("kdbData", data.kdbData);
		displayLocation(data.kdbData);
	});
}

function displayLocation(data: { number: string; room: string }[]) {
	const number2Room = new Map<string, string>();
	for (const row of data) {
		number2Room.set(row.number, row.room);
	}
	const rows = document.querySelectorAll("#root > main > table > tbody > tr");

	for (const row of rows) {
		const cells = row.childNodes;
		const number = cells[0].childNodes[0].textContent;
		const room = number2Room.get(number ?? "");
		console.log(number, room);
		if (cells[4].textContent?.includes(room ?? "")) {
			continue;
		}
		if (room) {
			cells[4]?.appendChild(document.createTextNode(room ?? ""));
		}
	}
}
