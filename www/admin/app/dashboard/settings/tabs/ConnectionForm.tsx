"use client";

import * as React from "react";
import {
	ActionIcon,
	FormControl,
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
} from "@admin/src/components/ui/server";
import { trpc } from "@admin/src/utils/trpc";
import { ArrowPathIcon, CheckIcon, ClipboardIcon } from "@heroicons/react/24/outline";
import { FormProvider, useForm } from "react-hook-form";
import { cn } from "@admin/src/utils/styling";

const TokenInput = ({ token }: { token: string }) => {
	const [copied, setCopied] = React.useState(false);
	const [spin, setSpin] = React.useState(false);
	const timeoutRef = React.useRef<NodeJS.Timer>();
	const mutation = trpc.auth.generateToken.useMutation();

	return (
		<div className="flex items-center gap-2">
			<Input className="font-mono" type="password" value={token} readOnly />
			<span className="flex">
				<Tooltip>
					<TooltipTrigger asChild>
						<ActionIcon
							onClick={async () => {
								await navigator.clipboard.writeText(token);
								setCopied(true);
							}}
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
							onClick={() => {
								clearTimeout(timeoutRef.current);
								setCopied(false);
								setSpin(true);
								timeoutRef.current = setTimeout(() => setSpin(false), 500);
								mutation.mutate();
							}}
						>
							<ArrowPathIcon className={cn("w-5", spin && "animate-spin")} />
						</ActionIcon>
					</TooltipTrigger>
					<TooltipContent>Regenerate token</TooltipContent>
				</Tooltip>
			</span>
		</div>
	);
};

export function ConnectionForm(props: { token: string | undefined }) {
	const token =
		trpc.auth.getToken.useQuery(undefined, {
			initialData: props.token,
			refetchOnWindowFocus: false,
		}).data ?? "";
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
						<FormItem className="grid grid-cols-[40%_auto]">
							<div className="space-y-1">
								<FormLabel>Token</FormLabel>
								<FormDescription>
									Paste this token into your environment variables
								</FormDescription>
							</div>

							<FormControl>
								<TokenInput token={token} />
							</FormControl>
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
