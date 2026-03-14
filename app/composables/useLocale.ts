import { computed } from 'vue'
import { useState } from '#app'
import { translations } from '~/utils/i18n'

export const useLocale = () => {
    const currentLocale = useState<'pt-BR' | 'en'>('locale', () => 'pt-BR')

    const t = computed(() => translations[currentLocale.value])

    function toggleLocale(): void {
        currentLocale.value = currentLocale.value === 'pt-BR' ? 'en' : 'pt-BR'
    }

    return {
        locale: currentLocale,
        t,
        toggleLocale
    }
}