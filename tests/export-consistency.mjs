import { createHash } from 'node:crypto'
import { mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

const baseURL = process.env.BYMARK_URL || 'http://127.0.0.1:5173'
const artifacts = path.resolve('test-results', 'export-consistency')
await mkdir(artifacts, { recursive: true })

const browser = await chromium.launch({ headless: true })

async function exportFrom(viewport, label) {
  const context = await browser.newContext({
    viewport,
    colorScheme: 'dark',
    deviceScaleFactor: 1,
    acceptDownloads: true,
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })

  await page.addInitScript(() => {
    window.__exportSourceMetrics = []
    new MutationObserver(() => {
      const card = document.querySelector('[data-export-render-card]')
      if (!card || window.__exportSourceMetrics.length) return
      const style = getComputedStyle(card)
      window.__exportSourceMetrics.push({
        width: card.clientWidth,
        height: card.clientHeight,
        transform: style.transform,
        transitionDuration: style.transitionDuration,
      })
    }).observe(document, { childList: true, subtree: true })
  })

  await page.goto(baseURL, { waitUntil: 'networkidle' })
  await page.locator('[data-testid="export-card"]').waitFor({ state: 'attached' })
  await page.waitForTimeout(200)
  const previewMarkup = await page.locator('[data-testid="export-card"]').evaluate((node) => node.outerHTML)
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('.export-button').click(),
  ])
  const outputPath = path.join(artifacts, `${label}.png`)
  await download.saveAs(outputPath)
  if (await download.failure()) throw new Error(`${label} export failed: ${await download.failure()}`)

  const sourceMetrics = await page.evaluate(() => window.__exportSourceMetrics)
  const bytes = await readFile(outputPath)
  await context.close()
  return {
    bytes,
    errors,
    previewMarkup,
    sourceMetrics,
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    sha256: createHash('sha256').update(bytes).digest('hex'),
  }
}

try {
  const desktop = await exportFrom({ width: 1440, height: 1000 }, 'desktop')
  const mobile = await exportFrom({ width: 390, height: 844 }, 'mobile')

  if (desktop.errors.length || mobile.errors.length) {
    throw new Error(`runtime errors: ${[...desktop.errors, ...mobile.errors].join(' | ')}`)
  }
  if (desktop.previewMarkup !== mobile.previewMarkup) {
    throw new Error('mobile and desktop previews do not share identical card markup')
  }
  for (const [label, result] of [['desktop', desktop], ['mobile', mobile]]) {
    const source = result.sourceMetrics[0]
    if (!source || source.width !== 800 || source.height !== 1067 || source.transform !== 'none') {
      throw new Error(`${label} did not render from the fixed desktop canvas: ${JSON.stringify(source)}`)
    }
    if (result.width !== 1536 || result.height !== 2048) {
      throw new Error(`${label} export dimensions are ${result.width}x${result.height}`)
    }
  }
  if (!desktop.bytes.equals(mobile.bytes)) {
    throw new Error(`viewport-dependent export: desktop=${desktop.sha256}, mobile=${mobile.sha256}`)
  }

  console.log(`Desktop/mobile preview markup matches; exported PNG bytes match (${desktop.sha256}).`)
} finally {
  await browser.close()
}
