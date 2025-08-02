import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface AccountLabel {
  text: string
}

export interface Account {
  id: string
  labels: AccountLabel[]
  type: 'LDAP' | 'Локальная'
  login: string
  password: string | null
}

export const useAccountsStore = defineStore('accounts', () => {
  const accounts = ref<Account[]>([])


  const loadAccounts = () => {
    const saved = localStorage.getItem('accounts')
    if (saved) {
      try {
        accounts.value = JSON.parse(saved)
      } catch (error) {
        console.error('Failed to load accounts from localStorage:', error)
        accounts.value = []
      }
    }
  }


  const saveAccounts = () => {
    try {
      localStorage.setItem('accounts', JSON.stringify(accounts.value))
    } catch (error) {
      console.error('Failed to save accounts to localStorage:', error)
    }
  }


  const addAccount = () => {
    const newAccount: Account = {
      id: Date.now().toString(),
      labels: [],
      type: 'Локальная',
      login: '',
      password: ''
    }
    accounts.value.push(newAccount)
    saveAccounts()
    return newAccount
  }


  const updateAccount = (id: string, updates: Partial<Account>) => {
    const index = accounts.value.findIndex(acc => acc.id === id)
    if (index !== -1) {

      if (updates.type === 'LDAP') {
        updates.password = null
      }

      accounts.value[index] = { ...accounts.value[index], ...updates }
      saveAccounts()
    }
  }


  const deleteAccount = (id: string) => {
    const index = accounts.value.findIndex(acc => acc.id === id)
    if (index !== -1) {
      accounts.value.splice(index, 1)
      saveAccounts()
    }
  }


  const parseLabels = (labelString: string): AccountLabel[] => {
    if (!labelString.trim()) return []
    return labelString
      .split(';')
      .map(label => label.trim())
      .filter(label => label.length > 0)
      .map(label => ({ text: label }))
  }


  const labelsToString = (labels: AccountLabel[]): string => {
    return labels.map(label => label.text).join('; ')
  }


  const validateAccount = (account: Account): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {}


    if (!account.login.trim()) {
      errors.login = 'Логин обязателен'
    } else if (account.login.length > 100) {
      errors.login = 'Логин не должен превышать 100 символов'
    }


    if (account.type === 'Локальная') {
      if (!account.password || !account.password.trim()) {
        errors.password = 'Пароль обязателен'
      } else if (account.password.length > 100) {
        errors.password = 'Пароль не должен превышать 100 символов'
      }
    }


    const labelString = labelsToString(account.labels)
    if (labelString.length > 50) {
      errors.labels = 'Метки не должны превышать 50 символов'
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }


  loadAccounts()

  return {
    accounts,
    addAccount,
    updateAccount,
    deleteAccount,
    parseLabels,
    labelsToString,
    validateAccount,
    loadAccounts,
    saveAccounts
  }
})
