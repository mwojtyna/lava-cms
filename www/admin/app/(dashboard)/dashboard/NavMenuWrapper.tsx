"use client";

import { Sheet } from "@admin/src/components/ui/client";
import { useNavMenu } from "@admin/src/data/stores/dashboard";

export function NavMenuWrapper({ children }: { children: React.ReactNode }) {
	const { isOpen, setOpen } = useNavMenu();

	return (
		<Sheet open={isOpen} onOpenChange={setOpen}>
			{children}
		</Sheet>
	);
}
