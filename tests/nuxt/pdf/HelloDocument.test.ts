import { renderToBuffer } from '@ceereals/vue-pdf'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import HelloDocument from '~/pdf/HelloDocument.vue'

describe('HelloDocument', () => {
  it('renders to a valid PDF', async () => {
    const buffer = await renderToBuffer(h(HelloDocument, { title: 'Hello, CView!' }))
    expect(buffer.subarray(0, 5).toString('latin1')).toBe('%PDF-')
    expect(buffer.subarray(-6).toString('latin1')).toContain('%%EOF')
  })

  it('writes the title into the document metadata', async () => {
    const buffer = await renderToBuffer(h(HelloDocument, { title: 'Ada Lovelace CV' }))
    // The /Info /Title is a plain PDF literal string. Page text is hex-encoded and kerned, so it
    // can't be grepped. Asserting body text needs a PDF text extractor (decide in P1).
    expect(buffer.toString('latin1')).toContain('(Ada Lovelace CV)')
  })
})
