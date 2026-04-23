import * as XLSX from 'xlsx'

export function generateExcel(data: Record<string, unknown>[], sheetName = 'Invitados'): Buffer {
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()

  // Column widths
  ws['!cols'] = Object.keys(data[0] ?? {}).map(() => ({ wch: 22 }))

  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
}
