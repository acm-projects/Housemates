import { Ionicons } from '@expo/vector-icons'
import { usePathname, useRouter } from 'expo-router'
import { Pressable, StyleSheet, View } from 'react-native'

const ACTIVE = '#EC8575'
const INACTIVE = '#000000'

export function AppBottomNav() {
  const router = useRouter()
  const pathname = usePathname()
  const color = (r: string) => pathname === r ? ACTIVE : INACTIVE
  const go = (r: '/taskPage' | '/ShoppingList' | '/home' | '/calendar' | '/expenses') => {
    if (pathname !== r) router.push(r)
  }
  return (
    <View style={s.wrap}>
      <View style={s.nav}>
        <Pressable style={({pressed}) => [s.btn, pressed && s.pressed]} onPress={() => go('/taskPage')} hitSlop={12}>
          <Ionicons name="list-outline" size={22} color={color('/taskPage')} />
        </Pressable>
        <Pressable style={({pressed}) => [s.btn, pressed && s.pressed]} onPress={() => go('/ShoppingList')} hitSlop={12}>
          <Ionicons name="bag-outline" size={22} color={color('/ShoppingList')} />
        </Pressable>
        <Pressable style={({pressed}) => [s.btn, pressed && s.pressed]} onPress={() => go('/home')} hitSlop={12}>
          <Ionicons name="home-outline" size={22} color={color('/home')} />
        </Pressable>
        <Pressable style={({pressed}) => [s.btn, pressed && s.pressed]} onPress={() => go('/calendar')} hitSlop={12}>
          <Ionicons name="calendar-outline" size={22} color={color('/calendar')} />
        </Pressable>
        <Pressable style={({pressed}) => [s.btn, pressed && s.pressed]} onPress={() => go('/expenses')} hitSlop={12}>
          <Ionicons name="card-outline" size={22} color={color('/expenses')} />
        </Pressable>
      </View>
    </View>
  )
}
export default AppBottomNav

const s = StyleSheet.create({
  wrap: { position:'absolute', left:14, right:14, bottom:10 },
  nav: {
    height:64, borderRadius:22,
    backgroundColor:'rgba(255,255,255,0.95)',
    borderWidth:1, borderColor:'rgba(255,255,255,0.7)',
    flexDirection:'row', alignItems:'center', justifyContent:'space-around',
    paddingHorizontal:10,
    shadowColor:'#000', shadowOffset:{width:0,height:4},
    shadowOpacity:0.08, shadowRadius:12, elevation:8,
  },
  btn: { width:44, height:44, borderRadius:22, alignItems:'center', justifyContent:'center' },
  pressed: { opacity:0.55 },
})
