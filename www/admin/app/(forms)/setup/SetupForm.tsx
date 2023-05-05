"use client";

import { useRouter } from "next/navigation";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRightIcon, QuestionMarkCircleIcon } from "@heroicons/react/20/solid";
import { check } from "language-tags";
import { SinglePageForm } from "@admin/src/components";
import { trpc } from "@admin/src/utils/trpc";
import {
	Button,
	Input,
	Textarea,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@admin/src/components/ui/client";
import { TypographyCode } from "@admin/src/components/ui/server";

const schema = z
	.object({
		title: z.string().min(1),
		description: z.string(),
		language: z.string().min(1),
	})
	.refine((data) => check(data.language), {
		path: ["language"],
	});
type Inputs = z.infer<typeof schema>;

export function SetupForm() {
	const router = useRouter();

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting, isSubmitSuccessful },
	} = useForm<Inputs>({ mode: "onChange", resolver: zodResolver(schema) });
	const onSubmit: SubmitHandler<Inputs> = async (data) => {
		await Promise.all([
			trpc.config.setConfig.mutate({
				...data,
			}),
			trpc.pages.addPage.mutate({
				name: "Root",
				url: "/",
				order: 0,
			}),
		]);

		router.push("/dashboard");
	};

	return (
		<SinglePageForm
			className="w-96" // sm
			onSubmit={handleSubmit(onSubmit)}
			titleText={
				<span className="bg-gradient-to-b from-foreground/70 to-foreground bg-clip-text text-transparent dark:bg-gradient-to-t">
					Set up website
				</span>
			}
			submitButton={
				<Button
					type="submit"
					icon={<ArrowRightIcon className="w-5" />}
					className="ml-auto shadow-lg shadow-primary/25"
					loading={isSubmitting || isSubmitSuccessful}
				>
					Finish
				</Button>
			}
		>
			<Input
				label="Title"
				placeholder="My Awesome Website"
				{...register("title")}
				error={!!errors.title}
				autoFocus
				withAsterisk
			/>

			<Textarea
				label={
					<>
						Description&nbsp;
						<Tooltip>
							<TooltipTrigger>
								<QuestionMarkCircleIcon className="w-4" />
							</TooltipTrigger>
							<TooltipContent>Used for SEO and social media previews</TooltipContent>
						</Tooltip>
					</>
				}
				placeholder="This website is very awesome and fun!"
				minRows={3}
				maxRows={10}
				{...register("description")}
			/>

			<Input
				label={
					<>
						Language&nbsp;
						<Tooltip>
							<TooltipTrigger>
								<QuestionMarkCircleIcon className="w-4" />
							</TooltipTrigger>
							<TooltipContent>
								Used in the <TypographyCode>lang</TypographyCode> attribute of the{" "}
								<TypographyCode>&lt;html&gt;</TypographyCode> tag
							</TooltipContent>
						</Tooltip>
					</>
				}
				placeholder="en-US"
				{...register("language")}
				error={!!errors.language}
				withAsterisk
			/>
		</SinglePageForm>
	);
}
