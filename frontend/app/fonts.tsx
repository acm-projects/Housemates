import { Platform } from 'react-native'

export const FONTS = {
  title:   Platform.select({ ios:'Lora-Bold',         android:'Lora-Bold',         default:'serif'      }),
  titleReg:Platform.select({ ios:'Lora-Regular',      android:'Lora-Regular',      default:'serif'      }),
  body:    Platform.select({ ios:'LexendDeca-Regular', android:'LexendDeca-Regular',default:'sans-serif' }),
  bodyMed: Platform.select({ ios:'LexendDeca-Medium',  android:'LexendDeca-Medium', default:'sans-serif' }),
}

export const PALETTE = {
  active:      '#EC8575',
  activeDark:  '#c96d5e',
  textDark:    '#1a1a1a',
  textMuted:   '#8b7b6b',
  glass:       'rgba(255,255,255,0.72)',
  glassBorder: 'rgba(255,255,255,0.65)',
  white:       '#FFFFFF',
  // FAB / action button label color
  fabText:     '#F2E8DC',
  // Split table down-arrow color
  downArrow:   '#E0A932',
}

// Frosted glass card shadow — strong drop shadow for depth
export const GLASS_SHADOW = {
  shadowColor:   '#000',
  shadowOffset:  { width: 0, height: 6 },
  shadowOpacity: 0.18,
  shadowRadius:  16,
  elevation:     10,
}
