import { describe, it, expect } from 'vitest'
import { useLocale } from '~/composables/useLocale'

describe('useLocale', () => {
    it('should initialize with pt-BR locale', () => {
        const { locale, t } = useLocale()
        expect(locale.value).toBe('pt-BR')
        expect(t.value.login.title).toBe('AP101 TimeTracker')
    })

    it('should toggle locale to en and update translations', () => {
        const { locale, t, toggleLocale } = useLocale()
        toggleLocale()

        expect(locale.value).toBe('en')
        expect(t.value.login.title).toBe('AP101 TimeTracker')
        expect(t.value.dashboard.title).toBe('Dashboard')
    })
})