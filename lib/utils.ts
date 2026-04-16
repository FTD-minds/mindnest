export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(date))
}

export interface AgeBand {
  min: number
  max: number
  label: string
}

export function getAgeBand(ageMonths: number): AgeBand {
  if (ageMonths < 3)  return { min: 0,  max: 3,  label: '0–3 months'   }
  if (ageMonths < 6)  return { min: 3,  max: 6,  label: '3–6 months'   }
  if (ageMonths < 9)  return { min: 6,  max: 9,  label: '6–9 months'   }
  if (ageMonths < 12) return { min: 9,  max: 12, label: '9–12 months'  }
  if (ageMonths < 18) return { min: 12, max: 18, label: '12–18 months' }
  if (ageMonths < 24) return { min: 18, max: 24, label: '18–24 months' }
  return                     { min: 24, max: 36, label: '24–36 months' }
}
