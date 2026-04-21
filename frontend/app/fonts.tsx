import { Platform } from 'react-native'

export const FONTS = {
  title:  Platform.select({ ios: 'Lora-Bold',        android: 'Lora-Bold',        default: 'serif'     }),
  titleReg:Platform.select({ ios: 'Lora-Regular',    android: 'Lora-Regular',     default: 'serif'     }),
  body:   Platform.select({ ios: 'LexendDeca-Regular',android: 'LexendDeca-Regular',default: 'sans-serif'}),
  bodyMed:Platform.select({ ios: 'LexendDeca-Medium', android: 'LexendDeca-Medium', default: 'sans-serif'}),
}

export const PALETTE = {
  active:       '#EC8575',
  activeDark:   '#c96d5e',
  textDark:     '#1a1a1a',
  textMuted:    '#8b7b6b',
  glass:        'rgba(255,255,255,0.68)',
  glassBorder:  'rgba(255,255,255,0.60)',
  glassDark:    'rgba(255,255,255,0.45)',
  white:        '#FFFFFF',
}

export const RECT_BTN = {
  height:       52,
  borderRadius: 14,
  alignItems:   'center' as const,
  justifyContent:'center' as const,
  paddingHorizontal: 24,
}
