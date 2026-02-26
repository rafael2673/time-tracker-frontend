export const useTheme = () => {
    const isDark = useState('theme', () => false)

    const toggleTheme = () => {
        isDark.value = !isDark.value
        updateDOM()
    }

    const updateDOM = () => {
        if (typeof document === 'undefined') return

        const html = document.documentElement
        if (isDark.value) {
            html.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } else {
            html.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        }
    }

    const initTheme = () => {
        if (typeof window === 'undefined') return

        const savedTheme = localStorage.getItem('theme')
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches

        if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
            isDark.value = true
        } else {
            isDark.value = false
        }
        updateDOM()
    }

    return { isDark, toggleTheme, initTheme }
}