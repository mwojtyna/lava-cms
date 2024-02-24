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

export function getSlugFromUrl(path: string) {
	const split = path.split("/");
	return "/" + split[split.length - 1]!;
}
export function editUrl(url: string, newSlug: string) {
	const split = url.split("/");
	split[split.length - 1] = newSlug.slice(1);
	return split.join("/");
}

export function NameSlugInput<T extends EditDialogInputs>({
	form,
	slugLocked,
	setSlugLocked,
}: {
	form: UseFormReturn<T>;
	slugLocked: boolean | undefined;
	setSlugLocked: (value: boolean) => void;
}) {
	return (
		<>
			<FormField
				control={form.control}
				name={"name" as Path<T>}
				rules={{
					onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
						if (!slugLocked)
							form.setValue(
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
				control={form.control}
				name={"slug" as Path<T>}
				render={({ field }) => (
					<FormItem>
						<FormLabel>Slug</FormLabel>
						<FormControl>
							<Input
								className="flex-row"
								rightButton={{
									state: !!slugLocked,
									setState: setSlugLocked,
									onClick: null,
									iconOn: <LockClosedIcon className="w-4" />,
									iconOff: <LockOpenIcon className="w-4" />,
									tooltip: `${slugLocked ? "Unlock" : "Lock"} slug autofill`,
								}}
								aria-required
								{...field}
							/>
						</FormControl>
						<FormError />
					</FormItem>
				)}
			/>
		</>
	);
}
