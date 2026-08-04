import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { collection, addDoc, onSnapshot, query, where, deleteDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { db, auth } from '../../firebaseConfig';
import Weather from '../components/Weather';
import AuthScreen from '../components/AuthScreen';

export default function IndexScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [memos, setMemos] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. Listen to Authentication State
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // 2. Fetch user-specific memos in real-time
  useEffect(() => {
    if (!user) {
      setMemos([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, 'memos'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMemos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      // Client-side sort by createdAt (newest first)
      newMemos.sort((a: any, b: any) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt || 0);
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt || 0);
        return timeB - timeA;
      });

      setMemos(newMemos);
      setLoading(false);
    }, (err) => {
      console.log('Firestore query error:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 3. Add memo tied to current user
  const addMemo = async () => {
    if (inputText.trim() === '' || !user) return;

    await addDoc(collection(db, 'memos'), {
      text: inputText,
      userId: user.uid,
      createdAt: new Date(),
    });

    setInputText('');
  };

  // 4. Delete memo
  const deleteMemo = async (id: string) => {
    await deleteDoc(doc(db, 'memos', id));
  };

  if (authLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📝 Memo</Text>
      <Weather />

      {!user ? (
        <AuthScreen />
      ) : (
        <>
          {/* User info bar */}
          <View style={styles.userHeader}>
            <Text style={styles.userEmail} numberOfLines={1}>👤 {user.email}</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={() => signOut(auth)}>
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          {/* Memo input area */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="To do a memo..."
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
        </>
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E8EAF6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3F51B5',
    flex: 1,
    marginRight: 10,
  },
  logoutButton: {
    backgroundColor: '#FF5252',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
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
