"use client";

import * as React from "react";
import {
	ActionIcon,
	FormDescription,
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
import { ArrowPathIcon, CheckIcon, ClipboardIcon } from "@heroicons/react/24/outline";
import { FormProvider, useForm } from "react-hook-form";
import { useToast } from "@admin/src/hooks";

export function ConnectionForm(props: { token: string | undefined }) {
	const token =
		trpc.auth.getToken.useQuery(undefined, {
			initialData: props.token,
			refetchOnWindowFocus: false,
		}).data ?? "";
	const form = useForm();

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
					<form className="flex flex-col gap-6">
						<FormItem className="grid grid-cols-[40%_auto]">
							<div className="space-y-1">
								<FormLabel>Token</FormLabel>
								<FormDescription>
									Paste into your website&apos;s CMS API configuration
								</FormDescription>
							</div>

							<TokenInput token={token} />
						</FormItem>
					</form>
				</FormProvider>
			</CardContent>
		</Card>
	);
}

const TokenInput = ({ token }: { token: string }) => {
	const [copied, setCopied] = React.useState(false);
	const mutation = trpc.auth.generateToken.useMutation();
	const { toast, toastError } = useToast();

	return (
		<div className="flex items-center gap-2">
			<Input
				className="font-mono"
				type="password"
				value={token}
				readOnly
				aria-label="Token input"
			/>
			<span className="flex" data-testid="token-actions">
				<Tooltip>
					<TooltipTrigger asChild>
						<ActionIcon
							onClick={async () => {
								await navigator.clipboard.writeText(token);
								setCopied(true);
							}}
							aria-label="Copy to clipboard"
						>
							{copied ? (
								<CheckIcon className="w-5 text-green-600" />
							) : (
								<ClipboardIcon className="w-5" />
							)}
						</ActionIcon>
					</TooltipTrigger>
					<TooltipContent>Copy to clipboard</TooltipContent>
				</Tooltip>

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
			</span>
		</div>
	);
};
