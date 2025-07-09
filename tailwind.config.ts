
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
				// Calmon Academy brand colors
				calmon: {
					50: '#fefcf0',
					100: '#fef7e0',
					200: '#fdf2c7',
					300: '#fbe49e',
					400: '#f7d065',
					500: '#f4c430', // Primary golden
					600: '#e6b800',
					700: '#d4af37', // Rich gold
					800: '#b8860b', // Dark gold
					900: '#996515', // Bronze
					950: '#5d3c0a'
				},
				// Legacy brand colors for backward compatibility
				brand: {
					50: '#fefcf0',
					100: '#fef7e0',
					200: '#fdf2c7',
					300: '#fbe49e',
					400: '#f7d065',
					500: '#f4c430',
					600: '#e6b800',
					700: '#d4af37',
					800: '#b8860b',
					900: '#996515',
				},
				ai: {
					50: '#fefcf0',
					100: '#fef7e0',
					200: '#fdf2c7',
					300: '#fbe49e',
					400: '#f7d065',
					500: '#f4c430',
					600: '#e6b800',
					700: '#d4af37',
					800: '#b8860b',
					900: '#996515',
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
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'slide-in': 'slide-in 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'gradient-shift': 'gradient-shift 3s ease-in-out infinite'
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
				'calmon-gradient': 'linear-gradient(135deg, #f4c430 0%, #d4af37 50%, #b8860b 100%)',
				'calmon-bg-gradient': 'linear-gradient(135deg, #fef7e0 0%, #fdf2c7 50%, #f9e79f 100%)',
				// Legacy gradients for backward compatibility
				'ai-gradient': 'linear-gradient(135deg, #f4c430 0%, #d4af37 50%, #b8860b 100%)',
				'brand-gradient': 'linear-gradient(135deg, #f4c430 0%, #d4af37 100%)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
