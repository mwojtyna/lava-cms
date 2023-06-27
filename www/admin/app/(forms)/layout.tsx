export default async function FormLayout({ children }: { children: React.ReactNode }) {
	return <main className="grid h-[100svh] h-screen place-items-center p-8">{children}</main>;
}
