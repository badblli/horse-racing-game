/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** `'true'` only in the e2e build, where the ?seed and ?rate query hooks are honoured. */
  readonly VITE_TEST_HOOKS?: 'true'
}
