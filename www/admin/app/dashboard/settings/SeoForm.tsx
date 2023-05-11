"use client";

import * as React from "react";
import { z } from "zod";
import { check } from "language-tags";
import { type SubmitHandler, useForm } from "react-hook-form";
import { trpcReact } from "@admin/src/utils/trpcReact";
import { zodResolver } from "@hookform/resolvers/zod";
import { InfoTooltip } from "@admin/src/components";
import { Button, Input, Textarea } from "@admin/src/components/ui/client";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	TypographyCode,
} from "@admin/src/components/ui/server";
import { useToast } from "@admin/src/hooks";

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

export function SeoForm({ initialData }: { initialData: Inputs }) {
	const data = trpcReact.config.getConfig.useQuery().data ?? initialData;
	const mutation = trpcReact.config.setConfig.useMutation();
	const { toast } = useToast();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<Inputs>({ resolver: zodResolver(schema) });

	const onSubmit: SubmitHandler<Inputs> = async (data) => {
		try {
			await mutation.mutateAsync({
				title: data.title,
				description: data.description,
				language: data.language,
			});
			toast({
				title: "Success",
				description: "Website settings saved.",
			});
		} catch (error) {
			if (error instanceof Error) {
				toast({
					title: "Error",
					description: (
						<TypographyCode className="bg-[hsl(0_100%_75%)] dark:bg-[hsl(0_73%_75%)]">
							{error.message.trim()}
						</TypographyCode>
					),
					variant: "destructive",
				});
			}
		}
	};

	return (
		<Card className="max-w-md flex-grow">
			<CardHeader>
				<CardTitle>SEO</CardTitle>
				<CardDescription>Search Engine Optimization</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
					<Input
						label="Title"
						placeholder="My awesome website"
						defaultValue={data.title}
						{...register("title")}
						error={!!errors.title}
						withAsterisk
					/>
					<Textarea
						label={
							<>
								Description&nbsp;
								<InfoTooltip>Used for social media previews</InfoTooltip>
							</>
						}
						placeholder="This website is very awesome and fun!"
						defaultValue={data.description}
						minRows={3}
						maxRows={10}
						{...register("description")}
					/>
					<Input
						label={
							<>
								Language&nbsp;
								<InfoTooltip>
									Used in the <TypographyCode>lang</TypographyCode> attribute of
									the <TypographyCode>&lt;html&gt;</TypographyCode> tag
								</InfoTooltip>
							</>
						}
						placeholder="en-US"
						defaultValue={data.language}
						{...register("language")}
						error={!!errors.language}
						withAsterisk
					/>
					<Button type="submit" className="ml-auto" loading={mutation.isLoading}>
						Save
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}