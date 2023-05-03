import { CheckCircleIcon } from "@heroicons/react/24/outline";
// import { Button, Loader, type ButtonProps } from "@admin/src/components";
import type { ComponentPropsWithRef, ReactNode } from "react";

export function SubmitButton() {
	// props: Omit<ButtonProps, "type"> & {
	// 	isLoading: boolean;
	// 	leftIcon?: ReactNode;
	// 	rightIcon?: ReactNode;
	// } & ComponentPropsWithRef<"button">
	// const { isLoading, leftIcon, rightIcon, ...rest } = props;

	return <input type="submit" value="INPUT BUTTON" />;
}
