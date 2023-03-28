"use client";

import { Button, Divider, Group, Loader, Stack, TextInput, Textarea, Title } from "@mantine/core";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { check } from "language-tags";
import Content from "@admin/app/dashboard/(components)/Content";
import { trpc } from "@admin/src/utils/trpc";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

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
		formState: { errors, isSubmitting, isSubmitSuccessful },
	} = useForm<Inputs>({ mode: "onChange", resolver: zodResolver(inputSchema) });

	const onSubmit: SubmitHandler<Inputs> = async (data) => {
		await trpc.config.setConfig.mutate({
			...data,
		});
	};

	return (
		<Content>
			{/* Website settings */}
			<Content.Card>
				<Stack spacing="0.5rem" mb={"sm"}>
					<Title order={4}>Website</Title>
					<Divider />
				</Stack>

				<form onSubmit={handleSubmit(onSubmit)}>
					<Stack spacing={"md"} maw={512}>
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
								leftIcon={
									!isSubmitting &&
									!isSubmitSuccessful && <CheckCircleIcon className="w-5" />
								}
							>
								{isSubmitting || isSubmitSuccessful ? (
									<Loader variant="dots" color="#fff" />
								) : (
									<>Save</>
								)}
							</Button>
						</Group>
					</Stack>
				</form>
			</Content.Card>
		</Content>
	);
}
