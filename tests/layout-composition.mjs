import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const targetUrl = process.env.BYMARK_URL
if (!targetUrl) throw new Error('BYMARK_URL is required')

const browser = await chromium.launch({ headless: true })

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  await page.goto(targetUrl)
  await page.getByRole('tab', { name: '版式' }).click()

  const presentation = page.getByRole('group', { name: '布局' })
  const fullButton = presentation.getByRole('button', { name: '铺满', exact: true })
  const sceneButton = presentation.getByRole('button', { name: '悬浮', exact: true })
  assert.equal(await fullButton.getAttribute('aria-pressed'), 'true')

  const readFullLayout = () => page.locator('.post-card-inner').evaluate((node) => {
    const style = getComputedStyle(node)
    return {
      width: style.width,
      height: style.height,
      padding: [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft],
    }
  })

  const bymarkFullLayout = await readFullLayout()
  await page.getByRole('button', { name: 'X', exact: true }).click()
  await page.locator('.post-card-folio:not(.post-card-scene)').waitFor({ state: 'visible' })
  assert.deepEqual(await readFullLayout(), bymarkFullLayout)
  assert.equal(await fullButton.getAttribute('aria-pressed'), 'true')
  assert.equal(await page.getByLabel('选择场景背景图片').isHidden(), true)

  await sceneButton.click()
  await page.locator('.post-card-folio.post-card-scene').waitFor({ state: 'visible' })
  assert.equal(await sceneButton.getAttribute('aria-pressed'), 'true')
  assert.equal(await page.getByLabel('选择场景背景图片').isVisible(), true)

  await page.getByRole('button', { name: /^场景微调/ }).click()
  const sceneValues = await page.locator('.scene-settings-disclosure input').evaluateAll((inputs) =>
    inputs.map((input) => input.value),
  )
  await fullButton.click()
  await page.getByLabel('选择场景背景图片').waitFor({ state: 'hidden' })
  await sceneButton.click()
  await page.getByRole('button', { name: /^场景微调/ }).click()
  assert.deepEqual(
    await page.locator('.scene-settings-disclosure input').evaluateAll((inputs) => inputs.map((input) => input.value)),
    sceneValues,
  )

  await page.getByRole('button', { name: 'Bymark', exact: true }).click()
  assert.equal(await sceneButton.getAttribute('aria-pressed'), 'true')
  await fullButton.click()
  await page.getByRole('button', { name: 'X', exact: true }).click()
  assert.equal(await fullButton.getAttribute('aria-pressed'), 'true')
} finally {
  await browser.close()
}

console.log('Layout composition checks passed.')
