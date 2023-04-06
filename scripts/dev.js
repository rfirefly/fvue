const { resolve } = require('node:path')
const { build } = require('esbuild')

const args = require('minimist')(process.argv.slice(2))

const target = args._[0] || 'FReactivity'
const format = args.f || 'global'
console.log('🚀 ~ format', format)
const baseUrl = resolve(__dirname, `../packages/${target}`)
const pkg = require(resolve(baseUrl, './package.json'))
// const outputFormat = format.startsWith('global') ? 'iife' : format === 'cjs' ? 'cjs' : 'esm'
// const outfile = resolve(baseUrl, `./dist/${target}.${format}.js`)

function buildType(type) {
  const outfile = resolve(baseUrl, `./dist/${target}.${type}.js`)

  build({
    entryPoints: [resolve(baseUrl, './src/index.ts')],
    outfile,
    bundle: true,
    sourcemap: true,
    format: type,
    globalName: pkg.buildOptions?.name,
    platform: format === 'cjs' ? 'node' : 'browser',
    // watch: {
    //   onRebuild(error) {
    //     if (!error)
    //       console.log('rebuild~~')
    //   },
    // },
  }).then(() => {
    console.log(`build ${type} success`)
  })
}

pkg.buildOptions.format.forEach((type) => {
  const outputFormat = type.startsWith('global') ? 'iife' : type === 'cjs' ? 'cjs' : 'esm'

  buildType(outputFormat)
})
