import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/client";
import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid";

interface InfoTooltipProps extends React.ComponentPropsWithoutRef<typeof Popover> {
	icon?: React.ReactNode;
}

const InfoTooltip = React.forwardRef<React.ComponentRef<typeof PopoverTrigger>, InfoTooltipProps>(
	({ icon = <QuestionMarkCircleIcon className="w-4" />, children }, ref) => (
		<Popover>
			<PopoverTrigger ref={ref} aria-label="More information">
				{icon}
			</PopoverTrigger>
			<PopoverContent variant={"tooltip"}>{children}</PopoverContent>
		</Popover>
	)
);
InfoTooltip.displayName = "InfoTooltip";

export { InfoTooltip };
