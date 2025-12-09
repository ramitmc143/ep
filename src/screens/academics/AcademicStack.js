import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AcademicScreen from './AcademicScreen';
import SubjectBooksScreen from './SubjectBooksScreen';
import CategoryDetailsScreen from './CategoryDetailsScreen';
// import PapersScreen from './PaperScreen';
import TopicsScreen from './TopicsScreen';

const Stack = createNativeStackNavigator();

export default function AcademicStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AcademicScreen" component={AcademicScreen} />
      <Stack.Screen name="SubjectBooksScreen" component={SubjectBooksScreen} />
      <Stack.Screen name="CategoryDetailsScreen" component={CategoryDetailsScreen} />
      <Stack.Screen name="TopicsScreen" component={TopicsScreen} />
    </Stack.Navigator>
  );
}