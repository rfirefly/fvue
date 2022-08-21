import { ReactiveEffect } from "@FVue/reactivity";
import { invokeFns, ShapeFlags } from "@FVue/shared";
import { createComponentInstance, renderComponent, setupComponent } from "./component";
import { shouldUpdateComponent, updateProps, updateSlots } from "./componentProps";
import { isKeepAlive } from "./components/KeepAlive";
import { queneJob } from "./scheduler";
import { getSequence } from "./sequence";
import { normalize } from "./utils";
import { Fragment, isSameNode, Text } from "./vnode";

export function createRenderer(renderOptions) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
    setText: hostSetText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    createElement: hostCreateElement,
    createText: hostCreateText,
    patchProp: hostPatchProp,
  } = renderOptions;

  const render = (vnode, containder) => {
    console.log("🚀 ~ containder", containder);
    // vnode 为空
    if (vnode === null) {
      // 卸载
      unmount(containder._vnode);
    } else {
      patch(containder._vnode || null, vnode, containder);
    }

    containder._vnode = vnode;
  };

  const patch = (n1, n2, container, anchor = null, parentComponent = null) => {
    if (n1 === n2) return;
    if (n1 && !isSameNode(n1, n2)) {
      unmount(n1, parentComponent);
      n1 = null;
    }

    const { type, shapeFlag } = n2;
    switch (type) {
      case Text:
        processText(n1, n2, container);
        break;
      case Fragment:
        processFragment(n1, n2, container, parentComponent);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, anchor, parentComponent);
        } else if (shapeFlag & ShapeFlags.COMPONENT) {
          // 组件
          processComponent(n1, n2, container, anchor, parentComponent);
        } else if (shapeFlag & ShapeFlags.TELEPORT) {
          // teleport
          type.process(n1, n2, container, anchor, {
            mountChildren,
            patchChildren,
            move,
          });
        }
    }
  };
  const move = (vnode, target) => {
    hostInsert(vnode.component ? vnode.component.subTree.el : vnode.el, target);
  };

  const processText = (n1, n2, container) => {
    if (n1 === null) {
      hostInsert((n2.el = hostCreateText(n2.children)), container);
    } else {
      // 文本更新
      const el = (n2.el = n1.el);
      if (n1.children !== n2.children) {
        hostSetText(el, n2.children);
      }
    }
  };

  const processFragment = (n1, n2, el, parentComponent) => {
    if (n1 === null) {
      n2.children && mountChildren(n2.children, el, parentComponent);
    } else {
      // 直接走diff
      patchChildren(n1, n2, el, parentComponent);
    }
  };

  const processComponent = (n1, n2, container, anchor, parentComponent = null) => {
    if (n1 === null) {
      if (n2.shapeFlag & ShapeFlags.COMPONENT_KEEP_ALIVE) {
        parentComponent.ctx.activate(n2, container, anchor);
      } else {
        mountComponent(n2, container, anchor, parentComponent);
      }
    } else {
      updateComponent(n1, n2);
    }
  };
  const updateComponentPreRender = (instance, next) => {
    instance.next = null;
    instance.vnode = next;
    updateProps(instance.props, next.props);
    updateSlots(instance, next.slots);
  };

  const setupRenderEffect = (instance, container, anchor) => {
    const componentUpdateFn = () => {
      if (!instance.isMounted) {
        let { bm, m } = instance;
        bm && invokeFns(bm);

        const subTree = renderComponent(instance);
        patch(null, subTree, container, anchor, instance);

        instance.subTree = subTree;
        instance.isMounted = true;
        m && invokeFns(m);
      } else {
        let { next, bu, u } = instance;
        next && updateComponentPreRender(instance, next);
        bu && invokeFns(bu);
        const subTree = renderComponent(instance);
        patch(instance.subTree, subTree, container, anchor, instance);
        u && invokeFns(u);

        instance.subTree = subTree;
      }
    };
    const effect = new ReactiveEffect(componentUpdateFn, () => queneJob(instance.update));
    const update = (instance.update = effect.run.bind(effect));
    update();
  };

  const mountComponent = (vnode, container, anchor, parentComponent) => {
    let instance = (vnode.component = createComponentInstance(vnode, parentComponent));

    if (isKeepAlive(vnode)) {
      (instance.ctx as any).renderer = {
        createElement: hostCreateElement,
        move: move,
      };
    }

    setupComponent(instance);
    setupRenderEffect(instance, container, anchor);
  };

  const updateComponent = (n1, n2) => {
    const instance = (n1.component = n2.component);
    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2;
      instance.update();
    }
  };

  const processElement = (n1, n2, container, anchor, parentComponent) => {
    if (n1 === null) {
      mountElement(n2, container, anchor, parentComponent);
    } else {
      patchElement(n1, n2, parentComponent);
    }
  };

  const mountElement = (vnode, container, anchor, parentComponent) => {
    let { type, props, children, shapeFlag } = vnode;

    let el = (vnode.el = hostCreateElement(type));

    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }
    if (shapeFlag & ShapeFlags.ARRENT_CHILDREN) {
      mountChildren(children, el, parentComponent);
    } else if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children);
    }
    hostInsert(el, container, anchor);
  };

  const patchElement = (n1, n2, parentComponent) => {
    const el = (n2.el = n1.el);
    let oldProps = n1.props || {};
    let newProps = n2.props || {};

    patchProps(oldProps, newProps, el);

    if (n2.dynamicChildren) {
      // 靶向更新
      patchBlockChildren(n1.dynamicChildren, n2.dynamicChildren, parentComponent);
    } else {
      // 全量更新
      patchChildren(n1, n2, el, parentComponent);
    }
  };

  const patchProps = (oldProps, newProps, el) => {
    for (const key in newProps) {
      hostPatchProp(el, key, oldProps[key], newProps[key]);
    }

    for (const key in oldProps) {
      if (newProps[key] === null) {
        hostPatchProp(el, key, oldProps[key], undefined);
      }
    }
  };

  const patchBlockChildren = (n1, n2, parentComponent) => {
    for (let i = 0; i < n2.length; i++) {
      patchElement(n1[i], n2[i], parentComponent);
    }
  };

  const patchChildren = (n1, n2, el, parentComponent) => {
    const c1 = n1.children;
    const c2 = n2.children;
    const prveShapeFlag = n1.shapeFlag;
    const nextShapeFlag = n2.shapeFlag;

    if (nextShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prveShapeFlag & ShapeFlags.ARRENT_CHILDREN) {
        unmountChildren(n1);
      }
      if (c1 !== c2) hostSetElementText(el, c2);
      return;
    }
    if (prveShapeFlag & ShapeFlags.ARRENT_CHILDREN) {
      if (nextShapeFlag & ShapeFlags.ARRENT_CHILDREN) {
        // diff
        patchKeyedChildren(c1, c2, el);
        return;
      }
      // 现在非数组
      unmountChildren(c1);
    } else {
      if (prveShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(el, "");
      }
      if (nextShapeFlag & ShapeFlags.ARRENT_CHILDREN) {
        mountChildren(c2, el, parentComponent);
      }
    }
  };

  const patchKeyedChildren = (c1, c2, el) => {
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = c2.length - 1;

    // 剔出从头开始相同的节点
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];
      if (isSameNode(n1, n2)) {
        patch(n1, n2, el);
      } else {
        break;
      }
      i++;
    }

    // 剔出从尾开始相同的节点
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];
      if (isSameNode(n1, n2)) {
        patch(n1, n2, el);
      } else {
        break;
      }
      e1--;
      e2--;
    }
    // i到e2即为新增节点
    if (i > e1 && i <= e2) {
      while (i <= e2) {
        const nextPos = e2 + 1;
        // 获取插入位置锚点
        const anchor = nextPos < c2.length ? c2[nextPos].el : null;
        patch(null, c2[i], el, anchor);
        i++;
      }
    }
    // i到e1即为删除节点
    if (i > e2 && i <= e1) {
      while (i <= e1) {
        unmount(c1[i]);
        i++;
      }
    }

    // 乱序比较
    let s1 = i;
    let s2 = i;

    const keyToNewIdxMap = new Map();
    for (let i = s2; i <= e2; i++) {
      keyToNewIdxMap.set(c2[i].key, i);
    }
    // 删除比对新旧节点
    const toBePatched = e2 - s2 + 1;
    const newIdxArray = new Array(toBePatched).fill(0);
    for (let i = s1; i <= e1; i++) {
      const oldVNode = c1[i];
      const newIdx = keyToNewIdxMap.get(oldVNode.key);
      if (!newIdx) {
        unmount(oldVNode);
      } else {
        newIdxArray[newIdx - s2] = i + 1;
        patch(oldVNode, c2[newIdx], el);
      }
    }

    const incSubQuence = getSequence(newIdxArray);
    let lastJump = incSubQuence.length - 1;
    for (let i = toBePatched - 1; i >= 0; i--) {
      let idx = i + s2;
      let current = c2[idx];
      let anchor = idx + 1 < c2.length ? c2[idx + 1].el : null;

      if (newIdxArray[i] === 0) {
        patch(null, current, el, anchor);
      } else {
        if (i !== incSubQuence[lastJump]) {
          hostInsert(current.el, el, anchor);
        } else {
          lastJump--;
        }
      }
    }
  };

  const mountChildren = (children, el, parentComponent) => {
    for (let i = 0; i < children.length; i++) {
      let child = normalize(children[i]);
      patch(null, child, el, null, parentComponent);
    }
  };

  const unmount = (vnode, instance = null) => {
    if (!vnode) return;
    if (vnode.type === Fragment) {
      unmountChildren(vnode);
      return;
    } else if (vnode.shapeFlag & ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE) {
      return instance.ctx.deactivate(vnode);
    } else if (vnode.shapeFlag & ShapeFlags.COMPONENT) {
      hostRemove(vnode.component.subTree.el);
      return;
    }
    hostRemove(vnode.el);
  };

  const unmountChildren = (children) => {
    for (let i = 0; i < children.length; i++) {
      unmountChildren(children[i]);
    }
  };

  return {
    render,
  };
}
