"use client";

import { Sheet } from "@/src/components/ui/client";
import { useNavMenuStore } from "@/src/data/stores/dashboard";

export function NavMenuWrapper({ children }: { children: React.ReactNode }) {
	const { isOpen, setIsOpen } = useNavMenuStore((state) => ({
		isOpen: state.isOpen,
		setIsOpen: state.setIsOpen,
	}));

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			{children}
		</Sheet>
	);
}
