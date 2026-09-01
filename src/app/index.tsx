import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, addDoc, onSnapshot, query, where, deleteDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { db, auth } from '../../firebaseConfig';
import { Feather } from '@expo/vector-icons';
import Weather from '../components/Weather';
import AuthScreen from '../components/AuthScreen';
import { colors } from '../constants/colors';

export default function IndexScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [memos, setMemos] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setMemos([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(db, 'memos'), where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newMemos = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        newMemos.sort((a: any, b: any) => {
          const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : a.createdAt || 0;
          const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : b.createdAt || 0;
          return timeB - timeA;
        });

        setMemos(newMemos);
        setLoading(false);
      },
      (err) => {
        console.log('Firestore query error:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addMemo = async () => {
    if (inputText.trim() === '' || !user) return;

    await addDoc(collection(db, 'memos'), {
      text: inputText,
      userId: user.uid,
      createdAt: new Date(),
    });

    setInputText('');
  };

  const deleteMemo = async (id: string) => {
    await deleteDoc(doc(db, 'memos', id));
  };

  if (authLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.accent} />
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
            <View style={styles.headerContainer}>
              <View>
                <Text style={styles.brandMark}>Weather Todo</Text>
                <Text style={styles.userEmail} numberOfLines={1}>
                  {user.email}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => signOut(auth)}
                accessibilityLabel="Sign out"
              >
                <Feather name="log-out" size={20} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <Weather />

            <View style={styles.listHeaderContainer}>
              <Text style={styles.listTitle}>Notes</Text>
              <Text style={styles.listCount}>{memos.length}</Text>
            </View>

            {loading ? (
              <View style={styles.centerContent}>
                <ActivityIndicator size="large" color={colors.accent} />
              </View>
            ) : (
              <FlatList
                data={memos}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                  <View style={styles.memoItem}>
                    <View style={styles.memoDot} />
                    <Text style={styles.memoText}>{item.text}</Text>
                    <TouchableOpacity
                      onPress={() => deleteMemo(item.id)}
                      style={styles.deleteButton}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Feather name="x" size={18} color={colors.faint} />
                    </TouchableOpacity>
                  </View>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyTitle}>Nothing here yet</Text>
                    <Text style={styles.emptyText}>Add a note below — it syncs to your account.</Text>
                  </View>
                }
              />
            )}

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Write a note…"
                placeholderTextColor={colors.faint}
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={addMemo}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[styles.addButton, inputText.trim() === '' && styles.addButtonDisabled]}
                onPress={addMemo}
                disabled={inputText.trim() === ''}
              >
                <Feather name="plus" size={22} color={colors.white} />
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
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'android' ? 16 : 0,
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
    alignItems: 'flex-start',
    marginBottom: 20,
    marginTop: 8,
  },
  brandMark: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: -0.6,
  },
  userEmail: {
    marginTop: 4,
    fontSize: 13,
    color: colors.muted,
    maxWidth: 240,
  },
  logoutButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  listHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: -0.3,
  },
  listCount: {
    fontSize: 14,
    color: colors.faint,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 16,
  },
  memoItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  memoDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginRight: 12,
  },
  memoText: {
    fontSize: 16,
    flex: 1,
    color: colors.ink,
    lineHeight: 22,
  },
  deleteButton: {
    padding: 6,
    marginLeft: 4,
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'flex-start',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: 6,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 6,
    borderRadius: 14,
    marginBottom: Platform.OS === 'ios' ? 10 : 16,
    marginTop: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.ink,
    paddingHorizontal: 14,
    height: 46,
  },
  addButton: {
    backgroundColor: colors.accent,
    width: 42,
    height: 42,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: colors.faint,
  },
});
