"use client";

import * as React from "react";
import { Card } from "@admin/src/components/ui/server";
import {
	ActionIcon,
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@admin/src/components/ui/client";
import { ArrowPathIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { IconMinusVertical } from "@tabler/icons-react";
import { useMouse } from "@mantine/hooks";
import { cn } from "@admin/src/utils/styling";

export function PagePreview(props: { url: string }) {
	const iframeRef = React.useRef<HTMLIFrameElement>(null);
	const [url, setUrl] = React.useState(props.url);

	const resizableRef = React.useRef<HTMLDivElement>(null);
	const beginWidth = React.useRef<number>();
	const beginX = React.useRef<number>();
	const { x: mouseX } = useMouse();
	const dragging = React.useRef(false);
	const side = React.useRef<"left" | "right">();

	React.useEffect(() => {
		const cb = () => {
			dragging.current = false;
			beginWidth.current = resizableRef.current!.clientWidth;
		};
		document.addEventListener("mouseup", cb);

		return () => document.removeEventListener("mouseup", cb);
	}, []);

	return (
		<div
			ref={resizableRef}
			className="mx-auto flex min-w-[300px] max-w-full"
			style={{
				width: dragging.current
					? beginWidth.current! +
					  (side.current === "left" ? 1 : -1) * (beginX.current! - mouseX) * 2
					: beginWidth?.current ?? "95%",
			}}
		>
			<IconMinusVertical
				size={64}
				className="-mx-5 h-full text-muted-foreground transition-colors hover:cursor-col-resize hover:text-foreground"
				onMouseDown={(e) => {
					dragging.current = true;
					beginX.current = e.clientX;
					beginWidth.current = resizableRef.current!.clientWidth;
					side.current = "left";
				}}
			/>

			<Card className="m-4 mx-0 h-auto flex-1 gap-0 overflow-hidden p-0 md:m-4 md:mx-0 md:p-0">
				<div className="flex items-center gap-2 p-2 md:p-2">
					<Tooltip>
						<TooltipTrigger asChild>
							<ActionIcon
								onClick={() => iframeRef.current?.contentWindow?.location.reload()}
								aria-label="Refresh"
							>
								<ArrowPathIcon className="w-5" />
							</ActionIcon>
						</TooltipTrigger>
						<TooltipContent>Refresh</TooltipContent>
					</Tooltip>

					<URL url={url} setUrl={setUrl} />

					<Tooltip>
						<TooltipTrigger asChild>
							<ActionIcon
								className="ml-auto"
								onClick={() => window.open(url)}
								aria-label="Open in new tab"
							>
								<ArrowTopRightOnSquareIcon className="w-5" />
							</ActionIcon>
						</TooltipTrigger>

						<TooltipContent>Open in new tab</TooltipContent>
					</Tooltip>
				</div>

				<iframe
					ref={iframeRef}
					className={cn("h-full", dragging.current && "pointer-events-none")}
					title="Page preview"
					src={props.url}
					onLoad={(e) => setUrl(e.currentTarget.contentWindow?.location.href ?? "")}
					// Allow all
					sandbox="allow-downloads allow-downloads-without-user-activation allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation allow-top-navigation-by-user-activation allow-top-navigation-to-custom-protocols"
				/>
			</Card>

			<IconMinusVertical
				size={64}
				className="-mx-5 h-full text-muted-foreground transition-colors hover:cursor-col-resize hover:text-foreground"
				onMouseDown={(e) => {
					dragging.current = true;
					beginX.current = e.clientX;
					beginWidth.current = resizableRef.current!.clientWidth;
					side.current = "right";
				}}
			/>
		</div>
	);
}

function URL(props: { url: string; setUrl: (url: string) => void }) {
	const split = props.url.split("://");
	const protocol = split[0];
	const domain = split[1]!.split("/")[0];
	const rest = split[1]!.slice(domain!.length);

	return (
		<p className="truncate">
			<span className="text-muted-foreground">{protocol}://</span>
			{domain}
			<span className="text-muted-foreground">{rest}</span>
		</p>
	);
}
