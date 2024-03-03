import { Skeleton } from "@/src/components/ui/server/Skeleton";

export default function Loading() {
	return (
		<div className="flex h-full flex-col gap-4 p-3">
			<div className="flex justify-between">
				<Skeleton className="h-10 w-28" />
				<div className="flex gap-4">
					<Skeleton className="size-10 rounded-full" />
					<Skeleton className="h-10 w-28" />
					<Skeleton className="h-10 w-28" />
				</div>
			</div>

			<div className="grid h-full grid-cols-[1fr_525px] gap-4">
				<Skeleton className="h-full w-full flex-[3]" />
				<Skeleton className="h-full w-full flex-[1]" />
			</div>
		</div>
	);
}
