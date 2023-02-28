/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Text,
  useColorScheme,
  ActivityIndicator,
  Button,
  View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import firestore from '@react-native-firebase/firestore';

// init user collection
const usersCollection = firestore().collection('Users');

type ItemData = {
  id: string;
  count: number;
};

type ItemProps = {
  item: ItemData;
};

const Item = ({item}: ItemProps) => (
  <TouchableOpacity
    onPress={() => {
      // Update data
      usersCollection
        .doc(item.id)
        .update({
          count: item.count + 1,
        })
        .then(() => console.debug('updated'));
    }}
    onLongPress={() => {
      // Delete data
      usersCollection
        .doc(item.id)
        .delete()
        .then(() => {
          console.debug('delete row');
        });
    }}
    style={styles.item}>
    <View style={{flexDirection: 'row'}}>
      <Text style={styles.title}>Count: </Text>
      <Text style={styles.title}>{item.count}</Text>
    </View>
  </TouchableOpacity>
);

function App(): JSX.Element {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Array<ItemData>>();

  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.white,
  };

  // 1. Read data from firestore
  useEffect(() => {
    const subscriber = usersCollection.onSnapshot(querySnapshot => {
      const queryUser: ItemData[] = [];
      // Read Data
      querySnapshot.forEach(documentSnapshot => {
        // 2. Set each document to data list
        queryUser.push({
          id: documentSnapshot.id,
          count: documentSnapshot.data()['count'],
        });
      });

      // 3. update user data & hide loading
      setUsers(queryUser);
      setLoading(false);
    });
    return () => subscriber();
  }, []);

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView>
        {/* 4. show each document data in scrollview */}
        {users?.map(value => (
          <Item key={value.id.toString()} item={value} />
        ))}
        <Button
          title="Add Data"
          onPress={() => {
            // Add Data
            usersCollection
              .add({
                count: 0,
              })
              .then(() => {
                console.debug('added data');
              });
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: '#fff8b5',
  },
  title: {
    fontSize: 32,
  },
});

export default App;
