import { useState, useEffect } from 'react'
import { useAppStore } from './useApp'

// stores dark mode preference in local storage
export const useDarkMode = () => {
    const settings = useAppStore((state) => state.settings)
    const [theme, setTheme] = useState<'light' | 'dark' | null>(null)

    useEffect(() => {
        if (localStorage.getItem('theme') === null) {
            localStorage.setItem('theme', 'light')
        }
        if (theme === null) {
            setTheme(localStorage.getItem('theme') as 'light' | 'dark')
        } else {
            localStorage.setItem('theme', theme)
        }

        if (theme === 'light') {
            document.body.classList.remove('dark')
        } else if (theme === 'dark') {
            document.body.classList.add('dark')
        }
    }, [theme])

    return [theme, setTheme]
}
