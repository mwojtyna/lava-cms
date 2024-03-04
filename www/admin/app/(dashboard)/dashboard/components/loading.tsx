import { Skeleton } from "@/src/components/ui/server/Skeleton";

export default function Loading() {
	return (
		<div className="space-y-4">
			<div className="flex justify-between gap-2">
				<Skeleton className="h-10 w-64" />
				<div className="flex gap-2">
					<Skeleton className="h-10 w-32 max-sm:w-20" />
					<Skeleton className="h-10 w-32 max-sm:w-20" />
				</div>
			</div>
			<Skeleton className="h-[25vh] w-full" />
		</div>
	);
}
