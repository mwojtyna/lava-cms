"use client";

import { useEffect } from "react";
import { Group, Stack, TextInput, Textarea } from "@admin/src/components";
import { notifications } from "@mantine/notifications";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { check } from "language-tags";
import { trpcReact } from "@admin/src/utils/trpcReact";
import { Section } from "@admin/app/dashboard/_components/Section";
import SubmitButton from "@admin/src/components/SubmitButton";

const inputSchema = z
	.object({
		title: z.string().min(1),
		description: z.string(),
		language: z.string().min(1),
	})
	.refine((data) => check(data.language), {
		path: ["language"],
	});
type Inputs = z.infer<typeof inputSchema>;

export default function WebsiteSettings({ initialData }: { initialData: Inputs }) {
	const data = trpcReact.config.getConfig.useQuery().data ?? initialData;
	const mutation = trpcReact.config.setConfig.useMutation();

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		setValue,
	} = useForm<Inputs>({ mode: "onChange", resolver: zodResolver(inputSchema) });

	const onSubmit: SubmitHandler<Inputs> = async (data) => {
		try {
			await mutation.mutateAsync({
				title: data.title,
				description: data.description,
				language: data.language,
			});
			notifications.show({
				title: "Success",
				message: "Website settings saved.",
				color: "green",
			});
		} catch (error) {
			if (error instanceof Error) {
				notifications.show({
					title: "Error",
					message: <pre>{error.message.trim()}</pre>,
					color: "red",
					autoClose: false,
					sx: {
						overflow: "auto",
						pre: {
							margin: 0,
							overflow: "auto",
						},
					},
				});
			}
		}
	};

	useEffect(() => {
		setValue("title", data.title);
		setValue("description", data.description);
		setValue("language", data.language);
	}, [setValue, data]);

	return (
		<Section data-testid="website-settings">
			<Section.Title>Website</Section.Title>

			<form onSubmit={handleSubmit(onSubmit)}>
				<Stack spacing={"md"} maw={"32rem"}>
					<TextInput
						label="Title"
						placeholder="My awesome website"
						{...register("title")}
						error={!!errors.title}
						withAsterisk
					/>
					<Textarea
						label="Description"
						placeholder="This website is very awesome and fun!"
						autosize
						minRows={2}
						{...register("description")}
					/>
					<TextInput
						label="Language"
						placeholder="en-US"
						{...register("language")}
						error={!!errors.language}
						withAsterisk
					/>

					<Group position="right">
						<SubmitButton isLoading={isSubmitting}>Save</SubmitButton>
					</Group>
				</Stack>
			</form>
		</Section>
	);
}
