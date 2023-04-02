const quene = []
let isFlushing = false
const resovlePromise = Promise.resolve()

// 组件异步更新
export function queneJob(job) {
  if (!quene.includes(job))
    quene.push(job)

  if (!isFlushing) {
    isFlushing = true
    resovlePromise.then(() => {
      isFlushing = false
      let copyQuene = quene.slice(0)
      quene.length = 0 // 防止更新时，触发更新
      for (let i = 0; i < copyQuene.length; i++) {
        const job = copyQuene[i]
        job()
      }
      copyQuene = null
    })
  }
}
