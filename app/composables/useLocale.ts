import { ref, computed } from 'vue'
import { translations } from '~/utils/i18n'

const currentLocale = ref<'pt-BR' | 'en'>('pt-BR')

export const useLocale = () => {
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