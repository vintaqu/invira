import QRCode from 'qrcode'

export const qrService = {
  async generate(url: string, options?: { width?: number }): Promise<string> {
    return QRCode.toDataURL(url, {
      width: options?.width ?? 300,
      margin: 2,
      color: { dark: '#0f0e0c', light: '#faf8f4' },
      errorCorrectionLevel: 'M',
    })
  },

  async generateBuffer(url: string): Promise<Buffer> {
    return QRCode.toBuffer(url, {
      width: 400,
      margin: 2,
      color: { dark: '#0f0e0c', light: '#ffffff' },
    })
  },
}
