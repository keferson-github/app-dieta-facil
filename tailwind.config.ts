
import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Cores específicas para o Dieta Fácil - Inspirado no MyFitnessPal
				health: {
					50: '#f0f9ff',   // Azul muito claro
					100: '#e0f2fe',  // Azul claro
					200: '#bae6fd',  // Azul suave
					300: '#7dd3fc',  // Azul médio claro
					400: '#38bdf8',  // Azul vibrante
					500: '#0ea5e9',  // Azul principal
					600: '#0284c7',  // Azul escuro
					700: '#0369a1',  // Azul mais escuro
					800: '#075985',  // Azul profundo
					900: '#0c4a6e',  // Azul muito escuro
				},
				// Cores secundárias para fitness
				fitness: {
					50: '#f0fdf4',   // Verde muito claro
					100: '#dcfce7',  // Verde claro
					200: '#bbf7d0',  // Verde suave
					300: '#86efac',  // Verde médio
					400: '#4ade80',  // Verde vibrante
					500: '#22c55e',  // Verde principal
					600: '#16a34a',  // Verde escuro
					700: '#15803d',  // Verde mais escuro
					800: '#166534',  // Verde profundo
					900: '#14532d',  // Verde muito escuro
				},
				// Tons neutros sofisticados
				slate: {
					50: '#f8fafc',   // Cinza muito claro
					100: '#f1f5f9',  // Cinza claro
					200: '#e2e8f0',  // Cinza suave
					300: '#cbd5e1',  // Cinza médio claro
					400: '#94a3b8',  // Cinza médio
					500: '#64748b',  // Cinza principal
					600: '#475569',  // Cinza escuro
					700: '#334155',  // Cinza mais escuro
					800: '#1e293b',  // Cinza profundo
					900: '#0f172a',  // Cinza muito escuro
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-in': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(0)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'slide-in': 'slide-in 0.3s ease-out'
			}
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;