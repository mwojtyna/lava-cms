import { Skeleton } from "@/src/components/ui/server/Skeleton";

export default function Loading() {
	return (
		<div className="flex h-full flex-col gap-4 p-3">
			<div className="flex justify-between">
				<Skeleton className="h-10 w-24" />
				<div className="flex gap-4">
					<Skeleton className="size-10 rounded-full" />
					<Skeleton className="h-10 w-24 max-sm:hidden" />
					<Skeleton className="h-10 w-24 max-sm:hidden" />
				</div>
			</div>

			<div className="flex h-full gap-4">
				<Skeleton className="h-full w-full flex-[1]" />
				<Skeleton className="h-full w-[525px] max-sm:hidden" />
			</div>
		</div>
	);
}
