/** @type {import('tailwindcss').Config} */
    module.exports = {
      darkMode: ["class"],
      content: [
        './pages/**/*.{js,jsx}',
        './components/**/*.{js,jsx}',
        './app/**/*.{js,jsx}',
        './src/**/*.{js,jsx}',
      ],
      theme: {
        container: {
          center: true,
          padding: "2rem",
          screens: {
            "2xl": "1400px",
          },
        },
        extend: {
          colors: {
            border: "hsl(var(--border))",
            input: "hsl(var(--input))",
            ring: "hsl(var(--ring))",
            background: "hsl(var(--background))",
            foreground: "hsl(var(--foreground))",
            primary: {
              DEFAULT: "hsl(var(--primary))",
              foreground: "hsl(var(--primary-foreground))",
            },
            secondary: {
              DEFAULT: "hsl(var(--secondary))",
              foreground: "hsl(var(--secondary-foreground))",
            },
            destructive: {
              DEFAULT: "hsl(var(--destructive))",
              foreground: "hsl(var(--destructive-foreground))",
            },
            muted: {
              DEFAULT: "hsl(var(--muted))",
              foreground: "hsl(var(--muted-foreground))",
            },
            accent: {
              DEFAULT: "hsl(var(--accent))",
              foreground: "hsl(var(--accent-foreground))",
            },
            popover: {
              DEFAULT: "hsl(var(--popover))",
              foreground: "hsl(var(--popover-foreground))",
            },
            card: {
              DEFAULT: "hsl(var(--card))",
              foreground: "hsl(var(--card-foreground))",
            },
            'brand-green-900': 'hsl(var(--brand-green-900))',
            'brand-green-600': 'hsl(var(--brand-green-600))',
            'brand-green-100': 'hsl(var(--brand-green-100))',
            'brand-gold-600': 'hsl(var(--brand-gold-600))',
            'brand-gold-700': 'hsl(var(--brand-gold-700))',
            'brand-gold-100': 'hsl(var(--brand-gold-100))',
            'text-primary': 'hsl(var(--text))',
            'text-secondary': 'hsl(var(--text-2))',
          },
          borderRadius: {
            lg: "var(--radius)",
            md: "calc(var(--radius) - 2px)",
            sm: "calc(var(--radius) - 4px)",
          },
          height: {
            '13': '3.25rem', // 52px - 30% más grande que h-10 (40px)
          },
          keyframes: {
            "accordion-down": {
              from: { height: 0 },
              to: { height: "var(--radix-accordion-content-height)" },
            },
            "accordion-up": {
              from: { height: "var(--radix-accordion-content-height)" },
              to: { height: 0 },
            },
            "aurora": {
              from: { backgroundPosition: "50% 50%, 50% 50%" },
              to: { backgroundPosition: "350% 50%, 350% 50%" },
            },
          },
          animation: {
            "accordion-down": "accordion-down 0.2s ease-out",
            "accordion-up": "accordion-up 0.2s ease-out",
            "aurora": "aurora 60s linear infinite",
          },
          fontFamily: {
            sans: ['"Inter"', 'sans-serif'],
            mono: ['"Roboto Mono"', 'monospace'],
          },
        },
      },
      plugins: [require("tailwindcss-animate")],
    }