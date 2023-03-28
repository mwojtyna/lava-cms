"use client";

import { Divider, Stack, TextInput, Title } from "@mantine/core";
import Content from "@admin/app/dashboard/(components)/Content";

export default function Settings() {
	return (
		<Content>
			<Content.Card>
				<Stack spacing="0.5rem" mb={"sm"}>
					<Title order={4}>Website</Title>
					<Divider />
				</Stack>

				<Stack spacing={"md"}>
					<TextInput label="Title" placeholder="My awesome website" />
					<TextInput
						label="Description"
						placeholder="This website is very awesome and fun!"
					/>
					<TextInput label="Language" placeholder="en-US" />
				</Stack>
			</Content.Card>
		</Content>
	);
}
