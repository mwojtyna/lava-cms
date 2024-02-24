"use client";

import { ArrowPathIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { useElementSize, useViewportSize, useWindowEvent } from "@mantine/hooks";
import { IconMinusVertical } from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import { Resizable } from "re-resizable";
import * as React from "react";
import { ActionIcon } from "@/src/components/ui/client/ActionIcon";
import { Card } from "@/src/components/ui/server/Card";
import { usePageEditorStore } from "@/src/data/stores/pageEditor";
import { useAlertDialog } from "@/src/hooks/useAlertDialog";
import { useSearchParams } from "@/src/hooks/useSearchParams";
import { trpcFetch } from "@/src/utils/trpc";
import { MIN_WIDTH as INSPECTOR_MIN_WIDTH } from "./Inspector";
import { type IframeMessage, type PageEditorMessage } from "./types";

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

	const url = React.useMemo(
		() => new URL(props.baseUrl + props.pageUrl),
		[props.baseUrl, props.pageUrl],
	);
	const router = useRouter();
	const pathname = usePathname();

	const { searchParams, setSearchParams } = useSearchParams({
		onChanged: (params) => {
			if (params.has("error")) {
				alert.open(() => setSearchParams({ error: "" }));
			}
		},
		removeWhenValueIsEmptyString: true,
		replace: true,
	});
	const alert = useAlertDialog(() => {
		const url = searchParams.get("error")!;
		return {
			className: "max-w-xl",
			title: `Page not found`,
			description: (
				// Parent element is <p>
				<>
					The HTML page you are trying to access exists, but no CMS page was found with
					the path assigned to <span className="text-accent-foreground">{url}</span>.{" "}
					<br />
					Please create a new CMS page if you want to edit it in the page editor.
				</>
			),
			noMessage: undefined,
			yesMessage: "Understood",
			disableCloseOnBlur: true,
		};
	});

	// Init bridge when iframe loaded and again when component is mounted
	const initIframeBridge = React.useCallback(() => {
		iframeRef.current?.contentWindow?.postMessage(
			{ name: "init" } satisfies PageEditorMessage,
			url.origin,
		);
		usePageEditorStore.setState({
			iframe: iframeRef.current,
			iframeOrigin: url.origin,
		});
	}, [url.origin]);
	React.useEffect(() => {
		initIframeBridge();
	}, [initIframeBridge, iframeRef, props.baseUrl]);

	useWindowEvent("message", async (e) => {
		const data = e.data as IframeMessage;
		// Ignore other messages, e.g. from React DevTools
		if (typeof data.name !== "string") {
			return;
		}

		// Update page editor when iframe url changes
		if (data.name === "urlChanged" && data.url !== url.href) {
			const page = await trpcFetch.pages.getPageByUrl.query({
				url: new URL(data.url).pathname,
			});
			if (!page) {
				// Only way to prevent loading the missing page
				history.back();
				// setSearchParams doesn't work here
				router.replace(
					pathname + "?error=" + encodeURIComponent(new URL(data.url).pathname),
				);
				return;
			}

			const split = pathname.split("/");
			split.pop();
			split.push(page.id);
			const newUrl = split.join("/");

			router.push(newUrl);
			const state = usePageEditorStore.getState();
			state.setSteps([state.steps[0]!]); // For some reason the step gets preserved between pages
		}
	});

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
									iframeRef.current.src = url.href;
								}
							}}
							tooltip="Refresh"
						>
							<ArrowPathIcon className="w-5" />
						</ActionIcon>

						<Url url={url} />

						<a href={url.href} target="_blank">
							<ActionIcon className="ml-auto" tooltip="Open in new tab" asChild>
								<ArrowTopRightOnSquareIcon className="w-5" />
							</ActionIcon>
						</a>
					</div>

					<iframe
						ref={iframeRef}
						className="h-full"
						title="Page preview"
						src={url.href}
						onLoad={initIframeBridge}
						// Allow all
						sandbox="allow-downloads allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation allow-top-navigation-by-user-activation allow-top-navigation-to-custom-protocols"
					/>
				</Card>
			</Resizable>
		</div>
	);
}

function Url({ url }: { url: URL }) {
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
