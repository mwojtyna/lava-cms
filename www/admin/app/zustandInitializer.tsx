"use client";

import { useRef } from "react";
import { useServerUrlStore } from "@admin/src/data/stores/dashboard";

interface Props {
	serverUrl: string;
}
export default function ZustandInitializer(props: Props) {
	const initialized = useRef(false);

	if (!initialized.current) {
		useServerUrlStore.setState({ url: props.serverUrl });
		initialized.current = true;
	}

	return null;
}
