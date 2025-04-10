import * as XLSX from "xlsx";
import * as htmlparser2 from "htmlparser2";
import type { KdbRecord } from "../../commons/model";
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
	const queryString = window.location.search;
	const params = new URLSearchParams(queryString);
	const page = params.get("page");

	download().then((data) => {
		console.log("Downloaded data", data.data);
		console.log("Uploaded at", data.uploadedAt);
		chrome.storage.local
			.set({
				kdbData: data.data,
				renewedAt: new Date().toJSON(),
				uploadedAt: data.uploadedAt,
			})
			.catch((err) => console.error(err));
	});

	return () => {};
}

async function download() {
	const response = await fetch("/ct/page_3734847c3734782");
	const html = await response.text();
	let url = undefined;
	let uploadedAt: undefined | string = undefined;
	const parser = new htmlparser2.Parser({
		onopentag(name, attributes) {
			if (name === "a" && attributes.href?.includes("kdb_2025--ja.xlsx")) {
				console.log("Found link to kdb_2025--ja.xlsx");
				url = attributes.href;
			}
		},
		ontext(text) {
			if (text.includes("kdb_2025--ja.xlsx - ")) {
				console.log("Found uploaded date");
				uploadedAt = text.split(" - ")[1].trim();
			}
		},
	});

	parser.write(html);
	parser.end();
	if (!url) {
		console.error("URL not found");
		return { data: [], uploadedAt: undefined };
	}
	const data = await downloadFile(url);
	return { data, uploadedAt };
}

async function downloadFile(url: string) {
	console.log(url);
	const response = await fetch(url);
	const file = await response.arrayBuffer();
	const workbook = XLSX.read(file);
	return parseKdbExcel(workbook);
}

function parseKdbExcel(workbook: XLSX.WorkBook) {
	const sheetName = workbook.SheetNames[0];
	const worksheet = workbook.Sheets[sheetName];
	const data: KdbRecord[] = XLSX.utils.sheet_to_json(worksheet);
	return data.map<{ number: string; room: string }>((row) => {
		const rowObj = Object.entries(row);
		return {
			number: rowObj[0][1],
			room: rowObj[7][1],
		};
	});
}
