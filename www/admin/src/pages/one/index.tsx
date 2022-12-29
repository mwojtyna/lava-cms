import React from "react";
import { trpc } from "../../utils/trpc";

export default function One() {
	const hello = trpc.example.hello.useQuery({ text: "One" });

	return <div>{hello.data?.greeting}</div>;
}
