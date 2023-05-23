"use client";

import * as React from "react";
import { z } from "zod";
import { check } from "language-tags";
import { type SubmitHandler, useForm } from "react-hook-form";
import { trpcReact } from "@admin/src/utils/trpcReact";
import { zodResolver } from "@hookform/resolvers/zod";
import { InfoTooltip } from "@admin/src/components";
import {
	Button,
	FormProvider,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	Input,
	Textarea,
} from "@admin/src/components/ui/client";
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
		title: z.string().nonempty(),
		description: z.string().optional(),
		language: z.string().nonempty(),
	})
	.refine((data) => check(data.language), {
		path: ["language"],
	});
type Inputs = z.infer<typeof schema>;

export function SeoForm({ serverData }: { serverData: Inputs }) {
	const data = trpcReact.config.getConfig.useQuery().data ?? serverData;
	const mutation = trpcReact.config.setConfig.useMutation();
	const { toast } = useToast();

	const form = useForm<Inputs>({ resolver: zodResolver(schema), defaultValues: data });
	const onSubmit: SubmitHandler<Inputs> = async (data) => {
		try {
			await mutation.mutateAsync({
				title: data.title,
				description: data.description ?? "",
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
				<FormProvider {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel withAsterisk>Title</FormLabel>
									<FormControl>
										<Input
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
									<FormLabel>
										Description&nbsp;
										<InfoTooltip>Used for social media previews</InfoTooltip>
									</FormLabel>
									<FormControl>
										<Textarea
											placeholder="This website is very awesome and fun!"
											minRows={3}
											maxRows={10}
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
									<FormLabel withAsterisk>
										Language&nbsp;
										<InfoTooltip>
											Used in the <TypographyCode>lang</TypographyCode>{" "}
											attribute of the{" "}
											<TypographyCode>&lt;html&gt;</TypographyCode> tag
										</InfoTooltip>
									</FormLabel>
									<FormControl>
										<Input placeholder="en-US" aria-required {...field} />
									</FormControl>
								</FormItem>
							)}
						/>

						<Button type="submit" className="ml-auto" loading={mutation.isLoading}>
							Save
						</Button>
					</form>
				</FormProvider>
			</CardContent>
		</Card>
	);
}
