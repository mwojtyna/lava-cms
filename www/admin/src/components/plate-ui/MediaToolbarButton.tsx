import type { ELEMENT_IMAGE, ELEMENT_MEDIA_EMBED } from "@udecode/plate-media";
import { withRef } from "@udecode/cn";
import { useMediaToolbarButton } from "@udecode/plate-media";
import React from "react";

import { icons } from "./icons";

import { ToolbarButton } from "./Toolbar";

export const MediaToolbarButton = withRef<
	typeof ToolbarButton,
	{
		nodeType?: typeof ELEMENT_IMAGE | typeof ELEMENT_MEDIA_EMBED;
	}
>(({ nodeType, ...rest }, ref) => {
	const { props } = useMediaToolbarButton({ nodeType });

	return (
		<ToolbarButton ref={ref} {...props} {...rest}>
			<icons.Image />
		</ToolbarButton>
	);
});
