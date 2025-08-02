<template>
  <div class="accounts-form">
    <div class="form-header">
      <h2>Управление учетными записями</h2>
      <el-button
        type="primary"
        :icon="Plus"
        @click="handleAddAccount"
        class="add-account-btn"
        circle
      />
    </div>

    <div class="labels-hint">
      <el-alert
        title="Подсказка для поля 'Метка'"
        description="Для указания нескольких меток для одной пары логин/пароль используйте разделитель ;"
        type="info"
        :closable="false"
        show-icon
      />
    </div>

    <div class="accounts-list">
      <div v-if="accountsStore.accounts.length === 0" class="no-accounts">
        <el-empty description="Нет учетных записей" />
      </div>

      <div v-else class="accounts-grid">
        <div class="field-labels">
          <div class="field-label">Метка</div>
          <div class="field-label">Тип записи</div>
          <div class="field-label">Логин</div>
          <div class="field-label">Пароль</div>
          <div class="field-label">Действия</div>
        </div>

        <div v-for="account in accountsStore.accounts" :key="account.id" class="account-row">
          <div class="field-wrapper">
            <el-input
              v-model="formData[account.id].labels"
              @blur="handleLabelsBlur(account.id)"
              placeholder="Введите метки через ;"
              maxlength="50"
              show-word-limit
              :class="{ 'error-field': fieldErrors[account.id]?.labels }"
            />
            <div v-if="fieldErrors[account.id]?.labels" class="error-message">
              {{ fieldErrors[account.id].labels }}
            </div>
          </div>

          <div class="field-wrapper">
            <el-select
              :model-value="account.type"
              @change="handleTypeChange(account.id, $event)"
              placeholder="Выберите тип"
            >
              <el-option label="LDAP" value="LDAP" />
              <el-option label="Локальная" value="Локальная" />
            </el-select>
          </div>

          <div class="field-wrapper" :class="{ 'login-span-two': account.type === 'LDAP' }">
            <el-input
              v-model="formData[account.id].login"
              @blur="handleLoginBlur(account.id)"
              placeholder="Введите логин"
              maxlength="100"
              show-word-limit
              :class="{ 'error-field': fieldErrors[account.id]?.login }"
            />
            <div v-if="fieldErrors[account.id]?.login" class="error-message">
              {{ fieldErrors[account.id].login }}
            </div>
          </div>

          <div v-if="account.type === 'Локальная'" class="field-wrapper password-field">
            <el-input
              v-model="formData[account.id].password"
              @blur="handlePasswordBlur(account.id)"
              :type="passwordVisible[account.id] ? 'text' : 'password'"
              placeholder="Введите пароль"
              maxlength="100"
              show-word-limit
              :class="{ 'error-field': fieldErrors[account.id]?.password }"
            >
              <template #suffix>
                <el-button
                  :icon="passwordVisible[account.id] ? Hide : View"
                  @click="togglePasswordVisibility(account.id)"
                  text
                  class="password-toggle-btn"
                />
              </template>
            </el-input>
            <div v-if="fieldErrors[account.id]?.password" class="error-message">
              {{ fieldErrors[account.id].password }}
            </div>
          </div>

          <div class="field-wrapper">
            <el-button
              type="danger"
              :icon="Delete"
              @click="handleDeleteAccount(account.id)"
              circle
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { ElButton, ElInput, ElSelect, ElOption, ElAlert, ElEmpty } from 'element-plus'
import { Plus, Delete, View, Hide } from '@element-plus/icons-vue'
import { useAccountsStore } from '../stores/accounts'

const accountsStore = useAccountsStore()

const fieldErrors = reactive<Record<string, Record<string, string>>>({})

const formData = reactive<Record<string, { labels: string; login: string; password: string }>>({})

const passwordVisible = reactive<Record<string, boolean>>({})

const initializeFormData = () => {
  accountsStore.accounts.forEach((account) => {
    if (!formData[account.id]) {
      formData[account.id] = {
        labels: accountsStore.labelsToString(account.labels),
        login: account.login,
        password: account.password || '',
      }
    }

    if (passwordVisible[account.id] === undefined) {
      passwordVisible[account.id] = false
    }
  })
}

initializeFormData()

watch(
  () => accountsStore.accounts,
  (newAccounts) => {
    newAccounts.forEach((account) => {
      if (!formData[account.id]) {
        formData[account.id] = {
          labels: accountsStore.labelsToString(account.labels),
          login: account.login,
          password: account.password || '',
        }
      }

      if (passwordVisible[account.id] === undefined) {
        passwordVisible[account.id] = false
      }
    })

    Object.keys(formData).forEach((id) => {
      if (!newAccounts.find((account) => account.id === id)) {
        delete formData[id]
      }
    })
  },
  { immediate: true, deep: true },
)

