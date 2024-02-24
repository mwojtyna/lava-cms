import type { EditDialogInputs } from "./types";
import type { UseFormReturn, Path, PathValue } from "react-hook-form";
import { LockClosedIcon, LockOpenIcon } from "@heroicons/react/24/outline";
import slugify from "slugify";
import {
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormError,
} from "@/src/components/ui/client/Form";
import { Input } from "@/src/components/ui/client/Input";

export function toPath(path: string) {
	return (
		"/" +
		slugify(path, {
			lower: true,
			strict: true,
			locale: "en",
			remove: /[*+~.()'"!:@]/g,
		})
	);
}

export function getSlugFromPath(path: string) {
	const split = path.split("/");
	return "/" + split[split.length - 1]!;
}

export function editPath(path: string, newSlug: string) {
	const split = path.split("/");
	split[split.length - 1] = newSlug.slice(1);
	return split.join("/");
}

export function removeSlugFromPath(path: string) {
	return path.split("/").slice(0, -1).join("/");
}

interface NameSlugInputProps<T extends EditDialogInputs> {
	form: UseFormReturn<T>;
	path: string;
	slugLocked: boolean | undefined;
	setSlugLocked: (value: boolean) => void;
}
export function NameSlugInput<T extends EditDialogInputs>(props: NameSlugInputProps<T>) {
	return (
		<div className="space-y-4">
			<FormField
				control={props.form.control}
				name={"name" as Path<T>}
				rules={{
					onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
						if (!props.slugLocked)
							props.form.setValue(
								"slug" as Path<T>,
								toPath(e.target.value) as PathValue<T, Path<T>>,
							);
					},
				}}
				render={({ field }) => (
					<FormItem>
						<FormLabel>Name</FormLabel>
						<FormControl>
							<Input className="flex-row" aria-required {...field} />
						</FormControl>
					</FormItem>
				)}
			/>

			<FormField
				control={props.form.control}
				name={"slug" as Path<T>}
				render={({ field }) => (
					<FormItem>
						<FormLabel>Slug</FormLabel>
						<FormControl>
							<Input
								className="flex-row"
								rightButton={{
									state: !!props.slugLocked,
									setState: props.setSlugLocked,
									onClick: null,
									iconOn: <LockClosedIcon className="w-4" />,
									iconOff: <LockOpenIcon className="w-4" />,
									tooltip: `${
										props.slugLocked ? "Unlock" : "Lock"
									} slug autofill`,
								}}
								aria-required
								{...field}
							/>
						</FormControl>
						<FormError />
					</FormItem>
				)}
			/>

			<FormItem>
				<FormLabel>Full path</FormLabel>
				<Input disabled value={props.path + props.form.watch("slug" as Path<T>)} readOnly />
			</FormItem>
		</div>
	);
}
