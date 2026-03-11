import React from "react"
import Svg, { Path, G } from "react-native-svg"

type IconProps = {
  size?: number
  color?: string
}

export const HomeIcon: React.FC<IconProps> = ({ size = 24, color = "#2D2D4E" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <G>
      <Path d="M20.83 8.01L14.28 2.77C13 1.75 11 1.74 9.73 2.76L3.18 8.01C2.24 8.76 1.67 10.26 1.87 11.44L3.13 18.98C3.42 20.67 4.99 22 6.7 22H17.3C18.99 22 20.59 20.64 20.88 18.97L22.14 11.43C22.32 10.26 21.75 8.76 20.83 8.01Z" fill={color} />
    </G>
  </Svg>
)

export const ChecklistIcon: React.FC<IconProps> = ({ size = 24, color = "#2D2D4E" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M20 19.26H10.93C10.48 19.26 10.11 18.89 10.11 18.44C10.11 17.99 10.48 17.62 10.93 17.62H20C20.45 17.62 20.82 17.99 20.82 18.44C20.82 18.9 20.45 19.26 20 19.26Z" fill={color} />
  </Svg>
)

export const ShoppingBagIcon: React.FC<IconProps> = ({ size = 24, color = "#2D2D4E" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M16 8.75C15.59 8.75 15.25 8.41 15.25 8V4.5C15.25 3.42 14.58 2.75 13.5 2.75H10.5C9.42 2.75 8.75 3.42 8.75 4.5V8C8.75 8.41 8.41 8.75 8 8.75C7.59 8.75 7.25 8.41 7.25 8V4.5C7.25 2.59 8.59 1.25 10.5 1.25H13.5C15.41 1.25 16.75 2.59 16.75 4.5V8C16.75 8.41 16.41 8.75 16 8.75Z" fill={color} />
  </Svg>
)

export const CalendarIcon: React.FC<IconProps> = ({ size = 24, color = "#2D2D4E" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M8 5.75C7.59 5.75 7.25 5.41 7.25 5V2C7.25 1.59 7.59 1.25 8 1.25C8.41 1.25 8.75 1.59 8.75 2V5C8.75 5.41 8.41 5.75 8 5.75Z" fill={color} />
  </Svg>
)

export const ExpensesIcon: React.FC<IconProps> = ({ size = 24, color = "#2D2D4E" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M17 4H7C4 4 2 5.5 2 9V15C2 18.5 4 20 7 20H17C20 20 22 18.5 22 15V9C22 5.5 20 4 17 4Z" fill={color} />
  </Svg>
)