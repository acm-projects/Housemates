import React from "react"
import Svg, { Path, G, Rect, ClipPath, Defs } from "react-native-svg"
import { Ionicons } from "@expo/vector-icons"

type IconProps = {
  size?: number
  color?: string
}

// --- Navigation Icons (Ionicons where possible) ---

export const HomeIcon: React.FC<IconProps> = ({ size = 24, color = "#2D2D4E" }) => (
  <Ionicons name="home-outline" size={size} color={color} />
)

export const ChecklistIcon: React.FC<IconProps> = ({ size = 24, color = "#2D2D4E" }) => (
  <Ionicons name="list-outline" size={size} color={color} />
)

export const ShoppingBagIcon: React.FC<IconProps> = ({ size = 24, color = "#2D2D4E" }) => (
  <Ionicons name="bag-outline" size={size} color={color} />
)

export const CalendarIcon: React.FC<IconProps> = ({ size = 24, color = "#2D2D4E" }) => (
  <Ionicons name="calendar-outline" size={size} color={color} />
)

export const ExpensesIcon: React.FC<IconProps> = ({ size = 24, color = "#2D2D4E" }) => (
  <Ionicons name="card-outline" size={size} color={color} />
)

// --- Feature Icons (SVG custom) ---

export const DownloadIcon: React.FC<IconProps> = ({ size = 24, color = "#fff" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Defs>
      <ClipPath id="clip_download">
        <Rect width="24" height="24" fill="white" />
      </ClipPath>
    </Defs>
    <G clipPath="url(#clip_download)">
      <Path d="M12.75 15.9203H13.4C14.05 15.9203 14.59 15.3403 14.59 14.6403C14.59 13.7703 14.28 13.6003 13.77 13.4203L12.76 13.0703V15.9203Z" fill={color} />
      <Path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill={color} opacity={0.4} />
    </G>
  </Svg>
)

export const MoneyCircleIcon: React.FC<IconProps> = ({ size = 24, color = "#fff" }) => (
  <Ionicons name="cash-outline" size={size} color={color} />
)

export const AddToCalendarIcon: React.FC<IconProps> = ({ size = 24, color = "#fff" }) => (
  <Ionicons name="calendar-outline" size={size} color={color} />
)

export const BellIcon: React.FC<IconProps> = ({ size = 24, color = "#2D2D4E" }) => (
  <Ionicons name="notifications-outline" size={size} color={color} />
)

export const CashIcon: React.FC<IconProps> = ({ size = 24, color = "#2D2D4E" }) => (
  <Ionicons name="cash-outline" size={size} color={color} />
)

export const VenmoIcon: React.FC<IconProps> = ({ size = 24, color = "#2D2D4E" }) => (
  <Ionicons name="logo-usd" size={size} color={color} />
)

export const ZelleIcon: React.FC<IconProps> = ({ size = 24, color = "#2D2D4E" }) => (
  <Ionicons name="flash-outline" size={size} color={color} />
)