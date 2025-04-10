import {
	type FunctionComponent,
	useCallback,
	useEffect,
	useState,
} from "react";

export const PopupApp: FunctionComponent = () => {
	const [cacheInfo, setCacheInfo] = useState<null | {
		uploadedAt: string;
		renewedAt: string;
	}>(null);

	useEffect(() => {
		async function callback() {
			const res = await chrome.storage.local.get([
				"kdbData",
				"renewedAt",
				"uploadedAt",
			]);
			const renewedAt = res.renewedAt;
			const uploadedAt = res.uploadedAt;
			if (typeof uploadedAt === "string") {
				const renewedDate = new Date(Date.parse(renewedAt));
				setCacheInfo({ uploadedAt, renewedAt: renewedDate.toLocaleString() });
			} else {
				setCacheInfo(null);
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
					{cacheInfo === null ? (
						<>
							<div>❌ manabaにログインして教室情報をローカルに保存できます</div>
							<div>ただし、KdB.classroom のコース登録が必要です</div>
						</>
					) : (
						<>
							<div>{`⭕️ ${cacheInfo.uploadedAt} にアップロードされたデータを使用中`}</div>
							<div>{`（${cacheInfo.renewedAt} 最終確認）`}</div>
						</>
					)}
				</div>
				<button type="button" className="delete-cache" onClick={deleteCache}>
					キャッシュを削除する
				</button>
			</div>
		</div>
	);
};
