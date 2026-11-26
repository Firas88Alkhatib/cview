import { fontStore } from '@ceereals/vue-pdf'
import interBoldItalic from '@fontsource/inter/files/inter-latin-700-italic.woff?url'
import interBold from '@fontsource/inter/files/inter-latin-700-normal.woff?url'
import interItalic from '@fontsource/inter/files/inter-latin-400-italic.woff?url'
import interRegular from '@fontsource/inter/files/inter-latin-400-normal.woff?url'
import loraBoldItalic from '@fontsource/lora/files/lora-latin-700-italic.woff?url'
import loraBold from '@fontsource/lora/files/lora-latin-700-normal.woff?url'
import loraItalic from '@fontsource/lora/files/lora-latin-400-italic.woff?url'
import loraRegular from '@fontsource/lora/files/lora-latin-400-normal.woff?url'
import poppinsBoldItalic from '@fontsource/poppins/files/poppins-latin-700-italic.woff?url'
import poppinsBold from '@fontsource/poppins/files/poppins-latin-700-normal.woff?url'
import poppinsItalic from '@fontsource/poppins/files/poppins-latin-400-italic.woff?url'
import poppinsRegular from '@fontsource/poppins/files/poppins-latin-400-normal.woff?url'
import type { FontFamily } from '~/pdf/meta'

// Bundled fonts (D-45): served from our own origin via Vite `?url` assets, never hotlinked.
// WOFF, which fontkit reads, latin subset. Regular/bold × upright/italic per family.
type Faces = { regular: string; bold: string; italic: string; boldItalic: string }

export const FONT_FILES: Record<FontFamily, Faces> = {
  Inter: {
    regular: interRegular,
    bold: interBold,
    italic: interItalic,
    boldItalic: interBoldItalic,
  },
  Lora: { regular: loraRegular, bold: loraBold, italic: loraItalic, boldItalic: loraBoldItalic },
  Poppins: {
    regular: poppinsRegular,
    bold: poppinsBold,
    italic: poppinsItalic,
    boldItalic: poppinsBoldItalic,
  },
}

let registered = false

/** Registers all fonts with the PDF engine once. Call before rendering (client only). */
export function registerPdfFonts() {
  if (registered) return
  for (const [family, faces] of Object.entries(FONT_FILES)) {
    fontStore.register({
      family,
      fonts: [
        { src: faces.regular, fontWeight: 400, fontStyle: 'normal' },
        { src: faces.bold, fontWeight: 700, fontStyle: 'normal' },
        { src: faces.italic, fontWeight: 400, fontStyle: 'italic' },
        { src: faces.boldItalic, fontWeight: 700, fontStyle: 'italic' },
      ],
    })
  }
  registered = true
}
