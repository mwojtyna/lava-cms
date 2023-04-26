import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { Button, Loader, type ButtonProps } from "@admin/src/components";
import type { ComponentPropsWithRef, ReactNode } from "react";

export default function SubmitButton(
	props: Omit<ButtonProps, "type"> & {
		isLoading: boolean;
		leftIcon?: ReactNode;
		rightIcon?: ReactNode;
	} & ComponentPropsWithRef<"button">
) {
	const { isLoading, leftIcon, rightIcon, ...rest } = props;

	return (
		<Button
			type="submit"
			leftIcon={
				!props.isLoading &&
				(props.leftIcon ? props.leftIcon : <CheckCircleIcon className="w-5" />)
			}
			rightIcon={!props.isLoading && props.rightIcon}
			{...rest}
		>
			{props.isLoading ? <Loader variant="dots" color="#fff" /> : props.children}
		</Button>
	);
}
