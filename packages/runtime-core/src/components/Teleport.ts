export const TeleportImpl = {
  __isTeleport: true,
  process(n1, n2, container, anchor, internals) {
    const { mountChildren } = internals
    if (!n1) {
      const target = document.querySelector(n2.props && n2.props.to)
      if (target) {
        mountChildren(n2.children, target)
      }
    }
  },
}

export const isTeleport = type => type.__isTeleport
