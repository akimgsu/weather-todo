import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
// ⭐️ Firebase Firestore(데이터베이스) 함수들 불러오기
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
// 상대 경로에 주의해서 firebaseConfig를 불러옵니다 (src/app 폴더의 밖의 밖)
import { db } from '../../firebaseConfig';

export default function IndexScreen() {
  const [memos, setMemos] = useState([]); // 메모 리스트 상태
  const [inputText, setInputText] = useState(''); // 입력창 텍스트 상태
  const [loading, setLoading] = useState(true); // 로딩 상태

  // 1. 메모 불러오기 (실시간 감지)
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

  // 2. 메모 추가하기 (클라우드 저장)
  const addMemo = async () => {
    if (inputText.trim() === '') return;
    
    await addDoc(collection(db, 'memos'), {
      text: inputText,
      createdAt: new Date(),
    });
    
    setInputText('');
  };

  // 3. 메모 삭제하기 (클라우드 삭제)
  const deleteMemo = async (id) => {
    await deleteDoc(doc(db, 'memos', id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📝 나의 첫 메모장</Text>
      
      {/* 메모 입력 영역 */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="오늘의 메모를 남겨보세요..."
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity style={styles.addButton} onPress={addMemo}>
          <Text style={styles.addButtonText}>등록</Text>
        </TouchableOpacity>
      </View>

      {/* 리스트 출력 영역 */}
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
