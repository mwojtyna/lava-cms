"use client";

import * as React from "react";
import { Card } from "@admin/src/components/ui/server";
import { ActionIcon } from "@admin/src/components/ui/client";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

export function PagePreview(props: { url: string }) {
	const ref = React.useRef<HTMLIFrameElement>(null);
	const [url, setUrl] = React.useState(props.url);

	return (
		<Card className="m-4 gap-0 overflow-hidden p-0 md:m-4 md:p-0">
			<div className="flex items-center gap-2 p-2 md:p-2">
				<ActionIcon onClick={() => ref.current?.contentWindow?.location.reload()}>
					<ArrowPathIcon className="w-5" />
				</ActionIcon>
				<URL url={url} setUrl={setUrl} />
			</div>
			<iframe
				ref={ref}
				className="relative h-full w-full"
				title="Page preview"
				src={props.url}
				onLoad={(e) => setUrl(e.currentTarget.contentWindow?.location.href ?? "")}
				// Allow all
				sandbox="allow-downloads allow-downloads-without-user-activation allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation allow-top-navigation-by-user-activation allow-top-navigation-to-custom-protocols"
			/>
		</Card>
	);
}

interface URLProps {
	url: string;
	setUrl: (url: string) => void;
}
function URL(props: URLProps) {
	const split = props.url.split("://");
	const protocol = split[0];
	const domain = split[1]!.split("/")[0];
	const rest = split[1]!.slice(domain!.length);

	return (
		<p>
			<span className="text-muted-foreground">{protocol}://</span>
			{domain}
			<span className="text-muted-foreground">{rest}</span>
		</p>
	);
}
