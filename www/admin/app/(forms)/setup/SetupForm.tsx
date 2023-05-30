"use client";

import { useRouter } from "next/navigation";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { check } from "language-tags";
import { trpc } from "@admin/src/utils/trpc";
import { InfoTooltip } from "@admin/src/components";
import {
	Button,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	Input,
	Textarea,
} from "@admin/src/components/ui/client";
import { TypographyCode } from "@admin/src/components/ui/server";
import { SinglePageForm } from "../SinglePageForm";

const schema = z
	.object({
		title: z.string().nonempty(),
		description: z.string().optional(),
		language: z.string().nonempty(),
	})
	.refine((data) => check(data.language), {
		path: ["language"],
	});
type Inputs = z.infer<typeof schema>;

export function SetupForm() {
	const router = useRouter();

	const form = useForm<Inputs>({ resolver: zodResolver(schema) });
	const onSubmit: SubmitHandler<Inputs> = async (data) => {
		await Promise.all([
			trpc.config.setConfig.mutate({
				...data,
				description: data.description ?? "",
			}),
			trpc.pages.addPage.mutate({ name: "Root", url: "", is_group: true, parent_id: null }),
		]);

		router.push("/dashboard");
	};

	return (
		<SinglePageForm
			className="sm:w-96"
			onSubmit={form.handleSubmit(onSubmit)}
			titleText={
				<span className="bg-gradient-to-b from-foreground/70 to-foreground bg-clip-text text-transparent dark:bg-gradient-to-t">
					Set up website
				</span>
			}
			submitButton={
				<Button
					type="submit"
					size="lg"
					icon={<ArrowRightIcon className="w-5" />}
					className="ml-auto shadow-lg shadow-primary/25"
					loading={form.formState.isSubmitting || form.formState.isSubmitSuccessful}
				>
					Finish
				</Button>
			}
			formData={form}
		>
			<FormField
				control={form.control}
				name="title"
				render={({ field }) => (
					<FormItem>
						<FormLabel size="lg" withAsterisk>
							Title
						</FormLabel>
						<FormControl>
							<Input
								size="lg"
								placeholder="My awesome website"
								aria-required
								{...field}
							/>
						</FormControl>
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="description"
				render={({ field }) => (
					<FormItem>
						<FormLabel size="lg">
							Description&nbsp;
							<InfoTooltip>Used for social media previews</InfoTooltip>
						</FormLabel>
						<FormControl>
							<Textarea
								placeholder="This website is very awesome and fun!"
								minRows={3}
								maxRows={10}
								size="lg"
								{...field}
							/>
						</FormControl>
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="language"
				render={({ field }) => (
					<FormItem>
						<FormLabel size="lg" withAsterisk>
							Language&nbsp;
							<InfoTooltip>
								Used in the <TypographyCode>lang</TypographyCode> attribute of the{" "}
								<TypographyCode>&lt;html&gt;</TypographyCode> tag
							</InfoTooltip>
						</FormLabel>
						<FormControl>
							<Input size="lg" placeholder="en-US" aria-required {...field} />
						</FormControl>
					</FormItem>
				)}
			/>
		</SinglePageForm>
	);
}
