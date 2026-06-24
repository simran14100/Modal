export async function enterFullscreen() {
  const el = document.documentElement
  if (el.requestFullscreen) {
    await el.requestFullscreen()
  } else if (el.webkitRequestFullscreen) {
    await el.webkitRequestFullscreen()
  }
}

export async function exitFullscreen() {
  if (!document.fullscreenElement && !document.webkitFullscreenElement) return

  if (document.exitFullscreen) {
    await document.exitFullscreen()
  } else if (document.webkitExitFullscreen) {
    await document.webkitExitFullscreen()
  }
}

export function isFullscreen() {
  return Boolean(document.fullscreenElement || document.webkitFullscreenElement)
}