const handleAddAccount = () => {
  const newAccount = accountsStore.addAccount()

  formData[newAccount.id] = {
    labels: '',
    login: '',
    password: '',
  }

  passwordVisible[newAccount.id] = false
}

const handleDeleteAccount = (id: string) => {
  accountsStore.deleteAccount(id)

  delete formData[id]
  delete fieldErrors[id]
  delete passwordVisible[id]
}

const handleLabelsBlur = (id: string) => {
  const labels = accountsStore.parseLabels(formData[id].labels)
  accountsStore.updateAccount(id, { labels })
  validateField(id, 'labels')
}

const handleTypeChange = (id: string, value: 'LDAP' | 'Локальная') => {
  accountsStore.updateAccount(id, { type: value })

  if (value === 'LDAP') {
    formData[id].password = ''
  }

  if (value === 'LDAP' && fieldErrors[id]?.password) {
    delete fieldErrors[id].password
  }
  validateField(id, 'password')
}

const handleLoginBlur = (id: string) => {
  accountsStore.updateAccount(id, { login: formData[id].login })
  validateField(id, 'login')
}

const handlePasswordBlur = (id: string) => {
  accountsStore.updateAccount(id, { password: formData[id].password })
  validateField(id, 'password')
}

const togglePasswordVisibility = (id: string) => {
  passwordVisible[id] = !passwordVisible[id]
}

const validateField = (accountId: string, fieldName: string) => {
  const account = accountsStore.accounts.find((acc) => acc.id === accountId)
  if (!account) return

  const validation = accountsStore.validateAccount(account)

  if (!fieldErrors[accountId]) {
    fieldErrors[accountId] = {}
  }

  if (validation.errors[fieldName]) {
    fieldErrors[accountId][fieldName] = validation.errors[fieldName]
  } else {
    delete fieldErrors[accountId][fieldName]
  }

  if (Object.keys(fieldErrors[accountId]).length === 0) {
    delete fieldErrors[accountId]
  }
}
</script>

<style scoped lang="scss">
.accounts-form {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;

  .form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      color: #303133;
    }

    .add-account-btn {
      width: 50px;
      height: 50px;
      background: transparent !important;
      border: 2px solid #bbbcbd;
      border-radius: 8px;
      font-size: 36px;
      color: #bbbcbd;

      &:hover {
        border-color: #838383;
        color: #838383;
        background: transparent !important;
      }

      &:active {
        border-color: #bbbcbd;
        color: #bbbcbd;
        background: transparent !important;
      }

      &:focus {
        background: transparent !important;
      }
    }
  }

  .labels-hint {
    margin-bottom: 20px;
  }

  .accounts-list {
    .no-accounts {
      text-align: center;
      padding: 40px 0;
    }

    .accounts-grid {
      .field-labels {
        display: grid;
        grid-template-columns: 1fr 150px 200px 200px 80px;
        gap: 16px;
        margin-bottom: 16px;
        padding: 0 8px;

        .field-label {
          font-weight: 600;
          color: #606266;
          font-size: 20px;
        }
      }

      .account-row {
        display: grid;
        grid-template-columns: 1fr 150px 200px 200px 80px;
        gap: 16px;
        margin-bottom: 16px;
        padding: 16px 8px;
        border: 1px solid #ebeef5;
        border-radius: 8px;
        background-color: #fff;

        &:hover {
          box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        }

        .field-wrapper {
          position: relative;

          &.login-span-two {
            grid-column: span 2;
          }

          &.password-field {
            .password-toggle-btn {
              padding: 0;
              margin: 0;
              min-height: auto;
              height: auto;
              border: none;
              background: transparent;

              &:hover {
                background: transparent;
              }

              &:focus {
                background: transparent;
              }
            }
          }

          .disabled-field {
            height: 32px;
            display: flex;
            align-items: center;
            padding: 0 14px;
            background-color: #f5f7fa;
            border: 1px solid #e4e7ed;
            border-radius: 4px;
            color: #909399;
            font-size: 16px;
          }

          .error-message {
            position: absolute;
            top: -75%;
            left: 0;
            font-size: 12px;
            color: #f56c6c;
            margin-top: 4px;
            z-index: 1;
          }
        }
      }
    }
  }
}

:deep(.error-field) {
  .el-input__wrapper {
    border-color: #f56c6c !important;
    box-shadow: 0 0 0 1px #f56c6c inset !important;
  }
}
</style>
