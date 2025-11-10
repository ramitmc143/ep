import React from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {
  toggleNotifications,
  setTheme,
  toggleCategory,
  setFontSize,
} from '../redux/slices/preferencesSlice';

const {width} = Dimensions.get('window');

const categories = [
  'Sports',
  'Politics',
  'Technology',
  'Entertainment',
  'Education',
  'Health',
  'Science',
];

const PreferencesScreen = () => {
  const dispatch = useDispatch();
  const {notificationsEnabled, theme, selectedCategories, fontSize} =
    useSelector(state => state.preferences);

  const colors = {
    background: theme === 'dark' ? '#0B0C10' : '#F9FAFB',
    text: theme === 'dark' ? '#F8F8F8' : '#111',
    card: theme === 'dark' ? '#1F2833' : '#FFFFFF',
    border: theme === 'dark' ? '#444' : '#DDD',
    accent: '#4E9F3D',
    secondaryAccent: '#2196F3',
  };

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: colors.background}]}
      showsVerticalScrollIndicator={false}>
      <Text style={[styles.header, {color: colors.text}]}>Preferences</Text>

      {/* 🔔 Notifications */}
      <View style={[styles.card, {backgroundColor: colors.card}]}>
        <Text style={[styles.label, {color: colors.text}]}>Notifications</Text>
        <Switch
          trackColor={{false: '#767577', true: colors.accent}}
          thumbColor={'#fff'}
          value={notificationsEnabled}
          onValueChange={() => dispatch(toggleNotifications())}
        />
      </View>

      {/* 🌙 Theme Toggle */}
      <View style={[styles.card, {backgroundColor: colors.card}]}>
        <Text style={[styles.label, {color: colors.text}]}>
          Theme ({theme === 'light' ? 'Light' : 'Dark'})
        </Text>
        <Switch
          trackColor={{false: '#767577', true: colors.accent}}
          thumbColor={'#fff'}
          value={theme === 'dark'}
          onValueChange={() =>
            dispatch(setTheme(theme === 'light' ? 'dark' : 'light'))
          }
        />
      </View>

      {/* 📰 Category Preferences */}
      <View style={[styles.cardColumn, {backgroundColor: colors.card}]}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>
          Category Preferences
        </Text>
        <View style={styles.categoryContainer}>
          {categories.map(cat => {
            const selected = selectedCategories.includes(cat);
            return (
              <TouchableOpacity
                key={cat}
                activeOpacity={0.7}
                onPress={() => dispatch(toggleCategory(cat))}
                style={[
                  styles.categoryButton,
                  {
                    borderColor: selected ? colors.accent : colors.border,
                    backgroundColor: selected ? colors.accent : 'transparent',
                  },
                ]}>
                <Text
                  style={{
                    color: selected ? '#fff' : colors.text,
                    fontWeight: selected ? '600' : '400',
                    fontSize: width * 0.035,
                  }}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 🔤 Font Size */}
      <View style={[styles.cardColumn, {backgroundColor: colors.card}]}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>
          Font Size
        </Text>
        <View style={styles.fontRow}>
          {['small', 'medium', 'large'].map(size => {
            const selected = fontSize === size;
            return (
              <TouchableOpacity
                key={size}
                activeOpacity={0.8}
                onPress={() => dispatch(setFontSize(size))}
                style={[
                  styles.fontButton,
                  {
                    backgroundColor: selected ? colors.accent : 'transparent',
                    borderColor: selected ? colors.accent : colors.border,
                  },
                ]}>
                <Text
                  style={{
                    color: selected ? '#fff' : colors.text,
                    textTransform: 'capitalize',
                    fontWeight: selected ? '600' : '400',
                    fontSize: width * 0.04,
                  }}>
                  {size}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <Text
        style={[
          styles.footerNote,
          {color: theme === 'dark' ? '#888' : '#666'},
        ]}>
        ✨ Your preferences are saved automatically.
      </Text>
    </ScrollView>
  );
};

export default PreferencesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
  },
  header: {
    fontSize: width * 0.075,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardColumn: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
  },
  label: {fontSize: width * 0.045, fontWeight: '600'},
  sectionTitle: {
    fontSize: width * 0.05,
    fontWeight: '700',
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
    justifyContent: 'center',
  },
  categoryButton: {
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginVertical: 4,
  },
  fontRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  fontButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  footerNote: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: width * 0.033,
    fontStyle: 'italic',
    marginBottom: 20,
  }, 
});
 