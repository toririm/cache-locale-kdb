import * as XLSX from "xlsx";
import type { kdbDataColumns } from "../../commons/model";
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

	if (page !== "main") {
		console.log("ログインされていません");
	} else {
		download().then((data) => {
			chrome.storage.local
				.set({ kdbData: data, renewedAt: new Date().toJSON() })
				.catch((err) => console.error(err));
		});
	}

	return () => {};
}

async function download() {
	const response = await fetch(
		"/campusweb/campussquare.do?_flowId=SDW-filerefer-flow&fileId=29",
	);
	const file = await response.arrayBuffer();
	const workbook = XLSX.read(file);
	return parseKdbExcel(workbook);
}

function parseKdbExcel(workbook: XLSX.WorkBook) {
	const sheetName = workbook.SheetNames[0];
	const worksheet = workbook.Sheets[sheetName];
	const data: Record<kdbDataColumns, string>[] =
		XLSX.utils.sheet_to_json(worksheet);
	return data.map((row) => {
		return { number: row.科目番号, room: row.教室 };
	});
}
