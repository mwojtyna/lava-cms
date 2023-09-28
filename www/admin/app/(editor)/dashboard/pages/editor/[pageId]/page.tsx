export default function Editor({ params }: { params: { pageId: string } }) {
	return <div>{params.pageId}</div>;
}
