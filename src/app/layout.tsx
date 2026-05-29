import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Michelito GIF Generator",
	description: "Generador de GIFs de Michelito",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="es">
			<body>{children}</body>
		</html>
	);
}
