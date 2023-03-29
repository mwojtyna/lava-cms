"use client";

import { Button, Group, Loader, Stack, TextInput, Textarea } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { check } from "language-tags";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import Content from "@admin/app/dashboard/(components)/Content";
import { trpc } from "@admin/src/utils/trpc";

export default function Settings() {
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

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<Inputs>({ mode: "onChange", resolver: zodResolver(inputSchema) });

	const onSubmit: SubmitHandler<Inputs> = async (data) => {
		try {
			await trpc.config.setConfig.mutate({
				...data,
			});
			notifications.show({
				title: "Success",
				message: "Website settings saved.",
				color: "green",
			});
		} catch (error: unknown | Error) {
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

	return (
		<Content>
			{/* Website settings */}
			<Content.Card>
				<Content.Title>Website</Content.Title>

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
							<Button
								type="submit"
								leftIcon={!isSubmitting && <CheckCircleIcon className="w-5" />}
							>
								{isSubmitting ? <Loader variant="dots" color="#fff" /> : <>Save</>}
							</Button>
						</Group>
					</Stack>
				</form>
			</Content.Card>
		</Content>
	);
}
