import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import {
	Controller,
	type ControllerProps,
	type FieldPath,
	type FieldValues,
	type PathValue,
	FormProvider,
	useFormContext,
} from "react-hook-form";
import { cn } from "@admin/src/utils/styling";
import { Label } from "@admin/src/components/ui/client";
import { TypographyMuted } from "../server";

interface FormFieldProps<T> {
	value: T;
	onChange: (value: T) => void;
}

type FormFieldContextValue<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
	name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

const FormField = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	defaultValue,
	...props
}: ControllerProps<TFieldValues, TName>) => {
	return (
		<FormFieldContext.Provider value={{ name: props.name }}>
			<Controller
				defaultValue={defaultValue ?? ("" as PathValue<TFieldValues, TName>)}
				{...props}
			/>
		</FormFieldContext.Provider>
	);
};

const useFormField = () => {
	const fieldContext = React.useContext(FormFieldContext);
	const itemContext = React.useContext(FormItemContext);
	const { getFieldState, formState } = useFormContext();

	const fieldState = getFieldState(fieldContext.name, formState);

	if (!fieldContext) {
		throw new Error("useFormField should be used within <FormField>");
	}

	const { id } = itemContext;

	return {
		id,
		name: fieldContext.name,
		formItemId: `${id}-form-item`,
		formDescriptionId: `${id}-form-item-description`,
		formMessageId: `${id}-form-item-message`,
		...fieldState,
	};
};

type FormItemContextValue = {
	id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => {
		const id = React.useId();

		return (
			<FormItemContext.Provider value={{ id }}>
				<div ref={ref} className={cn("flex flex-col gap-2", className)} {...props} />
			</FormItemContext.Provider>
		);
	},
);
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
	React.ElementRef<typeof Label>,
	React.ComponentPropsWithoutRef<typeof Label> & { withAsterisk?: boolean }
>(({ className, withAsterisk, children, ...props }, ref) => {
	const { formItemId } = useFormField();

	return (
		<Label
			ref={ref}
			className={cn("flex items-center", className)}
			htmlFor={formItemId}
			{...props}
		>
			{children}
			{withAsterisk && <span className="text-destructive">&nbsp;*</span>}
		</Label>
	);
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<
	React.ElementRef<typeof Slot>,
	React.ComponentPropsWithoutRef<typeof Slot>
>(({ className, ...props }, ref) => {
	const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

	return (
		<Slot
			ref={ref}
			id={formItemId}
			className={cn(className, error && "border-destructive outline-destructive")}
			aria-describedby={!error ? formDescriptionId : `${formDescriptionId} ${formMessageId}`}
			aria-invalid={!!error}
			{...props}
		/>
	);
});
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<
	React.ComponentRef<typeof TypographyMuted>,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ ...props }, ref) => {
	const { formDescriptionId } = useFormField();
	return <TypographyMuted ref={ref} id={formDescriptionId} {...props} />;
});
FormDescription.displayName = "FormDescription";

const FormError = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
	const { error, formMessageId } = useFormField();

	if (error === undefined || error.message?.trim() === "") {
		return null;
	}

	return (
		<span
			ref={ref}
			id={formMessageId}
			className={cn("text-sm text-destructive", className)}
			{...props}
		>
			{error.message}
		</span>
	);
});
FormError.displayName = "FormMessage";

export {
	useFormField,
	FormProvider,
	FormItem,
	FormLabel,
	FormControl,
	FormDescription,
	FormError,
	FormField,
	type FormFieldProps,
};
