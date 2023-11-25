"use client";

import * as React from "react";
import { Resizable } from "re-resizable";
import { useElementSize, useLocalStorage } from "@mantine/hooks";
import { ArrowPathIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { IconMinusVertical } from "@tabler/icons-react";
import { Card } from "@admin/src/components/ui/server";
import {
	ActionIcon,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@admin/src/components/ui/client";
import { cn } from "@admin/src/utils/styling";

const MIN_WIDTH = 250;

export function PagePreview(props: { url: string }) {
	const resizableRef = React.useRef<Resizable>(null);
	const iframeRef = React.useRef<HTMLIFrameElement>(null);
	const [url, setUrl] = React.useState(props.url);

	const [width, setWidth] = useLocalStorage({
		key: "page-preview-width",
		defaultValue: MIN_WIDTH * 2,
	});
	const { ref: wrapperRef, width: maxWidth } = useElementSize();

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
							className="relative right-[38px] h-full text-muted-foreground transition-colors hover:cursor-col-resize hover:text-foreground"
						/>
					),
					right: (
						<IconMinusVertical
							size={64}
							className="relative right-[16px] h-full text-muted-foreground transition-colors hover:cursor-col-resize hover:text-foreground"
						/>
					),
				}}
				onResizeStop={(_, __, ___, delta) => setWidth(width + delta.width)}
			>
				<Card className="m-4 mx-0 h-auto flex-1 gap-0 overflow-hidden p-0 md:m-4 md:mx-0 md:p-0">
					<div className="flex items-center gap-2 p-2 md:p-2">
						<Tooltip>
							<TooltipTrigger asChild>
								<ActionIcon
									onClick={() =>
										iframeRef.current?.contentWindow?.location.reload()
									}
									aria-label="Refresh"
								>
									<ArrowPathIcon className="w-5" />
								</ActionIcon>
							</TooltipTrigger>
							<TooltipContent>Refresh</TooltipContent>
						</Tooltip>

						<URL url={url} />

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
						className={cn("h-full")}
						title="Page preview"
						src={props.url}
						onLoad={(e) => setUrl(e.currentTarget.contentWindow?.location.href ?? "")}
						// Allow all
						sandbox="allow-downloads allow-downloads-without-user-activation allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation allow-top-navigation-by-user-activation allow-top-navigation-to-custom-protocols"
					/>
				</Card>
			</Resizable>
		</div>
	);
}

function URL(props: { url: string }) {
	const split = props.url.split("://");
	const protocol = split[0];
	const domain = split[1]!.split("/")[0];
	const rest = split[1]!.slice(domain!.length);

	return (
		<p className="flex items-center truncate">
			<span className="text-muted-foreground">{protocol}://</span>
			{domain}
			<span className="text-muted-foreground">{rest}</span>
		</p>
	);
}
