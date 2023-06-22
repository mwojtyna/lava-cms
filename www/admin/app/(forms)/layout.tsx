export default function FormLayout({ children }: { children: React.ReactNode }) {
	return <main className="grid h-[100svh] h-screen place-items-center p-10">{children}</main>;
}
