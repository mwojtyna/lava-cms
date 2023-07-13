"use client";

import { Sheet } from "@admin/src/components/ui/client";
import { useMenuStore } from "@admin/src/data/stores/dashboard";

export function NavMenuWrapper({ children }: { children: React.ReactNode }) {
	const menu = useMenuStore();

	return (
		<Sheet open={menu.isOpen} onOpenChange={menu.set}>
			{children}
		</Sheet>
	);
}
