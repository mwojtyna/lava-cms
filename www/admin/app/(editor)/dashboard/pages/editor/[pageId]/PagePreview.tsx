"use client";

import type { IframeMessage } from "./types";
import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import {
	ArrowPathIcon,
	ArrowTopRightOnSquareIcon,
	PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { useElementSize, useViewportSize } from "@mantine/hooks";
import { IconMinusVertical } from "@tabler/icons-react";
import { Resizable } from "re-resizable";
import * as React from "react";
import { EditableText } from "@/src/components/EditableText";
import { ActionIcon } from "@/src/components/ui/client";
import { Card } from "@/src/components/ui/server";
import { usePageEditor } from "@/src/data/stores/pageEditor";
import { useSearchParams } from "@/src/hooks";
import { cn } from "@/src/utils/styling";
import { MIN_WIDTH as INSPECTOR_MIN_WIDTH } from "./Inspector";

const MIN_WIDTH = 250;
const HANDLES_WIDTH = 45;

export function PagePreview(props: { baseUrl: string; pageUrl: string }) {
	const iframeRef = React.useRef<HTMLIFrameElement>(null);
	const [remountIframe, setRemountIframe] = React.useState(false);

	const { width: windowWidth } = useViewportSize();
	const [width, setWidth] = React.useState(MIN_WIDTH * 3);
	const [preferredWidth, setPreferredWidth] = React.useState(width);
	const { ref: wrapperRef, width: wrapperWidth } = useElementSize();
	const maxWidth = wrapperWidth - HANDLES_WIDTH;
	const initialWidthSet = React.useRef(false);

	const [url, setUrl] = React.useState(props.baseUrl + props.pageUrl);
	const { setSearchParams } = useSearchParams({
		onChanged: (searchParams) => {
			setUrl(props.baseUrl + (searchParams.get("path") ?? ""));
			setRemountIframe((prev) => !prev);
		},
	});

	// Init bridge when iframe loaded and again when component is mounted
	const initIframeBridge = React.useCallback(() => {
		const origin = new URL(props.baseUrl).origin;
		iframeRef.current?.contentWindow?.postMessage({ name: "init" } as IframeMessage, origin);
		usePageEditor.setState({
			iframe: iframeRef.current,
			iframeOrigin: new URL(props.baseUrl).origin,
		});
	}, [props.baseUrl]);
	React.useEffect(() => {
		initIframeBridge();
	}, [initIframeBridge, iframeRef, props.baseUrl]);

	React.useEffect(() => {
		// Ignore when widths are not set yet
		if (maxWidth > 0) {
			// Set initial width to fill up the available space
			if (!initialWidthSet.current) {
				setWidth(maxWidth);
				setPreferredWidth(maxWidth);
				initialWidthSet.current = true;
			}
			// Update width when inspector makes it smaller while it resizes
			if (width > maxWidth) {
				setWidth(maxWidth);
			}
			// Fill up available space when possible
			if (width < maxWidth && width < preferredWidth) {
				setWidth(
					Math.min(preferredWidth, windowWidth - INSPECTOR_MIN_WIDTH - HANDLES_WIDTH),
				);
			}
			// Update width when window is resized
			if (width > windowWidth) {
				setWidth(windowWidth - INSPECTOR_MIN_WIDTH - HANDLES_WIDTH);
			}
		}
	}, [maxWidth, preferredWidth, width, windowWidth]);

	function navigate(url: string) {
		// Only store pathname to prevent overriding the iframe origin set in Connection Settings
		const path = url.slice(props.baseUrl.length);
		setSearchParams({ path });
		setUrl(url); // Set the URL right away to prevent url lag
		setRemountIframe((prev) => !prev);
	}

	return (
		<div ref={wrapperRef}>
			<Resizable
				className="mx-auto flex"
				minWidth={MIN_WIDTH}
				maxWidth={maxWidth}
				size={{ width, height: "100%" }}
				enable={{ left: true, right: true }}
				handleComponent={{
					left: (
						<IconMinusVertical
							size={64}
							className="relative right-[38px] h-full text-muted-foreground transition-colors hover:text-foreground/90 active:text-foreground/90"
							aria-label="Left resize handle"
						/>
					),
					right: (
						<IconMinusVertical
							size={64}
							className="relative right-[16px] h-full text-muted-foreground transition-colors hover:text-foreground/90 active:text-foreground/90"
							aria-label="Right resize handle"
						/>
					),
				}}
				resizeRatio={2}
				onResizeStop={(_, __, ___, delta) => {
					setWidth(width + delta.width);
					setPreferredWidth(width + delta.width);
				}}
			>
				<Card className="my-4 flex-1 gap-0 overflow-auto !p-0">
					<div className="flex items-center gap-2 p-2 md:p-2">
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

						<Url baseUrl={props.baseUrl} url={url} onUrlChanged={navigate} />
						{url !== props.baseUrl + props.pageUrl && (
							<ActionIcon
								variant={"simple"}
								onClick={() => navigate(props.baseUrl + props.pageUrl)}
								tooltip={
									"The previewed page's URL differs from the URL of the page that you're editing. Click to reset."
								}
							>
								<ExclamationTriangleIcon className="mt-1 w-6 cursor-help text-yellow-500" />
							</ActionIcon>
						)}

						<a href={url} target="_blank">
							<ActionIcon className="ml-auto" tooltip="Open in new tab" asChild>
								<ArrowTopRightOnSquareIcon className="w-5" />
							</ActionIcon>
						</a>
					</div>

					<iframe
						key={+remountIframe}
						ref={iframeRef}
						className="h-full"
						title="Page preview"
						src={url}
						onLoad={initIframeBridge}
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
				<ActionIcon
					variant={"simple"}
					tooltip="Edit"
					onClick={() => setEditing(true)}
					// Fix for small part of button being clickable, but not triggering anything
					role="button"
					asChild
				>
					<PencilSquareIcon className="w-5 cursor-pointer" />
				</ActionIcon>
			)}
		</div>
	);
}
