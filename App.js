import React, { useRef, useEffect } from 'react';
import { View, Text, Image as RNImage, Button, Pressable } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Blend from "./Blending";

const naviList = [
  { title: "Blending", screen: "Blending - CARE SUCC", component: Blend, description: "alpha-blending" },
];

function HomeScreen({navigation}) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-start' }} >
      {/*<Text style={{fontSize: 40, marginBottom: 10}}>CARE SUCC</Text>*/}
      <RNImage source={require("./assets/caresucc-icon.jpg")} style={{width: 689*.5, height: 594*.5}} />
      <View style={{flex: 1, width: '100%', alignItems: 'center', justifyContent: 'flex-start'}}>
      {naviList.map((n) => {
        return (
          <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
            <Pressable onPress={() => navigation.navigate(n.screen, {description: n.description})} >
              <Text style={{fontSize: 25, color: "#fcc021", 
                      background: "linear-gradient(135deg, #bca021, #ac8021) border-box border-box", 
                      padding: 8, paddingLeft: 15, paddingRight: 15, marginBottom: 0, borderRadius: 10, 
                      border: "3px outset #cc8021"
                  }}> {n.title} </Text>
            </Pressable>
            <Text style={{width: 230, fontSize: 14, margin: 0, marginLeft: 10, color: "#ac8021"}}>{n.description}</Text>
          </View>
        );
      }
      )}
      </View>
      <Text style={{fontSize: 25, color: "#bc8021"}}> 2023 </Text>
    </View>
  );
}

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={true?"Home":naviList[0].screen}
        screenOptions={{
          headerMode: 'scree', headerTintColor: "#fcc021", headerStyle: { backgroundColor: "#c08118"}
        }}>
        <Stack.Screen name="CARE SUCC" component={HomeScreen} />
        {naviList.map((n) => <Stack.Screen name={n.screen} component={n.component}/>)}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
