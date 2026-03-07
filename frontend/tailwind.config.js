/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            keyframes: {
                bellShake: {
                    '0%, 100%': { transform: 'rotate(0deg)' },
                    '10%, 30%, 50%, 70%, 90%': { transform: 'rotate(-10deg)' },
                    '20%, 40%, 60%, 80%': { transform: 'rotate(10deg)' },
                }
            },
            animation: {
                bellShake: 'bellShake 0.5s ease-in-out',
            }
        },
    },
    plugins: [],
}
