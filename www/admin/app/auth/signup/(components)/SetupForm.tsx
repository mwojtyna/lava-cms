"use client";

import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Group, Loader, Stack, Textarea, TextInput, Title } from "@mantine/core";
import { ArrowDownOnSquareIcon } from "@heroicons/react/24/outline";
import { check } from "language-tags";
import ThemeSwitch from "@admin/app/(components)/ThemeSwitch";

export default function SetupForm() {
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
		console.log(data);
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md">
			<Stack spacing={"lg"}>
				<Title order={1} size="3.5rem" variant="gradient">
					Setup website
				</Title>

				<TextInput
					size="md"
					type="text"
					label="Title"
					placeholder="My Awesome Website"
					{...register("title")}
					error={!!errors.title}
					autoFocus
					withAsterisk
				/>
				<Textarea
					size="md"
					label="Description"
					placeholder="This website is very awesome and fun!"
					{...register("description")}
				/>
				<TextInput
					size="md"
					type="text"
					label="Language"
					placeholder="en-US"
					{...register("language")}
					error={!!errors.language}
					withAsterisk
				/>

				<Group position="apart">
					<ThemeSwitch />
					<Button
						size="md"
						type="submit"
						leftIcon={
							!isSubmitting &&
							!isSubmitSuccessful && <ArrowDownOnSquareIcon className="w-5" />
						}
					>
						{isSubmitting || isSubmitSuccessful ? (
							<Loader variant="dots" color="#fff" />
						) : (
							<>Submit</>
						)}
					</Button>
				</Group>
			</Stack>
		</form>
	);
}
