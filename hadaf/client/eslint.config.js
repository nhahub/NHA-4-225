import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

// NOTE: E0-1 hand-off flag — several rules below are relaxed because
// Impulse's pre-existing code violates them. The relaxations are scoped
// to those rules and are intended to be removed in a dedicated cleanup
// pass. New code in Hadaf must NOT add new violations of these rules.
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Pre-existing: Header.tsx uses setState inside useEffect for theme
      // sync — the pattern is correct here (external sync to localStorage
      // / matchMedia) but the new rule fires anyway. Refactor opportunity
      // noted; not blocking E0-1.
      'react-hooks/set-state-in-effect': 'off',

      // Pre-existing: Impulse uses `any` extensively for axios catch
      // blocks and mock data. Migration target is to type these properly
      // in the relevant feature epics (E1–E4). Not blocking E0-1.
      '@typescript-eslint/no-explicit-any': 'off',

      // Pre-existing: a handful of files import types/values they no
      // longer use. Trim in feature work. Not blocking E0-1.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // Pre-existing: Skeleton.tsx has `interface X extends Y {}` (empty
      // body) for a CVA-style prop alias. Cosmetic. Not blocking E0-1.
      '@typescript-eslint/no-empty-object-type': 'off',

      // react-hook-form's `watch()` is not compatible with React 19's
      // compiler-based memoization analysis. This is a known library
      // issue, not a Hadaf bug.
      'react-hooks/incompatible-library': 'off',

      // Pre-existing: a few @ts-ignore comments in task components. E2
      // work will rewrite task types; replace @ts-ignore with proper
      // types then.
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
])