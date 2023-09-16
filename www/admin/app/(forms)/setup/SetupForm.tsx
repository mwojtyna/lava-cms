"use client";

import { useRouter } from "next/navigation";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
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
import { trpc } from "@admin/src/utils/trpc";

const schema = z.object({
	title: z.string().nonempty(),
	description: z.string(),
	language: z.string().nonempty(),
});

type Inputs = z.infer<typeof schema>;

export function SetupForm() {
	const router = useRouter();

	const setConfigMutation = trpc.config.setConfig.useMutation();
	const setupMutation = trpc.config.setup.useMutation();

	const form = useForm<Inputs>({ resolver: zodResolver(schema) });
	const onSubmit: SubmitHandler<Inputs> = (data) => {
		setConfigMutation.mutate(data, {
			onSuccess: async () => {
				await setupMutation.mutateAsync();
				router.replace("/dashboard");
			},
			onError: (err) => {
				if (err.data?.code === "BAD_REQUEST") {
					form.setError("language", {});
				}
			},
		});
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
					loading={setConfigMutation.isLoading || setupMutation.isLoading}
				>
					Finish
				</Button>
			}
			formData={form}
			data-testid="setup-form"
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
