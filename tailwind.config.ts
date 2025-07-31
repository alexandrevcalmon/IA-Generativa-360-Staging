
import type { Config } from "tailwindcss";

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
				// Calmon Academy Golden color scheme (inspired by logo)
				calmon: {
					50: '#fefbf3',
					100: '#fdf6e3',
					200: '#faecc1',
					300: '#f6dd95',
					400: '#f1c668',
					500: '#edb247', // Primary golden
					600: '#d49c3d',
					700: '#b17d2f', // Rich golden
					800: '#8f632a', // Dark golden
					900: '#755127', // Deep golden
					950: '#422c13'
				},
				// Secondary purple palette
				purple: {
					50: '#f5f3ff',
					100: '#ede9fe',
					200: '#ddd6fe',
					300: '#c4b5fd',
					400: '#a78bfa',
					500: '#8b5cf6',
					600: '#7c3aed',
					700: '#6d28d9',
					800: '#5b21b6',
					900: '#4c1d95',
					950: '#2e1065'
				},
				// Legacy brand colors for backward compatibility
				brand: {
					50: '#f0f9f8',
					100: '#e0f3f1',
					200: '#b8e7e2',
					300: '#8fd8d0',
					400: '#4abfb3',
					500: '#2aa99c',
					600: '#1e8f85',
					700: '#1a756d',
					800: '#155c56',
					900: '#0f3d39',
				},
				ai: {
					50: '#f0f9f8',
					100: '#e0f3f1',
					200: '#b8e7e2',
					300: '#8fd8d0',
					400: '#4abfb3',
					500: '#2aa99c',
					600: '#1e8f85',
					700: '#1a756d',
					800: '#155c56',
					900: '#0f3d39',
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
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slide-in': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'gradient-shift': {
					'0%, 100%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' }
				},
				'bounce-in': {
					'0%': { transform: 'scale(0.3)', opacity: '0' },
					'50%': { transform: 'scale(1.05)' },
					'70%': { transform: 'scale(0.9)' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'slide-in': 'slide-in 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'gradient-shift': 'gradient-shift 3s ease-in-out infinite',
				'bounce-in': 'bounce-in 0.6s ease-out'
			},
			backgroundImage: {
					'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
					'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
					'calmon-gradient': 'linear-gradient(135deg, #edb247 0%, #d49c3d 100%)',
					'calmon-bg-gradient': 'linear-gradient(180deg, #fefbf3 0%, #fdf6e3 100%)',
					'header-gradient': 'linear-gradient(180deg, #ffffff 0%, #fefbf3 100%)',
					'card-gradient': 'linear-gradient(135deg, rgba(237,178,71,0.1) 0%, rgba(212,156,61,0.05) 100%)',
					'feature-gradient-red': 'linear-gradient(135deg, #9b2c2c 0%, #7f1d1d 100%)',
					'feature-gradient-green': 'linear-gradient(135deg, #edb247 0%, #b17d2f 100%)',
					'feature-gradient-blue': 'linear-gradient(135deg, #3182ce 0%, #2c5282 100%)',
					'feature-gradient-purple': 'linear-gradient(135deg, #805ad5 0%, #6b46c1 100%)',
					'adapta-dark': 'linear-gradient(180deg, #1a1e21 0%, #121517 100%)',
					'adapta-card-1': 'linear-gradient(135deg, #9b2c2c 0%, #7f1d1d 100%)',
					'adapta-card-2': 'linear-gradient(135deg, #edb247 0%, #b17d2f 100%)',
					'adapta-card-3': 'linear-gradient(135deg, #805ad5 0%, #6b46c1 100%)',
					'adapta-header': 'linear-gradient(180deg, #1a1e21 0%, #121517 100%)',
					'adapta-light': 'linear-gradient(180deg, #ffffff 0%, #fefbf3 100%)',
					// Legacy gradients for backward compatibility
					'ai-gradient': 'linear-gradient(135deg, #edb247 0%, #b17d2f 100%)',
					'brand-gradient': 'linear-gradient(135deg, #edb247 0%, #b17d2f 100%)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
