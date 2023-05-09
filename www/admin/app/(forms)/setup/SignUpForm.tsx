"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { EnvelopeIcon, LockClosedIcon, UserIcon } from "@heroicons/react/24/outline";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@admin/src/utils/trpc";
import { Button, Input } from "@admin/src/components/ui/client";
import { SinglePageForm } from "@admin/src/components";

const inputSchema = z
	.object({
		name: z.string().min(1),
		lastName: z.string().min(1),
		email: z
			.string()
			.min(1, { message: " " })
			.email({ message: "The e-mail you provided is invalid." }),
		password: z
			.string()
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
		repeatPassword: z.string(),
	})
	.refine((data) => data.password === data.repeatPassword && data.password !== "", {
		path: ["repeatPassword"],
		message: "The passwords do not match.",
	});
type Inputs = z.infer<typeof inputSchema>;

export function SignUpForm() {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting, isSubmitSuccessful },
	} = useForm<Inputs>({ mode: "onSubmit", resolver: zodResolver(inputSchema) });

	const router = useRouter();

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
			className="max-w-md"
			onSubmit={handleSubmit(onSubmit)}
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
					loading={isSubmitting || isSubmitSuccessful}
				>
					Continue
				</Button>
			}
		>
			<Input
				type="email"
				label="E-mail"
				placeholder="user@domain.com"
				size="lg"
				{...register("email")}
				error={errors.email?.message}
				icon={<EnvelopeIcon className="w-5" />}
				autoFocus
			/>

			<div className="flex gap-4">
				<Input
					type="text"
					label="Name"
					placeholder="John"
					size="lg"
					{...register("name")}
					error={!!errors.name}
					icon={<UserIcon className="w-5" />}
				/>
				<Input
					type="text"
					label="Last name"
					placeholder="Doe"
					size="lg"
					{...register("lastName")}
					error={!!errors.lastName}
				/>
			</div>

			<Input
				type="password"
				label="Password"
				size="lg"
				{...register("password")}
				error={errors.password?.message}
				icon={<LockClosedIcon className="w-5" />}
			/>
			<Input
				type="password"
				label="Repeat password"
				size="lg"
				{...register("repeatPassword")}
				error={errors.repeatPassword?.message}
				icon={<LockClosedIcon className="w-5" />}
			/>
		</SinglePageForm>
	);
}
