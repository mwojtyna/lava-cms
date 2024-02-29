"use client";

import { Sheet } from "@/src/components/ui/client/Sheet";
import { useNavMenuStore } from "@/src/data/stores/navMenu";

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
