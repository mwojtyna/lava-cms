"use client";

import * as React from "react";
import { Resizable } from "re-resizable";
import { useElementSize, useLocalStorage } from "@mantine/hooks";
import {
	ArrowPathIcon,
	ArrowTopRightOnSquareIcon,
	PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { IconMinusVertical } from "@tabler/icons-react";
import { Card } from "@admin/src/components/ui/server";
import {
	ActionIcon,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@admin/src/components/ui/client";
import { cn } from "@admin/src/utils/styling";
import { EditableText } from "@admin/src/components/EditableText";
import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";

const MIN_WIDTH = 250;

export function PagePreview(props: { url: string; iframeOrigin: string }) {
	const resizableRef = React.useRef<Resizable>(null);
	const iframeRef = React.useRef<HTMLIFrameElement>(null);
	const [url, setUrl] = React.useState(props.url);
	const [remountIframe, setRemountIframe] = React.useState(false);

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
						<Tooltip>
							<TooltipTrigger asChild>
								<ActionIcon
									onClick={() => {
										if (iframeRef.current) {
											iframeRef.current.src = url;
										}
									}}
									aria-label="Refresh"
								>
									<ArrowPathIcon className="w-5" />
								</ActionIcon>
							</TooltipTrigger>
							<TooltipContent>Refresh</TooltipContent>
						</Tooltip>

						<URL
							url={url}
							onUrlChanged={(url) => {
								setUrl(url);
								setRemountIframe(!remountIframe);
							}}
						/>

						{url !== props.url && (
							<Tooltip>
								<TooltipTrigger onClick={() => setUrl(props.url)}>
									<ExclamationTriangleIcon className="mt-1 w-6 cursor-help text-yellow-500" />
								</TooltipTrigger>
								<TooltipContent>
									The previewed page&apos;s URL differs from the URL of the page
									that you&apos;re editing. Click to reset.
								</TooltipContent>
							</Tooltip>
						)}
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
						key={+remountIframe}
						ref={iframeRef}
						className={cn("h-full")}
						title="Page preview"
						src={url}
						// Allow all
						sandbox="allow-downloads allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation allow-top-navigation-by-user-activation allow-top-navigation-to-custom-protocols"
					/>
				</Card>
			</Resizable>
		</div>
	);
}

interface UrlProps {
	url: string;
	onUrlChanged: (url: string) => void;
}
function URL(props: UrlProps) {
	const split = props.url.split("://");
	const protocol = split[0];
	const domain = split[1]!.split("/")[0];
	const rest = split[1]!.slice(domain!.length + 1);

	const [editing, setEditing] = React.useState(false);

	return (
		<div className="flex w-full gap-2 overflow-hidden">
			<div className={cn("flex items-center overflow-hidden", editing && "w-full")}>
				<p className="text-muted-foreground">
					{protocol}://
					<span className="text-foreground">{domain}</span>/
				</p>
				<EditableText
					inputProps={{ className: "ml-px", "aria-label": "URL input" }}
					value={rest}
					editing={editing}
					setEditing={setEditing}
					onSubmit={(rest) => props.onUrlChanged(`${protocol}://${domain}/${rest}`)}
					hasCustomEditButton
				>
					<span className="whitespace-nowrap text-muted-foreground">{rest}</span>
				</EditableText>
			</div>

			{!editing && (
				<Tooltip>
					<TooltipTrigger asChild>
						<ActionIcon variant={"simple"} aria-label="Edit">
							<PencilSquareIcon className="w-5" onClick={() => setEditing(true)} />
						</ActionIcon>
					</TooltipTrigger>
					<TooltipContent>Edit</TooltipContent>
				</Tooltip>
			)}
		</div>
	);
}
