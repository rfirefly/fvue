export function getSequence(list) {
  if (list.length === 0)
    return
  const subArr = [0]
  let subArrLastIdx
  let s, e, mid
  const p = new Array(list.length).fill(0)

  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    if (item === 0)
      continue
    subArrLastIdx = subArr[subArr.length - 1]
    if (list[subArrLastIdx] < item) {
      subArr.push(i)
      p[i] = subArrLastIdx // 标记前一项
      continue
    }

    s = 0
    e = subArr.length - 1
    while (s < e) {
      mid = ((s + e) / 2) | 0
      if (list[subArr[mid]] < item)
        s = mid + 1
      else
        e = mid
    }

    if (list[subArr[e]] > item) {
      subArr[e] = i
      p[i] = subArr[e - 1]
    }
  }

  //   获取最长子序列
  let i = subArr.length
  let last = subArr[i - 1]
  while (i-- > 0) {
    subArr[i] = last
    last = p[last]
  }

  return subArr
}
