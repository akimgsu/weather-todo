import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, addDoc, onSnapshot, query, where, deleteDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { db, auth } from '../../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
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
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {!user ? (
          <View style={styles.authWrapper}>
            <AuthScreen />
          </View>
        ) : (
          <>
            {/* Header */}
            <View style={styles.headerContainer}>
              <View style={styles.headerLeft}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={16} color="#4F46E5" />
                </View>
                <View>
                  <Text style={styles.greetingText}>Hello,</Text>
                  <Text style={styles.userEmail} numberOfLines={1}>{user.email?.split('@')[0]}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.logoutIconButton} onPress={() => signOut(auth)}>
                <Ionicons name="log-out-outline" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Weather />

            <View style={styles.listHeaderContainer}>
              <Text style={styles.listTitle}>My Tasks</Text>
              <Text style={styles.listCount}>{memos.length} items</Text>
            </View>

            {/* List display area */}
            {loading ? (
              <View style={styles.centerContent}>
                <ActivityIndicator size="large" color="#4F46E5" />
              </View>
            ) : (
              <FlatList
                data={memos}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                  <View style={styles.memoItem}>
                    <TouchableOpacity style={styles.checkboxPlaceholder}>
                      <Ionicons name="ellipse-outline" size={24} color="#D1D5DB" />
                    </TouchableOpacity>
                    <Text style={styles.memoText}>{item.text}</Text>
                    <TouchableOpacity onPress={() => deleteMemo(item.id)} style={styles.deleteButton}>
                      <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
                    <Text style={styles.emptyText}>No tasks yet. Add one below!</Text>
                  </View>
                }
              />
            )}

            {/* Memo input area */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="What do you need to do?"
                placeholderTextColor="#9CA3AF"
                value={inputText}
                onChangeText={setInputText}
              />
              <TouchableOpacity
                style={[styles.addButton, inputText.trim() === '' && styles.addButtonDisabled]}
                onPress={addMemo}
                disabled={inputText.trim() === ''}
              >
                <Ionicons name="arrow-up" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Gray-100
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 0,
  },
  authWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  greetingText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  userEmail: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  logoutIconButton: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  listHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  listCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
  memoItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  checkboxPlaceholder: {
    marginRight: 12,
  },
  memoText: {
    fontSize: 16,
    flex: 1,
    color: '#374151',
    lineHeight: 22,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    color: '#9CA3AF',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
    marginBottom: Platform.OS === 'ios' ? 10 : 20,
    marginTop: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingHorizontal: 16,
    height: 50,
  },
  addButton: {
    backgroundColor: '#4F46E5',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
});
