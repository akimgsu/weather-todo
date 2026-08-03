import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
// ⭐️ Import Firebase Firestore functions
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
// Import firebaseConfig (pay attention to relative path)
import { db } from '../../firebaseConfig';
import Weather from '../components/Weather'; // 🌤️ Import Weather component

export default function IndexScreen() {
  const [memos, setMemos] = useState([]); // Memo list state
  const [inputText, setInputText] = useState(''); // Input text state
  const [loading, setLoading] = useState(true); // Loading state

  // 1. Fetch memos (real-time listener)
  useEffect(() => {
    const q = query(collection(db, 'memos'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMemos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setMemos(newMemos);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Add memo (save to cloud)
  const addMemo = async () => {
    if (inputText.trim() === '') return;

    await addDoc(collection(db, 'memos'), {
      text: inputText,
      createdAt: new Date(),
    });

    setInputText('');
  };

  // 3. Delete memo (delete from cloud)
  const deleteMemo = async (id) => {
    await deleteDoc(doc(db, 'memos', id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📝 Memo</Text>

      <Weather />

      {/* Memo input area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Leave a memo for today..."
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity style={styles.addButton} onPress={addMemo}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* List display area */}
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <FlatList
          data={memos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.memoItem}>
              <Text style={styles.memoText}>{item.text}</Text>
              <TouchableOpacity onPress={() => deleteMemo(item.id)}>
                <Text style={styles.deleteText}>❌</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  memoItem: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  memoText: {
    fontSize: 16,
    flex: 1,
  },
  deleteText: {
    fontSize: 16,
    paddingLeft: 10,
  },
});
