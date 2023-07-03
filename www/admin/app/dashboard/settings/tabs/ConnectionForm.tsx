"use client";

import * as React from "react";
import {
	Button,
	FormDescription,
	FormItem,
	FormLabel,
	Separator,
} from "@admin/src/components/ui/client";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Loader,
	TypographyCode,
} from "@admin/src/components/ui/server";
import { trpc } from "@admin/src/utils/trpc";
import { FormProvider, useForm } from "react-hook-form";
import { useToast } from "@admin/src/hooks";

const GenerateToken = () => {
	const mutation = trpc.auth.generateToken.useMutation();
	const { toast } = useToast();

	const regenerateToken = async () => {
		try {
			const { token } = await mutation.mutateAsync();
			await navigator.clipboard.writeText(token);

			toast({
				title: "Success",
				description: (
					<>
						Token generated and stored in the clipboard.
						<br />
						The previous token is now invalid.
					</>
				),
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
		<Button
			className="ml-auto w-fit whitespace-nowrap"
			variant={"secondary"}
			onClick={regenerateToken}
		>
			{mutation.isLoading && <Loader />}Generate and copy token
		</Button>
	);
};

export function ConnectionForm() {
	const form = useForm();

	return (
		<Card className="flex max-w-4xl flex-grow flex-col gap-6 md:p-5" data-testid="seo-form">
			<CardHeader>
				<CardTitle>Connection</CardTitle>
				<CardDescription>Connect your website to the CMS.</CardDescription>
				<Separator className="mt-2" />
			</CardHeader>

			<CardContent>
				<FormProvider {...form}>
					<form className="flex flex-col gap-6">
						<FormItem className="flex-row items-center">
							<div className="space-y-1">
								<FormLabel>API Token</FormLabel>
								<FormDescription>
									Paste this token into your environment variables
								</FormDescription>
							</div>

							<GenerateToken />
						</FormItem>

						{/* <Button type="submit" className="ml-auto" loading={mutation.isLoading}>
							Save
						</Button> */}
					</form>
				</FormProvider>
			</CardContent>
		</Card>
	);
}
