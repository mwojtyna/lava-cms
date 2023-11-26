import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@admin/src/components/ui/client";

interface Props {
	open: boolean;
	setOpen: (value: boolean) => void;
}
export function AddComponentDialog(props: Props) {
	return (
		<Dialog open={props.open} onOpenChange={props.setOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add component</DialogTitle>
				</DialogHeader>
				{/* Component select:
					- Search
					- Open folder in new view
				*/}
			</DialogContent>
		</Dialog>
	);
}
