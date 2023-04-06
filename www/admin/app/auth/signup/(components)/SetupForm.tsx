"use client";

import { useRouter } from "next/navigation";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
	Button,
	Code,
	createStyles,
	Group,
	Loader,
	Stack,
	Textarea,
	TextInput,
	Title,
	Tooltip,
} from "@mantine/core";
import { ArrowDownOnSquareIcon } from "@heroicons/react/24/outline";
import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid";
import { check } from "language-tags";
import ThemeSwitch from "@admin/app/(components)/ThemeSwitch";
import { trpc } from "@admin/src/utils/trpc";

const useStyles = createStyles(() => ({
	label: {
		display: "flex",
		gap: "0.25rem",
	},
}));

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

export default function SetupForm() {
	const router = useRouter();

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting, isSubmitSuccessful },
	} = useForm<Inputs>({ mode: "onChange", resolver: zodResolver(inputSchema) });
	const onSubmit: SubmitHandler<Inputs> = async (data) => {
		await trpc.config.setConfig.mutate({
			...data,
		});
		await trpc.pages.addPage.mutate({
			name: "Root",
			path: "/",
			rootPage: true,
		});

		router.push("/dashboard");
	};

	const { classes } = useStyles();

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md">
			<Stack spacing={"lg"}>
				<Title order={1} size="3.5rem" variant="gradient">
					Setup website
				</Title>

				<TextInput
					size="md"
					label="Title"
					placeholder="My Awesome Website"
					{...register("title")}
					error={!!errors.title}
					autoFocus
					withAsterisk
				/>
				<Textarea
					classNames={{ label: classes.label }}
					placeholder="This website is very awesome and fun!"
					size="md"
					autosize
					minRows={2}
					label={
						<>
							Description
							<Tooltip label="Used for SEO and social media previews" withArrow>
								<QuestionMarkCircleIcon className="w-4" />
							</Tooltip>
						</>
					}
					{...register("description")}
				/>
				<TextInput
					classNames={{ label: classes.label }}
					size="md"
					label={
						<>
							Language
							<Tooltip
								label={
									<>
										Used in the <Code>lang</Code> attribute of the{" "}
										<Code>&lt;html&gt;</Code> tag
									</>
								}
								withArrow
							>
								<QuestionMarkCircleIcon className="w-4" />
							</Tooltip>
						</>
					}
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
							!isSubmitSuccessful && <ArrowDownOnSquareIcon width="1.25rem" />
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
