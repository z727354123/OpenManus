import { useEventListener } from '@vueuse/core'

/*
 * Show page shade
 */
export const showShade = function (closeCallBack) {
  const className = 'shade'
  const containerEl = document.querySelector('.layout-container')
  const shadeDiv = document.createElement('div')
  shadeDiv.setAttribute('class', 'layout-shade ' + className)
  containerEl.appendChild(shadeDiv)
  useEventListener(shadeDiv, 'click', () => closeShade(closeCallBack))
}

/*
 * Hide page shade
 */
export const closeShade = function (closeCallBack = () => { }) {
  const shadeEl = document.querySelector('.layout-shade')
  shadeEl && shadeEl.remove()
  closeCallBack()
}
