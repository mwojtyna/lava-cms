"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { EnvelopeIcon, LockClosedIcon, UserIcon } from "@heroicons/react/24/outline";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@admin/src/utils/trpc";
import {
	Button,
	FormControl,
	FormError,
	FormField,
	FormItem,
	FormLabel,
	Input,
} from "@admin/src/components/ui/client";
import { SinglePageForm } from "../SinglePageForm";

const inputSchema = z
	.object({
		name: z.string().nonempty(),
		lastName: z.string().nonempty(),
		email: z
			.string()
			.nonempty({ message: " " })
			.email({ message: "The e-mail you provided is invalid." }),
		password: z
			.string({ required_error: " " })
			.min(8, { message: "The password must be at least 8 characters long." })
			.regex(/[a-z]/, {
				message: "The password must contain at least one lowercase letter.",
			})
			.regex(/[A-Z]/, {
				message: "The password must contain at least one uppercase letter.",
			})
			.regex(/[0-9]/, {
				message: "The password must contain at least one digit.",
			}),
		repeatPassword: z.string({ required_error: " " }),
	})
	.refine((data) => data.password === data.repeatPassword && data.password !== "", {
		path: ["repeatPassword"],
		message: "The passwords do not match.",
	});
type Inputs = z.infer<typeof inputSchema>;

export function SignUpForm() {
	const router = useRouter();

	const form = useForm<Inputs>({ mode: "onSubmit", resolver: zodResolver(inputSchema) });
	const onSubmit: SubmitHandler<Inputs> = async (data) => {
		await trpc.auth.signUp.mutate({
			name: data.name,
			lastName: data.lastName,
			email: data.email,
			password: data.password,
		});
		await signIn("credentials", {
			redirect: false,
			email: data.email,
			password: data.password,
		});
		router.refresh();
	};

	return (
		<SinglePageForm
			className="max-w-sm"
			onSubmit={form.handleSubmit(onSubmit)}
			titleText={
				<span className="bg-gradient-to-b from-foreground/70 to-foreground bg-clip-text text-transparent dark:bg-gradient-to-t">
					Add admin user
				</span>
			}
			submitButton={
				<Button
					type="submit"
					size="lg"
					icon={<ArrowRightIcon className="w-5" />}
					className="ml-auto shadow-lg shadow-primary/25"
					loading={form.formState.isSubmitting || form.formState.isSubmitSuccessful}
				>
					Continue
				</Button>
			}
			formData={form}
		>
			<FormField
				control={form.control}
				name="email"
				render={({ field }) => (
					<FormItem>
						<FormLabel size="lg">E-mail</FormLabel>
						<FormControl>
							<Input
								type="email"
								placeholder="user@domain.com"
								size="lg"
								icon={<EnvelopeIcon className="w-5" />}
								autoFocus
								{...field}
							/>
						</FormControl>
						<FormError />
					</FormItem>
				)}
			/>

			<div className="flex gap-4">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel size="lg">Name</FormLabel>
							<FormControl>
								<Input
									type="text"
									placeholder="John"
									size="lg"
									icon={<UserIcon className="w-5" />}
									{...field}
								/>
							</FormControl>
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="lastName"
					render={({ field }) => (
						<FormItem>
							<FormLabel size="lg">Last name</FormLabel>
							<FormControl>
								<Input type="text" placeholder="Doe" size="lg" {...field} />
							</FormControl>
						</FormItem>
					)}
				/>
			</div>

			<FormField
				control={form.control}
				name="password"
				render={({ field }) => (
					<FormItem>
						<FormLabel size="lg">Password</FormLabel>
						<FormControl>
							<Input
								type="password"
								size="lg"
								icon={<LockClosedIcon className="w-5" />}
								{...field}
							/>
						</FormControl>
						<FormError />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="repeatPassword"
				render={({ field }) => (
					<FormItem>
						<FormLabel size="lg">Repeat password</FormLabel>
						<FormControl>
							<Input
								type="password"
								size="lg"
								icon={<LockClosedIcon className="w-5" />}
								{...field}
							/>
						</FormControl>
						<FormError />
					</FormItem>
				)}
			/>
		</SinglePageForm>
	);
}
