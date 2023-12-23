"use client";

import type { IframeMessage } from "./types";
import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import {
	ArrowPathIcon,
	ArrowTopRightOnSquareIcon,
	PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { useElementSize, useLocalStorage } from "@mantine/hooks";
import { IconMinusVertical } from "@tabler/icons-react";
import { Resizable } from "re-resizable";
import * as React from "react";
import { EditableText } from "@/src/components/EditableText";
import { ActionIcon, Tooltip, TooltipContent, TooltipTrigger } from "@/src/components/ui/client";
import { Card } from "@/src/components/ui/server";
import { useSearchParams } from "@/src/hooks";
import { cn } from "@/src/utils/styling";

const MIN_WIDTH = 250;

export function PagePreview(props: { baseUrl: string; pageUrl: string }) {
	const resizableRef = React.useRef<Resizable>(null);
	const iframeRef = React.useRef<HTMLIFrameElement>(null);
	const [remountIframe, setRemountIframe] = React.useState(false);

	const [width, setWidth] = useLocalStorage({
		key: "page-preview-width",
		defaultValue: MIN_WIDTH * 2,
	});
	const { ref: wrapperRef, width: maxWidth } = useElementSize();

	const [url, setUrl] = React.useState(props.baseUrl + props.pageUrl);
	const { setSearchParams } = useSearchParams({
		onChanged: (searchParams) => {
			setUrl(props.baseUrl + (searchParams.get("path") ?? ""));
			setRemountIframe((prev) => !prev);
		},
	});

	// Fix script not being initialized sometimes
	const initIframeScript = React.useCallback(() => {
		const origin = new URL(props.baseUrl).origin;
		iframeRef.current?.contentWindow?.postMessage({ name: "init" } as IframeMessage, origin);
	}, [props.baseUrl]);
	React.useEffect(() => {
		initIframeScript();
	}, [initIframeScript]);

	function navigate(url: string) {
		// Only store pathname to prevent overriding the iframe origin set in Connection Settings
		const path = url.slice(props.baseUrl.length);
		setSearchParams({ path });
		setUrl(url); // Set the URL right away to prevent url lag
		setRemountIframe((prev) => !prev);
	}

	return (
		<div ref={wrapperRef} className="h-full">
			<Resizable
				ref={resizableRef}
				className="mx-auto flex"
				minWidth={MIN_WIDTH}
				maxWidth={maxWidth - 45} // Account for the handles
				size={{ width, height: "100%" }}
				enable={{ left: true, right: true }}
				handleComponent={{
					left: (
						<IconMinusVertical
							size={64}
							className="relative right-[38px] h-full text-muted-foreground transition-colors hover:text-foreground"
							aria-label="Left resize handle"
						/>
					),
					right: (
						<IconMinusVertical
							size={64}
							className="relative right-[16px] h-full text-muted-foreground transition-colors hover:text-foreground"
							aria-label="Right resize handle"
						/>
					),
				}}
				onResizeStop={(_, __, ___, delta) => setWidth(width + delta.width)}
			>
				<Card className="m-4 mx-0 h-auto flex-1 gap-0 overflow-hidden p-0 md:m-4 md:mx-0 md:p-0">
					<div className="flex items-center gap-2 p-2 md:p-2">
						<div className="flex">
							<ActionIcon
								onClick={() => {
									if (iframeRef.current) {
										iframeRef.current.src = url;
									}
								}}
								tooltip="Refresh"
							>
								<ArrowPathIcon className="w-5" />
							</ActionIcon>
						</div>

						<Url baseUrl={props.baseUrl} url={url} onUrlChanged={navigate} />

						{url !== props.baseUrl + props.pageUrl && (
							<Tooltip>
								<TooltipTrigger
									onClick={() => navigate(props.baseUrl + props.pageUrl)}
								>
									<ExclamationTriangleIcon className="mt-1 w-6 cursor-help text-yellow-500" />
								</TooltipTrigger>
								<TooltipContent>
									The previewed page&apos;s URL differs from the URL of the page
									that you&apos;re editing. Click to reset.
								</TooltipContent>
							</Tooltip>
						)}
						<Tooltip>
							<ActionIcon
								className="ml-auto"
								onClick={() => window.open(url)}
								tooltip="Open in new tab"
							>
								<ArrowTopRightOnSquareIcon className="w-5" />
							</ActionIcon>
						</Tooltip>
					</div>

					<iframe
						key={+remountIframe}
						ref={iframeRef}
						className={cn("h-full")}
						title="Page preview"
						src={url}
						onLoad={initIframeScript}
						// Allow all
						sandbox="allow-downloads allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation allow-top-navigation-by-user-activation allow-top-navigation-to-custom-protocols"
						loading="lazy"
					/>
				</Card>
			</Resizable>
		</div>
	);
}

interface UrlProps {
	baseUrl: string;
	url: string;
	onUrlChanged: (url: string) => void;
}
function Url(props: UrlProps) {
	const url = new URL(props.url);
	const baseUrl = new URL(props.baseUrl);
	const editableUrl = props.url.slice(props.baseUrl.length, props.url.length);

	const [editing, setEditing] = React.useState(false);

	return (
		<div className="flex w-full gap-2 overflow-hidden">
			<div className={cn("flex items-center overflow-hidden", editing && "w-full")}>
				<p className="whitespace-nowrap text-muted-foreground">
					{url.protocol}
					{"//"}
					<span className="text-foreground">{url.host}</span>
					{baseUrl.pathname}
				</p>
				<EditableText
					inputProps={{ className: "ml-px", "aria-label": "URL input" }}
					value={editableUrl}
					editing={editing}
					setEditing={setEditing}
					onSubmit={(changed) => props.onUrlChanged(`${props.baseUrl}${changed}`)}
					hasCustomEditButton
				>
					<span className="whitespace-nowrap text-muted-foreground">{editableUrl}</span>
				</EditableText>
			</div>

			{!editing && (
				<ActionIcon variant={"simple"} tooltip="Edit">
					<PencilSquareIcon className="w-5" onClick={() => setEditing(true)} />
				</ActionIcon>
			)}
		</div>
	);
}
