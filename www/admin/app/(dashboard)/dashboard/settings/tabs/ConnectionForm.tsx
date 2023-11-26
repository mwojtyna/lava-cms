"use client";

import * as React from "react";
import { FormProvider, useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowPathIcon, CheckIcon, ClipboardIcon } from "@heroicons/react/24/outline";
import {
	ActionIcon,
	Button,
	FormControl,
	FormDescription,
	FormError,
	FormField,
	FormItem,
	FormLabel,
	Input,
	Separator,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@admin/src/components/ui/client";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Loader,
} from "@admin/src/components/ui/server";
import { trpc } from "@admin/src/utils/trpc";
import { useToast } from "@admin/src/hooks";

const schema = z.object({
	developmentUrl: z
		.string()
		.min(1, " ")
		.regex(/^https?:\/\/.*/, "Must include protocol")
		.url(),
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
			onSuccess: () => toast({ title: "Success", description: "Connection settings saved." }),
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

						<Button type="submit" className="ml-auto" loading={mutation.isLoading}>
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
				rightButton={
					// Only show copy button if clipboard API is available,
					// but display on server because of hydration issues
					(typeof window === "undefined" && typeof navigator === "undefined") ||
					(typeof window !== "undefined" && typeof navigator.clipboard !== "undefined")
						? {
								state: copied,
								setState: null,
								onClick: async () => {
									await navigator.clipboard.writeText(props.token);
									setCopied(true);
								},
								iconOn: <CheckIcon className="w-5 text-green-600" />,
								iconOff: <ClipboardIcon className="w-5" />,
								tooltip: "Copy to clipboard",
						  }
						: undefined
				}
				readOnly
				aria-label="Token input"
			/>

			<Tooltip>
				<TooltipTrigger asChild>
					<ActionIcon
						onClick={async () => {
							setCopied(false);
							try {
								await mutation.mutateAsync();
								toast({
									title: "Success",
									description:
										"Token regenerated, previous token is now invalid.",
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
						aria-label="Regenerate token"
					>
						{mutation.isLoading ? <Loader /> : <ArrowPathIcon className="w-5" />}
					</ActionIcon>
				</TooltipTrigger>
				<TooltipContent>Regenerate token</TooltipContent>
			</Tooltip>
		</div>
	);
}
