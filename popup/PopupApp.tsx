import {
	type FunctionComponent,
	useCallback,
	useEffect,
	useState,
} from "react";

export const PopupApp: FunctionComponent = () => {
	const [renewedAt, setRenewedAt] = useState<null | Date>(null);

	useEffect(() => {
		async function callback() {
			const res = await chrome.storage.local.get(["kdbData", "renewedAt"]);
			const renewedAt = res.renewedAt;
			if (renewedAt) {
				const renewedDate = new Date(Date.parse(renewedAt));
				setRenewedAt(renewedDate);
			} else {
				setRenewedAt(null);
			}
		}
		callback();
		chrome.storage.onChanged.addListener(callback);
		return () => chrome.storage.onChanged.removeListener(callback);
	});

	const deleteCache = useCallback(() => {
		chrome.storage.local.clear();
	}, []);

	return (
		<div className="container">
			<h1 className="title">教室情報キャッシュ</h1>
			<div>
				<div>
					{renewedAt === null
						? "❌ twinsにログインして教室情報をローカルに保存できます"
						: `⭕️ ${renewedAt.toLocaleString()} に最終更新`}
				</div>
				<button type="button" className="delete-cache" onClick={deleteCache}>
					キャッシュを削除する
				</button>
			</div>
		</div>
	);
};
