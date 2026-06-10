import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    prettier,
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            sourceType: 'module',
        },
        rules: {
            '@typescript-eslint/no-unsafe-function-type': 'off',

            '@typescript-eslint/naming-convention': [
                'error',

                {
                    selector: 'variable',
                    format: ['camelCase', 'UPPER_CASE'],
                },

                {
                    selector: 'function',
                    format: ['camelCase', 'PascalCase'],
                },

                {
                    selector: 'class',
                    format: ['PascalCase'],
                },

                {
                    selector: 'interface',
                    format: ['PascalCase'],
                },

                {
                    selector: 'enum',
                    format: ['PascalCase'],
                },

                {
                    selector: 'typeAlias',
                    format: ['PascalCase'],
                },
            ],

            '@typescript-eslint/no-explicit-any': 'warn',

            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],

            '@typescript-eslint/consistent-type-imports': 'error',

            // =========================
            // JavaScript General
            // =========================

            'prefer-const': 'error',

            'no-var': 'error',

            'no-shadow': [
                'error',
                {
                    allow: ['resolve', 'reject'],
                },
            ],

            curly: 'error',

            'no-multiple-empty-lines': [
                'error',
                {
                    max: 1,
                    maxEOF: 0,
                    maxBOF: 0,
                },
            ],

            'no-trailing-spaces': 'error',

            'no-console': 'off',
        },
    },

    {
        files: ['tests/**/*.test.ts', 'tests/**/*.spec.ts'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',

            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                },
            ],

            'no-shadow': 'off',
        },
    },
];
