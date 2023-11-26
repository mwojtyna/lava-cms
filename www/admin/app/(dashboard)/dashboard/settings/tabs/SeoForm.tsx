"use client";

import * as React from "react";
import { z } from "zod";
import { type SubmitHandler, useForm } from "react-hook-form";
import { trpc } from "@admin/src/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Button,
	FormProvider,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	Input,
	Textarea,
	FormDescription,
	Separator,
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

const schema = z.object({
	title: z.string().min(1),
	description: z.string(),
	language: z.string().min(1),
});
type Inputs = z.infer<typeof schema>;

export function SeoForm({ serverData }: { serverData: Inputs }) {
	const data = trpc.settings.getSeoSettings.useQuery(undefined, {
		initialData: serverData,
	}).data;
	const mutation = trpc.settings.setSeoSettings.useMutation();

	const { toast, toastError } = useToast();

	const form = useForm<Inputs>({
		resolver: zodResolver(schema),
		defaultValues: data,
	});
	const onSubmit: SubmitHandler<Inputs> = (data) => {
		mutation.mutate(data, {
			onSuccess: () => toast({ title: "Success", description: "SEO settings saved." }),
			onError: (err) => {
				if (err.data?.code === "BAD_REQUEST") {
					form.setError("language", {});
				} else {
					toastError({
						title: "Error",
						description: err.message.trim(),
					});
				}
			},
		});
	};

	return (
		<Card className="flex max-w-4xl flex-grow flex-col gap-6 md:p-5" data-testid="seo-form">
			<CardHeader>
				<CardTitle>Search Engine Optimization</CardTitle>
				<CardDescription>
					Optimize website visibility and rankings with SEO settings.
				</CardDescription>
				<Separator className="mt-2" />
			</CardHeader>

			<CardContent>
				<FormProvider {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem className="grid grid-cols-2">
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
								<FormItem className="grid grid-cols-2">
									<div className="space-y-1">
										<FormLabel>Description</FormLabel>
										<FormDescription>
											Used for social media previews
										</FormDescription>
									</div>

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
								<FormItem className="grid grid-cols-2">
									<div className="space-y-1">
										<FormLabel withAsterisk>Language</FormLabel>
										<FormDescription>
											Used in the <TypographyCode>lang</TypographyCode>{" "}
											attribute of the{" "}
											<TypographyCode>&lt;html&gt;</TypographyCode> tag
										</FormDescription>
									</div>

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
