export const TeleportImpl = {
  __isTeleport: true,
  process(n1, n2, container, anchor, internals) {
    const { move, mountChildren, patchChildren } = internals
    if (!n1) {
      const target = document.querySelector(n2.props && n2.props.to)
      if (target) {
        mountChildren(n2.children, target)
      }
    } else {
      patchChildren(n1, n2, container)
      if (n1.props.to !== n2.props.to) {
        const target = document.querySelector(n2.props && n2.props.to)
        n2.children.forEach(vnode => {
          move(vnode, target)
        })
      }
    }
  },
}

export const isTeleport = type => type.__isTeleport
