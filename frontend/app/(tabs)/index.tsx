import { View, Text, StyleSheet } from 'react-native'

const app = () => {
  return (
    // Note: style = ... is an ATTRIBUTE, not a prop
    <View style={styles.container}> 
      <Text style={styles.text} className = "text-white" >Coffee Shop</Text> 
      <Text style={styles.text} className = "text-blue-100">Banana Shop</Text>
      {/* flex-1 fills view */}
    </View>
  )
}

export default app

const styles = StyleSheet.create({
  container: {
    flex:1,
    flexDirection: "column",
  },
  text: {
    color:"white",
    fontSize:42,
    fontWeight:'bold',
    textAlign:'center'
  }
})