"use client";

import {
	LockClosedIcon,
	EnvelopeIcon,
	ExclamationCircleIcon,
	ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { signIn } from "next-auth/react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Alert, AlertTitle } from "@admin/src/components/ui/server";
import {
	Input,
	Button,
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormError,
} from "@admin/src/components/ui/client";
import { SinglePageForm } from "../SinglePageForm";

const schema = z.object({
	email: z.string().nonempty(" ").email("The e-mail you provided is invalid."),
	password: z.string().nonempty(),
});
type Inputs = z.infer<typeof schema>;

export function SignInForm() {
	const router = useRouter();

	const form = useForm<Inputs>({
		resolver: zodResolver(schema),
	});
	const onSubmit: SubmitHandler<Inputs> = async (data) => {
		const res = await signIn("credentials", {
			redirect: false,
			...data,
		});

		if (res?.ok) {
			router.push("/dashboard");
		} else if (res?.error === "CredentialsSignin") {
			// "CredentialsSignin" is the error message when the user inputs wrong credentials
			form.setError("root", {
				message: "Your credentials are invalid.",
			});
		} else {
			form.setError("root", {
				message: "Something went wrong. Try again later.",
			});
		}
	};

	return (
		<SinglePageForm
			onSubmit={form.handleSubmit(onSubmit)}
			className="max-w-sm"
			titleText={
				<>
					<span className="bg-gradient-to-b from-foreground/70 to-foreground bg-clip-text text-transparent dark:bg-gradient-to-t">
						Sign in to{" "}
					</span>
					<span className="bg-gradient-to-b from-orange-300 to-orange-600 bg-clip-text text-transparent">
						Lava
					</span>
				</>
			}
			submitButton={
				<Button
					type="submit"
					size="lg"
					icon={<ArrowRightOnRectangleIcon className="w-5" />}
					className="ml-auto shadow-lg shadow-primary/25"
					loading={form.formState.isSubmitting || form.formState.isSubmitSuccessful}
				>
					Sign in
				</Button>
			}
			formData={form}
			data-testid="sign-in"
		>
			{form.formState.errors.root && (
				<Alert variant="destructive" icon={<ExclamationCircleIcon className="w-5" />}>
					<AlertTitle className="mb-0">{form.formState.errors.root.message}</AlertTitle>
				</Alert>
			)}

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
								icon={<EnvelopeIcon />}
								autoFocus
								aria-required
								{...field}
							/>
						</FormControl>
						<FormError />
					</FormItem>
				)}
			/>

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
								icon={<LockClosedIcon />}
								aria-required
								{...field}
							/>
						</FormControl>
					</FormItem>
				)}
			/>
		</SinglePageForm>
	);
}
