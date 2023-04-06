import { defineConfig } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import pkg from './package.json' assert { type: 'json' }

export default defineConfig({
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
    },
    {
      file: pkg.module,
      format: 'es',
    },
  ],
  watch: {
    include: 'src/**',
  },
  plugins: [
    resolve(),
    typescript(),
  ],
})
