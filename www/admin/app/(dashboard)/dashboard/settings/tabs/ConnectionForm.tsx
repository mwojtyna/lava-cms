"use client";

import { ArrowPathIcon, CheckIcon, ClipboardIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { FormProvider, useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { ActionIcon } from "@/src/components/ui/client/ActionIcon";
import { Button } from "@/src/components/ui/client/Button";
import {
	FormItem,
	FormLabel,
	FormDescription,
	FormField,
	FormControl,
	FormError,
} from "@/src/components/ui/client/Form";
import { Input } from "@/src/components/ui/client/Input";
import { Separator } from "@/src/components/ui/client/Separator";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/src/components/ui/server/Card";
import { Loader } from "@/src/components/ui/server/Loader";
import { useToast } from "@/src/hooks/useToast";
import { devUrlRegex } from "@/src/utils/regex";
import { trpc } from "@/src/utils/trpc";

const schema = z.object({
	developmentUrl: z
		.string()
		.min(1, " ")
		.regex(devUrlRegex, "Must include protocol")
		.url()
		.endsWith("/", "Must end with a slash"),
});
type Inputs = z.infer<typeof schema>;

export function ConnectionForm(props: { token: string; connectionSettings: Inputs }) {
	const token =
		trpc.auth.getToken.useQuery(undefined, {
			initialData: props.token,
		}).data ?? "";
	const settings = trpc.settings.getConnectionSettings.useQuery(undefined, {
		initialData: props.connectionSettings,
	}).data;
	const mutation = trpc.settings.setConnectionSettings.useMutation();

	const { toast, toastError } = useToast();

	const form = useForm<Inputs>({
		resolver: zodResolver(schema),
		defaultValues: settings,
	});
	const onSubmit: SubmitHandler<Inputs> = (data) => {
		mutation.mutate(data, {
			onSuccess: () => {
				toast({ title: "Success", description: "Connection settings saved." });
				form.reset(form.getValues());
			},
			onError: (err) => {
				toastError({
					title: "Error",
					description: err.message.trim(),
				});
			},
		});
	};

	return (
		<Card
			className="flex max-w-4xl flex-grow flex-col gap-6 md:p-5"
			data-testid="connection-form"
		>
			<CardHeader>
				<CardTitle>Connection</CardTitle>
				<CardDescription>Connect your website to the CMS.</CardDescription>
				<Separator className="mt-2" />
			</CardHeader>

			<CardContent>
				<FormProvider {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
						<FormItem className="grid grid-cols-[40%_auto]">
							<div className="space-y-1">
								<FormLabel>Token</FormLabel>
								<FormDescription>
									Paste into your website&apos;s CMS API configuration
								</FormDescription>
							</div>

							<TokenInput token={token} />
						</FormItem>

						<FormField
							control={form.control}
							name="developmentUrl"
							render={({ field }) => (
								<FormItem className="grid grid-cols-[40%_auto]">
									<div className="space-y-1">
										<FormLabel>Development URL</FormLabel>
										<FormDescription>
											URL of your website&apos;s development server, including
											the protocol
										</FormDescription>
									</div>

									<div>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormError />
									</div>
								</FormItem>
							)}
						/>

						<Button
							type="submit"
							className="ml-auto"
							disabled={!form.formState.isDirty}
							loading={mutation.isLoading}
						>
							Save
						</Button>
					</form>
				</FormProvider>
			</CardContent>
		</Card>
	);
}

function TokenInput(props: { token: string }) {
	const [copied, setCopied] = React.useState(false);
	const mutation = trpc.auth.generateToken.useMutation();
	const { toast, toastError } = useToast();

	return (
		<div className="flex items-center gap-2">
			<Input
				className="font-mono"
				value={props.token}
				type="password"
				readOnly
				aria-label="Token input"
			/>

			<ActionIcon
				onClick={async () => {
					await navigator.clipboard.writeText(props.token);
					setCopied(true);
				}}
				tooltip="Copy to clipboard"
			>
				{copied ? (
					<CheckIcon className="w-5 text-green-600" />
				) : (
					<ClipboardIcon className="w-5" />
				)}
			</ActionIcon>
			<ActionIcon
				onClick={async () => {
					setCopied(false);
					try {
						await mutation.mutateAsync();
						toast({
							title: "Success",
							description: "Token regenerated, previous token is now invalid.",
						});
					} catch (error) {
						if (error instanceof Error) {
							toastError({
								title: "Error",
								description: error.message.trim(),
							});
						}
					}
				}}
				tooltip="Regenerate token"
			>
				{mutation.isLoading ? <Loader /> : <ArrowPathIcon className="w-5" />}
			</ActionIcon>
		</div>
	);
}
