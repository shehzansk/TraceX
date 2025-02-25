// providers.tsx
"use client";

import * as React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { ThemeProvider as NextThemesProvider, ThemeProviderProps } from "next-themes";

export interface ProvidersProps {
	children: React.ReactNode;
	themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
	return (
		<NextThemesProvider defaultTheme="light" {...themeProps}>
			<ChakraProvider>{children}</ChakraProvider>
		</NextThemesProvider>
	);
}
