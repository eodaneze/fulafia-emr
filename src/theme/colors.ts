export const colors = {
  primary: '#087F6A',
  primaryDark: '#034C40',
  primaryDeep: '#012E27',
  primaryLight: '#20B98A',
  primarySoft: '#DDF5EF',

  secondary: '#26C99A',
  accent: '#E8B44C',

  background: '#F4F8F7',
  surface: '#FFFFFF',
  surfaceMuted: '#EDF4F2',
  surfaceDark: '#073E35',

  textPrimary: '#12211E',
  textSecondary: '#62716D',
  textMuted: '#8A9693',
  textOnPrimary: '#FFFFFF',

  border: '#DCE7E4',
  borderDark: 'rgba(255, 255, 255, 0.15)',

  success: '#168B5B',
  successSoft: '#E3F6ED',

  warning: '#D78B18',
  warningSoft: '#FFF3DC',

  danger: '#D64545',
  dangerSoft: '#FDEAEA',

  info: '#256FD3',
  infoSoft: '#E8F0FD',

  overlay: 'rgba(0, 28, 24, 0.52)',
  transparent: 'transparent',
} as const;

export type AppColor = keyof typeof colors;