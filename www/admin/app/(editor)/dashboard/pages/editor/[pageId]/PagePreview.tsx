"use client";

import type { IframeMessage } from "./types";
import { ArrowPathIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { useElementSize, useViewportSize } from "@mantine/hooks";
import { IconMinusVertical } from "@tabler/icons-react";
import { Resizable } from "re-resizable";
import * as React from "react";
import { ActionIcon } from "@/src/components/ui/client";
import { Card } from "@/src/components/ui/server";
import { usePageEditor } from "@/src/data/stores/pageEditor";
import { MIN_WIDTH as INSPECTOR_MIN_WIDTH } from "./Inspector";

const MIN_WIDTH = 250;
const HANDLES_WIDTH = 45;

export function PagePreview(props: { baseUrl: string; pageUrl: string }) {
	const iframeRef = React.useRef<HTMLIFrameElement>(null);

	const { width: windowWidth } = useViewportSize();
	const [width, setWidth] = React.useState(MIN_WIDTH * 3);
	const [preferredWidth, setPreferredWidth] = React.useState(width);
	const { ref: wrapperRef, width: wrapperWidth } = useElementSize();
	const maxWidth = wrapperWidth - HANDLES_WIDTH;
	const initialWidthSet = React.useRef(false);
	const url = React.useMemo(() => props.baseUrl + props.pageUrl, [props.baseUrl, props.pageUrl]);

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

						<Url baseUrl={props.baseUrl} url={url} />

						<a href={url} target="_blank">
							<ActionIcon className="ml-auto" tooltip="Open in new tab" asChild>
								<ArrowTopRightOnSquareIcon className="w-5" />
							</ActionIcon>
						</a>
					</div>

					<iframe
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
}
function Url(props: UrlProps) {
	const url = new URL(props.url);

	return (
		<div className="flex w-full gap-2 overflow-hidden">
			<div className="flex items-center overflow-hidden">
				<p className="whitespace-nowrap text-muted-foreground">
					{url.protocol}
					{"//"}
					<span className="text-foreground">{url.host}</span>
					{url.pathname}
				</p>
			</div>
		</div>
	);
}
